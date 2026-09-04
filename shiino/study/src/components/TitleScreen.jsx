import { useEffect } from "react";
import { milestoneProgress } from "../lib/milestones";
import { goalProgress } from "../lib/goals";
import { studyStreak } from "../lib/streak";
import WeekChart from "./WeekChart";
import { formatClock, formatDuration, toDateKey, startOfWeekKey } from "../lib/time";

// 最初に出るタイトル画面。STARTを押すと本編に入る
function TitleScreen({ records, goals, subjects, running, elapsedSeconds, onStart }) {
  // Enter / Space でも始められるようにする
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key !== "Enter" && event.key !== " ") return;
      // Space はページが下にスクロールしてしまうので止める
      event.preventDefault();
      onStart();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onStart]);

  const todayKey = toDateKey(new Date());
  const todaySeconds = records
    .filter((record) => toDateKey(record.startedAt) === todayKey)
    .reduce((sum, record) => sum + record.seconds, 0);

  // 今日ぶんが今週のどれくらいかを、帯の長さにする
  const weekStart = startOfWeekKey();
  const weekSeconds = records
    .filter((record) => toDateKey(record.startedAt) >= weekStart)
    .reduce((sum, record) => sum + record.seconds, 0);
  const todayShare = weekSeconds > 0 ? todaySeconds / weekSeconds : 0;

  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const progress = milestoneProgress(totalSeconds);
  const goalNow = goalProgress(goals, records);
  const streak = studyStreak(records);
  const isPaused = Boolean(running) && running.since === null;

  const runningSubject = running
    ? subjects.find((subject) => subject.id === running.subjectId)
    : null;

  return (
    <div className="title-screen">
      <h1 className="title-logo">STUDY LOG</h1>

      {/* 計測したまま閉じても計測は続くので、開いた時点で経過時間が分かるようにする */}
      {running && (
        <p className="title-running">
          <span className={isPaused ? "running-dot is-paused" : "running-dot"} />
          {`${runningSubject?.name ?? "（削除された科目）"} を${isPaused ? "一時停止中" : "計測中"}`}
          <span className="running-clock">{formatClock(elapsedSeconds)}</span>
        </p>
      )}

      {/* 前回までの状況を少しだけ見せて、続きから始める感じを出す */}
      <dl className="title-stats">
        <div className="title-stat">
          <dt>今日の勉強</dt>
          <dd>
            {formatDuration(todaySeconds)}
            <span className="stat-track">
              <span
                className="stat-fill"
                style={{ width: `${todayShare * 100}%` }}
              />
            </span>
            <span className="stat-note">今週 {formatDuration(weekSeconds)}</span>
          </dd>
        </div>
        {/* 0日でも札は出す（列を欠けさせないため）。
            今日まだのときだけ補足で伝えて、途切れかけていることを分かるようにする */}
        <div className="title-stat">
          <dt>連続日数</dt>
          <dd>
            {streak.days > 0 ? `${streak.days}日` : "なし"}
            {streak.days > 0 && (
              <span className={streak.hasToday ? "stat-note" : "stat-note is-pending"}>
                {streak.hasToday ? "今日ぶんは記録ずみ" : "今日はまだ"}
              </span>
            )}
          </dd>
        </div>
        <div className="title-stat">
          <dt>到達段階</dt>
          <dd>
            {progress.current.name}
            <span className="stat-track">
              <span
                className="stat-fill"
                style={{ width: `${progress.ratio * 100}%` }}
              />
            </span>
            <span className="stat-note">
              {progress.isComplete
                ? "すべて達成"
                : `次は ${progress.next.name} まで`}
            </span>
          </dd>
        </div>
        <div className="title-stat">
          <dt>目標の達成度</dt>
          <dd>
            {goalNow ? (
              <>
                {goalNow.label}
                <span className="stat-track">
                  <span
                    className={
                      goalNow.isAlert ? "stat-fill is-alert" : "stat-fill"
                    }
                    style={{ width: `${goalNow.percent}%` }}
                  />
                </span>
                <span className="stat-note">
                  {goalNow.others > 0
                    ? `${goalNow.name} ほか${goalNow.others}件`
                    : goalNow.name}
                </span>
              </>
            ) : (
              "なし"
            )}
          </dd>
        </div>
      </dl>

      {/* 数字ばかりなので、形で「どの日にやったか」が分かるものを1つ置く */}
      <div className="title-week">
        <WeekChart records={records} compact />
      </div>

      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
      <p className="title-hint">Enter キー</p>
    </div>
  );
}

export default TitleScreen;
