import Icon from "./Icon";
import ConfidenceBadge from "./ConfidenceBadge";
import { formatDateLabel, formatTimeLabel, toDateKey } from "../lib/time";

// 自信を付け直した履歴。新しい順に並べ、前の値からどれだけ動いたかを添える。
// 科目が消えていても、その科目の履歴は「（削除された科目）」として残す
const LIMIT = 20;

function ConfidenceHistory({ subjects, log }) {
  // 古い順にたどって、科目ごとの「その時点の前の値」を出す
  const sorted = [...log].sort((a, b) => a.at.localeCompare(b.at));
  const previous = new Map();
  const rows = sorted.map((item) => {
    const before = previous.get(item.subjectId) ?? null;
    previous.set(item.subjectId, item.value);
    return { ...item, before: before };
  });

  const recent = rows.reverse().slice(0, LIMIT);

  const nameOf = (id) => subjects.find((subject) => subject.id === id);

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="list" />
        自信の推移
      </p>

      {recent.length === 0 ? (
        <p className="empty-message">
          まだ記録がないよ。計測を止めたときに自信を付けると、ここに残っていくよ
        </p>
      ) : (
        <ul className="history-list">
          {recent.map((item) => {
            const subject = nameOf(item.subjectId);
            const diff = item.before === null ? null : item.value - item.before;
            return (
              <li key={item.id} className="history-row">
                <span className="history-when">
                  {formatDateLabel(toDateKey(item.at))} {formatTimeLabel(item.at)}
                </span>
                <span className="subject-name">
                  <span className="dot" style={{ backgroundColor: subject?.color ?? "#cbd2dc" }} />
                  {subject?.name ?? "（削除された科目）"}
                </span>
                <span className="history-value">
                  <ConfidenceBadge value={item.value} />
                  {diff !== null && diff !== 0 && (
                    <span className={diff > 0 ? "history-diff is-up" : "history-diff is-down"}>
                      {diff > 0 ? `+${diff}` : diff}
                    </span>
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

export default ConfidenceHistory;
