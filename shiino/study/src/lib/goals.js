// 目標の計算。期限までに決めた時間ぶん勉強すると達成になる。
// Reactに依存しない純粋な関数だけを置く。
//
// 目標の形: { id, name, deadline: "YYYY-MM-DD", targetHours, subjectId: "" | 科目id, createdAt: ISO文字列 }

import { toDateKey } from "./time.js";

// 日付キーどうしの日数差。toKey が先なら正の数
function dayDiff(fromKey, toKey) {
  const [y1, m1, d1] = fromKey.split("-").map(Number);
  const [y2, m2, d2] = toKey.split("-").map(Number);
  const from = new Date(y1, m1 - 1, d1);
  const to = new Date(y2, m2 - 1, d2);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

export function goalStatus(goal, records, now = new Date()) {
  if (!goal) return null;

  const targetSeconds = Math.max(0, goal.targetHours) * 3600;

  // 目標を決めたあとの勉強だけが数えられる。
  // 日時はISO文字列なので、そのまま大小比較できる
  const done = records
    .filter((record) => record.startedAt >= goal.createdAt)
    .filter((record) => goal.subjectId === "" || record.subjectId === goal.subjectId)
    .reduce((sum, record) => sum + record.seconds, 0);

  const remaining = Math.max(0, targetSeconds - done);
  const ratio = targetSeconds === 0 ? 1 : Math.min(1, done / targetSeconds);

  // 今日を含めた残り日数。期限が今日なら1日
  const daysLeft = dayDiff(toDateKey(now), goal.deadline) + 1;

  let state = "active";
  if (remaining === 0) state = "done";
  else if (daysLeft <= 0) state = "expired";

  return {
    done: done,
    remaining: remaining,
    ratio: ratio,
    daysLeft: daysLeft,
    // 期限までに間に合わせるには、1日あたり何秒必要か
    needPerDay: state === "active" ? Math.ceil(remaining / daysLeft) : 0,
    state: state,
  };
}

// タイトル画面とメニューに出す「達成度」。両方で同じ見せ方になるよう、ここにまとめる。
// いくつでも持てるので、代表の1件を選んで返す。1つも無ければ null
export function goalProgress(goals, records, now = new Date()) {
  if (!Array.isArray(goals) || goals.length === 0) return null;

  const all = goals.map((goal) => ({ goal: goal, status: goalStatus(goal, records, now) }));

  // まだ途中のものがあれば、そのうち期限がいちばん近いもの。
  // 全部決着していれば、最後に決めたものを出す
  const active = all.filter((item) => item.status.state === "active");
  const picked =
    active.length > 0
      ? active.sort((a, b) => (a.goal.deadline < b.goal.deadline ? -1 : 1))[0]
      : all.sort((a, b) => (a.goal.createdAt > b.goal.createdAt ? -1 : 1))[0];

  const percent = Math.floor(picked.status.ratio * 100);
  const base = {
    percent: percent,
    name: picked.goal.name,
    // 代表以外が何件あるか。「ほか◯件」と出すのに使う
    others: goals.length - 1,
  };

  // 決着がついたあとは、数字より結果のほうが分かりやすいので言葉にする
  if (picked.status.state === "done") {
    return { ...base, label: "達成", isAlert: false };
  }
  if (picked.status.state === "expired") {
    return { ...base, label: "期限切れ", isAlert: true };
  }
  return { ...base, label: `${percent}%`, isAlert: false };
}
