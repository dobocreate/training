import { useEffect, useState } from "react";
import Timer from "./components/Timer";
import Summary from "./components/Summary";
import ManualEntry from "./components/ManualEntry";
import RecordList from "./components/RecordList";
import SubjectManager from "./components/SubjectManager";
import {
  loadSubjects,
  saveSubjects,
  loadRecords,
  saveRecords,
  loadRunning,
  saveRunning,
} from "./lib/storage";
import "./App.css";

// idは重複しなければよいので、時刻と乱数を組み合わせて作る
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

function App() {
  // useState に関数を渡すと、初回だけ実行される（毎回localStorageを読みにいかない）
  const [subjects, setSubjects] = useState(loadSubjects);
  const [records, setRecords] = useState(loadRecords);

  // 計測中の状態。{ subjectId, startedAt } か、計測していなければ null
  const [running, setRunning] = useState(loadRunning);

  const [selectedId, setSelectedId] = useState(() => loadSubjects()[0]?.id ?? "");

  // 経過時間は「今の時刻 − 開始時刻」で出す。
  // 1秒ごとに数を足していく方式だと、タブが裏に回ったときにずれるため
  const [now, setNow] = useState(() => Date.now());

  // 変更のたびに保存する
  useEffect(() => {
    saveSubjects(subjects);
  }, [subjects]);

  useEffect(() => {
    saveRecords(records);
  }, [records]);

  useEffect(() => {
    saveRunning(running);
  }, [running]);

  // 計測中だけ1秒ごとに現在時刻を更新する
  useEffect(() => {
    if (!running) return undefined;

    const timerId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, [running]);

  const elapsedSeconds = running
    ? Math.max(0, Math.floor((now - new Date(running.startedAt).getTime()) / 1000))
    : 0;

  const startTimer = () => {
    if (!selectedId || running) return;

    // 表示が1秒遅れないように、開始と同時に基準の時刻もそろえる
    setNow(Date.now());
    setRunning({ subjectId: selectedId, startedAt: new Date().toISOString() });
  };

  const stopTimer = () => {
    if (!running) return;

    const seconds = Math.floor((Date.now() - new Date(running.startedAt).getTime()) / 1000);
    // 1秒未満は誤操作とみなして記録しない
    if (seconds >= 1) {
      setRecords((prev) => [
        ...prev,
        {
          id: createId(),
          subjectId: running.subjectId,
          seconds: seconds,
          startedAt: running.startedAt,
        },
      ]);
    }
    setRunning(null);
  };

  // 手入力ぶんの追加。日付は選べるが、時刻は「今の時刻」を使う
  const addManualRecord = ({ subjectId, seconds, dateKey }) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const nowDate = new Date();
    const startedAt = new Date(
      y, m - 1, d, nowDate.getHours(), nowDate.getMinutes(),
    ).toISOString();

    setRecords((prev) => [...prev, { id: createId(), subjectId, seconds, startedAt }]);
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const addSubject = (name, color) => {
    const subject = { id: createId(), name: name, color: color };
    setSubjects((prev) => [...prev, subject]);
    if (!selectedId) setSelectedId(subject.id);
  };

  const deleteSubject = (id) => {
    const subject = subjects.find((item) => item.id === id);
    const count = records.filter((record) => record.subjectId === id).length;

    // 記録ごと消えるので、消える件数を伝えてから確認する
    const message =
      count === 0
        ? `「${subject.name}」を削除します。`
        : `「${subject.name}」と、その記録${count}件を削除します。`;
    if (!window.confirm(message)) return;

    const rest = subjects.filter((item) => item.id !== id);
    setSubjects(rest);
    setRecords((prev) => prev.filter((record) => record.subjectId !== id));

    // 計測中の科目が消えた場合は、計測も止める（記録は残さない）
    if (running?.subjectId === id) setRunning(null);
    if (selectedId === id) setSelectedId(rest[0]?.id ?? "");
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">STUDY LOG</h1>
        <p className="app-subtitle">科目ごとに勉強時間を記録する</p>
      </header>

      <div className="layout">
        <div className="column">
          <Timer
            subjects={subjects}
            running={running}
            elapsedSeconds={elapsedSeconds}
            selectedId={selectedId}
            onSelect={setSelectedId}
            onStart={startTimer}
            onStop={stopTimer}
          />
          <ManualEntry subjects={subjects} onAdd={addManualRecord} />
          <SubjectManager
            subjects={subjects}
            onAdd={addSubject}
            onDelete={deleteSubject}
          />
        </div>

        <div className="column">
          <Summary subjects={subjects} records={records} />
          <RecordList
            subjects={subjects}
            records={records}
            onDelete={deleteRecord}
          />
        </div>
      </div>
    </div>
  );
}

export default App;
