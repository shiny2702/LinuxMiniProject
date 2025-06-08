// 주어진 경로의 HTML 컴포넌트를 비동기적으로 로드하여 문자열로 반환
async function loadComponent(path) {
  const res = await fetch(path);
  return await res.text();
}

// 애플리케이션 초기화 함수
async function initApp() {
  const app = document.getElementById('app'); // 주요 콘텐츠가 삽입될 컨테이너
  const toggleContainer = document.getElementById('toggle-container'); // 온오프 스위치가 들어갈 컨테이너

  // 1. 온오프 스위치 컴포넌트를 먼저 로드하여 toggleContainer에 삽입
  const toggleHTML = await loadComponent('components/switch-onOff.html');
  toggleContainer.innerHTML = toggleHTML;

  // 2. 나머지 기능 섹션 컴포넌트들을 순서대로 로드하여 app 내부에 삽입
  const files = [
    'components/nav.html',                // 상단 네비게이션 바
    'components/section-schedule.html',  // 집중 시간 설정 섹션
    'components/section-block.html',     // 도메인 차단 섹션
    'components/section-idle.html',      // 유휴 상태 설정 섹션
    'components/section-calendar.html'   // 캘린더 표시 섹션
  ];

  // 각 컴포넌트를 순차적으로 로드하고 app 내부에 HTML로 삽입
  for (const file of files) {
    const html = await loadComponent(file);
    app.insertAdjacentHTML('beforeend', html);
  }

  // 3. 각 섹션에 대응되는 기능 스크립트를 비동기적으로 import (모듈 단위로 로딩)
  await import('./sectionScripts/onOff.js');      // 온오프 스위치 동작 처리
  await import('./sectionScripts/nav.js');        // 네비게이션 관련 동작
  await import('./sectionScripts/schedule.js');   // 스케줄(집중 시간) 기능
  await import('./sectionScripts/block.js');      // 도메인 차단/해제 기능
  await import('./sectionScripts/idle.js');       // 유휴 상태 모니터링 기능
  await import('./sectionScripts/calendar.js');   // 캘린더 표시 기능
}

// 페이지 로드 시 애플리케이션 초기화 시작
initApp();

