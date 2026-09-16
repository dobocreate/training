import { useState } from "react";
import Icon from "./Icon";
import ConfidenceInput from "./ConfidenceInput";
import { CONFIDENCE_MIN, CONFIDENCE_MAX, normalizeConfidence } from "../lib/confidence";
import { formatDuration } from "../lib/time";
import { uncheckedOf } from "../lib/skills";

// 一度に聞く「できるようになった？」の数
const ASK_LIMIT = 3;

// 計測を停止した直後に出る「今の自信は？」。
// 勉強した直後がいちばん感覚が新しいので、ここで1回だけ聞く。
// 閉じるボタンは置かない。保存するまで出しておいて、必ず答えてもらう
function ConfidencePrompt({ subject, seconds, skills = [], onSave }) {
  const [value, setValue] = useState(normalizeConfidence(subject.confidence));
  // 今回できるようになった項目。保存のときにまとめてチェックを付ける
  const [checked, setChecked] = useState([]);
  const asking = uncheckedOf(subject.id, skills).slice(0, ASK_LIMIT);
  const before = normalizeConfidence(subject.confidence);
  const diff = value - before;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(value, checked);
  };

  const toggle = (id) => {
    setChecked((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };

  return (
    <section className="card confidence-prompt">
      <p className="card-title">
        <Icon name="pencil" />
        自信チェック
      </p>

      <p className="confidence-prompt-lead">
        <span className="dot" style={{ backgroundColor: subject.color }} />
        {subject.name} を {formatDuration(seconds)} 勉強！お疲れ様！今の自信は？
      </p>

      <form className="confidence-form" onSubmit={handleSubmit}>
        <input
          className="confidence-slider"
          type="range"
          min={CONFIDENCE_MIN}
          max={CONFIDENCE_MAX}
          step={5}
          value={value}
          onChange={(event) => setValue(Number(event.target.value))}
          aria-label="自信"
        />
        <div className="confidence-value">
          <ConfidenceInput value={value} onChange={setValue} aria-label="自信（数値）" />
          <span className="unit">%</span>
          {/* 前回からどれだけ動いたかを横に添える */}
          <span className="confidence-diff">
            {diff === 0
              ? `前は ${before}%`
              : diff > 0
                ? `前は ${before}% → +${diff} アップ！`
                : `前は ${before}% → ${diff}`}
          </span>
        </div>

        {/* 未チェックの項目を少しだけ出して、その場でチェックできるようにする */}
        {asking.length > 0 && (
          <div className="prompt-skills">
            <p className="prompt-skills-title">今日できるようになった？</p>
            <ul className="skill-list">
              {asking.map((skill) => (
                <li key={skill.id} className="skill-item">
                  <label className="skill-label">
                    <input
                      type="checkbox"
                      checked={checked.includes(skill.id)}
                      onChange={() => toggle(skill.id)}
                    />
                    <span className="skill-text">{skill.text}</span>
                  </label>
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="confidence-buttons">
          <button type="submit" className="big-button">
            保存
          </button>
        </div>
      </form>
    </section>
  );
}

export default ConfidencePrompt;
