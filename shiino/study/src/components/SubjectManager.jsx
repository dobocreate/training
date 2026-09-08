import { useState } from "react";
import Icon from "./Icon";
import StarRating from "./StarRating";
import ConfidenceInput from "./ConfidenceInput";
import {
  CONFIDENCE_MIN,
  CONFIDENCE_MAX,
  DEFAULT_CONFIDENCE,
  DEFAULT_FEELING,
  feelingLabel,
} from "../lib/confidence";

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

function SubjectManager({ subjects, onAdd, onDelete, onUpdate, onFeeling }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState(COLORS[0]);
  // 追加する科目への自信。登録のときに必ず決める（ふつうは低めから始める）
  const [confidence, setConfidence] = useState(DEFAULT_CONFIDENCE);
  // 好き嫌い（★1〜5）。★2以下の科目は、同じくらい自信が無いときに先に勧められる
  const [feeling, setFeeling] = useState(DEFAULT_FEELING);
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

    onAdd(trimmed, color, confidence, feeling);
    setName("");
    setConfidence(DEFAULT_CONFIDENCE);
    setFeeling(DEFAULT_FEELING);
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
            {/* 好き嫌いもあとから直せる */}
            <StarRating
              value={subject.feeling}
              compact
              onChange={(value) => onFeeling(subject.id, value)}
            />
            {/* 自信はあとから直せる。計測の停止時に聞くのが基本で、ここは手直し用 */}
            <label className="subject-confidence">
              <ConfidenceInput
                value={subject.confidence}
                onChange={(next) => onUpdate(subject.id, next)}
                commitOnBlur
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
            <ConfidenceInput value={confidence} onChange={setConfidence} aria-label="自信（数値）" />
            <span className="unit">%</span>
          </span>
        </div>

        {/* 好き嫌い。★1〜5 で付ける */}
        <div className="feeling-picker">
          <span className="rating-label">この科目は</span>
          <StarRating value={feeling} onChange={setFeeling} />
          <span className="rating-label">{feelingLabel(feeling)}</span>
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
        自信は計測を止めるたびに聞くよ。一番自信のある科目に、遅れてる科目が追いつけるように、差の大きいものから勧めるね。同じくらいなら、★の少ない（嫌いな）科目のほうを先に
      </p>

      <p className="error-message">{error}</p>
    </section>
  );
}

export default SubjectManager;
