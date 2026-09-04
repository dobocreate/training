import { useState } from "react";
import Icon from "./Icon";

// 科目の色。選びやすいように候補を用意しておく
const COLORS = [
  "#2563eb",
  "#059669",
  "#db2777",
  "#7c3aed",
  "#d97706",
  "#dc2626",
  "#0891b2",
  "#475569",
];

function SubjectManager({ subjects, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (trimmed === "") {
      setError("科目名を入力してください");
      return;
    }
    if (subjects.some((subject) => subject.name === trimmed)) {
      setError("同じ名前の科目があります");
      return;
    }

    onAdd(trimmed, color);
    setName("");
    setError("");
  };

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="book" />
        科目
      </p>

      <ul className="subject-list">
        {subjects.map((subject) => (
          <li key={subject.id} className="subject-item">
            <span className="dot" style={{ backgroundColor: subject.color }} />
            <span className="subject-item-name">{subject.name}</span>
            <button
              type="button"
              className="delete-button"
              onClick={() => onDelete(subject.id)}
              aria-label={`${subject.name} を削除`}
            >
              ✕
            </button>
          </li>
        ))}
      </ul>

      <form className="subject-form" onSubmit={handleSubmit}>
        <input
          className="field"
          type="text"
          value={name}
          placeholder="科目を追加"
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />
        <button type="submit" className="add-button">
          追加
        </button>
      </form>

      {/* 色は候補から選ぶ。選んだ色は追加する科目に使う */}
      <div className="color-picker">
        {COLORS.map((item) => (
          <button
            type="button"
            key={item}
            className={item === color ? "color-swatch is-active" : "color-swatch"}
            style={{ backgroundColor: item }}
            onClick={() => setColor(item)}
            aria-label={`色 ${item}`}
          />
        ))}
      </div>

      <p className="error-message">{error}</p>
    </section>
  );
}

export default SubjectManager;
