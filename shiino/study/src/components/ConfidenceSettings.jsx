import Icon from "./Icon";
import { normalizeSelfWeight } from "../lib/skills";

// 自信の計算のしかた。自己申告とチェック率をどの割合で混ぜるかを決める
function ConfidenceSettings({ selfWeight, onChange }) {
  const self = normalizeSelfWeight(selfWeight);
  const rate = 100 - self;

  const hint = () => {
    if (self === 100) return "自分の感覚だけで決める";
    if (self === 0) return "やることリストだけで決める";
    if (self > rate) return "感覚を重めに見る";
    if (self < rate) return "やることリストを重めに見る";
    return "半々で混ぜる";
  };

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="pencil" />
        自信の計算
      </p>
      <p className="rating-help">
        自信 = 自分の感覚 × {self}% + やることリスト × {rate}%。{hint()}。
        リストが無い科目は感覚だけで決まるよ
      </p>
      <div className="weight-picker">
        <span className="weight-label">感覚</span>
        <input
          className="confidence-slider"
          type="range"
          min={0}
          max={100}
          step={10}
          value={self}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="自分の感覚の重み"
        />
        <span className="weight-label">リスト</span>
      </div>
    </section>
  );
}

export default ConfidenceSettings;
