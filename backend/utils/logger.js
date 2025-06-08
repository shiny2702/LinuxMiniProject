const fs = require('fs');
const path = require('path');

// 로그를 저장할 기본 디렉토리 경로 (운영체제 내 시스템 로그 위치를 모방)
const LOG_DIR = '/var/log/LinuxFocusScheduler';

// 로그 타입별로 대응되는 로그 파일 경로 매핑 객체
const LOG_FILES = {
  schedule: path.join(LOG_DIR, 'scheduleSettings.log'),  // 스케줄 관련 이벤트 로그 파일 경로
  blocklist: path.join(LOG_DIR, 'blocklistSettings.log'), // 차단 목록 관련 이벤트 로그 파일 경로
};

/**
 * 지정한 타입별 로그 파일에 이벤트 메시지를 기록하는 함수
 * @param {string} type - 로그 타입 (예: 'schedule', 'blocklist')
 * @param {string} message - 기록할 로그 메시지 내용
 */
function logEvent(type, message) {
  // ISO 표준 날짜 포맷을 사람이 읽기 좋은 형식으로 변환 (YYYY-MM-DD HH:mm:ss)
  const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
  // 로그 한 줄에 타임스탬프와 메시지를 포함시키고 줄바꿈 추가
  const logLine = `${timestamp} ${message}\n`;

  // 로그 타입에 대응하는 파일 경로 조회
  const logFile = LOG_FILES[type];

  // 정의되지 않은 로그 타입이 전달된 경우 에러 메시지 출력 후 함수 종료
  if (!logFile) {
    console.error(`[logger.js] 잘못된 로그 타입: ${type}`);
    return;
  }

  // 로그를 저장할 디렉토리가 존재하지 않으면 재귀적으로 생성
  if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
  }

  // 비동기 방식으로 로그 내용을 파일에 덧붙임 (append)
  fs.appendFile(logFile, logLine, (err) => {
    if (err) {
      // 파일 쓰기 오류 발생 시 에러 메시지를 콘솔에 출력
      console.error(`[logger.js] 로그 기록 실패 (${type}):`, err);
    }
  });
}

// 모듈로 logEvent 함수 내보내기
module.exports = { logEvent };


