import { useState } from "react";
import Icon from "./Icon";
import { daysUntil, sortByDate, countdownLabel } from "../lib/exams";
import { formatMonthDay, toDateKey } from "../lib/time";

// テストの予定。名前と日付を決めておくと、タイトル画面に「あと ○日」と出る
function ExamList({ exams, subjects, onAdd, onDelete }) {
  const [name, setName] = useState("");
  const [date, setDate] = useState(() => toDateKey(new Date()));
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmed = name.trim();
    if (trimmed === "") {
      setError("テストの名前を入力してください");
      return;
    }
    if (date === "" || date < toDateKey(new Date())) {
      setError("日付は今日以降にしてください");
      return;
    }

    onAdd({ name: trimmed, date: date, subjectId: subjectId });
    setName("");
    setError("");
  };

  const ordered = sortByDate(exams);

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="flag" />
        テストの予定
      </p>

      {ordered.length > 0 && (
        <ul className="subject-list">
          {ordered.map((exam) => {
            const days = daysUntil(exam.date);
            const subject = subjects.find((item) => item.id === exam.subjectId);
            return (
              <li key={exam.id} className={days < 0 ? "subject-item exam-item is-past" : "subject-item exam-item"}>
                {subject && <span className="dot" style={{ backgroundColor: subject.color }} />}
                <span className="subject-item-name">{exam.name}</span>
                <span className="exam-date">
                  {formatMonthDay(exam.date)}
                  {subject ? ` ／ ${subject.name}` : ""}
                </span>
                <span className={days >= 0 && days <= 3 ? "exam-days is-soon" : "exam-days"}>
                  {countdownLabel(days)}
                </span>
                <button
                  type="button"
                  className="delete-button"
                  onClick={() => onDelete(exam.id)}
                  aria-label={`${exam.name} を削除`}
                >
                  ✕
                </button>
              </li>
            );
          })}
        </ul>
      )}

      <form className="exam-form" onSubmit={handleSubmit}>
        <input
          className="field"
          type="text"
          value={name}
          placeholder="テストの名前（例：期末テスト）"
          autoComplete="off"
          onChange={(event) => {
            setName(event.target.value);
            setError("");
          }}
        />
        <div className="exam-row">
          <input
            className="field is-date"
            type="date"
            value={date}
            min={toDateKey(new Date())}
            onChange={(event) => {
              setDate(event.target.value);
              setError("");
            }}
          />
          <select
            className="field"
            value={subjectId}
            onChange={(event) => setSubjectId(event.target.value)}
            aria-label="科目"
          >
            <option value="">科目を決めない</option>
            {subjects.map((subject) => (
              <option key={subject.id} value={subject.id}>
                {subject.name}
              </option>
            ))}
          </select>
          <button type="submit" className="add-button">
            追加
          </button>
        </div>
      </form>

      <p className="error-message">{error}</p>
    </section>
  );
}

export default ExamList;
