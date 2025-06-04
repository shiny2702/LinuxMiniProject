// 서버에서 저장된 집중 시간 스케줄 목록을 불러와 화면에 출력
window.loadSchedules = async function () {
  const res = await fetch("http://127.0.0.1:3000/schedule/list");
  const schedules = await res.json();

  const list = document.getElementById("scheduleList");
  list.innerHTML = ""; // 기존 목록 초기화

  schedules.forEach(({ id, startHour, startMin, endHour, endMin }) => {
    // 시작/종료 시간을 HH:MM 형식의 문자열로 변환
    const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const li = document.createElement("li");
    li.textContent = `${startStr} ~ ${endStr}`;
    li.dataset.id = id; // 스케줄 ID 저장

    // 삭제 버튼 생성 및 삭제 로직 설정
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      const delRes = await fetch(`http://127.0.0.1:3000/schedule/delete/${id}`, { method: "DELETE" });
      if (delRes.ok) li.remove();
      else alert("삭제 실패");
    };

    li.appendChild(delBtn);
    list.appendChild(li); // 목록에 항목 추가
  });
};

// 입력된 시작/종료 시간으로 새 집중 시간 스케줄을 추가하고 UI에 반영
window.addFocusTime = async function () {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (start && end) {
    // HH:MM 문자열을 숫자 시간값으로 분해
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    // 서버에 새 스케줄 등록 요청
    const res = await fetch("http://127.0.0.1:3000/schedule/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startHour, startMin, endHour, endMin }),
    });

    const data = await res.json();

    if (res.ok) {
      const id = data.id;

      // 등록된 스케줄을 UI에 즉시 반영
      const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
      const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

      const li = document.createElement("li");
      li.textContent = `${startStr} ~ ${endStr}`;
      li.dataset.id = id;

      // 삭제 버튼 설정
      const delBtn = document.createElement("button");
      delBtn.textContent = "Delete";
      delBtn.className = "delete-btn";
      delBtn.onclick = async () => {
        const delRes = await fetch(`http://127.0.0.1:3000/schedule/delete/${id}`, {
          method: "DELETE"
        });
        if (delRes.ok) {
          li.remove();
        } else {
          alert("삭제 실패");
        }
      };

      li.appendChild(delBtn);
      document.getElementById("scheduleList").appendChild(li);

      // 입력 폼 초기화
      document.getElementById("startTime").value = "";
      document.getElementById("endTime").value = "";
    } else {
      alert(data.message || "스케줄 추가 실패");
    }
  } else {
    alert("Please enter both start and end times.");
  }
};

