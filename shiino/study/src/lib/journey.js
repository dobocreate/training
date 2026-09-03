// 宇宙旅の計算。累計の勉強時間を「飛行距離」に見立て、到達した天体を出す。
// Reactに依存しない純粋な関数だけを置く。

// hours は「そこに到達するのに必要な累計勉強時間」
export const PLANETS = [
  { name: "地球", hours: 0, color: "#60a5fa", size: 13 },
  { name: "月", hours: 5, color: "#cbd5e1", size: 9 },
  { name: "火星", hours: 15, color: "#f87171", size: 11 },
  { name: "木星", hours: 40, color: "#fbbf24", size: 17 },
  { name: "土星", hours: 80, color: "#facc15", size: 15 },
  { name: "天王星", hours: 150, color: "#67e8f9", size: 13 },
  { name: "海王星", hours: 250, color: "#818cf8", size: 13 },
  { name: "冥王星", hours: 400, color: "#a78bfa", size: 8 },
  { name: "太陽系外", hours: 600, color: "#f472b6", size: 12 },
];

export function journeyProgress(totalSeconds) {
  const hours = Math.max(0, totalSeconds) / 3600;

  // 到達済みのうち、いちばん先の天体を探す
  let index = 0;
  PLANETS.forEach((planet, i) => {
    if (hours >= planet.hours) index = i;
  });

  const current = PLANETS[index];
  const next = index + 1 < PLANETS.length ? PLANETS[index + 1] : null;

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
    // 全体のどこにいるか。区間の数で割るので、天体の間隔は等間隔で描ける。
    // 最後の天体に着いたら、区間がないので1で止める
    position: next ? (index + ratio) / (PLANETS.length - 1) : 1,
    isComplete: next === null,
  };
}
