// 유휴 팝업 기능 활성화/비활성화 요청을 서버에 전송
window.togglePopup = function (enabled) {
  fetch('http://127.0.0.1:3000/idle/toggle-popup', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ enabled }) // 사용자가 선택한 상태 전달
  })
    .then(res => res.text()) // 서버 응답 메시지를 텍스트로 추출
    .then(msg => {
      alert(msg);              // 사용자에게 서버 응답 알림
      updateIdleToggleState(); // 체크박스 상태를 서버 상태와 동기화
    })
    .catch(err => console.error('❌ 서버 요청 중 에러 발생:', err));
};

// 서버에서 현재 유휴 팝업 기능 상태를 가져와 체크박스 상태를 반영
async function updateIdleToggleState() {
  try {
    const res = await fetch('http://127.0.0.1:3000/idle/status'); // 현재 상태 요청
    const { enabled } = await res.json(); // 응답에서 enabled 필드 추출
    document.getElementById('idleToggle').checked = enabled; // 체크박스에 반영
  } catch (err) {
    console.error('⚠️ 유휴 팝업 상태 동기화 실패:', err);
  }
}

// 페이지 로드 완료 시 유휴 팝업 체크박스 상태를 서버 기준으로 동기화
window.addEventListener('DOMContentLoaded', updateIdleToggleState);
