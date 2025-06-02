// backend/routes/blockSiteAppRegisterRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { isFocusTimeNow } = require('../utils/focusTimeChecker');
const { runRegisterCronScript } = require('../utils/runRegisterCronScript');
const { logEvent } = require('../utils/logger');

const BLOCK_FILE = path.join(__dirname, '..', '..', 'state', 'registered_blockSiteApp.json');
const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');

// 초기 파일 생성
if (!fs.existsSync(BLOCK_FILE)) {
  fs.writeFileSync(BLOCK_FILE, JSON.stringify([]));
}

// 차단 항목 추가
router.post('/add', (req, res) => {
  const { hostname } = req.body;

  if (
    !hostname ||
    typeof hostname !== 'string' ||
    hostname.trim() === '' ||           // 빈 문자열 방지
    /\s/.test(hostname)                 // 공백(띄어쓰기, 탭 등) 포함 시 차단
  ) {
    return res.status(400).json({ message: 'Invalid hostname: no spaces allowed' });
  }

  const scheduleList = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 차단 목록을 변경할 수 없습니다.' });
  }

  const newItem = {
    id: Date.now(), // 고유 ID
    hostname
  };

  const data = JSON.parse(fs.readFileSync(BLOCK_FILE, 'utf-8'));
  data.push(newItem);
  fs.writeFileSync(BLOCK_FILE, JSON.stringify(data, null, 2));
  runRegisterCronScript(); // 차단 항목 추가 후 크론 등록 스크립트 실행

  logEvent('blocklist', `🚫 차단 항목 추가됨: ${hostname} (id: ${newItem.id})`);

  res.status(200).json({ message: 'Blocked site added', id: newItem.id });
});

// 차단 항목 삭제
router.delete('/delete/:id', (req, res) => {
  const scheduleList = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 차단 목록을 삭제할 수 없습니다.' });
  }

  const id = parseInt(req.params.id);
  let data = JSON.parse(fs.readFileSync(BLOCK_FILE, 'utf-8'));
  
  const originalLength = data.length;
  const deletedItem = data.find(item => item.id === id); 
  data = data.filter(item => item.id !== id);

  if (data.length === originalLength) {
    return res.status(404).json({ message: 'Blocked site not found' });
  }

  fs.writeFileSync(BLOCK_FILE, JSON.stringify(data, null, 2));
  runRegisterCronScript(); // 차단 항목 삭제 후 크론 등록 스크립트 실행

  if (deletedItem) {
    logEvent('blocklist', `✅ 차단 항목 삭제됨: ${deletedItem.hostname} (id: ${id})`);
  } else {
    logEvent('blocklist', `⚠️ 차단 항목 삭제 실패 - 존재하지 않는 ID: ${id}`);
  }

  res.status(200).json({ message: 'Blocked site deleted' });
});

// 전체 차단 목록 반환
router.get('/list', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(BLOCK_FILE, 'utf-8'));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read block list' });
  }
});

module.exports = router;

