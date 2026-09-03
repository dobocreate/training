// TODOのデータを配列で持ち、配列の中身から画面を作り直す方式にしている。
// 1件のTODOは { id: 連番, text: 入力された文字, done: 完了したかどうか } の形。
let todos = [];
let nextId = 1;

// よく使う要素は最初に取得しておく
const form = document.getElementById("todo-form");
const addText = document.getElementById("add-text");
const errorMessage = document.getElementById("error-message");
const incompleteList = document.getElementById("incomplete-list");
const completeList = document.getElementById("complete-list");
const incompleteEmpty = document.getElementById("incomplete-empty");
const completeEmpty = document.getElementById("complete-empty");
const incompleteCount = document.getElementById("incomplete-count");
const completeCount = document.getElementById("complete-count");

// 追加ボタンを押したとき（Enterキーで送信したときも同じ）
const onSubmit = (event) => {
  // formの送信でページが再読み込みされるのを止める
  event.preventDefault();

  // 前後の空白を取り除いた文字を使う
  const text = addText.value.trim();

  // 空のまま追加できないようにする
  if (text === "") {
    errorMessage.textContent = "TODOを入力してください";
    return;
  }

  errorMessage.textContent = "";
  todos.push({ id: nextId, text: text, done: false });
  nextId++;

  // 入力欄を空にして、次の入力ができる状態に戻す
  addText.value = "";
  addText.focus();

  render();
};

// 完了 / 戻す を切り替える
const toggleTodo = (id) => {
  const todo = todos.find((item) => item.id === id);
  todo.done = !todo.done;
  render();
};

// 指定したidのTODOを配列から取り除く
const deleteTodo = (id) => {
  todos = todos.filter((item) => item.id !== id);
  render();
};

// TODO1件分のliタグを作って返す
const createTodoElement = (todo) => {
  const li = document.createElement("li");

  const div = document.createElement("div");
  div.className = "list-row";

  const p = document.createElement("p");
  p.className = "todo-item";
  p.textContent = todo.text;

  // 未完了なら「完了」、完了済みなら「戻す」ボタンにする
  const toggleButton = document.createElement("button");
  toggleButton.textContent = todo.done ? "戻す" : "完了";
  toggleButton.addEventListener("click", () => toggleTodo(todo.id));

  const deleteButton = document.createElement("button");
  deleteButton.className = "delete-button";
  deleteButton.textContent = "削除";
  deleteButton.addEventListener("click", () => deleteTodo(todo.id));

  div.appendChild(p);
  div.appendChild(toggleButton);
  div.appendChild(deleteButton);
  li.appendChild(div);

  return li;
};

// todos配列の中身から、2つのリストをまとめて作り直す
const render = () => {
  incompleteList.innerHTML = "";
  completeList.innerHTML = "";

  const incompleteTodos = todos.filter((todo) => !todo.done);
  const completeTodos = todos.filter((todo) => todo.done);

  incompleteTodos.forEach((todo) => {
    incompleteList.appendChild(createTodoElement(todo));
  });
  completeTodos.forEach((todo) => {
    completeList.appendChild(createTodoElement(todo));
  });

  // 件数の表示を更新する
  incompleteCount.textContent = incompleteTodos.length;
  completeCount.textContent = completeTodos.length;

  // TODOが1件もないときだけ、案内メッセージを表示する
  incompleteEmpty.hidden = incompleteTodos.length > 0;
  completeEmpty.hidden = completeTodos.length > 0;
};

form.addEventListener("submit", onSubmit);

// 入力し直したらエラーメッセージを消す
addText.addEventListener("input", () => {
  errorMessage.textContent = "";
});

// 最初の表示（空のメッセージや件数を正しい状態にする）
render();
