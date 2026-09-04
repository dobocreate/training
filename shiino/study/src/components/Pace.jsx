import Icon from "./Icon";
import { formatDuration, toDateKey, startOfWeekKey, recentDateKeys } from "../lib/time";

// 計測とボス戦の画面に添える、今のペース。
// 「今日はどれだけやったか」「この調子で足りるか」をその場で確かめられるようにする
function Pace({ records }) {
  const todayKey = toDateKey(new Date());
  const weekStart = startOfWeekKey();

  const todaySeconds = records
    .filter((record) => toDateKey(record.startedAt) === todayKey)
    .reduce((sum, record) => sum + record.seconds, 0);

  const weekSeconds = records
    .filter((record) => toDateKey(record.startedAt) >= weekStart)
    .reduce((sum, record) => sum + record.seconds, 0);

  // 直近7日の1日あたり。勉強しなかった日も1日として数えるので、
  // 「毎日ならすとどれくらいか」が出る
  const keys = recentDateKeys(7);
  const recentSeconds = records
    .filter((record) => toDateKey(record.startedAt) >= keys[0])
    .reduce((sum, record) => sum + record.seconds, 0);
  const perDay = Math.floor(recentSeconds / keys.length);

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="trend" />
        今のペース
      </p>

      <dl className="pace">
        <div className="pace-item">
          <dt>今日</dt>
          <dd>{formatDuration(todaySeconds)}</dd>
        </div>
        <div className="pace-item">
          <dt>今週</dt>
          <dd>{formatDuration(weekSeconds)}</dd>
        </div>
        <div className="pace-item">
          <dt>1日あたり</dt>
          <dd>{formatDuration(perDay)}</dd>
        </div>
      </dl>
    </section>
  );
}

export default Pace;
