// sectionScripts/block.js

// 차단된 사이트/앱 목록을 불러와 화면에 표시하는 함수
window.loadBlockedItems = async function () {
  // 서버에서 차단된 도메인 목록을 요청
  const res = await fetch("http://127.0.0.1:3000/blockSiteApp/list");
  const items = await res.json();

  // 목록을 표시할 UL 요소를 가져와 초기화
  const list = document.getElementById("blockList");
  list.innerHTML = "";

  // 받아온 각 도메인 항목을 리스트에 추가
  items.forEach(({ id, domain }) => {
    const li = document.createElement("li");
    li.textContent = domain;
    li.dataset.id = id; // 각 항목에 ID를 데이터 속성으로 저장

    // 삭제 버튼 생성 및 이벤트 핸들러 등록
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      // 서버에 삭제 요청
      const delRes = await fetch(`http://127.0.0.1:3000/blockSiteApp/delete/${id}`, {
        method: "DELETE"
      });

      // 삭제 성공 시 화면에서도 제거
      if (delRes.ok) {
        li.remove();
      } else {
        alert("삭제 실패");
      }
    };

    li.appendChild(delBtn);
    list.appendChild(li);
  });
};

// 새로운 차단 도메인을 추가하는 함수
window.addBlockedItem = async function () {
  const input = document.getElementById("blockInput");
  const domain = input.value.trim();

  // 입력값 검증
  if (!domain) {
    alert("차단할 도메인을 입력해주세요.");
    return;
  }

  // 서버에 도메인 추가 요청
  const res = await fetch("http://127.0.0.1:3000/blockSiteApp/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ domain })
  });

  const data = await res.json();

  // 추가 성공 시 화면에 새 항목 추가
  if (res.ok) {
    const id = data.id;

    const li = document.createElement("li");
    li.textContent = domain;
    li.dataset.id = id;

    // 삭제 버튼 생성 및 이벤트 핸들러 등록
    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      // 서버에 삭제 요청
      const delRes = await fetch(`http://127.0.0.1:3000/blockSiteApp/delete/${id}`, {
        method: "DELETE"
      });

      // 삭제 성공 시 화면에서도 제거
      if (delRes.ok) {
        li.remove();
      } else {
        alert("삭제 실패");
      }
    };

    li.appendChild(delBtn);
    document.getElementById("blockList").appendChild(li);
    input.value = ""; // 입력창 초기화
  } else {
    alert(data.message || "도메인 차단 실패");
  }
};


