// localStorage への読み書き。壊れた値が入っていても落ちないように、必ず try で包む。

const KEYS = {
  subjects: "study.subjects",
  records: "study.records",
  running: "study.running",
  bosses: "study.bosses",
  // ボスを1件しか持てなかったころのキー。読み込みのときだけ見る
  oldBoss: "study.boss",
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
  { id: "s1", name: "数学", color: "#2563eb" },
  { id: "s2", name: "英語", color: "#db2777" },
  { id: "s3", name: "プログラミング", color: "#059669" },
];

export function loadSubjects() {
  const value = load(KEYS.subjects, null);
  return Array.isArray(value) && value.length > 0 ? value : DEFAULT_SUBJECTS;
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
// 形は { subjectId, startedAt, accumulated, since }。
// accumulated は止めていたぶんを除いた確定ぶんの秒数、since は今動いている区間の開始時刻
// （一時停止中は null）
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
    };
  }
  return value;
}

export function saveRunning(running) {
  save(KEYS.running, running);
}

function isBoss(value) {
  return (
    Boolean(value) &&
    typeof value.deadline === "string" &&
    typeof value.createdAt === "string"
  );
}

// 挑戦中のボス。挑んでいなければ空の配列
export function loadBosses() {
  const value = load(KEYS.bosses, null);
  if (Array.isArray(value)) return value.filter(isBoss);

  // 1件しか持てなかったころのデータを引き継ぐ。
  // 一度 saveBosses が走れば新しいキーができるので、ここを通るのは移行のときだけ
  const old = load(KEYS.oldBoss, null);
  return isBoss(old) ? [{ ...old, id: old.id ?? "boss-1" }] : [];
}

export function saveBosses(bosses) {
  save(KEYS.bosses, bosses);
}
