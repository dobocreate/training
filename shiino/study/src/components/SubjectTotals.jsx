import Icon from "./Icon";
import ConfidenceBadge from "./ConfidenceBadge";
import { formatDuration } from "../lib/time";
import { gapOf } from "../lib/confidence";

// 科目の画面に添える、科目別の累計。
// どの科目にどれだけ使ったかを見ながら、追加や削除を判断できるようにする。
// 棒の長さは合計に対する割合ではなく、いちばん多い科目を基準にする（差が見やすいため）
function SubjectTotals({ subjects, records }) {
  const totals = subjects
    .map((subject) => ({
      ...subject,
      seconds: records
        .filter((record) => record.subjectId === subject.id)
        .reduce((sum, record) => sum + record.seconds, 0),
    }))
    .sort((a, b) => b.seconds - a.seconds);

  const max = Math.max(...totals.map((item) => item.seconds), 1);

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="chart" />
        科目別の累計
      </p>

      {totals.length === 0 ? (
        <p className="empty-message">科目がありません</p>
      ) : (
        <ul className="subject-bars">
          {totals.map((item) => (
            <li key={item.id} className="subject-bar">
              <span className="subject-name">
                <span className="dot" style={{ backgroundColor: item.color }} />
                {item.name}
                <ConfidenceBadge value={item.confidence} isBehind={gapOf(item, subjects) > 0} />
              </span>
              <span className="subject-time">{formatDuration(item.seconds)}</span>

              <span className="bar-track">
                <span
                  className="bar-fill"
                  style={{
                    width: `${(item.seconds / max) * 100}%`,
                    backgroundColor: item.color,
                  }}
                />
              </span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

export default SubjectTotals;
