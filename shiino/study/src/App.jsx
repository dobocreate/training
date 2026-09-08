import { useEffect, useState } from "react";
import Icon from "./components/Icon";
import TitleScreen from "./components/TitleScreen";
import Menu from "./components/Menu";
import Timer from "./components/Timer";
import Summary from "./components/Summary";
import SubjectManager from "./components/SubjectManager";
import Pace from "./components/Pace";
import SubjectTotals from "./components/SubjectTotals";
import RecordList from "./components/RecordList";
import CatchUp from "./components/CatchUp";
import ConfidenceSettings from "./components/ConfidenceSettings";
import ConfidenceEditor from "./components/ConfidenceEditor";
import SkillList from "./components/SkillList";
import ConfidencePrompt from "./components/ConfidencePrompt";
import { FEATURES } from "./lib/features";
import { formatDuration, toDateKey } from "./lib/time";
import { dayLimitError, remainingOnDay } from "./lib/dayLimit";
import { recommendSubject } from "./lib/confidence";
import { withBlendedConfidence } from "./lib/skills";
import {
  loadSubjects,
  saveSubjects,
  loadRecords,
  saveRecords,
  loadRunning,
  saveRunning,
  loadConfidenceLog,
  saveConfidenceLog,
  loadSkills,
  saveSkills,
  loadSettings,
  saveSettings,
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

  // 自信を付け直した履歴。科目には今の値だけを持ち、推移はこちらで追う
  const [confidenceLog, setConfidenceLog] = useState(loadConfidenceLog);

  // 「できること」チェックリスト。チェックした割合が自信に混ざる
  const [skills, setSkills] = useState(loadSkills);

  // 設定。自己申告とチェック率をどの割合で混ぜるか
  const [settings, setSettings] = useState(loadSettings);

  // 計測を止めた直後に出す「今の自信は？」。{ subjectId, seconds } か、聞くことが無ければ null。
  // 開き直したら聞き直さない（保存しない）
  const [pendingConfidence, setPendingConfidence] = useState(null);

  // 今どの画面にいるか。"title" → "menu" → 機能のキー（FEATURES）と進む。
  // 開くたびにタイトルから始まるので、保存はしない
  const [screen, setScreen] = useState("title");

  // 計測で選ばれている科目。開いたときは「先頭との差がいちばん大きく、最近やっていない科目」を選んでおく。
  // 進んでいる科目ばかりにならないように、最初の一手を遅れている科目に寄せるため
  const [selectedId, setSelectedId] = useState(
    () =>
      recommendSubject(
        withBlendedConfidence(loadSubjects(), loadSkills(), loadSettings().selfWeight),
        loadRecords(),
      )?.id ?? "",
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
    saveConfidenceLog(confidenceLog);
  }, [confidenceLog]);

  useEffect(() => {
    saveSkills(skills);
  }, [skills]);

  useEffect(() => {
    saveSettings(settings);
  }, [settings]);

  // 表示と優先度の計算には、自己申告とチェック率を混ぜた自信を使う。
  // 自己申告そのものを扱う入力欄（科目画面・自信チェック）は subjects をそのまま使う
  const blended = withBlendedConfidence(subjects, skills, settings.selfWeight);

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

  // 記録の追加口はここ1か所にまとめる
  const addRecord = (record) => {
    setRecords((prev) => [...prev, record]);
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

    let seconds = elapsedSeconds;

    // 1日の合計は24時間まで。超えるぶんは切り詰め、そのことを本人に伝える
    const remaining = remainingOnDay(records, toDateKey(running.startedAt));
    if (seconds > remaining) {
      window.alert(
        "1日に記録できるのは合計24時間までです。\n" +
          (remaining > 0
            ? `この日の残り ${formatDuration(remaining)} ぶんだけ記録します。`
            : "この日はすでに24時間ぶん記録されているため、今回の計測は記録しません。"),
      );
      seconds = remaining;
    }

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

      // 記録が残ったときだけ、自信を聞く（科目が消えていれば聞かない）
      if (subjects.some((subject) => subject.id === running.subjectId)) {
        setPendingConfidence({ subjectId: running.subjectId, seconds: seconds });
      }
    }
    setRunning(null);
  };

  // 自信の書き換えはここ1か所にまとめる。科目の値を直し、履歴にも残す
  const setSubjectConfidence = (id, value) => {
    setSubjects((prev) =>
      prev.map((subject) =>
        subject.id === id ? { ...subject, confidence: value } : subject,
      ),
    );
    setConfidenceLog((prev) => [
      ...prev,
      { id: createId(), subjectId: id, value: value, at: new Date().toISOString() },
    ]);
  };

  // 好き嫌いの書き換え。履歴には残さない（自信と違って、推移を追う意味が薄いため）
  const setSubjectFeeling = (id, feeling) => {
    setSubjects((prev) =>
      prev.map((subject) => (subject.id === id ? { ...subject, feeling: feeling } : subject)),
    );
  };

  // できることリスト
  const addSkill = (subjectId, text) => {
    setSkills((prev) => [
      ...prev,
      {
        id: createId(),
        subjectId: subjectId,
        text: text,
        done: false,
        doneAt: null,
        createdAt: new Date().toISOString(),
      },
    ]);
  };

  // チェックの付け外し。付けたときは時刻も残す（見直しどきの判定に使う）
  const toggleSkill = (id) => {
    setSkills((prev) =>
      prev.map((skill) =>
        skill.id === id
          ? { ...skill, done: !skill.done, doneAt: skill.done ? null : new Date().toISOString() }
          : skill,
      ),
    );
  };

  // 自信チェックでまとめてチェックを付ける
  const checkSkills = (ids) => {
    if (ids.length === 0) return;
    const at = new Date().toISOString();
    const set = new Set(ids);
    setSkills((prev) =>
      prev.map((skill) => (set.has(skill.id) ? { ...skill, done: true, doneAt: at } : skill)),
    );
  };

  const deleteSkill = (id) => {
    setSkills((prev) => prev.filter((skill) => skill.id !== id));
  };

  const setSelfWeight = (value) => {
    setSettings((prev) => ({ ...prev, selfWeight: value }));
  };

  const addSubject = (name, color, confidence, feeling) => {
    const subject = {
      id: createId(),
      name: name,
      color: color,
      confidence: confidence,
      feeling: feeling,
    };
    setSubjects((prev) => [...prev, subject]);
    if (!selectedId) setSelectedId(subject.id);
  };

  // 記録の修正。日付だけ差し替え、何時に始めたかは元のまま残す。
  // 直せなかったときは理由の文言を返す
  const updateRecord = (id, { subjectId, seconds, dateKey }) => {
    const error = dayLimitError(records, dateKey, seconds, id);
    if (error) return error;

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
    return "";
  };

  // 記録の削除。決め直せばすぐ作り直せるので、確認は挟まない
  const deleteRecord = (id) => {
    setRecords((prev) => prev.filter((record) => record.id !== id));
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
    const skillCount = skills.filter((skill) => skill.subjectId === id).length;
    if (skillCount > 0) {
      lines.push(`できることリスト${skillCount}件も消えます。`);
    }
    if (!window.confirm(lines.join("\n"))) return;

    // 計測中の科目が消える場合も、計測ぶんは捨てずに記録してから止める
    if (isRunningSubject) stopTimer();

    const rest = subjects.filter((item) => item.id !== id);
    setSubjects(rest);
    setSkills((prev) => prev.filter((skill) => skill.subjectId !== id));
    // 消した科目について自信を聞いている途中なら、その問いかけも消す
    if (pendingConfidence?.subjectId === id) setPendingConfidence(null);
    if (selectedId === id) setSelectedId(rest[0]?.id ?? "");
  };

  if (screen === "title") {
    return (
      <TitleScreen
        records={records}
        subjects={blended}
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
        onSelect={setScreen}
      />
    );
  }

  return (
    <div className="app">
      {/* メニューと同じく、画面全体をひとつの枠で囲む */}
      <div className="screen-panel">
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
            ただし一覧・集計を見せるカード（記録・合計・トロフィー）は、
            どこが本家か分からなくなるので、それぞれの画面にしか置かない */}
        <div className="screen-body">
          {feature.key === "timer" && (
            <>
              {/* 止めた直後だけ、計測パネルの上に出す */}
              {pendingConfidence && (
                <ConfidencePrompt
                  key={pendingConfidence.subjectId}
                  subject={subjects.find((s) => s.id === pendingConfidence.subjectId)}
                  seconds={pendingConfidence.seconds}
                  skills={skills}
                  onSave={(value, checkedIds) => {
                    setSubjectConfidence(pendingConfidence.subjectId, value);
                    checkSkills(checkedIds);
                    setPendingConfidence(null);
                  }}
                />
              )}
              <Timer
                subjects={blended}
                records={records}
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
            </>
          )}

          {/* 合計の下に記録の一覧。消したり直したりできる */}
          {feature.key === "summary" && (
            <>
              <Summary subjects={subjects} records={records} />
              <RecordList
                subjects={subjects}
                records={records}
                newestId={null}
                onDelete={deleteRecord}
                onUpdate={updateRecord}
              />
            </>
          )}

          {/* やることチェックリスト。科目ごとに項目を足して、できたらチェックする */}
          {feature.key === "skills" && (
            <SkillList
              subjects={subjects}
              skills={skills}
              onAdd={addSkill}
              onToggle={toggleSkill}
              onDelete={deleteSkill}
            />
          )}

          {feature.key === "confidence" && (
            <>
              <CatchUp
                subjects={blended}
                skills={skills}
                records={records}
                selectedId={selectedId}
                running={running}
                onSelect={setSelectedId}
              />
              <ConfidenceEditor
                subjects={subjects}
                onUpdate={setSubjectConfidence}
                onFeeling={setSubjectFeeling}
              />
              <ConfidenceSettings selfWeight={settings.selfWeight} onChange={setSelfWeight} />
            </>
          )}

          {feature.key === "subjects" && (
            <>
              <SubjectManager
                subjects={subjects}
                onAdd={addSubject}
                onDelete={deleteSubject}
                onUpdate={setSubjectConfidence}
                onFeeling={setSubjectFeeling}
              />
              <SubjectTotals subjects={blended} records={records} />
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default App;