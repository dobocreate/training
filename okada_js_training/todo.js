// import "./todo.css";

const onClickAdd = () => {
  const inputText = document.getElementById("add-text").value;
  document.getElementById("add-text").value = ""; //追加したテキストを得て空欄に

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
    //ボタンを削除
    const moveTarget = completeButton.closest("li");
    completeButton.nextElementSibling.remove();
    completeButton.remove();
    //戻すボタンを設置
    const backButton = document.createElement("button");
    backButton.innerText = "戻す";
    backButton.addEventListener("click", () => {
      moveTarget.firstElementChild.appendChild(backButton);
    });
    moveTarget.firstElementChild.appendChild(backButton);
    //完了リストに移動
    document.getElementById("complete-list").appendChild(moveTarget);
  });

  // //
  // //戻すボタンで未完了に移動
  // backButton.addEventListener("click", () => {
  //   const moveTarget = backButton.closest("li");
  //   backButton.nextElementSibling.remove();
  //   backButton.remove();

  //   const completeButton = document.createElement("button");
  //   completeButton.innerText = "完了";
  //   const deleteButton = document.createElement("button");
  //   deleteButton.innerText = "削除";
  //   moveTarget.firstElementChild.appendChild(completeButton);
  //   moveTarget.firstElementChild.appendChild(deleteButton);
  //   //未完了リストに移動
  //   document.getElementById("incomplete-list").appendChild(moveTarget);
  // });
  // //

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

const createIncompleteTodo = (todo) => {
  const li = document.createElement("li");
  const div = document.createElement("div");
};

document.getElementById("add-button").addEventListener("click", onClickAdd);
