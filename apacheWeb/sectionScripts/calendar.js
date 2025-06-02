let currentYear = new Date().getFullYear();
let currentMonth = new Date().getMonth();
const calendarTitle = document.getElementById('calendarTitle');
const calendarDays = document.getElementById('calendarDays');

let focusSummary = {};
let scheduleSettings = {};
let blocklistSettings = {};

// focusedTime 요약 불러오기
async function loadFocusSummary() {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_focusedTime_summary.json');
    if (res.ok) {
      focusSummary = await res.json();
    }
  } catch (e) {
    console.error('⚠️ Error loading focus summary:', e);
  }
}

// 스케줄 설정 불러오기
async function loadScheduleSettings() {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_scheduleSettings.json');
    if (res.ok) {
      scheduleSettings = await res.json();
    }
  } catch (e) {
    console.error('⚠️ Error loading schedule settings:', e);
  }
}

// 블록리스트 설정 불러오기
async function loadBlocklistSettings() {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_blocklistSettings.json');
    if (res.ok) {
      blocklistSettings = await res.json();
    }
  } catch (e) {
    console.error('⚠️ Error loading blocklist settings:', e);
  }
}


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

    const today = new Date();
    
    for (let i = 0; i < startDay; i++) {
        const empty = document.createElement('div');
        empty.className = 'calendar-day';
        empty.style.visibility = 'hidden';
        calendarDays.appendChild(empty);
    }

    for (let day = 1; day <= lastDate; day++) {
        const cell = document.createElement('div');
        cell.className = 'calendar-day';

    // 오늘 날짜인지 확인
    const isToday =
      currentYear === today.getFullYear() &&
      currentMonth === today.getMonth() &&
      day === today.getDate();

    if (isToday) {
      cell.classList.add('today'); // 'today' 클래스 추가
    }

    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
    const summary = focusSummary[dateKey];
    
    cell.textContent = day;

    if (summary && summary.total && summary.total !== "00:00:00") {
      const totalElem = document.createElement('div');
      totalElem.style.fontSize = '0.7em';
      totalElem.style.color = 'green';
      totalElem.textContent = `Total: ${summary.total}`;
      cell.appendChild(totalElem);
    }

    cell.onclick = () => {
      let message = `${dateKey} Summary ::\n`;

      // 📌 Focus summary
      if (!summary || !summary.sessions || summary.sessions.length === 0) {
        message += `\nNo focused time record.`;
      } else {
        const sessions = summary.sessions.map(s =>
          `🟢 ${s.start} ~ 🔴 ${s.end} (${s.duration})`
        ).join('\n');
        message += `\n\n[Focused Sessions]\n${sessions}\n\nTotal :: ${summary.total}`;
      }

      // 📌 Schedule settings
      const schedule = scheduleSettings[dateKey];
      if (schedule) {
        message += `\n\n[Schedule settings]`;
        if (schedule.added && schedule.added.length > 0) {
          message += `\n➕ Added:\n${schedule.added.map(i => `  • ${i.info}`).join('\n')}`;
        }
        if (schedule.deleted && schedule.deleted.length > 0) {
          message += `\n➖ Deleted:\n${schedule.deleted.map(i => `  • ${i.info}`).join('\n')}`;
        }
      }

      // 📌 Blocklist settings
      const blocklist = blocklistSettings[dateKey];
      if (blocklist) {
        message += `\n\n[Blocklist settings]`;
        if (blocklist.added && blocklist.added.length > 0) {
          message += `\n➕ Added:\n${blocklist.added.map(site => `  • ${site}`).join('\n')}`;
        }
        if (blocklist.deleted && blocklist.deleted.length > 0) {
          message += `\n➖ Deleted:\n${blocklist.deleted.map(site => `  • ${site}`).join('\n')}`;
        }
      }

      alert(message);
    };

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

window.onload = async () => {
  await loadFocusSummary();
  renderCalendar();
};
