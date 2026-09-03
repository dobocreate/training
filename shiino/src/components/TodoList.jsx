import TodoItem from "./TodoItem";

// 未完了リストと完了リストの両方で使い回すコンポーネント。
// completeがtrueのときだけ、完了リスト用の見た目に切り替える
function TodoList({
  title,
  todos,
  emptyMessage,
  onToggle,
  onDelete,
  complete,
}) {
  return (
    <section className={complete ? "todo-area complete-area" : "todo-area"}>
      <p className="title">
        {/* 光る丸。絵文字だと環境によって表示が崩れるのでCSSで描いている */}
        <span className="title-dot" />
        {title}
        <span className="count">{todos.length}</span>
      </p>

      {/* 0件のときはリストの代わりに案内メッセージを出す */}
      {todos.length === 0 ? (
        <p className="empty-message">{emptyMessage}</p>
      ) : (
        <ul className="todo-list">
          {todos.map((todo) => (
            // keyがあることで、追加・削除のときにReactがどの行かを見分けられる
            <TodoItem
              key={todo.id}
              todo={todo}
              onToggle={onToggle}
              onDelete={onDelete}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

export default TodoList;
