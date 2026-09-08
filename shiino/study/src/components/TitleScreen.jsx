import { useEffect } from "react";
import { studyStreak } from "../lib/streak";
import ConfidenceBadge from "./ConfidenceBadge";
import StarRating from "./StarRating";
import {
  leaderSubject,
  gapOf,
  recommendSubject,
  normalizeConfidence,
  isDisliked,
  isLeveled,
  GOAL,
} from "../lib/confidence";
import { formatClock, formatDuration, toDateKey, startOfWeekKey } from "../lib/time";

// 最初に出るタイトル画面。STARTを押すと本編に入る
function TitleScreen({ records, subjects, running, elapsedSeconds, onStart }) {
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

  const streak = studyStreak(records);
  const isPaused = Boolean(running) && running.since === null;

  const runningSubject = running
    ? subjects.find((subject) => subject.id === running.subjectId)
    : null;

  // 科目ごとの自信。自信が高い順に並べ、先頭との差が見えるようにする
  const leader = leaderSubject(subjects);
  const recommended = recommendSubject(subjects, records);
  const leveled = isLeveled(subjects);
  const byConfidence = [...subjects].sort(
    (a, b) => normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence),
  );

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
      </dl>

      {/* 科目ごとの自信。どれが遅れているかを、開いた瞬間に分かるようにする */}
      {subjects.length > 0 && (
        <div className="title-confidence">
          <div className="title-confidence-head">
            <span className="chart-title">自信</span>
            <span className="stat-note">
              {/* 差があるときは何も言わない。棒と線で差が見えるので、文は横並びのときだけ */}
              {subjects.length > 1 && leveled
                ? `横並び！${GOAL}% を目指そう。まずは${isDisliked(recommended) ? "嫌いな" : ""} ${recommended.name} から`
                : ""}
            </span>
          </div>
          <ul className="subject-bars is-title">
            {byConfidence.map((subject) => {
              const value = normalizeConfidence(subject.confidence);
              const gap = gapOf(subject, subjects);
              return (
                <li key={subject.id} className="subject-bar">
                  <span className="subject-name">
                    <span className="dot" style={{ backgroundColor: subject.color }} />
                    {subject.name}
                    {!leveled && subject.id === leader?.id && subjects.length > 1 && (
                      <span className="leader-tag">先頭</span>
                    )}
                    <StarRating value={subject.feeling} compact />
                  </span>
                  <span className="subject-time">
                    <ConfidenceBadge value={value} isBehind={gap > 0} />
                  </span>
                  <span className="bar-track catch-up-track">
                    <span
                      className="bar-fill"
                      style={{ width: `${value}%`, backgroundColor: subject.color }}
                    />
                    <span className="leader-line is-target" style={{ left: `${GOAL}%` }} />
                    {!leveled && leader && gap > 0 && (
                      <span
                        className="leader-line"
                        style={{ left: `${normalizeConfidence(leader.confidence)}%` }}
                      />
                    )}
                  </span>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
      <p className="title-hint">Enter キー</p>
    </div>
  );
}

export default TitleScreen;
