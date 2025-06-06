// ON/OFF 토글 스위치 초기화 함수: 체크 상태에 따라 스케줄러 ON 또는 OFF 처리
window.initOnOffSwitch = function () {
  const toggle = document.getElementById("schedulerToggle");

  if (toggle) {
    toggle.addEventListener("change", async () => {
      const isOn = toggle.checked;
      console.log(`LinuxFocusScheduler ${isOn ? 'ON' : 'OFF'}`);

      if (isOn) {
        await window.handleSchedulerOn();
      } else {
        await window.handleSchedulerOff();
      }
    });
  } else {
    console.warn("schedulerToggle 요소를 찾을 수 없습니다.");
  }
};

// 스케줄러 ON 시 실행되는 처리 로직
window.handleSchedulerOn = async function () {
  try {
    // 현재 집중 시간인지 확인
    const res = await fetch('http://127.0.0.1:3000/utils/focusTimeChecker');
    const { isFocusTime } = await res.json();

    // 크론 등록 스크립트 실행 (집중 시간 도메인 차단/해제 및 집중 시간 분석용 전체)
    await window.execScript('register_analyzing_cron.sh');
    await window.execScript('register_cron.sh');

    // 집중 시간이라면 도메인 차단 스크립트 실행
    if (isFocusTime) {
      await window.execScript('block_domains.sh');
    }

    // Idle 모니터링 시작
    await window.toggleIdleMonitor(true);

    // GUI 차단 오버레이 제거 (사용 가능 상태로 전환)
    window.removeGuiBlockOverlay();
  } catch (err) {
    console.error('ON 처리 중 오류 발생:', err);
  }
};

// 스케줄러 OFF 시 실행되는 처리 로직
window.handleSchedulerOff = async function () {
  try {
    // 현재 집중 시간인지 확인
    const res = await fetch('http://127.0.0.1:3000/utils/focusTimeChecker');
    const { isFocusTime } = await res.json();

    // 등록된 크론 전체 제거
    await window.execScript('remove_analyzing_cron.sh');
    await window.execScript('remove_cron.sh');

    // 집중 시간이라면 도메인 차단 해제 스크립트 실행
    if (isFocusTime) {
      await window.execScript('unblock_domains.sh');
    }

    // Idle 모니터링 중단
    await window.toggleIdleMonitor(false);

    // GUI 차단 오버레이 추가 (작업 비활성화 상태로 전환)
    window.applyGuiBlockOverlay();
  } catch (err) {
    console.error('OFF 처리 중 오류 발생:', err);
  }
};

// 서버 측에 요청을 보내 쉘 스크립트를 실행하는 함수
window.execScript = async function (scriptName) {
  const res = await fetch(`http://127.0.0.1:3000/scripts/run/${scriptName}`);
  const text = await res.text();
  console.log(`✔️ ${scriptName} 실행 결과:`, text);
};

// Idle 팝업 모니터링 활성화/비활성화 요청
window.toggleIdleMonitor = async function (enabled) {
  await fetch('http://127.0.0.1:3000/idle/toggle-popup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  })
    .then(res => res.text())
    .then(msg => console.log(`Idle Monitor 상태 변경됨: ${msg}`))
    .catch(err => console.error('Idle Monitor 전환 오류:', err));
};

// GUI 차단 오버레이를 app 내부에 추가 (화면 클릭 등 비활성화)
window.applyGuiBlockOverlay = function () {
  if (!document.getElementById('guiBlockOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'guiBlockOverlay';

    // app 요소를 기준으로 오버레이 설정
    const app = document.getElementById('app');
    if (!app) return;

    // 오버레이 스타일 설정
    overlay.style.position = 'absolute';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'not-allowed';

    // app을 상대 위치로 설정해 오버레이 기준을 맞춤
    app.style.position = 'relative';

    // 오버레이 추가 (app 내부에만 적용)
    app.appendChild(overlay);
  }
};

// GUI 차단 오버레이 제거 (다시 사용자 인터페이스 활성화)
window.removeGuiBlockOverlay = function () {
  const overlay = document.getElementById('guiBlockOverlay');
  if (overlay) {
    overlay.remove();

    const app = document.getElementById('app');
    if (app) {
      app.style.position = '';
    }
  }
};

// 페이지 로딩 상태에 따라 스케줄러 스위치 초기화 실행 시점 결정
if (document.readyState === 'loading') {
  // 아직 DOM이 완전히 생성되지 않은 상태라면, DOMContentLoaded 이벤트 발생 후 initOnOffSwitch 실행 (안전하게 요소 접근 가능)
  window.addEventListener("DOMContentLoaded", window.initOnOffSwitch);
} else {
  // 이미 DOM이 로드 완료된 상태라면, 즉시 initOnOffSwitch 실행
  window.initOnOffSwitch();
}


