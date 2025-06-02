// sectionScripts/block.js

window.loadBlockedItems = async function () {
  const res = await fetch("http://127.0.0.1:3000/blockSiteApp/list");
  const items = await res.json();

  const list = document.getElementById("blockList");
  list.innerHTML = "";

  items.forEach(({ id, hostname }) => {
    const li = document.createElement("li");
    li.textContent = hostname;
    li.dataset.id = id;

    const delBtn = document.createElement("button");
    delBtn.textContent = "Delete";
    delBtn.className = "delete-btn";
    delBtn.onclick = async () => {
      const delRes = await fetch(`http://127.0.0.1:3000/blockSiteApp/delete/${id}`, {
        method: "DELETE"
      });

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

window.onload = window.loadBlockedItems;

window.addBlockedItem = async function () {
  const input = document.getElementById("blockInput");
  const hostname = input.value.trim();

  if (!hostname) {
    alert("차단할 도메인을 입력해주세요.");
    return;
  }

  const res = await fetch("http://127.0.0.1:3000/blockSiteApp/add", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ hostname })
  });

  const data = await res.json();
  const id = data.id;

  const li = document.createElement("li");
  li.textContent = hostname;
  li.dataset.id = id;

  const delBtn = document.createElement("button");
  delBtn.textContent = "Delete";
  delBtn.className = "delete-btn";
  delBtn.onclick = async () => {
    const delRes = await fetch(`http://127.0.0.1:3000/blockSiteApp/delete/${id}`, {
      method: "DELETE"
    });

    if (delRes.ok) {
      li.remove();
    } else {
      alert("삭제 실패");
    }
  };

  li.appendChild(delBtn);
  document.getElementById("blockList").appendChild(li);
  input.value = "";
};

