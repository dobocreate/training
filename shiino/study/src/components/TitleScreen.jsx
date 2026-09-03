import { useEffect } from "react";
import { journeyProgress } from "../lib/journey";
import { formatDuration, toDateKey } from "../lib/time";

// 最初に出るタイトル画面。STARTを押すと本編に入る
function TitleScreen({ records, boss, onStart }) {
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

  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const journey = journeyProgress(totalSeconds);

  return (
    <div className="title-screen">
      <p className="title-eyebrow">SPACE STUDY</p>
      <h1 className="title-logo">STUDY LOG</h1>
      <p className="title-lead">科目ごとに勉強時間を記録する</p>

      {/* 前回までの状況を少しだけ見せて、続きから始める感じを出す */}
      <dl className="title-stats">
        <div className="title-stat">
          <dt>今日の勉強</dt>
          <dd>{formatDuration(todaySeconds)}</dd>
        </div>
        <div className="title-stat">
          <dt>現在地</dt>
          <dd>{journey.current.name}</dd>
        </div>
        <div className="title-stat">
          <dt>挑戦中のボス</dt>
          <dd>{boss ? boss.name : "なし"}</dd>
        </div>
      </dl>

      <button type="button" className="start-button" onClick={onStart}>
        START
      </button>
      <p className="title-hint">Enter キーでも始められる</p>
    </div>
  );
}

export default TitleScreen;
