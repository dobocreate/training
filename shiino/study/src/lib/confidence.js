// 科目ごとの「自信」（0〜100%）と、それをもとに「いちばん進んでいる科目に追いつく」ための計算。
// Reactに依存しない純粋な関数だけを置く。
//
// 自信は本人の感覚で付ける数字。計測を停止するたびに聞き、科目の画面でも直せる。
// いちばん高い科目を「先頭」と呼び、先頭との差（gap）が大きい科目ほど優先して勧める

import { toDateKey, recentDateKeys } from "./time.js";

// 好き嫌い。★1〜5 で付ける（★1 大嫌い … ★3 ふつう … ★5 大好き）。
// 嫌いな科目は後回しにしがちなので、同じくらい自信が無いなら嫌いなほうを先に勧める
export const FEELING_MIN = 1;
export const FEELING_MAX = 5;
export const DEFAULT_FEELING = 3;

// ★2以下を「嫌い」と呼ぶ
export const DISLIKE_THRESHOLD = 2;

const FEELING_LABELS = {
  1: "大嫌い",
  2: "嫌い",
  3: "ふつう",
  4: "好き",
  5: "大好き",
};

// 星1つぶんで、先頭との差（%）にどれだけ足し引きするか。
// ★1 なら +20、★3 は 0、★5 なら −20。嫌いなほど差が小さくても先に勧める
export const FEELING_STEP = 10;

export function normalizeFeeling(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_FEELING;
  return Math.min(FEELING_MAX, Math.max(FEELING_MIN, Math.round(number)));
}

export function feelingLabel(value) {
  return FEELING_LABELS[normalizeFeeling(value)];
}

export function feelingBonus(value) {
  return (DEFAULT_FEELING - normalizeFeeling(value)) * FEELING_STEP;
}

export function isDisliked(subject) {
  return normalizeFeeling(subject?.feeling) <= DISLIKE_THRESHOLD;
}

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

// ===== 嫌い優先 → 全体を上げる、の切り替え =====
// 差があるとき、平均の自信がこれ以上になったら好き嫌いの足し引きをやめて、差だけで勧める。
// それまでは嫌いな科目を優先する。横並びのときは平均に関係なく嫌いな科目が先
export const RAISE_ALL_FROM = 80;

export function isRaisingAll(subjects) {
  return subjects.length > 0 && averageConfidence(subjects) >= RAISE_ALL_FROM;
}

// 優先度。先頭との差に、好き嫌いのぶんを足し引きする。
// 「好きで自信が無い」より「嫌いで自信が無い」を先にするため。
// 平均が 80% を超えたら、好き嫌いは見ずに差だけで決める
export function priorityOf(subject, subjects) {
  const bonus = isRaisingAll(subjects) ? 0 : feelingBonus(subject.feeling);
  return gapOf(subject, subjects) + bonus;
}

// ===== 横並び（底上げモード） =====
// 最大の差がこれ以下なら「横並び」とみなす。
// ぴったり 0 だと、1回の付け直しですぐ崩れてしまうので少し幅を持たせる
export const LEVEL_THRESHOLD = 5;

export function isLeveled(subjects) {
  return subjects.length > 1 && spread(subjects) <= LEVEL_THRESHOLD;
}

export function averageConfidence(subjects) {
  if (subjects.length === 0) return 0;
  const total = subjects.reduce((sum, subject) => sum + confidenceOf(subject), 0);
  return Math.round(total / subjects.length);
}

// 目標。全科目でここを目指す。グラフの目標ラインと文言に使う
export const GOAL = CONFIDENCE_MAX;

// 科目を「やるべき順」に並べる。
//
// ふだん（差があるとき）
//   1. 優先度（先頭との差 ± 好き嫌い）が高い科目
//   2. 同じなら、直近7日でいちばん触っていない科目
//   3. それでも同じなら、科目一覧の並び順
//
// 横並びのとき
//   差で選べないので、嫌いな科目から順に上げていく（平均が高くても同じ）
//   1. ★の少ない（嫌いな）科目
//   2. 同じなら、直近7日でいちばん触っていない科目
//   3. それでも同じなら、科目一覧の並び順
export function sortByPriority(subjects, records) {
  const recent = recentSecondsBySubject(subjects, records);
  const leveled = isLeveled(subjects);
  const scored = subjects.map((subject, index) => ({
    subject: subject,
    priority: priorityOf(subject, subjects),
    feeling: normalizeFeeling(subject.feeling),
    recentSeconds: recent.get(subject.id),
    index: index,
  }));

  scored.sort((a, b) => {
    if (leveled) {
      return a.feeling - b.feeling || a.recentSeconds - b.recentSeconds || a.index - b.index;
    }
    return b.priority - a.priority || a.recentSeconds - b.recentSeconds || a.index - b.index;
  });

  return scored.map((item) => item.subject);
}

// 「次に何をやるべきか」を1つ選ぶ。科目が無ければ null
export function recommendSubject(subjects, records) {
  if (subjects.length === 0) return null;
  return sortByPriority(subjects, records)[0];
}
