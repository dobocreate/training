// 1日に記録できる勉強時間の上限。Reactに依存しない純粋な関数だけを置く。
//
// 1日は24時間しかないので、同じ日の合計がそれを超える記録は入れられないようにする。
// 記録がどの日のものかは startedAt の日付で決める（一覧・集計と同じ見方）

import { toDateKey, formatDuration } from "./time.js";

export const DAY_LIMIT_SECONDS = 24 * 60 * 60;

// その日に記録ずみの秒数。編集のときは、直している記録そのものを除いて数える
export function secondsOnDay(records, dateKey, excludeId = null) {
  return records
    .filter((record) => record.id !== excludeId)
    .filter((record) => toDateKey(record.startedAt) === dateKey)
    .reduce((sum, record) => sum + record.seconds, 0);
}

// その日にあと何秒入れられるか
export function remainingOnDay(records, dateKey, excludeId = null) {
  return Math.max(0, DAY_LIMIT_SECONDS - secondsOnDay(records, dateKey, excludeId));
}

// seconds を足すと上限を超えるなら、その理由の文言を返す。入れられるなら ""。
// フォームのエラー表示にそのまま使える形にしておく
export function dayLimitError(records, dateKey, seconds, excludeId = null) {
  const remaining = remainingOnDay(records, dateKey, excludeId);
  if (seconds <= remaining) return "";
  if (remaining === 0) return "この日はすでに24時間ぶん記録されています";
  return `1日に記録できるのは合計24時間までです（この日はあと ${formatDuration(remaining)}）`;
}
