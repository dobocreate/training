// import "./todo.css";

const onClickAdd = () => {
  const inputText = document.getElementById("add-text").value;
  document.getElementById("add-text").value = ""; //追加したテキストを得て空欄に
  //ここより上の時点でうまくいってない

  //ここからが入力したテキストがtodoリストにのる作業
  //li生成
  const li = document.createElement("li");
  //div生成
  const div = document.createElement("div");
  div.className = "list-row";
  //p生成
  const p = document.createElement("p");
  p.className = "todo-item";
  p.innerText = inputText;
  //button生成
  const completeButton = document.createElement("button");
  completeButton.innerText = "完了";
  completeButton.addEventListener("click", () => {
    alert("完了");
  });

  const deleteButton = document.createElement("button");
  deleteButton.innerText = "削除";
  deleteButton.addEventListener("click", () => {
    //削除ボタンの親のliタグを削除
    const deleteTarget = deleteButton.closest("li");
    document.getElementById("incomplete-list").removeChild(deleteTarget);
  });

  div.appendChild(p); //階層構造にできるdivの子がp
  div.appendChild(completeButton);
  div.appendChild(deleteButton);
  li.appendChild(div);
  //未完了リストに追加
  document.getElementById("incomplete-list").appendChild(li);
};

document.getElementById("add-button").addEventListener("click", onClickAdd);
