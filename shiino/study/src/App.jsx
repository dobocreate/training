import { useEffect, useState } from "react";
import Icon from "./components/Icon";
import TitleScreen from "./components/TitleScreen";
import Menu from "./components/Menu";
import Timer from "./components/Timer";
import Milestones from "./components/Milestones";
import GoalList from "./components/GoalList";
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
  loadGoals,
  saveGoals,
} from "./lib/storage";
import "./App.css";

// idは重複しなければよいので、時刻と乱数を組み合わせて作る
function createId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
}

// 「その時刻から今まで」の秒数。
// 端末の時計が巻き戻ってもマイナスにならないようにしておく
function secondsSince(isoString, nowMs) {
  return Math.max(
    0,
    Math.floor((nowMs - new Date(isoString).getTime()) / 1000),
  );
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

  // 決めてある目標。いくつでも同時に持てる
  const [goals, setGoals] = useState(loadGoals);

  // 今どの画面にいるか。"title" → "menu" → 機能のキー（FEATURES）と進む。
  // 開くたびにタイトルから始まるので、保存はしない
  const [screen, setScreen] = useState("title");

  // 直前に足した記録のid。計測・手入力の下で、どれが今足したぶんかを示すのに使う
  const [newestRecordId, setNewestRecordId] = useState(null);

  const [selectedId, setSelectedId] = useState(
    () => loadSubjects()[0]?.id ?? "",
  );

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
    saveGoals(goals);
  }, [goals]);

  // 計測中は1秒ごとに現在時刻を更新する。
  // 一時停止中も休憩の時間が進むので、止めずに動かし続ける
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

  // 確定ぶんに、今の区間のぶんを足す。勉強と休憩で同じ数え方をする
  const elapsedSeconds = running
    ? running.accumulated +
      (running.since ? secondsSince(running.since, now) : 0)
    : 0;

  const breakSeconds = running
    ? running.breakAccumulated +
      (running.pausedAt ? secondsSince(running.pausedAt, now) : 0)
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
    setRunning({
      subjectId: selectedId,
      startedAt: at,
      accumulated: 0,
      since: at,
      breakAccumulated: 0,
      pausedAt: null,
    });
  };

  // 一時停止。勉強ぶんを accumulated に畳んで閉じ、休憩の計測をはじめる
  const pauseTimer = () => {
    if (!running?.since) return;
    setNow(Date.now());
    setRunning({
      ...running,
      accumulated: elapsedSeconds,
      since: null,
      pausedAt: new Date().toISOString(),
    });
  };

  // 再開。休憩ぶんを breakAccumulated に畳んで閉じ、勉強の計測に戻す
  const resumeTimer = () => {
    if (!running || running.since) return;
    setNow(Date.now());
    setRunning({
      ...running,
      since: new Date().toISOString(),
      breakAccumulated: breakSeconds,
      pausedAt: null,
    });
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
        // 一時停止していたぶん。集計には入れず、記録として残すだけ
        breakSeconds: breakSeconds,
        startedAt: running.startedAt,
      });
    }
    setRunning(null);
  };

  // 手入力ぶんの追加。日付は選べるが、時刻は「今の時刻」を使う
  const addManualRecord = ({ subjectId, seconds, dateKey }) => {
    const [y, m, d] = dateKey.split("-").map(Number);
    const nowDate = new Date();
    // 秒まで入れておく。分で切り捨てると、直前に決めた目標より古い記録に
    // なってしまい、目標のぶんとして数えられなくなる
    const startedAt = new Date(
      y,
      m - 1,
      d,
      nowDate.getHours(),
      nowDate.getMinutes(),
      nowDate.getSeconds(),
      nowDate.getMilliseconds(),
    ).toISOString();

    addRecord({
      id: createId(),
      subjectId,
      seconds,
      breakSeconds: 0,
      startedAt,
    });
  };

  // 記録の修正。日付だけ差し替え、何時に始めたかは元のまま残す
  const updateRecord = (id, { subjectId, seconds, dateKey }) => {
    setRecords((prev) =>
      prev.map((record) => {
        if (record.id !== id) return record;

        const old = new Date(record.startedAt);
        const [y, m, d] = dateKey.split("-").map(Number);
        const startedAt = new Date(
          y,
          m - 1,
          d,
          old.getHours(),
          old.getMinutes(),
          old.getSeconds(),
          old.getMilliseconds(),
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

  // 目標を決める。決めた時刻を覚えておき、それ以降の記録だけを数える
  const addGoal = (config) => {
    setGoals((prev) => [
      ...prev,
      { ...config, id: createId(), createdAt: new Date().toISOString() },
    ]);
  };

  // 目標は名前・期限・時間を決め直せばすぐ作れるので、確認は挟まない
  // （記録の削除に確認が無いのと同じ扱い）
  const deleteGoal = (id) => {
    setGoals((prev) => prev.filter((item) => item.id !== id));
  };

  // 科目を消しても記録は残す。過去に積み上げた時間まで失われないようにするため。
  // 科目のいなくなった記録は「（削除された科目）」として一覧に出る
  const deleteSubject = (id) => {
    const subject = subjects.find((item) => item.id === id);
    const count = records.filter((record) => record.subjectId === id).length;
    const isRunningSubject = running?.subjectId === id;

    const lines = [`「${subject.name}」を削除します。`];
    if (count > 0) {
      lines.push(
        `記録${count}件はそのまま残ります（「（削除された科目）」と表示されます）。`,
      );
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
        goals={goals}
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
        goals={goals}
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

      {/* そのページの機能を先頭に置き、続けて「そこで一緒に見たくなるもの」をそえる。
          ただし一覧・集計を見せるカード（記録・合計・マイルストーン）は、
          どこが本家か分からなくなるので、それぞれの画面にしか置かない */}
      <div className="screen-body">
        {feature.key === "timer" && (
          <>
            <Timer
              subjects={subjects}
              running={running}
              elapsedSeconds={elapsedSeconds}
              breakSeconds={breakSeconds}
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

        {feature.key === "summary" && <Summary subjects={subjects} records={records} />}

        {/* 一覧が主役なので先に置き、そのすぐ下で足せるようにする。
            足したぶんは一覧の中で色が付き、見える位置まで自動でスクロールする */}
        {feature.key === "records" && (
          <>
            <RecordList
              subjects={subjects}
              records={records}
              newestId={newestRecordId}
              onDelete={deleteRecord}
              onUpdate={updateRecord}
            />
            <ManualEntry subjects={subjects} onAdd={addManualRecord} />
          </>
        )}

        {feature.key === "milestones" && <Milestones records={records} />}

        {feature.key === "goal" && (
          <>
            <GoalList
              goals={goals}
              subjects={subjects}
              records={records}
              onAdd={addGoal}
              onDelete={deleteGoal}
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
      </div>
    </div>
  );
}

export default App;
