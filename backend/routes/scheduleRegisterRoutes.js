// backend/routes/scheduleRegisterRoutes.js

const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();

const { isFocusTimeNow } = require('../utils/focusTimeChecker');
const { runRegisterCronScript } = require('../utils/runRegisterCronScript');
const { logEvent } = require('../utils/logger');

// 집중 시간 스케줄 데이터가 저장되는 파일 경로
const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');

// 스케줄 파일이 없을 경우 빈 배열로 초기화된 JSON 파일 생성
if (!fs.existsSync(SCHEDULE_FILE)) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));
}

/**
 * JSON 파일을 안전하게 읽어오는 함수
 * - 빈 파일이거나 파싱 오류 발생 시 빈 배열 반환
 * - 데이터 안정성을 확보하기 위한 방어적 처리
 */
function readScheduleFileSafely() {
  try {
    const raw = fs.readFileSync(SCHEDULE_FILE, 'utf-8');
    return raw.trim() ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('❌ 스케줄 파일 파싱 실패, 빈 배열 반환:', err.message);
    return [];
  }
}

/**
 * [POST] /add
 * 스케줄 추가 API
 * - 사용자로부터 시작 시각(startHour, startMin)과 종료 시각(endHour, endMin)을 입력받음
 * - 현재가 집중 시간 중이면 추가 불가
 * - 고유 ID와 함께 스케줄을 JSON 파일에 저장
 * - 크론 등록 스크립트 실행 및 로그 기록
 */
router.post('/add', (req, res) => {
  const { startHour, startMin, endHour, endMin } = req.body;

  // 필수 필드가 누락된 경우
  if (
    startHour == null || startMin == null ||
    endHour == null || endMin == null
  ) {
    return res.status(400).json({ message: 'Invalid schedule format' });
  }

  const scheduleList = readScheduleFileSafely();

  // 현재가 집중 시간 중이면 스케줄 추가 제한
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 스케줄을 추가할 수 없습니다.' });
  }

  const newSchedule = {
    id: Date.now(), // 유니크 ID (timestamp 기반)
    startHour,
    startMin,
    endHour,
    endMin
  };

  // 스케줄 추가 및 파일 저장
  scheduleList.push(newSchedule);
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(scheduleList, null, 2));

  // 크론 등록 스크립트 실행 (등록된 스케줄에 따라 시스템 동작 자동화)
  runRegisterCronScript();

  // 로그 기록
  logEvent('schedule', `✅ 스케줄 추가됨: ${startHour}:${startMin} ~ ${endHour}:${endMin} (id: ${newSchedule.id})`);

  res.status(200).json({ message: 'Schedule added', id: newSchedule.id });
});

/**
 * [DELETE] /delete/:id
 * 스케줄 삭제 API
 * - ID에 해당하는 스케줄 항목을 삭제
 * - 집중 시간 중에는 삭제 불가
 * - 삭제 후 파일 업데이트 및 크론 스크립트 실행
 * - 삭제 성공 여부에 따라 로그 기록
 */
router.delete('/delete/:id', (req, res) => {
  const scheduleList = readScheduleFileSafely();

  // 집중 시간에는 삭제 불가
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 스케줄을 삭제할 수 없습니다.' });
  }

  const id = parseInt(req.params.id);
  const originalLength = scheduleList.length;

  // 삭제 대상 항목 추적 및 리스트 필터링
  const deletedItem = scheduleList.find(item => item.id === id);
  const updatedList = scheduleList.filter(item => item.id !== id);

  // 해당 ID가 존재하지 않을 경우
  if (updatedList.length === originalLength) {
    return res.status(404).json({ message: 'Schedule not found' });
  }

  // 파일에 업데이트된 리스트 저장
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(updatedList, null, 2));

  // 크론 등록 스크립트 재실행
  runRegisterCronScript();

  // 로그 기록
  if (deletedItem) {
    logEvent('schedule', `🗑️ 스케줄 삭제됨: ${deletedItem.startHour}:${deletedItem.startMin} ~ ${deletedItem.endHour}:${deletedItem.endMin} (id: ${id})`);
  } else {
    logEvent('schedule', `⚠️ 스케줄 ID ${id} 삭제 시도 - 해당 ID 없음`);
  }

  res.status(200).json({ message: 'Schedule deleted' });
});

/**
 * [GET] /list
 * 등록된 모든 스케줄 반환 API
 * - 파일에서 안전하게 데이터를 읽어 클라이언트에 응답
 * - 실패 시 500 에러 반환
 */
router.get('/list', (req, res) => {
  try {
    const data = readScheduleFileSafely();
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read schedule' });
  }
});

module.exports = router;


