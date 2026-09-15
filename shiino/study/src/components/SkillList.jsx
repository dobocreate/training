import { useState } from "react";
import Icon from "./Icon";
import { skillsOf, checkRate } from "../lib/skills";
import SkillItem from "./SkillItem";

// 科目ごとの「やること」チェックリスト。
// 科目ごとに1枚のカードにして、これからやるものを上、できたものを下にまとめる。
// 項目を足して、できるようになったらチェックする。チェックした割合が進捗度の根拠になる
function SkillList({ subjects, skills, onAdd, onToggle, onDelete }) {
  // 科目ごとの入力欄の文字。科目idをキーにして持つ
  const [drafts, setDrafts] = useState({});

  const submit = (event, subjectId) => {
    event.preventDefault();
    const text = (drafts[subjectId] ?? "").trim();
    if (text === "") return;
    onAdd(subjectId, text);
    setDrafts((prev) => ({ ...prev, [subjectId]: "" }));
  };

  if (subjects.length === 0) {
    return (
      <section className="card">
        <p className="card-title">
          <Icon name="check" />
          やることチェックリスト
        </p>
        <p className="empty-message">科目がありません</p>
      </section>
    );
  }

  return subjects.map((subject) => {
    const list = skillsOf(subject.id, skills);
    const todo = list.filter((skill) => !skill.done);
    const done = list.filter((skill) => skill.done);
    const rate = checkRate(subject.id, skills);

    return (
      <section key={subject.id} className="card skill-card">
        <p className="card-title skill-card-head">
          <span className="subject-name">
            <span className="dot" style={{ backgroundColor: subject.color }} />
            {subject.name}
          </span>
          <span className="skill-count">
            {list.length === 0 ? "まだ項目なし" : `${done.length} / ${list.length} できた`}
          </span>
        </p>

        {/* どれだけできたかを棒で見せる。項目が無いうちは出さない */}
        {list.length > 0 && (
          <span className="bar-track skill-track">
            <span
              className="bar-fill"
              style={{ width: `${rate}%`, backgroundColor: subject.color }}
            />
          </span>
        )}

        {todo.length > 0 && (
          <div className="skill-section">
            <p className="skill-section-title">これから</p>
            <ul className="skill-list">
              {todo.map((skill) => (
                <SkillItem key={skill.id} skill={skill} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          </div>
        )}

        {done.length > 0 && (
          <div className="skill-section">
            <p className="skill-section-title">できた</p>
            <ul className="skill-list">
              {done.map((skill) => (
                <SkillItem key={skill.id} skill={skill} onToggle={onToggle} onDelete={onDelete} />
              ))}
            </ul>
          </div>
        )}

        <form className="skill-form" onSubmit={(event) => submit(event, subject.id)}>
          <input
            className="field"
            type="text"
            value={drafts[subject.id] ?? ""}
            placeholder="やることを追加"
            autoComplete="off"
            onChange={(event) =>
              setDrafts((prev) => ({ ...prev, [subject.id]: event.target.value }))
            }
          />
          <button type="submit" className="add-button">
            追加
          </button>
        </form>
      </section>
    );
  });
}

export default SkillList;
