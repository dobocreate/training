const inputForm = document.querySelector(".input-area input");
const addBtn = document.querySelector(".input-area button");
const incompleteList = document.querySelector(".incomplete-area");
const completeList = document.querySelector(".complete-area");

let taskIdCounter = 0;

addBtn.addEventListener("click", () => {
  const text = inputForm.value;
  const task = {
    id: taskIdCounter++,
    content: text,
    completeBtn: document.createElement("button"),
    deleteBtn: document.createElement("button"),
    returnBtn: document.createElement("button"),
  };
  const div = document.createElement("div");
  div.classList.add("task-item");
  incompleteList.appendChild(div);
  const li = document.createElement("li");
  div.appendChild(li);
  const span = document.createElement("span");
  span.textContent = task.content;
  const completeBtn = task.completeBtn;
  completeBtn.textContent = "完了";
  const deleteBtn = task.deleteBtn;
  deleteBtn.textContent = "削除";
  li.appendChild(span);
  div.appendChild(completeBtn);
  div.appendChild(deleteBtn);
  completeBtn.addEventListener("click", () => {
    completeList.appendChild(div);
    completeBtn.style.display = "none";
    div.insertBefore(task.returnBtn, deleteBtn);
    task.returnBtn.textContent = "戻す";
  });
  task.returnBtn.addEventListener("click", () => {
    incompleteList.appendChild(div);
    completeBtn.style.display = "inline";
    task.returnBtn.remove();
  });
  deleteBtn.addEventListener("click", () => {
    div.remove();
  });
  inputForm.value = "";
});
