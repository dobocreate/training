import Icon from "./Icon";
import { MILESTONES, milestoneProgress, milestoneReachedDates } from "../lib/milestones";
import { formatDuration, formatDateLabel } from "../lib/time";

// 累計の勉強時間が、どの段階まで来ているかを見せる。
// 記録から毎回計算するので、保存している値はない。
// 積み上げてきた実感が出るように、到達した段階と、その日付を一覧で残す
function Milestones({ records }) {
  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const progress = milestoneProgress(totalSeconds);
  const reachedDates = milestoneReachedDates(records);

  return (
    <section className="card">
      <div className="milestone-head">
        <p className="card-title">
          <Icon name="flag" />
          マイルストーン
        </p>
        <span className="milestone-total">累計 {formatDuration(totalSeconds)}</span>
      </div>

      {/* 今いる段階を主役にする */}
      <p className="milestone-now">{progress.current.name}</p>
      <p className="milestone-next">
        {progress.isComplete
          ? "すべての段階を達成した"
          : `あと ${formatDuration(progress.remainingSeconds)} で ${progress.next.name}`}
      </p>

      {/* 今いる区間の進み具合 */}
      <div className="milestone-bar">
        <div
          className="milestone-bar-fill"
          style={{ width: `${progress.ratio * 100}%` }}
        />
      </div>

      <ol className="milestone-steps">
        {MILESTONES.map((milestone, index) => {
          const isReached = index <= progress.index;
          const isCurrent = index === progress.index;

          const classes = ["milestone-step"];
          if (isReached) classes.push("is-reached");
          if (isCurrent) classes.push("is-current");

          return (
            <li key={milestone.name} className={classes.join(" ")}>
              <span className="milestone-mark">
                {isReached && <Icon name="check" />}
              </span>
              <span className="milestone-name">{milestone.name}</span>
              <span className="milestone-hours">{milestone.hours}時間</span>
              <span className="milestone-date">
                {isCurrent
                  ? "いまここ"
                  : reachedDates[index]
                    ? `${formatDateLabel(reachedDates[index])} 到達`
                    : ""}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default Milestones;
