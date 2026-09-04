import { useEffect, useState } from "react";
import Icon from "./components/Icon";
import TitleScreen from "./components/TitleScreen";
import Menu from "./components/Menu";
import Timer from "./components/Timer";
import Milestones from "./components/Milestones";
import BossBattle from "./components/BossBattle";
import Summary from "./components/Summary";
import ManualEntry from "./components/ManualEntry";
import RecordList from "./components/RecordList";
import RecentRecords from "./components/RecentRecords";
import SubjectManager from "./components/SubjectManager";
import { FEATURES } from "./lib/features";
import {
  loadSubjects,
  saveSubjects,
  loadRecords,
  saveRecords,
  loadRunning,
  saveRunning,
  loadBoss,
  saveBoss,
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

  // 挑戦中のボス。設定していなければ null
  const [boss, setBoss] = useState(loadBoss);

  // 今どの画面にいるか。"title" → "menu" → 機能のキー（FEATURES）と進む。
  // 開くたびにタイトルから始まるので、保存はしない
  const [screen, setScreen] = useState("title");

  // 直前に足した記録のid。計測・手入力の下で、どれが今足したぶんかを示すのに使う
  const [newestRecordId, setNewestRecordId] = useState(null);

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

  useEffect(() => {
    saveBoss(boss);
  }, [boss]);

  // 計測中だけ1秒ごとに現在時刻を更新する
  useEffect(() => {
    if (!running) return undefined;

    const timerId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, [running]);

  // 機能の画面では Escape でメニューに戻れるようにする
  useEffect(() => {
    if (screen === "title" || screen === "menu") return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setScreen("menu");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen]);

  const elapsedSeconds = running
    ? Math.max(0, Math.floor((now - new Date(running.startedAt).getTime()) / 1000))
    : 0;

  // 記録の追加口はここ1か所にまとめる。
  // 計測でも手入力でも同じように「今足したぶん」を示せるよう、idもここで覚える
  const addRecord = (record) => {
    setRecords((prev) => [...prev, record]);
    setNewestRecordId(record.id);
  };

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
      addRecord({
        id: createId(),
        subjectId: running.subjectId,
        seconds: seconds,
        startedAt: running.startedAt,
      });
    }
    setRunning(null);
  };

  // 手入力ぶんの追加。日付は選べるが、時刻は「今の時刻」を使う
  const addManualRecord = ({ subjectId, seconds, dateKey }) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const nowDate = new Date();
    // 秒まで入れておく。分で切り捨てると、直前に設定したボスより古い記録に
    // なってしまい、ダメージとして数えられなくなる
    const startedAt = new Date(
      y, m - 1, d,
      nowDate.getHours(), nowDate.getMinutes(),
      nowDate.getSeconds(), nowDate.getMilliseconds(),
    ).toISOString();

    addRecord({ id: createId(), subjectId, seconds, startedAt });
  };

  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
  };

  const addSubject = (name, color) => {
    const subject = { id: createId(), name: name, color: color };
    setSubjects((prev) => [...prev, subject]);
    if (!selectedId) setSelectedId(subject.id);
  };

  // ボスに挑む。挑戦を始めた時刻を覚えておき、それ以降の記録だけをダメージにする
  const startBoss = (config) => {
    setBoss({ ...config, createdAt: new Date().toISOString() });
  };

  const clearBoss = () => {
    if (!window.confirm("ボス戦を解除します。")) return;
    setBoss(null);
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

  if (screen === "title") {
    return (
      <TitleScreen
        records={records}
        boss={boss}
        onStart={() => setScreen("menu")}
      />
    );
  }

  // ここから先は機能の画面。キーが一覧に無ければメニューを出す
  const feature = FEATURES.find((item) => item.key === screen);
  if (!feature) {
    return <Menu running={running} onSelect={setScreen} />;
  }

  return (
    <div className="app">
      <header className="screen-header">
        <button
          type="button"
          className="back-button"
          onClick={() => setScreen("menu")}
        >
          <Icon name={feature.icon} />
          メニューに戻る
        </button>
        <h1 className="wordmark">STUDY LOG</h1>
      </header>

      {/* 1画面に1機能だけ出す。
          記録が増える計測・手入力には、足したぶんをその場で確かめられるよう
          「追加した記録」を続けて置く */}
      <div className="screen-body">
        {feature.key === "timer" && (
          <>
            <Timer
              subjects={subjects}
              running={running}
              elapsedSeconds={elapsedSeconds}
              selectedId={selectedId}
              onSelect={setSelectedId}
              onStart={startTimer}
              onStop={stopTimer}
            />
            <RecentRecords
              subjects={subjects}
              records={records}
              newestId={newestRecordId}
              onDelete={deleteRecord}
            />
          </>
        )}

        {feature.key === "summary" && <Summary subjects={subjects} records={records} />}

        {feature.key === "records" && (
          <RecordList subjects={subjects} records={records} onDelete={deleteRecord} />
        )}

        {feature.key === "milestones" && <Milestones records={records} />}

        {feature.key === "boss" && (
          <BossBattle
            boss={boss}
            subjects={subjects}
            records={records}
            onStart={startBoss}
            onClear={clearBoss}
          />
        )}

        {feature.key === "subjects" && (
          <SubjectManager
            subjects={subjects}
            onAdd={addSubject}
            onDelete={deleteSubject}
          />
        )}

        {feature.key === "manual" && (
          <>
            <ManualEntry subjects={subjects} onAdd={addManualRecord} />
            <RecentRecords
              subjects={subjects}
              records={records}
              newestId={newestRecordId}
              onDelete={deleteRecord}
            />
          </>
        )}
      </div>

      <p className="screen-hint">Esc キーでもメニューに戻れる</p>
    </div>
  );
}

export default App;
