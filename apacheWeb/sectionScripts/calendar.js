// 현재 연도와 월을 전역 변수로 저장
window.currentYear = new Date().getFullYear();
window.currentMonth = new Date().getMonth();

// 캘린더 제목과 날짜 영역 요소 캐싱
window.calendarTitle = document.getElementById('calendarTitle');
window.calendarDays = document.getElementById('calendarDays');

// 각종 설정 데이터 저장용 전역 객체 초기화
window.focusSummary = {};         // 날짜별 집중 시간 요약 정보
window.scheduleSettings = {};     // 날짜별 일정 변경 내역
window.blocklistSettings = {};    // 날짜별 블록리스트 변경 내역

// focusedTime 요약 데이터 로드 함수
window.loadFocusSummary = async function () {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_focusedTime_summary.json');
    if (res.ok) {
      try {
        window.focusSummary = await res.json();
      } catch {
        window.focusSummary = {}; // 응답 파싱 실패 시 빈 객체로 초기화
      }
    }
  } catch (e) {
    console.error('⚠️ Error loading focus summary:', e);
  }
};

// 스케줄 설정 데이터 로드 함수
window.loadScheduleSettings = async function () {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_scheduleSettings.json');
    if (res.ok) {
      try {
        window.scheduleSettings = await res.json();
      } catch {
        window.scheduleSettings = {}; // 응답 파싱 실패 시 빈 객체로 초기화
      }
    }
  } catch (e) {
    console.error('⚠️ Error loading schedule settings:', e);
  }
};

// 블록리스트 설정 데이터 로드 함수
window.loadBlocklistSettings = async function () {
  try {
    const res = await fetch('http://127.0.0.1:3000/state/everyday_blocklistSettings.json');
    if (res.ok) {
      try {
        window.blocklistSettings = await res.json();
      } catch {
        window.blocklistSettings = {}; // 응답 파싱 실패 시 빈 객체로 초기화
      }
    }
  } catch (e) {
    console.error('⚠️ Error loading blocklist settings:', e);
  }
};

// 캘린더 렌더링 함수
window.renderCalendar = function () {
  // 기존 날짜 초기화
  calendarDays.innerHTML = '';

  // 요일 헤더 생성
  const weekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  for (let i = 0; i < 7; i++) {
    const header = document.createElement('div');
    header.className = 'calendar-header';
    header.textContent = weekdays[i];
    calendarDays.appendChild(header);
  }

  // 현재 월 시작 날짜 및 마지막 날짜 계산
  const date = new Date(currentYear, currentMonth, 1);
  const monthName = date.toLocaleString('default', { month: 'long' });
  calendarTitle.textContent = `${monthName} ${currentYear}`;

  const startDay = date.getDay(); // 시작 요일
  const lastDate = new Date(currentYear, currentMonth + 1, 0).getDate(); // 마지막 날짜

  const today = new Date();

  // 시작 요일 이전의 빈 셀 추가
  for (let i = 0; i < startDay; i++) {
    const empty = document.createElement('div');
    empty.className = 'calendar-day';
    empty.style.visibility = 'hidden';
    calendarDays.appendChild(empty);
  }

  // 날짜 셀 생성
  for (let day = 1; day <= lastDate; day++) {
    const cell = document.createElement('div');
    cell.className = 'calendar-day';

    // 오늘 날짜 강조
    const isToday =
      currentYear === today.getFullYear() &&
      currentMonth === today.getMonth() &&
      day === today.getDate();

    if (isToday) {
      cell.classList.add('today');
    }

    const dayStr = day.toString().padStart(2, '0');
    const monthStr = (currentMonth + 1).toString().padStart(2, '0');
    const dateKey = `${currentYear}-${monthStr}-${dayStr}`;
    const summary = focusSummary[dateKey];

    cell.textContent = day;

    // 해당 날짜에 집중 시간이 있으면 요약 표시
    if (summary && summary.total && summary.total !== "00:00:00") {
      const totalElem = document.createElement('div');
      totalElem.style.fontSize = '0.7em';
      totalElem.style.color = 'green';
      totalElem.textContent = `Total: ${summary.total}`;
      cell.appendChild(totalElem);
    }

    // 셀 클릭 시 해당 날짜의 상세 정보 출력
    cell.onclick = () => {
      let message = `${dateKey} Summary ::\n`;

      // 집중 시간 요약
      if (!summary || !summary.sessions || summary.sessions.length === 0) {
        message += `\nNo focused time record.`;
      } else {
        const sessions = summary.sessions.map(s =>
          `🟢 ${s.start} ~ 🔴 ${s.end} (${s.duration})`
        ).join('\n');
        message += `\n\n[Focused Sessions]\n${sessions}\n\nTotal :: ${summary.total}`;
      }

      // 스케줄 변경 내역
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

      // 블록리스트 변경 내역
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
};

// 이전 달로 이동
window.prevMonth = function () {
  currentMonth--;
  if (currentMonth < 0) {
    currentMonth = 11;
    currentYear--;
  }
  renderCalendar();
};

// 다음 달로 이동
window.nextMonth = function () {
  currentMonth++;
  if (currentMonth > 11) {
    currentMonth = 0;
    currentYear++;
  }
  renderCalendar();
};

// 이전 연도로 이동
window.prevYear = function () {
  currentYear--;
  renderCalendar();
};

// 다음 연도로 이동
window.nextYear = function () {
  currentYear++;
  renderCalendar();
};

