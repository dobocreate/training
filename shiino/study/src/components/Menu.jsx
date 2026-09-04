import { useEffect } from "react";
import Icon from "./Icon";
import { FEATURES } from "../lib/features";
import { bossProgress } from "../lib/boss";
import { formatClock } from "../lib/time";

// STARTのあとに出るメニュー。アイコンを押すと、その機能の画面に移る
function Menu({ running, elapsedSeconds, bosses, records, onSelect }) {
  const bossNow = bossProgress(bosses, records);
  const isPaused = Boolean(running) && running.since === null;

  // タイトルがEnter、機能の画面がEscなので、ここも数字キーで選べるようにする
  useEffect(() => {
    const handleKeyDown = (event) => {
      // 修飾キー付きはブラウザ側の操作なので触らない
      if (event.altKey || event.ctrlKey || event.metaKey) return;

      const index = Number(event.key) - 1;
      if (!Number.isInteger(index) || index < 0 || index >= FEATURES.length)
        return;

      event.preventDefault();
      onSelect(FEATURES[index].key);
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect]);

  return (
    <div className="menu-screen">
      <header className="menu-header">
        <h1 className="app-title">STUDY LOG</h1>
      </header>

      <ul className="menu-grid">
        {FEATURES.map((feature, index) => (
          <li key={feature.key}>
            <button
              type="button"
              className="menu-tile"
              onClick={() => onSelect(feature.key)}
            >
              <span className="menu-key">{index + 1}</span>
              <Icon name={feature.icon} className="menu-icon" />
              <span className="menu-label">{feature.label}</span>
              <span className="menu-description">{feature.description}</span>

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

              {/* 挑戦中なら、開かなくても達成度が分かるようにする */}
              {feature.key === "boss" && bossNow && (
                <span
                  className={
                    bossNow.isAlert ? "menu-badge is-alert" : "menu-badge"
                  }
                >
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
