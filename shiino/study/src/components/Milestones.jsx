import Icon from "./Icon";
import { MILESTONES, milestoneProgress } from "../lib/milestones";
import { formatDuration } from "../lib/time";

// 累計の勉強時間が、どの段階まで来ているかを見せる。
// 記録から毎回計算するので、保存している値はない
function Milestones({ records }) {
  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const progress = milestoneProgress(totalSeconds);

  return (
    <section className="card">
      <div className="milestone-head">
        <p className="card-title">
          <Icon name="flag" />
          マイルストーン
        </p>
        <span className="milestone-total">累計 {formatDuration(totalSeconds)}</span>
      </div>

      <p className="milestone-current">{progress.current.name}</p>
      <p className="milestone-next">
        {progress.isComplete
          ? "すべての段階を達成した"
          : `次は ${progress.next.name} まで あと ${formatDuration(progress.remainingSeconds)}`}
      </p>

      {/* 目盛りは等間隔に置き、現在位置のマークだけ進み具合に応じて動かす */}
      <div className="track">
        <div className="track-line" />
        <div className="track-done" style={{ width: `${progress.position * 100}%` }} />

        {MILESTONES.map((milestone, index) => (
          <span
            key={milestone.name}
            className={index <= progress.index ? "step is-reached" : "step"}
            style={{ left: `${(index / (MILESTONES.length - 1)) * 100}%` }}
            title={`${milestone.name} / ${milestone.hours}時間`}
          />
        ))}

        <span className="marker" style={{ left: `${progress.position * 100}%` }} />
      </div>

      {/* 到達済みの段階が分かるように、一覧も出す */}
      <ul className="step-list">
        {MILESTONES.map((milestone, index) => (
          <li
            key={milestone.name}
            className={index <= progress.index ? "step-chip is-reached" : "step-chip"}
          >
            {milestone.name}
            <span className="step-hours">{milestone.hours}h</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Milestones;
