function initOnOffSwitch() {
  const toggle = document.getElementById("schedulerToggle");

  if (toggle) {
    toggle.addEventListener("change", async () => {
      const isOn = toggle.checked;
      console.log(`LinuxFocusScheduler ${isOn ? 'ON' : 'OFF'}`);

      if (isOn) {
        await handleSchedulerOn();
      } else {
        await handleSchedulerOff();
      }
    });
  } else {
    console.warn("schedulerToggle 요소를 찾을 수 없습니다.");
  }
}


async function handleSchedulerOn() {
  try {
    // 1. 현재가 Focus 시간인지 확인
    const res = await fetch('http://127.0.0.1:3000/utils/focusTimeChecker');
    const { isFocusTime } = await res.json();

    if (isFocusTime) {
      await execScript('block_domains.sh');
    }

    // 2. cron 등록 (자정 실행)
    await execScript('register_analyzing_cron.sh');

    // 3. idle monitor 및 GUI ON
    await toggleIdleMonitor(true);

    // 4. GUI 제어 해제 (원상 복구)
    removeGuiBlockOverlay();

  } catch (err) {
    console.error('ON 처리 중 오류 발생:', err);
  }
}

async function handleSchedulerOff() {
  try {
    // 1. focus 시간 중인지 확인
    const res = await fetch('http://127.0.0.1:3000/utils/focusTimeChecker');
    const { isFocusTime } = await res.json();

    if (isFocusTime) {
      await execScript('unblock_domains.sh');
    }

    // 2. cron 해제
    await execScript('remove_analyzing_cron.sh');

    // 3. idle monitor 및 GUI OFF
    await toggleIdleMonitor(false);

    // 4. GUI 제어 차단 (Shadow Overlay 추가)
    applyGuiBlockOverlay();

  } catch (err) {
    console.error('OFF 처리 중 오류 발생:', err);
  }
}


// ✅ 공통: 쉘 스크립트 실행 요청
async function execScript(scriptName) {
  const res = await fetch(`http://127.0.0.1:3000/scripts/run/${scriptName}`);
  const text = await res.text();
  console.log(`✔️ ${scriptName} 실행 결과:`, text);
}

// ✅ idle 모니터 on/off
async function toggleIdleMonitor(enabled) {
  await fetch('http://127.0.0.1:3000/idle/toggle-popup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  })
    .then(res => res.text())
    .then(msg => console.log(`Idle Monitor 상태 변경됨: ${msg}`))
    .catch(err => console.error('Idle Monitor 전환 오류:', err));
}

// ✅ GUI 차단
function applyGuiBlockOverlay() {
  if (!document.getElementById('guiBlockOverlay')) {
    const overlay = document.createElement('div');
    overlay.id = 'guiBlockOverlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100vw';
    overlay.style.height = '100vh';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
    overlay.style.zIndex = '9999';
    overlay.style.cursor = 'not-allowed';
    document.body.appendChild(overlay);
  }
}

// ✅ GUI 복구
function removeGuiBlockOverlay() {
  const overlay = document.getElementById('guiBlockOverlay');
  if (overlay) {
    overlay.remove();
  }
}

if (document.readyState === 'loading') {
  window.addEventListener("DOMContentLoaded", initOnOffSwitch);
} else {
  initOnOffSwitch(); // 이미 DOM이 준비됨
}


