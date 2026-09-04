import { useState } from "react";
import Icon from "./Icon";
import { goalStatus } from "../lib/goals";
import { formatDuration, toDateKey } from "../lib/time";

// 目標を決めるためのフォーム
function GoalForm({ subjects, onAdd }) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState(() => toDateKey(new Date()));
  const [hours, setHours] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const targetHours = Number(hours);
    if (!Number.isFinite(targetHours) || targetHours <= 0) {
      setError("目標の時間を入力してください");
      return;
    }
    if (deadline < toDateKey(new Date())) {
      setError("期限は今日以降にしてください");
      return;
    }

    onAdd({
      name: name.trim() === "" ? "目標" : name.trim(),
      deadline: deadline,
      targetHours: targetHours,
      subjectId: subjectId,
    });

    // 続けてもう1つ決められるように、入力を空に戻す
    setName("");
    setHours("");
    setError("");
  };

  return (
    <form className="goal-form" onSubmit={handleSubmit}>
      <input
        className="field"
        type="text"
        value={name}
        placeholder="目標の名前（例：期末テスト）"
        autoComplete="off"
        onChange={(event) => {
          setName(event.target.value);
          setError("");
        }}
      />

      <select
        className="field"
        value={subjectId}
        onChange={(event) => setSubjectId(event.target.value)}
      >
        <option value="">すべての科目</option>
        {subjects.map((subject) => (
          <option key={subject.id} value={subject.id}>
            {subject.name}
          </option>
        ))}
      </select>

      <div className="goal-row">
        <input
          className="field is-date"
          type="date"
          value={deadline}
          min={toDateKey(new Date())}
          onChange={(event) => {
            setDeadline(event.target.value);
            setError("");
          }}
        />
        <input
          className="field is-number"
          type="number"
          min="1"
          placeholder="20"
          value={hours}
          onChange={(event) => {
            setHours(event.target.value);
            setError("");
          }}
        />
        <span className="unit">時間</span>

        <button type="submit" className="add-button">
          追加
        </button>
      </div>

      <p className="error-message">{error}</p>
    </form>
  );
}

// 目標1つぶんの状況
function GoalEntry({ goal, subjects, records, onDelete }) {
  const status = goalStatus(goal, records);
  const subject = subjects.find((item) => item.id === goal.subjectId);
  const targetLabel =
    goal.subjectId === "" ? "すべての科目" : (subject?.name ?? "削除された科目");

  return (
    <li className={`goal-entry is-${status.state}`}>
      <div className="goal-head">
        <p className="goal-name">{goal.name}</p>
        <button type="button" className="delete-button" onClick={() => onDelete(goal.id)}>
          削除
        </button>
      </div>

      <p className="goal-meta">
        {goal.deadline} まで ／ {targetLabel} ／ 目標 {goal.targetHours}時間
      </p>

      {/* 勉強したぶんだけ左から伸びる。タイトル画面の達成度と同じ向きにそろえてある */}
      <div className="goal-track">
        <div
          className={`goal-fill is-${status.state}`}
          style={{ width: `${status.ratio * 100}%` }}
        />
      </div>

      <p className="goal-text">
        達成 <strong>{formatDuration(status.done)}</strong>
        <span className="goal-remaining">残り {formatDuration(status.remaining)}</span>
      </p>

      {status.state === "active" && (
        <div className="goal-status">
          <span className="goal-days">残り {status.daysLeft}日</span>
          <span className="goal-pace">
            1日あたり {formatDuration(status.needPerDay)} 必要
          </span>
        </div>
      )}

      {status.state === "done" && (
        <p className="goal-result is-win">達成！ 目標の時間に届いた</p>
      )}

      {status.state === "expired" && (
        <p className="goal-result is-lose">
          期限切れ… あと {formatDuration(status.remaining)} 足りなかった
        </p>
      )}
    </li>
  );
}

// 目標。期限までに決めた時間ぶん勉強すると達成になる。いくつでも同時に持てる
function GoalList({ goals, subjects, records, onAdd, onDelete }) {
  // すでに目標があるときはフォームをたたんでおく。状況を先に見せたいため
  const [isAdding, setIsAdding] = useState(false);

  const handleAdd = (config) => {
    onAdd(config);
    setIsAdding(false);
  };

  if (goals.length === 0) {
    return (
      <section className="card">
        <p className="card-title">
          <Icon name="target" />
          目標
        </p>
        <p className="goal-lead">
          期限と時間を決めると、決めた日からの勉強が積み上がっていく。
          期限や科目を分けて、いくつでも同時に持てる。
        </p>
        <GoalForm subjects={subjects} onAdd={handleAdd} />
      </section>
    );
  }

  // 期限が近い順に並べる
  const sorted = [...goals].sort((a, b) => (a.deadline < b.deadline ? -1 : 1));

  return (
    <section className="card">
      <div className="goal-card-head">
        <p className="card-title">
          <Icon name="target" />
          目標
        </p>
        <span className="goal-count">{goals.length}件</span>
      </div>

      <ul className="goal-list">
        {sorted.map((goal) => (
          <GoalEntry
            key={goal.id}
            goal={goal}
            subjects={subjects}
            records={records}
            onDelete={onDelete}
          />
        ))}
      </ul>

      {isAdding ? (
        <div className="goal-add">
          <GoalForm subjects={subjects} onAdd={handleAdd} />
          <button
            type="button"
            className="delete-button is-wide"
            onClick={() => setIsAdding(false)}
          >
            やめる
          </button>
        </div>
      ) : (
        <button
          type="button"
          className="delete-button is-wide"
          onClick={() => setIsAdding(true)}
        >
          ＋ 目標を追加
        </button>
      )}
    </section>
  );
}

export default GoalList;
