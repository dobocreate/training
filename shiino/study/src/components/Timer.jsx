import Icon from "./Icon";
import ConfidenceBadge from "./ConfidenceBadge";
import { formatClock } from "../lib/time";
import { gapOf, sortByPriority } from "../lib/confidence";

// 計測パネル。科目を選んで開始・一時停止・停止する。
// running.since が null なら一時停止中（時計は止まったまま）
function Timer({
  subjects,
  records,
  running,
  elapsedSeconds,
  breakSeconds,
  selectedId,
  onSelect,
  onStart,
  onPause,
  onResume,
  onStop,
}) {
  const runningSubject = running
    ? subjects.find((s) => s.id === running.subjectId)
    : null;
  const isPaused = Boolean(running) && running.since === null;

  const stateText = () => {
    if (!running) return "科目を選んで開始";
    const name = runningSubject?.name ?? "（削除された科目）";
    const base = isPaused ? `${name} を一時停止中` : `${name} を計測中`;
    // 先頭より遅れている科目に取り組んでいるときは、それが分かるようにひとこと足す
    const behind = runningSubject && gapOf(runningSubject, subjects) > 0;
    return behind ? `${base}（追い上げ中！）` : base;
  };

  // やるべき順（先頭との差 ± 好き嫌い）に並べる。追いつきカードの「次はこれ」と同じ順
  const ordered = sortByPriority(subjects, records);

  return (
    <section className="card timer">
      <p className="card-title">
        <Icon name="timer" />
        計測
      </p>

      {/* 科目 / 時計 / ボタン を横に並べる。狭い画面ではCSSで縦積みにする */}
      <div className="timer-body">
        {/* 計測中は科目を変えられないようにする（途中で付け替えると記録が曖昧になるため） */}
        <div className="chips">
          {ordered.map((subject) => (
            <button
              type="button"
              key={subject.id}
              className={subject.id === selectedId ? "chip is-active" : "chip"}
              style={{ "--chip-color": subject.color }}
              onClick={() => onSelect(subject.id)}
              disabled={Boolean(running)}
            >
              {subject.name}
              <ConfidenceBadge value={subject.confidence} isBehind={gapOf(subject, subjects) > 0} />
            </button>
          ))}
        </div>

        <div className="timer-display">
          <p className={isPaused ? "timer-clock is-paused" : "timer-clock"}>
            {formatClock(elapsedSeconds)}
          </p>
          <p className="timer-subject">{stateText()}</p>

          {/* 一時停止中はここが動く。再開後も、その回にとった休憩の合計を出しておく */}
          {running && breakSeconds > 0 && (
            <p className={isPaused ? "timer-break is-running" : "timer-break"}>
              休憩 {formatClock(breakSeconds)}
            </p>
          )}
        </div>

        {running ? (
          <div className="timer-buttons">
            {isPaused ? (
              <button type="button" className="big-button" onClick={onResume}>
                再開
              </button>
            ) : (
              <button type="button" className="big-button is-pause" onClick={onPause}>
                一時停止
              </button>
            )}
            <button type="button" className="big-button is-stop" onClick={onStop}>
              停止して記録
            </button>
          </div>
        ) : (
          <button
            type="button"
            className="big-button"
            onClick={onStart}
            disabled={subjects.length === 0}
          >
            開始
          </button>
        )}
      </div>
    </section>
  );
}

export default Timer;
