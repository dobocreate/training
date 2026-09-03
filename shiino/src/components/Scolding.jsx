// 進捗が0%のときに出てくる、怒っている人。
// データは持たず、表示するかどうかは親（App）が決める
function Scolding() {
  return (
    <div className="scolding" role="status">
      <svg className="scolding-figure" viewBox="0 0 120 150" aria-hidden="true">
        <defs>
          <linearGradient id="angry-shirt-gradient" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        <ellipse className="figure-shadow figure-shadow-still" cx="60" cy="141" rx="26" ry="5" />

        {/* 体ごと小刻みに震えさせて、怒っている感じを出す */}
        <g className="figure-body figure-body-angry">
          {/* 腕（腰に手を当てたポーズ） */}
          <path className="figure-limb" d="M50 76 L32 88 L48 100" />
          <path className="figure-limb" d="M70 76 L88 88 L72 100" />

          {/* 脚 */}
          <path className="figure-limb" d="M55 108 L47 136" />
          <path className="figure-limb" d="M65 108 L73 136" />

          {/* 胴体 */}
          <rect x="46" y="66" width="28" height="46" rx="14" fill="url(#angry-shirt-gradient)" />

          {/* 頭・髪 */}
          <circle className="figure-head" cx="60" cy="40" r="21" />
          <path className="figure-hair" d="M39.4 36 A21 21 0 0 1 80.6 36 Q60 24 39.4 36 Z" />

          {/* つり上がった眉 */}
          <path className="figure-brow" d="M46 38 L56 42" />
          <path className="figure-brow" d="M74 38 L64 42" />

          {/* 目と、叫んでいる口 */}
          <circle className="figure-eye" cx="52" cy="46" r="2.6" />
          <circle className="figure-eye" cx="68" cy="46" r="2.6" />
          <ellipse className="figure-shout" cx="60" cy="54" rx="6" ry="4.2" />

          {/* 怒りマーク。頭の横でチカチカさせる */}
          <g className="anger-mark">
            <path d="M86 7 L92 12 L98 7 M86 27 L92 22 L98 27 M82 12 L87 17 L82 22 M102 12 L97 17 L102 22" />
          </g>
        </g>
      </svg>

      <p className="scolding-title">まだ1つも終わってない！</p>
      <p className="scolding-text">さあ、1つでいいから片づけよう。</p>
    </div>
  );
}

export default Scolding;
