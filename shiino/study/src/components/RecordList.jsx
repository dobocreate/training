import { useState } from "react";
import Icon from "./Icon";
import { formatDuration, toDateKey, formatDateLabel, formatTimeLabel } from "../lib/time";

// 1件ぶんの編集フォーム。科目・日付・時間を直せる。
// 時刻（何時何分に始めたか）は触らず、元の値をそのまま残す
function EditRow({ record, subjects, onSave, onCancel }) {
  const [subjectId, setSubjectId] = useState(record.subjectId);
  const [dateKey, setDateKey] = useState(toDateKey(record.startedAt));
  const [hours, setHours] = useState(String(Math.floor(record.seconds / 3600)));
  const [minutes, setMinutes] = useState(String(Math.floor((record.seconds % 3600) / 60)));
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
    if (seconds <= 0) {
      setError("時間を入力してください");
      return;
    }

    onSave(record.id, { subjectId: subjectId, seconds: seconds, dateKey: dateKey });
  };

  return (
    <li className="record-row is-editing">
      <form className="edit-form" onSubmit={handleSubmit}>
        <select
          className="field"
          value={subjectId}
          onChange={(event) => setSubjectId(event.target.value)}
        >
          {/* 削除された科目に付いた記録も編集できるよう、選択肢に残しておく */}
          {!subjects.some((subject) => subject.id === subjectId) && (
            <option value={subjectId}>（削除された科目）</option>
          )}
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <div className="edit-row">
          <input
            className="field is-date"
            type="date"
            value={dateKey}
            onChange={(event) => setDateKey(event.target.value)}
          />
          <input
            className="field is-number"
            type="number"
            min="0"
            value={hours}
            onChange={(event) => {
              setHours(event.target.value);
              setError("");
            }}
          />
          <span className="unit">時間</span>
          <input
            className="field is-number"
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(event) => {
              setMinutes(event.target.value);
              setError("");
            }}
          />
          <span className="unit">分</span>

          <button type="submit" className="add-button">
            保存
          </button>
          <button type="button" className="delete-button" onClick={onCancel}>
            やめる
          </button>
        </div>

        <p className="error-message">{error}</p>
      </form>
    </li>
  );
}

// 記録の一覧。日付ごとにまとめて、新しい順に並べる
function RecordList({ subjects, records, onDelete, onUpdate }) {
  const [editingId, setEditingId] = useState(null);

  const findSubject = (id) => subjects.find((subject) => subject.id === id);

  // 日付キーごとに record をまとめる
  const groups = new Map();
  records.forEach((record) => {
    const key = toDateKey(record.startedAt);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(record);
  });

  const sortedKeys = [...groups.keys()].sort().reverse();

  const handleSave = (id, values) => {
    onUpdate(id, values);
    setEditingId(null);
  };

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="list" />
        記録
      </p>

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
                    if (record.id === editingId) {
                      return (
                        <EditRow
                          key={record.id}
                          record={record}
                          subjects={subjects}
                          onSave={handleSave}
                          onCancel={() => setEditingId(null)}
                        />
                      );
                    }

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
                          onClick={() => setEditingId(record.id)}
                          aria-label="この記録を編集"
                        >
                          編集
                        </button>
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
