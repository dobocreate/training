// 紙吹雪の1枚ごとの設定。位置・色・落ちる速さをずらして、
// バラバラに舞っているように見せる
const CONFETTI = [
  { left: "6%", color: "#22d3ee", delay: "0s", duration: "2.4s" },
  { left: "14%", color: "#ec4899", delay: "0.5s", duration: "3s" },
  { left: "23%", color: "#a3e635", delay: "1.1s", duration: "2.6s" },
  { left: "32%", color: "#facc15", delay: "0.2s", duration: "3.2s" },
  { left: "41%", color: "#7c3aed", delay: "1.6s", duration: "2.5s" },
  { left: "50%", color: "#22d3ee", delay: "0.8s", duration: "3.4s" },
  { left: "59%", color: "#ec4899", delay: "1.9s", duration: "2.7s" },
  { left: "68%", color: "#a3e635", delay: "0.4s", duration: "3.1s" },
  { left: "77%", color: "#facc15", delay: "1.3s", duration: "2.3s" },
  { left: "86%", color: "#7c3aed", delay: "0.9s", duration: "3.3s" },
  { left: "94%", color: "#22d3ee", delay: "1.7s", duration: "2.8s" },
];

// 全部完了したときだけ表示されるお祝い。
// データは持たず、表示するかどうかは親（App）が決める
function Celebration() {
  return (
    <div className="celebration" role="status">
      {/* 紙吹雪。飾りなのでaria-hiddenで読み上げ対象から外す */}
      <div className="confetti" aria-hidden="true">
        {CONFETTI.map((piece, index) => (
          <span
            key={index}
            className="confetti-piece"
            style={{
              left: piece.left,
              backgroundColor: piece.color,
              animationDelay: piece.delay,
              animationDuration: piece.duration,
            }}
          />
        ))}
      </div>

      {/* 万歳している人。線と丸だけで描いている */}
      <svg
        className="celebration-figure"
        viewBox="0 0 120 150"
        aria-hidden="true"
      >
        <defs>
          <linearGradient id="shirt-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {/* 足元の影。本体が跳ねるのに合わせて伸び縮みする */}
        <ellipse className="figure-shadow" cx="60" cy="141" rx="26" ry="5" />

        <g className="figure-body">
          {/* 腕（万歳） */}
          <path className="figure-limb figure-arm-left" d="M50 76 L28 48" />
          <path className="figure-limb figure-arm-right" d="M70 76 L92 48" />

          {/* 脚 */}
          <path className="figure-limb" d="M55 108 L47 136" />
          <path className="figure-limb" d="M65 108 L73 136" />

          {/* 胴体 */}
          <rect x="46" y="66" width="28" height="46" rx="14" fill="url(#shirt-gradient)" />

          {/* 頭・髪・顔 */}
          <circle className="figure-head" cx="60" cy="40" r="21" />
          <path className="figure-hair" d="M39 41 A21 21 0 0 1 81 41 Q60 29 39 41 Z" />
          <circle className="figure-eye" cx="52" cy="42" r="2.6" />
          <circle className="figure-eye" cx="68" cy="42" r="2.6" />
          <path className="figure-mouth" d="M52 49 Q60 58 68 49" />
        </g>
      </svg>

      <p className="celebration-title">全部おわった！</p>
      <p className="celebration-text">おつかれさま。ひと休みしよう。</p>
    </div>
  );
}

export default Celebration;
