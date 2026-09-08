// 科目ごとの「自信」（0〜100%）と、それをもとに「いちばん進んでいる科目に追いつく」ための計算。
// Reactに依存しない純粋な関数だけを置く。
//
// 自信は本人の感覚で付ける数字。計測を停止するたびに聞き、科目の画面でも直せる。
// いちばん高い科目を「先頭」と呼び、先頭との差（gap）が大きい科目ほど優先して勧める

import { toDateKey, recentDateKeys } from "./time.js";

export const CONFIDENCE_MIN = 0;
export const CONFIDENCE_MAX = 100;
export const DEFAULT_CONFIDENCE = 0;

// 保存されていた値が壊れていても、必ず 0〜100 の整数にそろえる。
// 自信を付ける前の科目（confidence が無い）は 0 とみなす
export function normalizeConfidence(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_CONFIDENCE;
  return Math.min(CONFIDENCE_MAX, Math.max(CONFIDENCE_MIN, Math.round(number)));
}

function confidenceOf(subject) {
  return normalizeConfidence(subject?.confidence);
}

function sumSeconds(records) {
  return records.reduce((sum, record) => sum + record.seconds, 0);
}

// いちばん進んでいる科目。同点なら一覧で先にあるほう。科目が無ければ null
export function leaderSubject(subjects) {
  let best = null;
  subjects.forEach((subject) => {
    if (!best || confidenceOf(subject) > confidenceOf(best)) best = subject;
  });
  return best;
}

// 先頭との差。先頭自身は 0
export function gapOf(subject, subjects) {
  const leader = leaderSubject(subjects);
  return leader ? confidenceOf(leader) - confidenceOf(subject) : 0;
}

// いちばん高い科目といちばん低い科目の差。科目が無ければ 0。
// この数字が小さくなっていけば「差が埋まっている」
export function spread(subjects) {
  if (subjects.length === 0) return 0;
  const values = subjects.map(confidenceOf);
  return Math.max(...values) - Math.min(...values);
}

// 直近7日の科目別の勉強時間
function recentSecondsBySubject(subjects, records) {
  const keys = recentDateKeys(7);
  const recent = records.filter((record) => toDateKey(record.startedAt) >= keys[0]);
  const map = new Map();
  subjects.forEach((subject) => {
    map.set(subject.id, sumSeconds(recent.filter((r) => r.subjectId === subject.id)));
  });
  return map;
}

// 「次に何をやるべきか」を1つ選ぶ。
//   1. 先頭との差が大きい科目を優先する
//   2. 同じ差なら、直近7日でいちばん触っていない科目を優先する
//   3. それでも同じなら、科目一覧の並び順
// 科目が無ければ null
export function recommendSubject(subjects, records) {
  if (subjects.length === 0) return null;

  const recent = recentSecondsBySubject(subjects, records);
  const scored = subjects.map((subject, index) => ({
    subject: subject,
    gap: gapOf(subject, subjects),
    recentSeconds: recent.get(subject.id),
    index: index,
  }));

  scored.sort(
    (a, b) => b.gap - a.gap || a.recentSeconds - b.recentSeconds || a.index - b.index,
  );

  return scored[0].subject;
}

// 追いつくための「今週の時間配分」。
// 直近7日の合計勉強時間（少なくとも1時間）を、先頭との差の大きさに比例して配る。
// 先頭の科目は差が 0 なので配分も 0 になる（今週は他に回す）。
// 差が1つも無ければ null（全科目が並んでいる）
export const MIN_WEEK_SECONDS = 60 * 60;

export function allocateWeek(subjects, records) {
  if (subjects.length === 0) return null;

  const gaps = subjects.map((subject) => gapOf(subject, subjects));
  const gapTotal = gaps.reduce((sum, gap) => sum + gap, 0);
  if (gapTotal === 0) return null;

  const keys = recentDateKeys(7);
  const recentTotal = sumSeconds(
    records.filter((record) => toDateKey(record.startedAt) >= keys[0]),
  );
  const budget = Math.max(MIN_WEEK_SECONDS, recentTotal);

  // 今週すでにやったぶんも並べて、達成度が見えるようにする
  const recent = recentSecondsBySubject(subjects, records);

  return {
    budget: budget,
    items: subjects
      .map((subject, i) => ({
        subject: subject,
        gap: gaps[i],
        // 分単位に丸める（秒までは見せないため）
        seconds: Math.round((budget * gaps[i]) / gapTotal / 60) * 60,
        done: recent.get(subject.id),
      }))
      .sort((a, b) => b.gap - a.gap),
  };
}
