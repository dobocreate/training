import { useState } from "react";
import Icon from "./Icon";
import ConfidenceInput from "./ConfidenceInput";
import { CONFIDENCE_MIN, CONFIDENCE_MAX, normalizeConfidence } from "../lib/confidence";
import { formatDuration } from "../lib/time";

// 計測を停止した直後に出る「今の自信は？」。
// 勉強した直後がいちばん感覚が新しいので、ここで1回だけ聞く。
// 閉じるボタンは置かない。保存するまで出しておいて、必ず答えてもらう
function ConfidencePrompt({ subject, seconds, onSave }) {
  const [value, setValue] = useState(normalizeConfidence(subject.confidence));
  const before = normalizeConfidence(subject.confidence);
  const diff = value - before;

  const handleSubmit = (event) => {
    event.preventDefault();
    onSave(value);
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
