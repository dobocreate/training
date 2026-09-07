import Icon from "./Icon";
import { FEATURES } from "../lib/features";
import { goalProgress } from "../lib/goals";
import { formatClock } from "../lib/time";

// STARTのあとに出るメニュー。アイコンを押すと、その機能の画面に移る
function Menu({ running, elapsedSeconds, goals, records, onSelect }) {
  const goalNow = goalProgress(goals, records);
  const isPaused = Boolean(running) && running.since === null;

  return (
    <div className="menu-screen">
      {/* タイトルと項目をひとつの枠で囲み、メニュー全体のまとまりを見せる */}
      <div className="menu-panel">
        <header className="menu-header">
          <h1 className="app-title">STUDY LOG</h1>
          <p className="menu-lead">機能を選んでください</p>
        </header>

        <ul className="menu-grid">
          {FEATURES.map((feature) => (
            <li key={feature.key}>
              <button
                type="button"
                className="menu-tile"
                onClick={() => onSelect(feature.key)}
              >
                <Icon name={feature.icon} className="menu-icon" />
                <span className="menu-label">{feature.label}</span>

                {/* 計測したまま別の画面に移れるので、経過時間をそのまま出す */}
                {feature.key === "timer" && running && (
                  <span
                    className={
                      isPaused
                        ? "menu-badge is-clock"
                        : "menu-badge is-alert is-clock"
                    }
                  >
                    {formatClock(elapsedSeconds)}
                  </span>
                )}

                {/* 目標があれば、開かなくても達成度が分かるようにする */}
                {feature.key === "goal" && goalNow && (
                  <span
                    className={
                      goalNow.isAlert ? "menu-badge is-alert" : "menu-badge"
                    }
                  >
                    {goalNow.label}
                  </span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default Menu;
