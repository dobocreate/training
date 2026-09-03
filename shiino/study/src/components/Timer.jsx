import Icon from "./Icon";
import { formatClock } from "../lib/time";

// 計測パネル。科目を選んで開始・停止する
function Timer({ subjects, running, elapsedSeconds, selectedId, onSelect, onStart, onStop }) {
  const runningSubject = running
    ? subjects.find((s) => s.id === running.subjectId)
    : null;

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
          {subjects.map((subject) => (
            <button
              type="button"
              key={subject.id}
              className={subject.id === selectedId ? "chip is-active" : "chip"}
              style={{ "--chip-color": subject.color }}
              onClick={() => onSelect(subject.id)}
              disabled={Boolean(running)}
            >
              {subject.name}
            </button>
          ))}
        </div>

        <div className="timer-display">
          <p className="timer-clock">{formatClock(elapsedSeconds)}</p>
          <p className="timer-subject">
            {runningSubject ? `${runningSubject.name} を計測中` : "科目を選んで開始"}
          </p>
        </div>

        {running ? (
          <button type="button" className="big-button is-stop" onClick={onStop}>
            停止して記録
          </button>
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
