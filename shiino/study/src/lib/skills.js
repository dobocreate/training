// 「やること」チェックリスト。科目ごとに項目を持ち、チェックした割合を進捗度の根拠にする。
// Reactに依存しない純粋な関数だけを置く。
//
// 項目の形は { id, subjectId, text, done, doneAt, createdAt }。
//   done   … チェック済みか
//   doneAt … 最後にチェックした時刻。しばらく見直していない項目を薄く出すのに使う

import { normalizeConfidence } from "./confidence.js";

// 自信とチェック率を混ぜるときの、自信の重み（%）。設定で変えられる
export const DEFAULT_SELF_WEIGHT = 50;

// 項目がこれより少ない科目は、チェック率の重みを項目数に応じて弱める。
// 3項目で1つ付いただけで 33% と出ると、数字が振れすぎるため
export const FULL_WEIGHT_ITEMS = 5;

// チェックしてからこれだけ経った項目は「見直しどき」として薄く出す
export const STALE_DAYS = 30;

export function normalizeSelfWeight(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return DEFAULT_SELF_WEIGHT;
  return Math.min(100, Math.max(0, Math.round(number)));
}

export function skillsOf(subjectId, skills) {
  return skills.filter((skill) => skill.subjectId === subjectId);
}

export function uncheckedOf(subjectId, skills) {
  return skillsOf(subjectId, skills).filter((skill) => !skill.done);
}

// チェック率（0〜100）。項目が無ければ null
export function checkRate(subjectId, skills) {
  const list = skillsOf(subjectId, skills);
  if (list.length === 0) return null;
  const done = list.filter((skill) => skill.done).length;
  return Math.round((done / list.length) * 100);
}

// 自信とチェック率を混ぜた進捗度。
//   項目が無い     … 自信そのまま
//   項目が 5 未満  … チェック率の重みを (項目数 / 5) 倍に弱める
export function blendedConfidence(subject, skills, selfWeight) {
  const self = normalizeConfidence(subject.confidence);
  const rate = checkRate(subject.id, skills);
  if (rate === null) return self;

  const count = skillsOf(subject.id, skills).length;
  const scale = Math.min(1, count / FULL_WEIGHT_ITEMS);
  const rateWeight = ((100 - normalizeSelfWeight(selfWeight)) / 100) * scale;
  return Math.round(self * (1 - rateWeight) + rate * rateWeight);
}

export function isStale(skill, now = new Date()) {
  if (!skill.done || !skill.doneAt) return false;
  const days = (now.getTime() - new Date(skill.doneAt).getTime()) / (24 * 60 * 60 * 1000);
  return days >= STALE_DAYS;
}

// 科目ごとの「混ぜたあとの進捗度」を持った一覧にして返す。
// 表示と優先度の計算はこちらを使い、自信の入力欄はもとの subjects を使う
export function withBlendedConfidence(subjects, skills, selfWeight) {
  return subjects.map((subject) => ({
    ...subject,
    selfConfidence: normalizeConfidence(subject.confidence),
    confidence: blendedConfidence(subject, skills, selfWeight),
  }));
}
