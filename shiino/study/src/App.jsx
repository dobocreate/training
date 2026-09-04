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
import SubjectManager from "./components/SubjectManager";
import RecentRecords from "./components/RecentRecords";
import Pace from "./components/Pace";
import SubjectTotals from "./components/SubjectTotals";
import { FEATURES } from "./lib/features";
import { formatDuration } from "./lib/time";
import {
  loadSubjects,
  saveSubjects,
  loadRecords,
  saveRecords,
  loadRunning,
  saveRunning,
  loadBosses,
  saveBosses,
} from "./lib/storage";
import "./App.css";

// idは重複しなければよいので、時刻と乱数を組み合わせて作る
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// これより長い計測は、止め忘れ（計測したまま閉じた）の可能性があるので確認する
const LONG_SESSION_SECONDS = 8 * 60 * 60;

function App() {
  // useState に関数を渡すと、初回だけ実行される（毎回localStorageを読みにいかない）
  const [subjects, setSubjects] = useState(loadSubjects);
  const [records, setRecords] = useState(loadRecords);

  // 計測中の状態。{ subjectId, startedAt, accumulated, since } か、計測していなければ null。
  // since が null のときは一時停止中
  const [running, setRunning] = useState(loadRunning);

  // 挑戦中のボス。何体でも同時に挑める
  const [bosses, setBosses] = useState(loadBosses);

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
    saveBosses(bosses);
  }, [bosses]);

  // 動いているあいだだけ1秒ごとに現在時刻を更新する（一時停止中は止める）
  useEffect(() => {
    if (!running?.since) return undefined;

    const timerId = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timerId);
  }, [running?.since]);

  // 機能の画面では Escape でメニューに戻れるようにする
  useEffect(() => {
    if (screen === "title" || screen === "menu") return undefined;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") setScreen("menu");
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [screen]);

  // 確定ぶん（accumulated）に、今動いている区間のぶんを足す
  const elapsedSeconds = running
    ? running.accumulated +
      (running.since
        ? Math.max(0, Math.floor((now - new Date(running.since).getTime()) / 1000))
        : 0)
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
    const at = new Date().toISOString();
    setNow(Date.now());
    setRunning({ subjectId: selectedId, startedAt: at, accumulated: 0, since: at });
  };

  // 一時停止。ここまでのぶんを accumulated に畳んで、区間を閉じる
  const pauseTimer = () => {
    if (!running?.since) return;
    setRunning({ ...running, accumulated: elapsedSeconds, since: null });
  };

  const resumeTimer = () => {
    if (!running || running.since) return;
    setNow(Date.now());
    setRunning({ ...running, since: new Date().toISOString() });
  };

  const stopTimer = () => {
    if (!running) return;

    const seconds = elapsedSeconds;
    // 1秒未満は誤操作とみなして記録しない
    if (seconds >= 1) {
      // 計測したまま閉じていた場合、何時間ぶんも入ってしまう。
      // 消す前に必ず本人に選ばせる（黙って捨てない）
      if (seconds >= LONG_SESSION_SECONDS) {
        const message =
          `${formatDuration(seconds)} と、かなり長い計測になっています。\n` +
          "計測したまま閉じていた可能性があります。\n\n" +
          "OK … このまま記録する\n" +
          "キャンセル … 記録しないで破棄する";
        if (!window.confirm(message)) {
          setRunning(null);
          return;
        }
      }

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

  // 記録の修正。日付だけ差し替え、何時に始めたかは元のまま残す
  const updateRecord = (id, { subjectId, seconds, dateKey }) => {
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== id) return record;

        const old = new Date(record.startedAt);
        const [y, m, d] = dateKey.split("-").map(Number);
        const startedAt = new Date(
          y, m - 1, d,
          old.getHours(), old.getMinutes(), old.getSeconds(), old.getMilliseconds(),
        ).toISOString();

        return { ...record, subjectId, seconds, startedAt };
      }),
    );
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
    setBosses((prev) => [
      ...prev,
      { ...config, id: createId(), createdAt: new Date().toISOString() },
    ]);
  };

  const clearBoss = (id) => {
    const boss = bosses.find((item) => item.id === id);
    if (!window.confirm(`「${boss.name}」のボス戦を解除します。`)) return;
    setBosses((prev) => prev.filter((item) => item.id !== id));
  };

  // 科目を消しても記録は残す。過去に積み上げた時間まで失われないようにするため。
  // 科目のいなくなった記録は「（削除された科目）」として一覧に出る
  const deleteSubject = (id) => {
    const subject = subjects.find((item) => item.id === id);
    const count = records.filter((record) => record.subjectId === id).length;
    const isRunningSubject = running?.subjectId === id;

    const lines = [`「${subject.name}」を削除します。`];
    if (count > 0) {
      lines.push(`記録${count}件はそのまま残ります（「（削除された科目）」と表示されます）。`);
    }
    if (isRunningSubject) {
      lines.push("計測中のぶんは、記録してから停止します。");
    }
    if (!window.confirm(lines.join("\n"))) return;

    // 計測中の科目が消える場合も、計測ぶんは捨てずに記録してから止める
    if (isRunningSubject) stopTimer();

    const rest = subjects.filter((item) => item.id !== id);
    setSubjects(rest);
    if (selectedId === id) setSelectedId(rest[0]?.id ?? "");
  };

  if (screen === "title") {
    return (
      <TitleScreen
        records={records}
        bosses={bosses}
        subjects={subjects}
        running={running}
        elapsedSeconds={elapsedSeconds}
        onStart={() => setScreen("menu")}
      />
    );
  }

  // ここから先は機能の画面。キーが一覧に無ければメニューを出す
  const feature = FEATURES.find((item) => item.key === screen);
  if (!feature) {
    return (
      <Menu
        running={running}
        elapsedSeconds={elapsedSeconds}
        bosses={bosses}
        records={records}
        onSelect={setScreen}
      />
    );
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

      {/* そのページの機能を先頭に置き、続けて「そこで一緒に見たくなるもの」を
          1〜2枚そえる。合計→マイルストーン→記録→合計 と一巡するように組んであり、
          同じ組み合わせのページができないようにしている */}
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
              onPause={pauseTimer}
              onResume={resumeTimer}
              onStop={stopTimer}
            />
            <Pace records={records} />
            <RecentRecords
              subjects={subjects}
              records={records}
              newestId={newestRecordId}
              onDelete={deleteRecord}
            />
          </>
        )}

        {feature.key === "summary" && (
          <>
            <Summary subjects={subjects} records={records} />
            <Milestones records={records} />
          </>
        )}

        {feature.key === "records" && (
          <>
            <RecordList
              subjects={subjects}
              records={records}
              onDelete={deleteRecord}
              onUpdate={updateRecord}
            />
            <Summary subjects={subjects} records={records} />
          </>
        )}

        {feature.key === "milestones" && (
          <>
            <Milestones records={records} />
            <RecordList
              subjects={subjects}
              records={records}
              onDelete={deleteRecord}
              onUpdate={updateRecord}
            />
          </>
        )}

        {feature.key === "boss" && (
          <>
            <BossBattle
              bosses={bosses}
              subjects={subjects}
              records={records}
              onStart={startBoss}
              onClear={clearBoss}
            />
            <Pace records={records} />
            <RecentRecords
              subjects={subjects}
              records={records}
              newestId={newestRecordId}
              onDelete={deleteRecord}
            />
          </>
        )}

        {feature.key === "subjects" && (
          <>
            <SubjectManager
              subjects={subjects}
              onAdd={addSubject}
              onDelete={deleteSubject}
            />
            <SubjectTotals subjects={subjects} records={records} />
          </>
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
            <Pace records={records} />
          </>
        )}
      </div>
    </div>
  );
}

export default App;
