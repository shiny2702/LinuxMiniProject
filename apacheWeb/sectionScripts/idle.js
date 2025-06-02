window.togglePopup = function (enabled) {
  fetch('http://127.0.0.1:3000/idle/toggle-popup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled })
  })
    .then(res => res.text())
    .then(msg => {
      alert(msg);                      // 사용자에게 결과 표시
      updateIdleToggleState();         // 프론트 상태 재동기화
    })
    .catch(err => console.error('에러:', err));
};

// 프론트 상태 동기화 함수
async function updateIdleToggleState() {
  try {
    const res = await fetch('http://127.0.0.1:3000/idle/status');
    const { enabled } = await res.json();
    document.getElementById('idleToggle').checked = enabled;
  } catch (err) {
    console.error('상태 동기화 실패:', err);
  }
}

// 페이지 로드 시 체크박스 상태 동기화
window.addEventListener('DOMContentLoaded', updateIdleToggleState);