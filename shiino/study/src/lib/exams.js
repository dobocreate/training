// テストの予定。名前と日付を決めておくと、タイトル画面に「あと ○日」と出る。
// Reactに依存しない純粋な関数だけを置く。
//
// 予定の形: { id, name, date: "YYYY-MM-DD", subjectId: "" | 科目id, createdAt: ISO文字列 }

import { toDateKey } from "./time.js";

// 終わってからこれだけ経った予定は、読み込みのときに捨てる
export const KEEP_PAST_DAYS = 30;

export function isExam(value) {
  return (
    value !== null &&
    typeof value === "object" &&
    typeof value.id === "string" &&
    typeof value.name === "string" &&
    typeof value.date === "string" &&
    /^\d{4}-\d{2}-\d{2}$/.test(value.date)
  );
}

// 今日からテストの日までの日数。当日なら 0、過ぎていればマイナス
export function daysUntil(dateKey, now = new Date()) {
  const [y1, m1, d1] = toDateKey(now).split("-").map(Number);
  const [y2, m2, d2] = dateKey.split("-").map(Number);
  const from = new Date(y1, m1 - 1, d1);
  const to = new Date(y2, m2 - 1, d2);
  return Math.round((to - from) / (24 * 60 * 60 * 1000));
}

// 日付の近い順に並べ替える。同じ日なら先に決めたほう
export function sortByDate(exams) {
  return [...exams].sort((a, b) => {
    if (a.date !== b.date) return a.date < b.date ? -1 : 1;
    return a.createdAt < b.createdAt ? -1 : 1;
  });
}

// まだ来ていない（今日を含む）予定だけを、近い順に
export function upcomingExams(exams, now = new Date()) {
  return sortByDate(exams.filter((exam) => daysUntil(exam.date, now) >= 0));
}

// タイトル画面に出す、いちばん近い予定。無ければ null
export function nearestExam(exams, now = new Date()) {
  return upcomingExams(exams, now)[0] ?? null;
}

// 「あと 12日」「今日！」のような言い方
export function countdownLabel(days) {
  if (days < 0) return "終了";
  if (days === 0) return "今日！";
  return `あと ${days}日`;
}
