// import "./style.css";

const onclickadd = () => {
  //テキストボックスの値を取得し、初期化する
  const inputText = document.getElementById("add-text").value;
  document.getElementById("add-text").value = "";

  //未完了リストに追加
  createIncompleteTodo(inputText);
};

//渡された引数を基に未完了のTODoを作成する関数
const createIncompleteTodo = (todo) => {
  //li生成
  const li = document.createElement("li");

  //div生成
  const div = document.createElement("div");
  div.className = "list-row";

  //完了タグ生成
  const completebutton = document.createElement("button");
  completebutton.innerText = "完了";
  completebutton.addEventListener("click", () => {
    //押された完了ボタンの親にあるliタグ配下の完了ボタンと削除ボタンを削除 nextElementSibling次にある対象をとる
    const moveTarget = completebutton.closest("li");
    completebutton.nextElementSibling.remove();
    completebutton.remove();
    //戻すボタンを生成してdivタグ配下に設定
    const backButton = document.createElement("button");
    backButton.innerText = "戻す";
    backButton.addEventListener("click", () => {
      const todoText = backButton.previousElementSibling.innerText;
      createIncompleteTodo(todoText);
      backButton.closest("li").remove();
    });
    moveTarget.firstElementChild.appendChild(backButton);
    //完了リストに移動
    document.getElementById("complete-list").appendChild(moveTarget);
  });
  //削除タグ生成
  const deletebutton = document.createElement("button");
  deletebutton.innerText = "削除";
  deletebutton.addEventListener("click", () => {
    // 押された削除ボタンの親にあるぃタグを未完了リストから削除closetは一番近い親を探す
    const deleteTarget = deletebutton.closest("li");
    document.getElementById("incomplete-list").removeChild(deleteTarget);
  });

  //p生成
  const p = document.createElement("p");
  p.className = "todo-item";
  p.innerText = todo;

  div.appendChild(p);
  div.appendChild(completebutton);
  div.appendChild(deletebutton);
  li.appendChild(div);

  document.getElementById("incomplete-list").appendChild(li);
};
document.getElementById("add-button").addEventListener("click", onclickadd);
