import { PLANETS, journeyProgress } from "../lib/journey";
import { formatDuration } from "../lib/time";

// 累計の勉強時間を飛行距離に見立てた宇宙旅。
// 記録から毎回計算するので、保存している値はない
function Journey({ records }) {
  const totalSeconds = records.reduce((sum, record) => sum + record.seconds, 0);
  const journey = journeyProgress(totalSeconds);

  return (
    <section className="card">
      <div className="journey-head">
        <p className="card-title">宇宙旅</p>
        <span className="journey-total">
          飛行距離 {formatDuration(totalSeconds)}
        </span>
      </div>

      <p className="journey-current">{journey.current.name}</p>
      <p className="journey-next">
        {journey.isComplete
          ? "太陽系を抜けた。ここから先は未知の宙域"
          : `次は ${journey.next.name} まで あと ${formatDuration(journey.remainingSeconds)}`}
      </p>

      {/* 航路。天体は等間隔に置き、宇宙船だけ進み具合に応じて動かす */}
      <div className="route">
        <div className="route-line" />
        <div className="route-done" style={{ width: `${journey.position * 100}%` }} />

        {PLANETS.map((planet, index) => (
          <span
            key={planet.name}
            className={index <= journey.index ? "planet is-reached" : "planet"}
            style={{
              left: `${(index / (PLANETS.length - 1)) * 100}%`,
              width: `${planet.size}px`,
              height: `${planet.size}px`,
              backgroundColor: planet.color,
            }}
            title={`${planet.name} / ${planet.hours}時間`}
          />
        ))}

        <span className="ship" style={{ left: `${journey.position * 100}%` }} />
      </div>

      {/* 到達済みの天体が分かるように、一覧も出す */}
      <ul className="planet-list">
        {PLANETS.map((planet, index) => (
          <li
            key={planet.name}
            className={index <= journey.index ? "planet-chip is-reached" : "planet-chip"}
            style={{ "--planet-color": planet.color }}
          >
            {planet.name}
            <span className="planet-hours">{planet.hours}h</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default Journey;
