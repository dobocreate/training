import { useState } from "react";
import Icon from "./Icon";
import { CONFIDENCE_MIN, CONFIDENCE_MAX, DEFAULT_CONFIDENCE, normalizeConfidence } from "../lib/confidence";

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

function SubjectManager({ subjects, onAdd, onDelete, onUpdate }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  // 追加する科目への自信。登録のときに必ず決める（ふつうは低めから始める）
  const [confidence, setConfidence] = useState(DEFAULT_CONFIDENCE);
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

    onAdd(trimmed, color, confidence);
    setName("");
    setConfidence(DEFAULT_CONFIDENCE);
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
            {/* 自信はあとから直せる。計測の停止時に聞くのが基本で、ここは手直し用 */}
            <label className="subject-confidence">
              <input
                className="field is-number is-confidence"
                type="number"
                min={CONFIDENCE_MIN}
                max={CONFIDENCE_MAX}
                value={subject.confidence}
                onChange={(event) =>
                  onUpdate(subject.id, normalizeConfidence(event.target.value))
                }
                aria-label={`${subject.name} の自信`}
              />
              <span className="unit">%</span>
            </label>
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

      {/* 科目を登録するときに、名前・自信・色をまとめて決める。
          自信は「その科目にどれくらい自信があるか」を 0〜100% で付ける */}
      <form className="subject-form" onSubmit={handleSubmit}>
        <input
          className="field"
          type="text"
          value={name}
          placeholder="科目名"
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />

        <div className="confidence-picker">
          <span className="rating-label">この科目への自信</span>
          <input
            className="confidence-slider"
            type="range"
            min={CONFIDENCE_MIN}
            max={CONFIDENCE_MAX}
            step={5}
            value={confidence}
            onChange={(event) => setConfidence(Number(event.target.value))}
            aria-label="自信"
          />
          <span className="confidence-value">
            <input
              className="field is-number is-confidence"
              type="number"
              min={CONFIDENCE_MIN}
              max={CONFIDENCE_MAX}
              value={confidence}
              onChange={(event) => setConfidence(normalizeConfidence(event.target.value))}
              aria-label="自信（数値）"
            />
            <span className="unit">%</span>
          </span>
        </div>

        {/* 色は候補から選ぶ */}
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

        <button type="submit" className="add-button is-wide">
          追加
        </button>
      </form>
      <p className="rating-help">
        自信は計測を止めるたびに聞き直します。いちばん自信のある科目に他の科目が追いつくよう、差の大きい科目を優先して勧めます
      </p>

      <p className="error-message">{error}</p>
    </section>
  );
}

export default SubjectManager;
