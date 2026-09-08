import Icon from "./Icon";
import ConfidenceBadge from "./ConfidenceBadge";
import StarRating from "./StarRating";
import {
  leaderSubject,
  gapOf,
  spread,
  recommendSubject,
  normalizeConfidence,
  isDisliked,
  isLeveled,
  isRaisingAll,
  averageConfidence,
  GOAL,
} from "../lib/confidence";
import { skillsOf, gapNotice, uncheckedOf } from "../lib/skills";

// 計測の画面に添える「追いつき」のカード。
// いちばん自信のある科目を先頭にして、他の科目がどれだけ後ろにいるかを見せ、
// 差が大きい科目から順に時間を回すよう勧める
function CatchUp({ subjects, skills = [], records, selectedId, running, onSelect }) {
  const leader = leaderSubject(subjects);
  const recommended = recommendSubject(subjects, records);
  const gapSpread = spread(subjects);

  // 横並び（底上げモード）。差を埋めるのではなく、共通のラインをみんなで目指す
  const leveled = isLeveled(subjects);
  const average = averageConfidence(subjects);
  // 平均 80% 以上なら、嫌い優先をやめて全体を上げる
  const raisingAll = isRaisingAll(subjects);

  // 自信が高い順に並べる（先頭が上）
  const ordered = [...subjects].sort(
    (a, b) => normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence),
  );

  const message = () => {
    if (subjects.length === 0) return "科目を足すと、ここで自信をくらべられるよ";
    if (subjects.length === 1) return "科目が1つだけだから、まだくらべる相手がいないね";
    if (leveled) {
      if (average >= GOAL) return `全科目 ${GOAL}%！もう言うことないよ。好きな科目を好きなだけやろう`;
      const lead = isDisliked(recommended) ? `嫌いな ${recommended.name}` : recommended.name;
      return `横並び！${GOAL}% を目指して、まずは ${lead} から！`;
    }
    const top = normalizeConfidence(leader.confidence);
    const gap = gapOf(recommended, subjects);
    if (!raisingAll && isDisliked(recommended)) {
      return `いま一番なのは ${leader.name} の ${top}%。嫌いな ${recommended.name} が ${gap}% 遅れてる。嫌いなものほど先にやっつけよう！`;
    }
    return `いま一番なのは ${leader.name} の ${top}%。${recommended.name} が ${gap}% 遅れてるから、まずここから追いかけよう！`;
  };

  return (
    <section className="card catch-up">
      <div className="summary-head">
        <p className="card-title">
          <Icon name="trend" />
          追いつき
        </p>
        {/* 横並びのときは本文で伝えるので、右上には差があるときだけ出す */}
        {subjects.length > 1 && !leveled && (
          <span className="milestone-total">最大の差 {gapSpread}%・目標 {GOAL}%</span>
        )}
      </div>

      <p className="catch-up-message">{message()}</p>

      {subjects.length > 0 && (
        <ul className="subject-bars">
          {ordered.map((subject) => {
            const value = normalizeConfidence(subject.confidence);
            // 差があるときは先頭までの残り。横並びのときは目標の線までの残り
            const gap = leveled ? Math.max(0, GOAL - value) : gapOf(subject, subjects);
            return (
              <li key={subject.id} className="subject-bar">
                <span className="subject-name">
                  <span className="dot" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                  {!leveled && subject.id === leader?.id && subjects.length > 1 && (
                    <span className="leader-tag">先頭</span>
                  )}
                  <StarRating value={subject.feeling} compact />
                </span>
                <span className="subject-time">
                  {gap > 0 ? `あと ${gap}%` : ""}
                  <ConfidenceBadge value={value} isBehind={gap > 0} />
                </span>

                {/* やることリストがあれば、何個できたかと、感覚とのずれを添える */}
                {skillsOf(subject.id, skills).length > 0 && (
                  <span className="skill-note">
                    やること {skillsOf(subject.id, skills).filter((k) => k.done).length} /{" "}
                    {skillsOf(subject.id, skills).length}
                    {gapNotice({ ...subject, confidence: subject.selfConfidence ?? subject.confidence }, skills) && (
                      <span className="skill-gap">
                        ・{gapNotice({ ...subject, confidence: subject.selfConfidence ?? subject.confidence }, skills)}
                      </span>
                    )}
                  </span>
                )}

                {/* 棒は 100% を全幅にする。
                    目標の線（点線）はいつも引き、差があるときは先頭の位置にも実線を引く */}
                <span className="bar-track catch-up-track">
                  <span
                    className="bar-fill"
                    style={{ width: `${value}%`, backgroundColor: subject.color }}
                  />
                  <span className="leader-line is-target" style={{ left: `${GOAL}%` }} />
                  {!leveled && leader && gap > 0 && (
                    <span
                      className="leader-line"
                      style={{ left: `${normalizeConfidence(leader.confidence)}%` }}
                    />
                  )}
                </span>
              </li>
            );
          })}
        </ul>
      )}

      {recommended && subjects.length > 1 && (leveled ? average < GOAL : gapSpread > 0) && (
        <div className="catch-up-recommend">
          <span className="catch-up-recommend-label">次はこれ</span>
          <span className="subject-name">
            <span className="dot" style={{ backgroundColor: recommended.color }} />
            {recommended.name}
          </span>
          <ConfidenceBadge value={recommended.confidence} isBehind />
          {/* 計測中は科目を変えられないので、そのときは押せなくする */}
          <button
            type="button"
            className="chip is-recommend"
            style={{ "--chip-color": recommended.color }}
            disabled={Boolean(running) || recommended.id === selectedId}
            onClick={() => onSelect(recommended.id)}
          >
            {recommended.id === selectedId ? "選んでるよ" : "これにする"}
          </button>
          {/* その科目で、まだできていないことを1つ出す。何から手を付けるかが決まる */}
          {uncheckedOf(recommended.id, skills)[0] && (
            <span className="next-skill">
              まずは「{uncheckedOf(recommended.id, skills)[0].text}」から
            </span>
          )}
        </div>
      )}
    </section>
  );
}

export default CatchUp;
