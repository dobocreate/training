import { formatDuration, toDateKey, recentDateKeys, formatDateLabel } from "../lib/time";

// 直近7日の棒グラフ。合計の画面とタイトル画面で使い回す。
// compact のときは棒の上の数字を省いて、形だけ見せる
function WeekChart({ records, compact = false }) {
  const days = recentDateKeys(7).map((key) => ({
    key: key,
    seconds: records
      .filter((record) => toDateKey(record.startedAt) === key)
      .reduce((sum, record) => sum + record.seconds, 0),
  }));

  // いちばん多い日を満杯にする。全部0だと0除算になるので、最低1にしておく
  const max = Math.max(...days.map((day) => day.seconds), 1);

  return (
    <ul className={compact ? "week-chart is-compact" : "week-chart"}>
      {days.map((day) => (
        <li key={day.key} className="week-day">
          {!compact && (
            <span className="week-value">
              {day.seconds > 0 ? formatDuration(day.seconds) : ""}
            </span>
          )}

          {/* 棒は下から伸ばしたいので、枠を flex-end にして高さだけ変える */}
          <span
            className="week-track"
            title={`${formatDateLabel(day.key)} ${formatDuration(day.seconds)}`}
          >
            <span
              className="week-fill"
              style={{ height: `${(day.seconds / max) * 100}%` }}
            />
          </span>

          <span className="week-label">{formatDateLabel(day.key)}</span>
        </li>
      ))}
    </ul>
  );
}

export default WeekChart;
