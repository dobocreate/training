// ボス戦の計算。試験日までに目標時間ぶん勉強すると撃破できる。
// Reactに依存しない純粋な関数だけを置く。
//
// ボスの形: { name, deadline: "YYYY-MM-DD", targetHours, subjectId: "" | 科目id, createdAt: ISO文字列 }

import { toDateKey } from "./time.js";

// 日付キーどうしの日数差。toKey が先なら正の数
function dayDiff(fromKey, toKey) {
  const [y1, m1, d1] = fromKey.split("-").map(Number);
  const [y2, m2, d2] = toKey.split("-").map(Number);
  const from = new Date(y1, m1 - 1, d1);
  const to = new Date(y2, m2 - 1, d2);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function bossStatus(boss, records, now = new Date()) {
  if (!boss) return null;

  const targetSeconds = Math.max(0, boss.targetHours) * 3600;

  // 挑戦を始めたあとの勉強だけがダメージになる。
  // 日時はISO文字列なので、そのまま大小比較できる
  const damage = records
    .filter((record) => record.startedAt >= boss.createdAt)
    .filter((record) => boss.subjectId === "" || record.subjectId === boss.subjectId)
    .reduce((sum, record) => sum + record.seconds, 0);

  const remaining = Math.max(0, targetSeconds - damage);
  const ratio = targetSeconds === 0 ? 1 : Math.min(1, damage / targetSeconds);

  // 今日を含めた残り日数。期限が今日なら1日
  const daysLeft = dayDiff(toDateKey(now), boss.deadline) + 1;

  let state = "fighting";
  if (remaining === 0) state = "defeated";
  else if (daysLeft <= 0) state = "expired";

  return {
    damage: damage,
    remaining: remaining,
    ratio: ratio,
    daysLeft: daysLeft,
    // 期限までに間に合わせるには、1日あたり何秒必要か
    needPerDay: state === "fighting" ? Math.ceil(remaining / daysLeft) : 0,
    state: state,
  };
}

// タイトル画面とメニューに出す「達成度」。両方で同じ見せ方になるよう、ここにまとめる。
// ボスに挑んでいなければ null
export function bossProgress(boss, records, now = new Date()) {
  const status = bossStatus(boss, records, now);
  if (!status) return null;

  const percent = Math.floor(status.ratio * 100);

  // 決着がついたあとは、数字より結果のほうが分かりやすいので言葉にする
  if (status.state === "defeated") {
    return { percent: percent, label: "撃破", isAlert: false };
  }
  if (status.state === "expired") {
    return { percent: percent, label: "期限切れ", isAlert: true };
  }
  return { percent: percent, label: `${percent}%`, isAlert: false };
}
