// 📁 /utils/focusTimeChecker.js
const fs = require('fs');
const path = require('path');

const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');

function getScheduleList() {
  if (!fs.existsSync(SCHEDULE_FILE)) return [];
  return JSON.parse(fs.readFileSync(SCHEDULE_FILE, 'utf-8'));
}

function isFocusTimeNow(scheduleList = null) {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  if (!scheduleList) scheduleList = getScheduleList();

  return scheduleList.some(schedule => {
    const start = schedule.startHour * 60 + schedule.startMin;
    const end = schedule.endHour * 60 + schedule.endMin;
    return currentMinutes >= start && currentMinutes < end;
  });
}

module.exports = { isFocusTimeNow };
