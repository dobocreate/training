import Icon from "./Icon";
import { FEATURES } from "../lib/features";
import { bossProgress } from "../lib/boss";

// STARTのあとに出るメニュー。アイコンを押すと、その機能の画面に移る
function Menu({ running, boss, records, onSelect }) {
  const bossNow = bossProgress(boss, records);

  return (
    <div className="menu-screen">
      <header className="menu-header">
        <h1 className="app-title">STUDY LOG</h1>
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
              <span className="menu-description">{feature.description}</span>

              {/* 計測したまま別の画面に移れるので、動いていることが分かるようにする */}
              {feature.key === "timer" && running && (
                <span className="menu-badge is-alert">計測中</span>
              )}

              {/* 挑戦中なら、開かなくても達成度が分かるようにする */}
              {feature.key === "boss" && bossNow && (
                <span className={bossNow.isAlert ? "menu-badge is-alert" : "menu-badge"}>
                  {bossNow.label}
                </span>
              )}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Menu;
