export const InoutTodo = (props) => {
  const { todoText, onChange, onClick } = props;
  return (
    <div className="input-area">
      <input
        placeholder="TODOを入力"
        value={todoText}
        onChange={onChangeTodoText}
      ></input>
      <button onClick={onClickAdd}>追加</button>
    </div>
  );
};
