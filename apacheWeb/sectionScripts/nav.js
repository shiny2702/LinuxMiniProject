// 주어진 섹션 ID에 해당하는 콘텐츠만 화면에 표시하고, 필요한 데이터를 로드하는 함수
window.showSection = async function (id) {
  // 모든 <section> 요소를 숨김 처리하여 화면 초기화
  // defulat 화면 : schedule.html; 개별적으로 display none처리 안되어 있음
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');

  // 선택된 ID를 가진 섹션만 보이도록 설정
  const target = document.getElementById(id);
  if (target) target.style.display = 'block';

  // 섹션 ID에 따라 필요한 데이터를 비동기로 로드
  switch (id) {
    case 'schedule':
      // 스케줄 섹션이 열리면 일정 정보를 불러옴
      if (typeof window.loadSchedules === 'function') {
        await window.loadSchedules();
      }
      break;

    case 'block':
      // 블록 섹션이 열리면 차단 항목 정보를 불러옴
      if (typeof window.loadBlockedItems === 'function') {
        await window.loadBlockedItems();
      }
      break;

    case 'calendar':
      // 캘린더 섹션이 열리면 요약, 스케줄, 블록리스트 데이터를 모두 병렬로 불러옴
      if (
        typeof window.loadFocusSummary === 'function' &&
        typeof window.loadScheduleSettings === 'function' &&
        typeof window.loadBlocklistSettings === 'function'
      ) {
        await Promise.all([
          window.loadFocusSummary(),
          window.loadScheduleSettings(),
          window.loadBlocklistSettings()
        ]);
      }

      // 데이터를 다 불러온 뒤 캘린더 렌더링
      if (typeof window.renderCalendar === 'function') {
        window.renderCalendar();
      }
      break;
  }
};
