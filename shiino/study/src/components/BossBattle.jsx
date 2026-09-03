import { useState } from "react";
import { bossStatus } from "../lib/boss";
import { formatDuration, toDateKey } from "../lib/time";

// ボスがいないときに出す設定フォーム
function BossForm({ subjects, onStart }) {
  const [name, setName] = useState("");
  const [deadline, setDeadline] = useState(() => toDateKey(new Date()));
  const [hours, setHours] = useState("");
  const [subjectId, setSubjectId] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (event) => {
    event.preventDefault();

    const targetHours = Number(hours);
    if (!Number.isFinite(targetHours) || targetHours <= 0) {
      setError("目標時間を入力してください");
      return;
    }
    if (deadline < toDateKey(new Date())) {
      setError("期限は今日以降にしてください");
      return;
    }

    onStart({
      name: name.trim() === "" ? "ボス" : name.trim(),
      deadline: deadline,
      targetHours: targetHours,
      subjectId: subjectId,
    });
  };

  return (
    <form className="boss-form" onSubmit={handleSubmit}>
      <input
        className="field"
        type="text"
        value={name}
        placeholder="ボスの名前（例：期末テスト）"
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

      <div className="boss-row">
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
          挑戦
        </button>
      </div>

      <p className="error-message">{error}</p>
    </form>
  );
}

// ボス戦。期限までに目標時間ぶん勉強すると撃破できる
function BossBattle({ boss, subjects, records, onStart, onClear }) {
  const status = bossStatus(boss, records);

  if (!boss || !status) {
    return (
      <section className="card">
        <p className="card-title">ボス戦</p>
        <p className="boss-lead">
          試験日と目標時間を決めると、挑戦した日から勉強したぶんだけHPを削れる。
        </p>
        <BossForm subjects={subjects} onStart={onStart} />
      </section>
    );
  }

  const subject = subjects.find((item) => item.id === boss.subjectId);
  const targetLabel = boss.subjectId === "" ? "すべての科目" : (subject?.name ?? "削除された科目");

  return (
    <section className={`card boss-card is-${status.state}`}>
      <div className="boss-head">
        <p className="card-title">ボス戦</p>
        <button type="button" className="delete-button" onClick={onClear}>
          解除
        </button>
      </div>

      <p className="boss-name">{boss.name}</p>
      <p className="boss-meta">
        {boss.deadline} まで ／ {targetLabel} ／ 目標 {boss.targetHours}時間
      </p>

      {/* HPバー。削ったぶんだけ右から減っていく */}
      <div className="hp-track">
        <div className="hp-fill" style={{ width: `${(1 - status.ratio) * 100}%` }} />
      </div>

      <p className="hp-text">
        残りHP <strong>{formatDuration(status.remaining)}</strong>
        <span className="hp-damage">
          与ダメージ {formatDuration(status.damage)}
        </span>
      </p>

      {status.state === "fighting" && (
        <div className="boss-status">
          <span className="boss-days">残り {status.daysLeft}日</span>
          <span className="boss-pace">
            1日あたり {formatDuration(status.needPerDay)} 必要
          </span>
        </div>
      )}

      {status.state === "defeated" && (
        <p className="boss-result is-win">撃破！ 目標を達成した</p>
      )}

      {status.state === "expired" && (
        <p className="boss-result is-lose">
          期限切れ… あと {formatDuration(status.remaining)} 足りなかった
        </p>
      )}
    </section>
  );
}

export default BossBattle;
