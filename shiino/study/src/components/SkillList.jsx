import { useState } from "react";
import Icon from "./Icon";
import { skillsOf, checkRate, isStale } from "../lib/skills";

// 科目ごとの「やること」チェックリスト。
// 項目を足して、できるようになったらチェックする。チェックした割合が自信の根拠になる
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

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="check" />
        やることチェックリスト
      </p>
      <p className="rating-help">
        「二次方程式を解けるようにする」のように、1つの単元・1つの技能を1項目にするとぶれにくいよ。
        できたらチェック。チェックした割合が自信に混ざる（5項目以上で本来の重みになる）
      </p>

      {subjects.length === 0 ? (
        <p className="empty-message">科目がありません</p>
      ) : (
        subjects.map((subject) => {
          const list = skillsOf(subject.id, skills);
          const rate = checkRate(subject.id, skills);
          const done = list.filter((skill) => skill.done).length;
          return (
            <div key={subject.id} className="skill-group">
              <p className="skill-head">
                <span className="subject-name">
                  <span className="dot" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                </span>
                <span className="skill-count">
                  {list.length === 0 ? "項目なし" : `${done} / ${list.length}（${rate}%）`}
                </span>
              </p>

              {list.length > 0 && (
                <ul className="skill-list">
                  {list.map((skill) => (
                    <li
                      key={skill.id}
                      className={isStale(skill) ? "skill-item is-stale" : "skill-item"}
                      title={isStale(skill) ? "チェックしてから30日以上。まだできるか見直してみて" : undefined}
                    >
                      <label className="skill-label">
                        <input
                          type="checkbox"
                          checked={skill.done}
                          onChange={() => onToggle(skill.id)}
                        />
                        <span className={skill.done ? "skill-text is-done" : "skill-text"}>
                          {skill.text}
                        </span>
                      </label>
                      <button
                        type="button"
                        className="delete-button"
                        onClick={() => onDelete(skill.id)}
                        aria-label={`${skill.text} を削除`}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              )}

              <form className="skill-form" onSubmit={(event) => submit(event, subject.id)}>
                <input
                  className="field"
                  type="text"
                  value={drafts[subject.id] ?? ""}
                  placeholder="やること"
                  autoComplete="off"
                  onChange={(event) =>
                    setDrafts((prev) => ({ ...prev, [subject.id]: event.target.value }))
                  }
                />
                <button type="submit" className="add-button">
                  追加
                </button>
              </form>
            </div>
          );
        })
      )}
    </section>
  );
}

export default SkillList;
