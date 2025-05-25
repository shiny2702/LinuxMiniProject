async function loadComponent(path) {
  const res = await fetch(path);
  return await res.text();
}

async function initApp() {
  const app = document.getElementById('app');

  const files = [
    'components/nav.html',
    'components/section-schedule.html',
    'components/section-block.html',
    'components/section-auth.html',
    'components/section-idle.html',
    'components/section-report.html',
    'components/section-calendar.html'
  ];

  for (const file of files) {
    const html = await loadComponent(file);
    app.insertAdjacentHTML('beforeend', html);
  }

  // 기존 JS 기능들 삽입 (변경 없이 유지 가능)
  // showSection, addFocusTime, addBlockedItem, togglePopup, renderCalendar 등 전부 여기에 둡니다
  window.showSection = function (id) {
    document.querySelectorAll('section').forEach(sec => sec.style.display = 'none');
    document.getElementById(id).style.display = 'block';
  };

  window.addFocusTime = function () {
    const start = document.getElementById("startTime").value;
    const end = document.getElementById("endTime").value;
    if (start && end) {
      const li = document.createElement("li");
      li.textContent = `${start} ~ ${end}`;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => li.remove();
      li.appendChild(delBtn);
      document.getElementById("scheduleList").appendChild(li);
      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
    } else {
      alert("Please enter both start and end times.");
    }
  };

  window.addBlockedItem = function () {
    const input = document.getElementById("blockInput");
    const value = input.value.trim();
    if (value) {
      const li = document.createElement("li");
      li.textContent = value;
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = () => li.remove();
      li.appendChild(delBtn);
      document.getElementById("blockList").appendChild(li);
      input.value = "";
    } else {
      alert("Please enter a site or app name.");
    }
  };

  window.togglePopup = function (enabled) {
    fetch('http://127.0.0.1:3000/toggle-popup', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled })
    }).then(res => res.text())
      .then(msg => alert(msg))
      .catch(err => console.error('에러:', err));
  };

  
  // Calendar 관련 로직
  let currentYear = new Date().getFullYear();
  let currentMonth = new Date().getMonth();
  const calendarTitle = document.getElementById('calendarTitle');
  const calendarDays = document.getElementById('calendarDays');

  function renderCalendar() {
    calendarDays.innerHTML = '';
    const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    for (let i = 0; i < 7; i++) {
      const header = document.createElement('div');
      header.className = 'calendar-header';
      header.textContent = weekdays[i];
      calendarDays.appendChild(header);
    }

    const date = new Date(currentYear, currentMonth, 1);
    const monthName = date.toLocaleString('default', { month: 'long' });
    calendarTitle.textContent = `${monthName} ${currentYear}`;

    const startDay = date.getDay();
    const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate();

    for (let i = 0; i < startDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'calendar-day';
      empty.style.visibility = 'hidden';
      calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day++) {
      const cell = document.createElement('div');
      cell.className = 'calendar-day';
      cell.textContent = day;
      cell.onclick = () => alert(`Activity summary for ${currentYear}-${(currentMonth + 1).toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`);
      calendarDays.appendChild(cell);
    }
  }

  window.prevMonth = function () {
    currentMonth--;
    if (currentMonth < 0) {
      currentMonth = 11;
      currentYear--;
    }
    renderCalendar();
  };

  window.nextMonth = function () {
    currentMonth++;
    if (currentMonth > 11) {
      currentMonth = 0;
      currentYear++;
    }
    renderCalendar();
  };

  window.prevYear = function () {
    currentYear--;
    renderCalendar();
  };

  window.nextYear = function () {
    currentYear++;
    renderCalendar();
  };

  renderCalendar();
}

initApp();
