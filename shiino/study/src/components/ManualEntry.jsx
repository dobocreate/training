import { useState } from "react";
import Icon from "./Icon";
import { toDateKey } from "../lib/time";

// あとから手入力で記録を足すためのパネル。
// 計測し忘れた分や、アプリを使う前の分を入れられるようにしている
function ManualEntry({ subjects, onAdd }) {
  const [subjectId, setSubjectId] = useState(subjects[0]?.id ?? "");
  const [hours, setHours] = useState("");
  const [minutes, setMinutes] = useState("");
  const [dateKey, setDateKey] = useState(() => toDateKey(new Date()));
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const seconds = (Number(hours) || 0) * 3600 + (Number(minutes) || 0) * 60;
    if (seconds <= 0) {
      setError("時間を入力してください");
      return;
    }
    // 一覧に無い科目が選ばれたままになることがあるので、ここで確認する
    if (!subjects.some((s) => s.id === subjectId)) {
      setError("科目を選んでください");
      return;
    }

    // 1日の上限を超えたときなどは理由が返ってくるので、入力を残したまま見せる
    const problem = onAdd({ subjectId, seconds, dateKey });
    if (problem) {
      setError(problem);
      return;
    }
    setHours("");
    setMinutes("");
    setError("");
  };

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="pencil" />
        手入力で追加
      </p>

      <form className="manual-form" onSubmit={handleSubmit}>
        <select
          className="field"
          value={subjectId}
          onChange={(e) => {
            setSubjectId(e.target.value);
            setError("");
          }}
        >
          {subjects.map((subject) => (
            <option key={subject.id} value={subject.id}>
              {subject.name}
            </option>
          ))}
        </select>

        <input
          className="field is-date"
          type="date"
          value={dateKey}
          max={toDateKey(new Date())}
          onChange={(e) => {
            setDateKey(e.target.value);
            setError("");
          }}
        />

        <div className="duration-inputs">
          <input
            className="field is-number"
            type="number"
            min="0"
            max="23"
            placeholder="0"
            value={hours}
            onChange={(e) => {
              setHours(e.target.value);
              setError("");
            }}
          />
          <span className="unit">時間</span>

          <input
            className="field is-number"
            type="number"
            min="0"
            max="59"
            placeholder="30"
            value={minutes}
            onChange={(e) => {
              setMinutes(e.target.value);
              setError("");
            }}
          />
          <span className="unit">分</span>
        </div>

        <button type="submit" className="add-button">
          追加
        </button>
      </form>

      <p className="error-message">{error}</p>
    </section>
  );
}

export default ManualEntry;
