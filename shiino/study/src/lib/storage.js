// localStorage への読み書き。壊れた値が入っていても落ちないように、必ず try で包む。

const KEYS = {
  subjects: "study.subjects",
  records: "study.records",
  running: "study.running",
  boss: "study.boss",
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
  { id: "s1", name: "数学", color: "#22d3ee" },
  { id: "s2", name: "英語", color: "#f472b6" },
  { id: "s3", name: "プログラミング", color: "#a3e635" },
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

// 計測中の状態。ページを閉じても計測が続くように保存しておく
export function loadRunning() {
  const value = load(KEYS.running, null);
  if (!value || typeof value.subjectId !== "string" || typeof value.startedAt !== "string") {
    return null;
  }
  return value;
}

export function saveRunning(running) {
  save(KEYS.running, running);
}

// 挑戦中のボス。設定していなければ null
export function loadBoss() {
  const value = load(KEYS.boss, null);
  if (!value || typeof value.deadline !== "string" || typeof value.createdAt !== "string") {
    return null;
  }
  return value;
}

export function saveBoss(boss) {
  save(KEYS.boss, boss);
}
