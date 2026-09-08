import Icon from "./Icon";
import ConfidenceInput from "./ConfidenceInput";
import StarRating from "./StarRating";

// 自信の画面で、科目ごとの自信（自分の感覚）と好き嫌いを直す。
// 計測の停止時に聞くのが基本で、ここは手直し用。直すと履歴にも残る
function ConfidenceEditor({ subjects, onUpdate, onFeeling }) {
  return (
    <section className="card">
      <p className="card-title">
        <Icon name="pencil" />
        自信を直す
      </p>

      {subjects.length === 0 ? (
        <p className="empty-message">科目がありません</p>
      ) : (
        <ul className="subject-list">
          {subjects.map((subject) => (
            <li key={subject.id} className="subject-item">
              <span className="dot" style={{ backgroundColor: subject.color }} />
              <span className="subject-item-name">{subject.name}</span>
              <StarRating
                value={subject.feeling}
                compact
                onChange={(value) => onFeeling(subject.id, value)}
              />
              <label className="subject-confidence">
                <ConfidenceInput
                  value={subject.confidence}
                  onChange={(next) => onUpdate(subject.id, next)}
                  commitOnBlur
                  aria-label={`${subject.name} の自信`}
                />
                <span className="unit">%</span>
              </label>
            </li>
          ))}
        </ul>
      )}
      <p className="rating-help">数字は自分の感覚。やることリストがある科目は、これとチェック率を混ぜた値がグラフに出るよ</p>
    </section>
  );
}

export default ConfidenceEditor;
