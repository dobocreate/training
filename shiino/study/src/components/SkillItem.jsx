import { isStale } from "../lib/skills";

// チェックリストの1行。チェックと削除だけ
function SkillItem({ skill, onToggle, onDelete }) {
  const stale = isStale(skill);
  return (
    <li
      className={stale ? "skill-item is-stale" : "skill-item"}
      title={stale ? "チェックしてから30日以上。まだできるか見直してみて" : undefined}
    >
      <label className="skill-label">
        <input type="checkbox" checked={skill.done} onChange={() => onToggle(skill.id)} />
        <span className={skill.done ? "skill-text is-done" : "skill-text"}>{skill.text}</span>
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
  );
}

export default SkillItem;
