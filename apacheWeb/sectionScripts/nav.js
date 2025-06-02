window.showSection = async function (id) {
  document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
  document.getElementById(id).style.display = 'block';

  if (id === 'schedule') {
    window.loadSchedules(); // 전역 함수
  }

  if (id === 'block') {
    window.loadBlockedItems();
  }

  if (id === 'calendar') {
    await loadFocusSummary();
    renderCalendar();
  }
};
