import "./todo.css";

const onClickAdd = () => {
  const inputText = document.getElementById("add-text").value;
  document.getElementById("add-text").value = "";
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

  div.appendChild(p); //階層構造にできるdivの子がp
  li.appendChild(div);
  //未完了リストに追加
  document.getElementById("incomplete-list").appendChild(li);
};

document.getElementById("add-button").addEventListener("click", onClickAdd);
