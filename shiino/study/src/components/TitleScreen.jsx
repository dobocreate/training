import { useEffect } from "react";
import { milestoneProgress } from "../lib/milestones";
import { bossProgress } from "../lib/boss";
import { formatClock, formatDuration, toDateKey, startOfWeekKey } from "../lib/time";

// 最初に出るタイトル画面。STARTを押すと本編に入る
function TitleScreen({ records, bosses, subjects, running, elapsedSeconds, onStart }) {
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
  const bossNow = bossProgress(bosses, records);
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
          <dt>ボス戦の達成度</dt>
          <dd>
            {bossNow ? (
              <>
                {bossNow.label}
                <span className="stat-track">
                  <span
                    className={
                      bossNow.isAlert ? "stat-fill is-alert" : "stat-fill"
                    }
                    style={{ width: `${bossNow.percent}%` }}
                  />
                </span>
                <span className="stat-note">
                  {bossNow.others > 0
                    ? `${bossNow.name} ほか${bossNow.others}件`
                    : bossNow.name}
                </span>
              </>
            ) : (
              "なし"
            )}
          </dd>
        </div>
      </dl>

      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
      <p className="title-hint">Enter キー</p>
    </div>
  );
}

export default TitleScreen;
