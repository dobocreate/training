import { FEELING_MIN, FEELING_MAX, normalizeFeeling, feelingLabel } from "../lib/confidence";

// 好き嫌いを ★ で出す。onChange を渡すと押して変えられ、渡さなければ表示だけ。
// 絵文字ではなく文字の ★ を使い、色はCSSで付ける
function StarRating({ value, onChange, compact = false }) {
  const feeling = normalizeFeeling(value);
  const stars = [];
  for (let n = FEELING_MIN; n <= FEELING_MAX; n += 1) stars.push(n);

  const className = compact ? "stars is-compact" : "stars";

  if (!onChange) {
    return (
      <span
        className={className}
        title={feelingLabel(feeling)}
        aria-label={`★${feeling}（${feelingLabel(feeling)}）`}
      >
        {stars.map((n) => (
          <span key={n} className={n <= feeling ? "star is-on" : "star"} aria-hidden="true">
            ★
          </span>
        ))}
      </span>
    );
  }

  return (
    <span className={className} role="radiogroup" aria-label="好き嫌い">
      {stars.map((n) => (
        <button
          type="button"
          key={n}
          className={n <= feeling ? "star is-on" : "star"}
          role="radio"
          aria-checked={n === feeling}
          aria-label={`★${n}（${feelingLabel(n)}）`}
          title={feelingLabel(n)}
          onClick={() => onChange(n)}
        >
          ★
        </button>
      ))}
    </span>
  );
}

export default StarRating;
