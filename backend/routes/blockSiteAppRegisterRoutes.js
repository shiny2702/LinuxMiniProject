// backend/routes/blockSiteAppRegisterRoutes.js

// 필요한 모듈 불러오기
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { isFocusTimeNow } = require('../utils/focusTimeChecker');       // 현재 시간이 집중 시간인지 확인
const { runRegisterCronScript } = require('../utils/runRegisterCronScript'); // 크론 등록 스크립트 실행
const { logEvent } = require('../utils/logger');                       // 이벤트 로그 기록 함수

// 파일 경로 상수 정의
const BLOCK_FILE = path.join(__dirname, '..', '..', 'state', 'registered_blockSiteApp.json'); // 차단 도메인 정보 저장 파일
const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');  // 집중 시간 설정 정보 저장 파일

// 상태 파일이 존재하지 않으면 초기화 (빈 배열로 생성)
if (!fs.existsSync(BLOCK_FILE)) {
  fs.writeFileSync(BLOCK_FILE, JSON.stringify([]));
}
if (!fs.existsSync(SCHEDULE_FILE)) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));
}

// JSON 파일을 안전하게 로드하는 유틸 함수
function safeLoadJson(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    return []; // 파일이 없거나 JSON 파싱 에러가 발생하면 빈 배열 반환
  }
}

/**
 * [POST] /add
 * 새로운 차단 도메인을 추가
 * - 유효성 검사
 * - 집중 시간 중에는 수정 불가
 * - JSON 파일에 항목 추가 후 저장
 * - 크론 스크립트 실행
 * - 이벤트 로그 기록
 */
router.post('/add', (req, res) => {
  const { domain } = req.body;

  // 유효성 검사: 비어 있거나 문자열이 아니거나 공백 포함 시 오류
  if (
    !domain ||
    typeof domain !== 'string' ||
    domain.trim() === '' ||           
    /\s/.test(domain)
  ) {
    return res.status(400).json({ message: 'Invalid domain: no spaces allowed' });
  }

  // 현재가 집중 시간인지 확인 → 집중 시간에는 차단 목록 변경 불가
  const scheduleList = safeLoadJson(SCHEDULE_FILE);
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 차단 목록을 변경할 수 없습니다.' });
  }

  // 새 항목 객체 생성 (id는 timestamp 사용)
  const newItem = {
    id: Date.now(),
    domain
  };

  // 기존 차단 목록 불러와서 항목 추가 후 저장
  const data = safeLoadJson(BLOCK_FILE);
  data.push(newItem);
  fs.writeFileSync(BLOCK_FILE, JSON.stringify(data, null, 2));

  // 크론 스크립트 재등록
  runRegisterCronScript();

  // 로그 기록
  logEvent('blocklist', `🚫 차단 항목 추가됨: ${domain} (id: ${newItem.id})`);

  // 성공 응답 반환
  res.status(200).json({ message: 'Blocked site added', id: newItem.id });
});

/**
 * [DELETE] /delete/:id
 * 차단 도메인 항목 삭제
 * - 집중 시간 중에는 삭제 불가
 * - ID 기반으로 항목 찾아 제거
 * - 크론 스크립트 갱신
 * - 이벤트 로그 기록
 */
router.delete('/delete/:id', (req, res) => {
  // 집중 시간 확인
  const scheduleList = safeLoadJson(SCHEDULE_FILE);
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 차단 목록을 삭제할 수 없습니다.' });
  }

  const id = parseInt(req.params.id);
  let data = safeLoadJson(BLOCK_FILE);

  const originalLength = data.length;
  const deletedItem = data.find(item => item.id === id); // 삭제할 항목 미리 찾기
  data = data.filter(item => item.id !== id); // 해당 ID를 제외한 목록으로 재구성

  // 항목이 실제로 삭제되지 않았다면 존재하지 않는 ID
  if (data.length === originalLength) {
    return res.status(404).json({ message: 'Blocked site not found' });
  }

  // 새 목록 저장
  fs.writeFileSync(BLOCK_FILE, JSON.stringify(data, null, 2));

  // 크론 스크립트 갱신
  runRegisterCronScript();

  // 삭제 성공 로그 기록
  if (deletedItem) {
    logEvent('blocklist', `✅ 차단 항목 삭제됨: ${deletedItem.domain} (id: ${id})`);
  } else {
    logEvent('blocklist', `⚠️ 차단 항목 삭제 실패 - 존재하지 않는 ID: ${id}`);
  }

  res.status(200).json({ message: 'Blocked site deleted' });
});

/**
 * [GET] /list
 * 현재 등록된 전체 차단 도메인 목록 반환
 */
router.get('/list', (req, res) => {
  try {
    const data = safeLoadJson(BLOCK_FILE);
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read block list' });
  }
});

// 라우터 모듈 export
module.exports = router;



