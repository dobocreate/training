import Icon from "./Icon";
import ConfidenceBadge from "./ConfidenceBadge";
import { formatDuration } from "../lib/time";
import {
  leaderSubject,
  gapOf,
  spread,
  recommendSubject,
  allocateWeek,
  normalizeConfidence,
} from "../lib/confidence";

// 計測の画面に添える「追いつき」のカード。
// いちばん自信のある科目を先頭にして、他の科目がどれだけ後ろにいるかを見せ、
// 差が大きい科目から順に時間を回すよう勧める
function CatchUp({ subjects, records, selectedId, running, onSelect }) {
  const leader = leaderSubject(subjects);
  const recommended = recommendSubject(subjects, records);
  const plan = allocateWeek(subjects, records);
  const gapSpread = spread(subjects);

  // 自信が高い順に並べる（先頭が上）
  const ordered = [...subjects].sort(
    (a, b) => normalizeConfidence(b.confidence) - normalizeConfidence(a.confidence),
  );

  const message = () => {
    if (subjects.length === 0) return "科目を追加すると、ここで進み具合をくらべられます";
    if (subjects.length === 1) return "科目が1つなので、くらべる相手がまだいません";
    if (gapSpread === 0) {
      return "全科目の自信が同じです。計測を止めるたびに自信を聞き直すので、そこから差が見えてきます";
    }
    return `先頭は「${leader.name}」の ${normalizeConfidence(leader.confidence)}%。差がいちばん大きい「${recommended.name}」から追いつきましょう`;
  };

  return (
    <section className="card catch-up">
      <div className="summary-head">
        <p className="card-title">
          <Icon name="trend" />
          追いつき
        </p>
        {subjects.length > 1 && (
          <span className="milestone-total">いちばんの差 {gapSpread}pt</span>
        )}
      </div>

      <p className="catch-up-message">{message()}</p>

      {subjects.length > 0 && (
        <ul className="subject-bars">
          {ordered.map((subject) => {
            const value = normalizeConfidence(subject.confidence);
            const gap = gapOf(subject, subjects);
            return (
              <li key={subject.id} className="subject-bar">
                <span className="subject-name">
                  <span className="dot" style={{ backgroundColor: subject.color }} />
                  {subject.name}
                  {subject.id === leader?.id && subjects.length > 1 && (
                    <span className="leader-tag">先頭</span>
                  )}
                </span>
                <span className="subject-time">
                  {gap > 0 ? `あと ${gap}pt` : ""}
                  <ConfidenceBadge value={value} isBehind={gap > 0} />
                </span>

                {/* 棒は 100% を全幅にする。先頭の位置に細い線を引いて、そこまでの差を見せる */}
                <span className="bar-track catch-up-track">
                  <span
                    className="bar-fill"
                    style={{ width: `${value}%`, backgroundColor: subject.color }}
                  />
                  {leader && gap > 0 && (
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

      {/* 今週の配分。直近7日の勉強時間を、差の大きさに比例して配る */}
      {plan && (
        <>
          <p className="chart-title">今週の配分（{formatDuration(plan.budget)} を差に応じて）</p>
          <ul className="plan-list">
            {plan.items.map((item) => (
              <li key={item.subject.id} className="plan-item">
                <span className="subject-name">
                  <span className="dot" style={{ backgroundColor: item.subject.color }} />
                  {item.subject.name}
                </span>
                <span className="plan-time">
                  {item.seconds === 0 ? (
                    <span className="plan-rest">今週は他に回す</span>
                  ) : (
                    <>
                      {formatDuration(item.done)} / {formatDuration(item.seconds)}
                      {item.done >= item.seconds && <Icon name="check" className="card-icon plan-check" />}
                    </>
                  )}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}

      {recommended && subjects.length > 1 && gapSpread > 0 && (
        <div className="catch-up-recommend">
          <span className="catch-up-recommend-label">次におすすめ</span>
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
            {recommended.id === selectedId ? "選択中" : "この科目にする"}
          </button>
        </div>
      )}
    </section>
  );
}

export default CatchUp;
