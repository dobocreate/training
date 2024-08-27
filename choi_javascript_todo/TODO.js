// ボタンをクリックすると、イベント発生
document.getElementsByClassName("input-button")[0].addEventListener("click", InputText);

// 検索窓に登録した情報をオブジェクト化する関数
function InputText() {

  const AddText = document.getElementsByClassName("text")[0].value;
  document.getElementsByClassName("text")[0].value = ""; //初期化

  // 未完了リストを作るEventListener
  document.getElementsByClassName("input-button")[0].addEventListener("click", CreateToDoList(AddText));
};

// 未完了リストが削除
function DeleatBox(target) {
  document.getElementById("ToDo-Area").removeChild(target);
};

// 完了リストが削除
function DeleatClearBox(target) {
  document.getElementById("Clear-Area").removeChild(target);
};

// Clearボタンを押したら、Claer-Areaに移る。
function CreateToDoList(addtext) {

  // 未完成リストに関するCloneを作る
  const template = document.getElementById("todo-item");
  const ToDoList = template.cloneNode(true);

  const ToDoTextBox = ToDoList.querySelector(".todo-text");
  // 入力箱の単語をCloneのTextBoxに反映する。
  ToDoTextBox.append(addtext);

  // ボタンのObject化
  const CloneDeletButton = ToDoList.querySelector(".DeleteButton");
  const CloneClearButton = ToDoList.querySelector(".ClearButton");

  // ToDo-Areaに未完了リストを入れる
  document.getElementById("ToDo-Area").appendChild(ToDoList);

  // 未完了リストを完了リストに移るEvenListener
  CloneClearButton.addEventListener("click", function () { CreateClearAreaColne(ToDoList); });
  // 未完了リストの削除に関するEvenListener
  CloneDeletButton.addEventListener("click", function () { DeleatBox(ToDoList); });
};

// 未完了リストを完了リストに移る
function CreateClearAreaColne(claertarget) {

  // Clone を作る
  const template = document.getElementById("clear-item")
  const Clearlist = template.cloneNode(true)
  const ToDoText = claertarget.querySelector(".todo-text").value;


  const ClearTextBox = Clearlist.querySelector(".clear-text");
  const ClearDeletButton = Clearlist.querySelector(".DeleteButton");
  const ClearDoButton = Clearlist.querySelector(".DoButton");
  const ClearText = Clearlist.querySelector(".clear-text").value;

  // 未完了リストの内容を完了リストに文字を移る
  ClearTextBox.append(ToDoText);
  //Clear-Areaに完了リストを入れる
  document.getElementById("Clear-Area").appendChild(Clearlist);
  // ToDo-Areaから未完了リストを削除
  document.getElementById("ToDo-Area").removeChild(claertarget);

  // 未完了、削除ボタンに関するEventListener
  ClearDeletButton.addEventListener("click", function () { DeleatClearBox(Clearlist); });
  ClearDoButton.addEventListener("click", function () { CreateToDoList(ClearText); });
  ClearDoButton.addEventListener("click", function () { DeleatClearBox(Clearlist); });
};



