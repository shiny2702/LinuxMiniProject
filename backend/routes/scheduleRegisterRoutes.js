// backend/routes/scheduleRegisterRoutes.js
const express = require('express');
const fs = require('fs');
const path = require('path');
const router = express.Router();
const { isFocusTimeNow } = require('../utils/focusTimeChecker');
const { runRegisterCronScript } = require('../utils/runRegisterCronScript');
const { logEvent } = require('../utils/logger');

const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');

// 초기 스케줄 파일이 없으면 생성
if (!fs.existsSync(SCHEDULE_FILE)) {
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify([]));
}

// 스케줄 추가
router.post('/add', (req, res) => {
  const { startHour, startMin, endHour, endMin } = req.body;

  if (
    startHour == null || startMin == null ||
    endHour == null || endMin == null
  ) {
    return res.status(400).json({ message: 'Invalid schedule format' });
  }

  const scheduleList = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 스케줄을 추가할 수 없습니다.' });
  }

  const newSchedule = {
    id: Date.now(), // 고유 ID
    startHour,
    startMin,
    endHour,
    endMin
  };

  scheduleList.push(newSchedule);
  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(scheduleList, null, 2));
  runRegisterCronScript(); // 스케줄 추가 후 크론 등록 스크립트 실행 

  logEvent('schedule', `✅ 스케줄 추가됨: ${startHour}:${startMin} ~ ${endHour}:${endMin} (id: ${newSchedule.id})`);

  res.status(200).json({ message: 'Schedule added', id: newSchedule.id });
});


// 스케줄 삭제
router.delete('/delete/:id', (req, res) => {
  const scheduleList = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
  if (isFocusTimeNow(scheduleList)) {
    return res.status(403).json({ message: '🚫 집중 시간 중에는 스케줄을 삭제할 수 없습니다.' });
  }

  const id = parseInt(req.params.id);
  let data = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));

  const originalLength = data.length;
  const deletedItem = data.find(item => item.id === id);
  data = data.filter(item => item.id !== id);

  if (data.length === originalLength) {
    return res.status(404).json({ message: 'Schedule not found' });
  }

  fs.writeFileSync(SCHEDULE_FILE, JSON.stringify(data, null, 2));
  runRegisterCronScript(); // 스케줄 삭제 후 크론 등록 스크립트 실행 

  if (deletedItem) {
    logEvent('schedule', `🗑️ 스케줄 삭제됨: ${deletedItem.startHour}:${deletedItem.startMin} ~ ${deletedItem.endHour}:${deletedItem.endMin} (id: ${id})`);
  } else {
    logEvent('schedule', `⚠️ 스케줄 ID ${id} 삭제 시도 - 해당 ID 없음`);
  }

  res.status(200).json({ message: 'Schedule deleted' });
});


// 스케줄 전체 목록 반환
router.get('/list', (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
    res.status(200).json(data);
  } catch (err) {
    res.status(500).json({ message: 'Failed to read schedule' });
  }
});

module.exports = router;
