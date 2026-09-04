import Icon from "./Icon";
import { formatDuration, toDateKey, formatDateLabel, formatTimeLabel } from "../lib/time";

// 計測・手入力のすぐ下に置く、足したばかりの記録。
// 「記録に残った」ことをその場で確かめられるようにするためのもの。
//
// 日付順ではなく「追加した順」で新しいほうから出す。
// 日付順にすると、過去の日付を手入力したときに今足したぶんが下に埋もれてしまうため
const SHOW_COUNT = 5;

function RecentRecords({ subjects, records, newestId, onDelete }) {
  const recent = records.slice(-SHOW_COUNT).reverse();

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="list" />
        追加した記録
      </p>

      {recent.length === 0 ? (
        <p className="empty-message">まだ記録がありません</p>
      ) : (
        <ul className="record-list">
          {recent.map((record) => {
            const subject = subjects.find((item) => item.id === record.subjectId);
            return (
              <li
                key={record.id}
                className={record.id === newestId ? "record-row is-new" : "record-row"}
              >
                <span
                  className="dot"
                  style={{ backgroundColor: subject?.color ?? "#64748b" }}
                />
                <span className="record-subject">
                  {subject?.name ?? "（削除された科目）"}
                </span>
                <span className="record-time">
                  {formatDateLabel(toDateKey(record.startedAt))}{" "}
                  {formatTimeLabel(record.startedAt)}
                </span>
                <span className="record-duration">{formatDuration(record.seconds)}</span>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDelete(record.id)}
                  aria-label="この記録を削除"
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default RecentRecords;
