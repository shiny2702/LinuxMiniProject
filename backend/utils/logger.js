const fs = require('fs');
const path = require('path');

// 로그 디렉토리 경로
const LOG_DIR = '/var/log/LinuxFocusSchedular';

// 로그 파일 이름 맵
const LOG_FILES = {
  schedule: path.join(LOG_DIR, 'scheduleSettings.log'),
  blocklist: path.join(LOG_DIR, 'blocklistSettings.log'),
};

// 로그 이벤트 기록 함수
function logEvent(type, message) {
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19); // YYYY-MM-DD HH:mm:ss
  const logLine = `${timestamp} ${message}\n`;

  const logFile = LOG_FILES[type];

  if (!logFile) {
    console.error(`[logger.js] 잘못된 로그 타입: ${type}`);
    return;
  }

  // 로그 디렉토리가 없으면 생성
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      console.error(`[logger.js] 로그 기록 실패 (${type}):`, err);
    }
  });
}

module.exports = { logEvent };

