import { formatDuration, toDateKey, formatDateLabel, formatTimeLabel } from "../lib/time";

// 記録の一覧。日付ごとにまとめて、新しい順に並べる
function RecordList({ subjects, records, onDelete }) {
  const findSubject = (id) => subjects.find((subject) => subject.id === id);

  // 日付キーごとに record をまとめる
  const groups = new Map();
  records.forEach((record) => {
    const key = toDateKey(record.startedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });

  const sortedKeys = [...groups.keys()].sort().reverse();

  return (
    <section className="card">
      <p className="card-title">記録</p>

      {sortedKeys.length === 0 ? (
        <p className="empty-message">まだ記録がありません</p>
      ) : (
        <div className="record-scroll">
          {sortedKeys.map((key) => {
            const items = groups
              .get(key)
              .slice()
              .sort((a, b) => (a.startedAt < b.startedAt ? 1 : -1));
            const dayTotal = items.reduce((sum, item) => sum + item.seconds, 0);

            return (
              <div key={key} className="record-group">
                <p className="record-date">
                  {formatDateLabel(key)}
                  <span className="record-date-total">{formatDuration(dayTotal)}</span>
                </p>

                <ul className="record-list">
                  {items.map((record) => {
                    const subject = findSubject(record.subjectId);
                    return (
                      <li key={record.id} className="record-row">
                        <span
                          className="dot"
                          style={{ backgroundColor: subject?.color ?? "#64748b" }}
                        />
                        <span className="record-subject">
                          {subject?.name ?? "（削除された科目）"}
                        </span>
                        <span className="record-time">{formatTimeLabel(record.startedAt)}</span>
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
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default RecordList;
