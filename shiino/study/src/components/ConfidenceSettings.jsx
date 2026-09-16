import Icon from "./Icon";
import { normalizeSelfWeight } from "../lib/skills";

// 進捗度の計算のしかた。自信（自己申告）とチェック率をどの割合で混ぜるかを決める
function ConfidenceSettings({ selfWeight, onChange }) {
  const self = normalizeSelfWeight(selfWeight);
  const rate = 100 - self;

  const hint = () => {
    if (self === 100) return "自信だけで決める";
    if (self === 0) return "やることリストだけで決める";
    if (self > rate) return "自信を重めに見る";
    if (self < rate) return "やることリストを重めに見る";
    return "半々で混ぜる";
  };

  return (
    <section className="card">
      <p className="card-title">
        <Icon name="pencil" />
        進捗度の計算
      </p>
      <p className="rating-help">
        進捗度 = 自信 × {self}% + やることリスト × {rate}%。{hint()}。
        リストが無い科目は自信だけで決まるよ
      </p>
      <div className="weight-picker">
        <span className="weight-label">自信</span>
        <input
          className="confidence-slider"
          type="range"
          min={0}
          max={100}
          step={10}
          value={self}
          onChange={(event) => onChange(Number(event.target.value))}
          aria-label="自信の重み"
        />
        <span className="weight-label">リスト</span>
      </div>
    </section>
  );
}

export default ConfidenceSettings;
