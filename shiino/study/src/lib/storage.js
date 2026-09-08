// localStorage への読み書き。壊れた値が入っていても落ちないように、必ず try で包む。

import { normalizeConfidence, normalizeFeeling } from "./confidence.js";

const KEYS = {
  subjects: "study.subjects",
  records: "study.records",
  running: "study.running",
  goals: "study.goals",
  confidenceLog: "study.confidenceLog",
  // 「ボス戦」と呼んでいたころ・1件しか持てなかったころのキー。
  // 読み込みのときだけ見る
  oldGoals: "study.bosses",
  oldGoal: "study.boss",
};

function load(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw);
  } catch {
    // 保存されている内容が壊れていた場合は、初期値で動かす
    return fallback;
  }
}

function save(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 保存できなくても操作自体は続けられるようにする（容量オーバーなど）
  }
}

// 最初に開いたときに入れておく科目
const DEFAULT_SUBJECTS = [
  { id: "s1", name: "数学", color: "#2563eb", confidence: 0, feeling: 3 },
  { id: "s2", name: "英語", color: "#db2777", confidence: 0, feeling: 3 },
  { id: "s3", name: "プログラミング", color: "#059669", confidence: 0, feeling: 3 },
];

// 科目の形は { id, name, color, confidence, feeling }。
// 前に保存された科目には無いことがあるので、自信は 0、好き嫌いは ★3（ふつう）を補う
export function loadSubjects() {
  const value = load(KEYS.subjects, null);
  const list = Array.isArray(value) && value.length > 0 ? value : DEFAULT_SUBJECTS;
  return list.map((subject) => ({
    ...subject,
    confidence: normalizeConfidence(subject.confidence),
    feeling: normalizeFeeling(subject.feeling),
  }));
}

export function saveSubjects(subjects) {
  save(KEYS.subjects, subjects);
}

export function loadRecords() {
  const value = load(KEYS.records, []);
  return Array.isArray(value) ? value : [];
}

export function saveRecords(records) {
  save(KEYS.records, records);
}

// 計測中の状態。ページを閉じても計測が続くように保存しておく。
// 形は { subjectId, startedAt, accumulated, since, breakAccumulated, pausedAt }。
//
//   accumulated      … 勉強ぶんの確定秒数（一時停止のたびにここへ畳む）
//   since            … 今動いている区間の開始時刻。一時停止中は null
//   breakAccumulated … 休憩ぶんの確定秒数（再開のたびにここへ畳む）
//   pausedAt         … 今の休憩の開始時刻。動いているあいだは null
//
// since と pausedAt は必ずどちらか片方だけが入る
export function loadRunning() {
  const value = load(KEYS.running, null);
  if (!value || typeof value.subjectId !== "string" || typeof value.startedAt !== "string") {
    return null;
  }

  // 一時停止に対応する前の形（accumulated と since が無い）は、
  // 「開始してから一度も止めずに動いている」とみなして読み替える
  if (typeof value.accumulated !== "number" || value.since === undefined) {
    return {
      subjectId: value.subjectId,
      startedAt: value.startedAt,
      accumulated: 0,
      since: value.startedAt,
      breakAccumulated: 0,
      pausedAt: null,
    };
  }

  // 休憩を数える前の形には、休憩ぶんの入れ物だけ足す
  return {
    ...value,
    breakAccumulated:
      typeof value.breakAccumulated === "number" ? value.breakAccumulated : 0,
    pausedAt: typeof value.pausedAt === "string" ? value.pausedAt : null,
  };
}

export function saveRunning(running) {
  save(KEYS.running, running);
}

function isGoal(value) {
  return (
    Boolean(value) &&
    typeof value.deadline === "string" &&
    typeof value.createdAt === "string"
  );
}

// 決めてある目標。1つも無ければ空の配列
export function loadGoals() {
  const value = load(KEYS.goals, null);
  if (Array.isArray(value)) return value.filter(isGoal);

  // 古い名前で保存されたデータを引き継ぐ。
  // 一度 saveGoals が走れば新しいキーができるので、ここを通るのは移行のときだけ
  const oldList = load(KEYS.oldGoals, null);
  if (Array.isArray(oldList)) return oldList.filter(isGoal);

  const single = load(KEYS.oldGoal, null);
  return isGoal(single) ? [{ ...single, id: single.id ?? "goal-1" }] : [];
}

export function saveGoals(goals) {
  save(KEYS.goals, goals);
}

// 自信を付け直した履歴。形は { id, subjectId, value, at }。
// 科目には「今の値」だけを持ち、推移はこちらで追う
export function loadConfidenceLog() {
  const value = load(KEYS.confidenceLog, []);
  return Array.isArray(value)
    ? value.filter((item) => item && typeof item.subjectId === "string" && typeof item.at === "string")
    : [];
}

export function saveConfidenceLog(log) {
  save(KEYS.confidenceLog, log);
}
