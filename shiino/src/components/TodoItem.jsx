// TODO1件分の表示。データは持たず、押されたことを親に伝えるだけ
function TodoItem({ todo, onToggle, onDelete }) {
  return (
    <li className="list-row">
      {/* 丸いチェックボタン。完了済みならチェックが入った見た目になる */}
      <button
        className="check-button"
        onClick={() => onToggle(todo.id)}
        aria-label={todo.done ? "未完了に戻す" : "完了にする"}
      >
        <span className="check-mark">✓</span>
      </button>

      <p className="todo-item">{todo.text}</p>

      {/* 未完了なら「完了」、完了済みなら「戻す」と表示を変える */}
      <button className="toggle-button" onClick={() => onToggle(todo.id)}>
        {todo.done ? "戻す" : "完了"}
      </button>

      <button
        className="delete-button"
        onClick={() => onDelete(todo.id)}
        aria-label="削除"
      >
        ✕
      </button>
    </li>
  );
}

export default TodoItem;
