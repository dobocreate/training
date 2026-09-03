// 星（紙吹雪のかわり）の1粒ごとの設定。
// 位置・色・落ちる速さをずらして、バラバラに舞っているように見せる
const SPARKS = [
  { left: "6%", color: "#22d3ee", delay: "0s", duration: "2.4s" },
  { left: "14%", color: "#86efac", delay: "0.5s", duration: "3s" },
  { left: "23%", color: "#facc15", delay: "1.1s", duration: "2.6s" },
  { left: "32%", color: "#ec4899", delay: "0.2s", duration: "3.2s" },
  { left: "41%", color: "#a5b4fc", delay: "1.6s", duration: "2.5s" },
  { left: "50%", color: "#22d3ee", delay: "0.8s", duration: "3.4s" },
  { left: "59%", color: "#86efac", delay: "1.9s", duration: "2.7s" },
  { left: "68%", color: "#facc15", delay: "0.4s", duration: "3.1s" },
  { left: "77%", color: "#ec4899", delay: "1.3s", duration: "2.3s" },
  { left: "86%", color: "#a5b4fc", delay: "0.9s", duration: "3.3s" },
  { left: "94%", color: "#22d3ee", delay: "1.7s", duration: "2.8s" },
];

// 全ミッション完了したときだけ表示されるお祝い。
// データは持たず、表示するかどうかは親（App）が決める
function Celebration() {
  return (
    <div className="celebration" role="status">
      {/* 舞い落ちる星。飾りなのでaria-hiddenで読み上げ対象から外す */}
      <div className="sparks" aria-hidden="true">
        {SPARKS.map((spark, index) => (
          <span
            key={index}
            className="spark"
            style={{
              left: spark.left,
              backgroundColor: spark.color,
              boxShadow: `0 0 8px ${spark.color}`,
              animationDelay: spark.delay,
              animationDuration: spark.duration,
            }}
          />
        ))}
      </div>

      {/* 万歳している宇宙人 */}
      <svg
        className="celebration-figure"
        viewBox="0 0 120 150"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="happy-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="happy-suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* 足元の影。本体が跳ねるのに合わせて伸び縮みする */}
        <ellipse className="figure-shadow" cx="60" cy="141" rx="26" ry="5" />

        <g className="figure-body">
          {/* 触角。先が光る */}
          <path className="alien-antenna" d="M50 22 Q44 10 38 6" />
          <path className="alien-antenna" d="M70 22 Q76 10 82 6" />
          <circle className="alien-antenna-tip" cx="38" cy="6" r="3.6" />
          <circle className="alien-antenna-tip" cx="82" cy="6" r="3.6" />

          {/* 腕（万歳） */}
          <path className="figure-limb alien-arm-left" d="M50 78 L28 52" />
          <path className="figure-limb alien-arm-right" d="M70 78 L92 52" />

          {/* 脚 */}
          <path className="figure-limb" d="M55 110 L47 136" />
          <path className="figure-limb" d="M65 110 L73 136" />

          {/* 首と胴体 */}
          <path className="figure-limb alien-neck" d="M60 60 L60 72" />
          <rect x="46" y="68" width="28" height="46" rx="14" fill="url(#happy-suit)" />

          {/* 頭 */}
          <ellipse className="alien-head alien-head-happy" cx="60" cy="40" rx="23" ry="25" />

          {/* 大きな目と、その中の光 */}
          <ellipse className="alien-eye" cx="49" cy="40" rx="6.5" ry="9.5" transform="rotate(-18 49 40)" />
          <ellipse className="alien-eye" cx="71" cy="40" rx="6.5" ry="9.5" transform="rotate(18 71 40)" />
          <circle className="alien-glint" cx="47" cy="35" r="1.9" />
          <circle className="alien-glint" cx="69" cy="35" r="1.9" />

          {/* にっこりした口 */}
          <path className="alien-mouth" d="M53 55 Q60 61 67 55" />
        </g>
      </svg>

      <p className="celebration-title">全ミッション完了！</p>
      <p className="celebration-text">おつかれさま。母星へ帰ろう。</p>
    </div>
  );
}

export default Celebration;
