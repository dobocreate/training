// マイルストーンの計算。累計の勉強時間から、今どの段階まで来たかを出す。
// Reactに依存しない純粋な関数だけを置く。

import { toDateKey } from "./time.js";

// hours は「その段階に到達するのに必要な累計勉強時間」
export const MILESTONES = [
  { name: "スタート", hours: 0 },
  { name: "入門", hours: 5 },
  { name: "初級", hours: 15 },
  { name: "中級", hours: 40 },
  { name: "上級", hours: 80 },
  { name: "熟練", hours: 150 },
  { name: "達人", hours: 250 },
  { name: "名人", hours: 400 },
  { name: "極み", hours: 600 },
];

export function milestoneProgress(totalSeconds) {
  const hours = Math.max(0, totalSeconds) / 3600;

  // 到達済みのうち、いちばん先の段階を探す
  let index = 0;
  MILESTONES.forEach((milestone, i) => {
    if (hours >= milestone.hours) index = i;
  });

  const current = MILESTONES[index];
  const next = index + 1 < MILESTONES.length ? MILESTONES[index + 1] : null;

  // 今いる区間のどこまで来たか（0〜1）。最後まで行ったら1で固定
  const ratio = next
    ? Math.min(1, Math.max(0, (hours - current.hours) / (next.hours - current.hours)))
    : 1;

  return {
    hours: hours,
    index: index,
    current: current,
    next: next,
    ratio: ratio,
    remainingSeconds: next ? Math.max(0, (next.hours - hours) * 3600) : 0,
    // 全体のどこにいるか。区間の数で割るので、目盛りは等間隔で描ける。
    // 最後の段階に着いたら、区間がないので1で止める
    position: next ? (index + ratio) / (MILESTONES.length - 1) : 1,
    isComplete: next === null,
  };
}

// 段階ごとに「最初に到達した日」を出す。到達していなければ null。
// 記録を日付の古い順に積み上げて、しきい値を超えた時点の日付を段階に割り当てる。
// 累計は日付順に増えるので、いちど超えた段階が後から取り消されることはない
export function milestoneReachedDates(records) {
  // 同じ日の記録はまとめてから、日付順に見る
  const perDay = new Map();
  records.forEach((record) => {
    const key = toDateKey(record.startedAt);
    perDay.set(key, (perDay.get(key) ?? 0) + record.seconds);
  });

  const dates = new Array(MILESTONES.length).fill(null);
  let totalSeconds = 0;
  let index = 0;

  [...perDay.keys()].sort().forEach((key) => {
    totalSeconds += perDay.get(key);
    const hours = totalSeconds / 3600;

    // 1日で2段階まとめて超えることもあるので、超えたぶんだけ進める
    while (index < MILESTONES.length && hours >= MILESTONES[index].hours) {
      dates[index] = key;
      index += 1;
    }
  });

  return dates;
}
