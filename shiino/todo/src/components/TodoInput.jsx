import { useState } from "react";

// 入力欄はこのコンポーネントの中だけで完結させ、
// 追加が確定したときだけ親（App）にテキストを渡す
function TodoInput({ onAdd }) {
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    // formの送信でページが再読み込みされるのを止める
    event.preventDefault();

    // 前後の空白を取り除いた文字を使う
    const trimmedText = text.trim();

    // 空のまま追加できないようにする
    if (trimmedText === "") {
      setError("ミッションを入力してください");
      return;
    }

    onAdd(trimmedText);
    setText("");
  };

  const handleChange = (event) => {
    setText(event.target.value);
    // 入力し直したらエラーメッセージを消す
    setError("");
  };

  return (
    <div className="input-block">
      {/* formにすることでEnterキーでも追加できる */}
      <form
        className={error ? "input-area is-error" : "input-area"}
        onSubmit={handleSubmit}
      >
        <input
          type="text"
          value={text}
          onChange={handleChange}
          placeholder="ミッションを入力して Enter"
          autoComplete="off"
        />
        <button type="submit" className="add-button">
          <span className="add-icon">＋</span>
          追加
        </button>
      </form>

      {/* エラーがないときは高さだけ確保して、行がガタつかないようにする */}
      <p className="error-message">{error}</p>
    </div>
  );
}

export default TodoInput;
