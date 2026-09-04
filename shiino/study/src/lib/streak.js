// 連続で勉強した日数。records から毎回数える。
// Reactに依存しない純粋な関数だけを置く。

import { toDateKey } from "./time.js";

// 今日から1日ずつさかのぼって、記録のある日が何日続いているかを数える。
//
// 今日まだ記録が無いときは、昨日を起点にする。
// その日のうちに勉強すれば途切れないので、まだ切れたことにはしないため。
// hasToday で「今日ぶんを含んでいるか」を返し、呼ぶ側が言い方を変えられるようにする
export function studyStreak(records, now = new Date()) {
  // 同じ日に何件あっても1日と数えるので、日付キーの集合にしてから見る
  const days = new Set(records.map((record) => toDateKey(record.startedAt)));

  const hasToday = days.has(toDateKey(now));

  const cursor = new Date(now);
  if (!hasToday) cursor.setDate(cursor.getDate() - 1);

  let count = 0;
  while (days.has(toDateKey(cursor))) {
    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return { days: count, hasToday: hasToday };
}
