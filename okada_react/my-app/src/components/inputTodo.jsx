const style = {
  backgroundcolor: "#aacfd0",
  width: "400px",
  height: "30px",
  padding: "8px",
  margin: "8px",
  borderRadius: "8px",
};
export const InputTodo = (props) => {
  const { todoText, onChange, onClick } = props;
  return (
    <div style={style} className="input-area">
      <input
        placeholder="TODOを入力"
        value={todoText}
        onChange={onChange}
      ></input>
      <button onClick={onClick}>追加</button>
    </div>
  );
};
