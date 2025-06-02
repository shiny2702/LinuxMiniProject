window.loadSchedules = async function () {
  const res = await fetch("http://127.0.0.1:3000/schedule/list");
  const schedules = await res.json();

  const list = document.getElementById("scheduleList");
  list.innerHTML = "";

  schedules.forEach(({ id, startHour, startMin, endHour, endMin }) => {
    const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const li = document.createElement("li");
    li.textContent = `${startStr} ~ ${endStr}`;
    li.dataset.id = id;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      const delRes = await fetch(`http://127.0.0.1:3000/schedule/delete/${id}`, { method: "DELETE" });
      if (delRes.ok) li.remove();
      else alert("삭제 실패");
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
};

window.onload = window.loadSchedules;

window.addFocusTime = async function () {
  const start = document.getElementById("startTime").value;
  const end = document.getElementById("endTime").value;

  if (start && end) {
    const [startHour, startMin] = start.split(":").map(Number);
    const [endHour, endMin] = end.split(":").map(Number);

    const res = await fetch("http://127.0.0.1:3000/schedule/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ startHour, startMin, endHour, endMin }),
    });

    const data = await res.json();
    const id = data.id;

    const startStr = `${String(startHour).padStart(2, '0')}:${String(startMin).padStart(2, '0')}`;
    const endStr = `${String(endHour).padStart(2, '0')}:${String(endMin).padStart(2, '0')}`;

    const li = document.createElement("li");
    li.textContent = `${startStr} ~ ${endStr}`;
    li.dataset.id = id;

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

    document.getElementById("startTime").value = "";
    document.getElementById("endTime").value = "";
  } else {
    alert("Please enter both start and end times.");
  }
};
