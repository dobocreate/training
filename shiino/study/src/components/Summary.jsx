import { useState } from "react";
import {
  formatDuration,
  toDateKey,
  startOfWeekKey,
  recentDateKeys,
  formatDateLabel,
} from "../lib/time";

const RANGES = [
  { key: "today", label: "今日" },
  { key: "week", label: "今週" },
  { key: "all", label: "全期間" },
];

// 日付キーは YYYY-MM-DD なので、文字列のまま大小比較できる
function inRange(record, range) {
  const key = toDateKey(record.startedAt);
  if (range === "today") return key === toDateKey(new Date());
  if (range === "week") return key >= startOfWeekKey();
  return true;
}

function Summary({ subjects, records }) {
  const [range, setRange] = useState("today");

  const target = records.filter((record) => inRange(record, range));
  const total = target.reduce((sum, record) => sum + record.seconds, 0);

  // 科目ごとの合計を出して、多い順に並べる
  const perSubject = subjects
    .map((subject) => ({
      ...subject,
      seconds: target
        .filter((record) => record.subjectId === subject.id)
        .reduce((sum, record) => sum + record.seconds, 0),
    }))
    .filter((item) => item.seconds > 0)
    .sort((a, b) => b.seconds - a.seconds);

  // 直近7日は範囲切り替えの影響を受けず、いつも同じものを出す
  const days = recentDateKeys(7).map((key) => ({
    key,
    seconds: records
      .filter((record) => toDateKey(record.startedAt) === key)
      .reduce((sum, record) => sum + record.seconds, 0),
  }));
  const maxDay = Math.max(...days.map((d) => d.seconds), 1);

  return (
    <section className="card">
      <div className="summary-head">
        <p className="card-title">合計</p>
        <div className="range-tabs">
          {RANGES.map((item) => (
            <button
              type="button"
              key={item.key}
              className={item.key === range ? "range-tab is-active" : "range-tab"}
              onClick={() => setRange(item.key)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <p className="summary-total">{formatDuration(total)}</p>

      {perSubject.length === 0 ? (
        <p className="empty-message">この期間の記録はまだありません</p>
      ) : (
        <ul className="subject-bars">
          {perSubject.map((item) => (
            <li key={item.id} className="subject-bar">
              <span className="subject-name">
                <span className="dot" style={{ backgroundColor: item.color }} />
                {item.name}
              </span>
              <span className="subject-time">{formatDuration(item.seconds)}</span>

              {/* 棒の長さは合計に対する割合。色は科目の色をそのまま使う */}
              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${(item.seconds / total) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}

      <p className="chart-title">直近7日</p>
      <ul className="week-chart">
        {days.map((day) => (
          <li key={day.key} className="week-day">
            <span className="week-value">
              {day.seconds > 0 ? formatDuration(day.seconds) : ""}
            </span>
            <span className="week-track">
              <span
                className="week-fill"
                style={{ height: `${(day.seconds / maxDay) * 100}%` }}
              />
            </span>
            <span className="week-label">{formatDateLabel(day.key)}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Summary;
