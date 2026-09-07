import Icon from "./Icon";
import { MILESTONES, milestoneProgress, milestoneReachedDates } from "../lib/milestones";
import { formatDuration, formatDateLabel } from "../lib/time";

// 累計の勉強時間が、どの段階まで来ているかを見せる。
// 記録から毎回計算するので、保存している値はない。
// 9つの段階をトロフィー棚のように並べ、集めていく楽しさが出るようにする。
// 到達したものは金色のトロフィー、いまの段階は進み具合のリング、まだのものは鍵つきで出す
function Milestones({ records }) {
  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const progress = milestoneProgress(totalSeconds);
  const reachedDates = milestoneReachedDates(records);
  const percent = Math.round(progress.ratio * 100);

  // 段階ごとの棚札の文言。状態によって見せるものを変える
  const caption = (index, milestone) => {
    // いまの段階は残り時間を上の行で出しているので、ここでは進み具合だけ
    if (index === progress.index) {
      return progress.isComplete ? "すべて達成" : `${percent}% 達成`;
    }
    if (index < progress.index) {
      return reachedDates[index] ? `${formatDateLabel(reachedDates[index])} 到達` : "到達";
    }
    return `${milestone.hours}時間で解放`;
  };

  return (
    <section className="card">
      <div className="milestone-head">
        <p className="card-title">
          <Icon name="trophy" />
          トロフィー
        </p>
        <span className="milestone-total">累計 {formatDuration(totalSeconds)}</span>
      </div>

      {/* いまの段階と、次までの残り。詳しい進み具合は棚のリングで見せる */}
      <p className="milestone-status">
        <span className="milestone-now">{progress.current.name}</span>
        <span className="milestone-next">
          {progress.isComplete
            ? "すべての段階を達成した"
            : `あと ${formatDuration(progress.remainingSeconds)} で ${progress.next.name}`}
        </span>
      </p>

      <ol className="trophy-shelf">
        {MILESTONES.map((milestone, index) => {
          const isCurrent = index === progress.index;
          const isReached = index < progress.index || progress.isComplete;

          const classes = ["trophy"];
          if (isReached) classes.push("is-reached");
          if (isCurrent) classes.push("is-current");

          return (
            <li key={milestone.name} className={classes.join(" ")}>
              {isCurrent && !progress.isComplete && (
                <span className="trophy-tag">いまここ</span>
              )}

              {/* いまの段階だけ、外周のリングで区間の進み具合を出す */}
              <span
                className="trophy-badge"
                style={isCurrent ? { "--ratio": progress.ratio } : undefined}
              >
                <span className="trophy-badge-inner">
                  <Icon
                    name={isReached || isCurrent ? "trophy" : "lock"}
                    className="trophy-icon"
                  />
                </span>
              </span>

              <span className="trophy-name">{milestone.name}</span>
              <span className="trophy-caption">{caption(index, milestone)}</span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}

export default Milestones;
