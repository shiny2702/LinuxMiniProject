async function loadComponent(path) {
  const res = await fetch(path);
  return await res.text();
}

async function initApp() {
  const app = document.getElementById('app');
  const toggleContainer = document.getElementById('toggle-container');

  // 1. Toggle Switch 먼저 삽입
  const toggleHTML = await loadComponent('components/switch-onOff.html');
  toggleContainer.innerHTML = toggleHTML;

  // 2. 다른 섹션 컴포넌트 로드
  const files = [
    'components/nav.html',
    'components/section-schedule.html',
    'components/section-block.html',
    'components/section-idle.html',
    'components/section-report.html',
    'components/section-calendar.html'
  ];

  for (const file of files) {
    const html = await loadComponent(file);
    app.insertAdjacentHTML('beforeend', html);
  }

  // 각 기능별 스크립트 로드
  await import('./sectionScripts/onOff.js');
  await import('./sectionScripts/nav.js');
  await import('./sectionScripts/schedule.js');
  await import('./sectionScripts/block.js');
  await import('./sectionScripts/idle.js');
  await import('./sectionScripts/calendar.js');
}

initApp();
