// 📁 /utils/focusTimeChecker.js
const fs = require('fs');
const path = require('path');

// 집중 시간 스케줄이 저장된 JSON 파일 경로
const SCHEDULE_FILE = path.join(__dirname, '..', '..', 'state', 'registered_schedule.json');

/**
 * 안전하게 JSON 파일을 읽어서 파싱하는 함수
 * - 파일이 존재하지 않으면 빈 배열 반환
 * - 파일 내용이 빈 문자열이거나 JSON 파싱 실패 시에도 빈 배열 반환
 * - 에러 발생 시 에러 메시지를 콘솔에 출력함
 * param {string} filePath - JSON 파일 경로
 * returns {Array} - 파싱된 JSON 데이터 배열 또는 빈 배열
 */
function safeLoadJson(filePath) {
  try {
    if (!fs.existsSync(filePath)) return [];                  // 파일이 없으면 빈 배열 반환
    const raw = fs.readFileSync(filePath, 'utf-8').trim();    // 파일 내용 읽고 앞뒤 공백 제거
    return raw ? JSON.parse(raw) : [];                         // 빈 문자열이면 빈 배열 반환, 아니면 JSON 파싱
  } catch (e) {
    console.error(`[focusTimeChecker.js] JSON 파싱 오류: ${e.message}`); // 파싱 실패 시 로그 출력
    return [];                                                 // 에러 발생 시 빈 배열 반환으로 안전 처리
  }
}

/**
 * 저장된 집중 시간 스케줄 목록을 반환하는 함수
 * - 내부적으로 safeLoadJson을 사용해 SCHEDULE_FILE에서 읽음
 * returns {Array} - 집중 시간 스케줄 객체 배열
 */
function getScheduleList() {
  return safeLoadJson(SCHEDULE_FILE);
}

/**
 * 현재 시각이 집중 시간(scheduleList 내 구간)인지 판단하는 함수
 * param {Array|null} scheduleList - 집중 시간 스케줄 배열 (없으면 내부에서 getScheduleList 호출)
 * returns {boolean} - 현재가 집중 시간 범위 내에 있으면 true, 아니면 false
 */
function isFocusTimeNow(scheduleList = null) {
  const now = new Date();
  // 현재 시각을 '분' 단위로 변환 
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  if (!scheduleList) scheduleList = getScheduleList();

  // scheduleList 배열 내 각 스케줄 객체에 대해 현재 시간이 범위(start~end)에 포함되는지 확인
  return scheduleList.some(schedule => {
    const start = schedule.startHour * 60 + schedule.startMin; // 시작 시각을 분으로 환산
    const end = schedule.endHour * 60 + schedule.endMin;       // 종료 시각을 분으로 환산
    // 현재 시간이 시작 시각 이상이고 종료 시각 미만이면 true
    return currentMinutes >= start && currentMinutes < end;
  });
}

// 모듈로 함수 내보내기
module.exports = { isFocusTimeNow, getScheduleList };

