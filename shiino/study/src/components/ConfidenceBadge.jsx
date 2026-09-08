import { normalizeConfidence } from "../lib/confidence";

// 科目名のそばに添える「42%」の小さなラベル。
// 先頭との差が大きいほど目立たせたいので、isBehind で色を変えられる
function ConfidenceBadge({ value, isBehind = false }) {
  return (
    <span className={isBehind ? "confidence-badge is-behind" : "confidence-badge"}>
      {normalizeConfidence(value)}%
    </span>
  );
}

export default ConfidenceBadge;
