// 進捗が0%のときに出てくる、怒っている宇宙人。
// データは持たず、表示するかどうかは親（App）が決める
function Scolding() {
  return (
    <div className="scolding" role="status">
      <svg className="scolding-figure" viewBox="0 0 120 150" aria-hidden="true">
        <defs>
          <linearGradient id="angry-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a7f3a0" />
            <stop offset="100%" stopColor="#22c55e" />
          </linearGradient>
          <linearGradient id="angry-suit" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
        </defs>

        <ellipse className="figure-shadow figure-shadow-still" cx="60" cy="141" rx="26" ry="5" />

        {/* 体ごと小刻みに震えさせて、怒っている感じを出す */}
        <g className="figure-body figure-body-angry">
          {/* 触角。怒っているので先が赤く光る */}
          <path className="alien-antenna" d="M50 22 Q44 10 38 6" />
          <path className="alien-antenna" d="M70 22 Q76 10 82 6" />
          <circle className="alien-antenna-tip alien-antenna-tip-angry" cx="38" cy="6" r="3.6" />
          <circle className="alien-antenna-tip alien-antenna-tip-angry" cx="82" cy="6" r="3.6" />

          {/* 腕（腰に手を当てたポーズ） */}
          <path className="figure-limb" d="M50 78 L32 90 L48 102" />
          <path className="figure-limb" d="M70 78 L88 90 L72 102" />

          {/* 脚 */}
          <path className="figure-limb" d="M55 110 L47 136" />
          <path className="figure-limb" d="M65 110 L73 136" />

          {/* 首と胴体 */}
          <path className="figure-limb alien-neck" d="M60 60 L60 72" />
          <rect x="46" y="68" width="28" height="46" rx="14" fill="url(#angry-suit)" />

          {/* 頭 */}
          <ellipse className="alien-head alien-head-angry" cx="60" cy="40" rx="23" ry="25" />

          {/* 吊り上がった目 */}
          <ellipse className="alien-eye" cx="49" cy="42" rx="6.5" ry="7" transform="rotate(-30 49 42)" />
          <ellipse className="alien-eye" cx="71" cy="42" rx="6.5" ry="7" transform="rotate(30 71 42)" />

          {/* 怒り眉 */}
          <path className="alien-brow" d="M40 27 L56 35" />
          <path className="alien-brow" d="M80 27 L64 35" />

          {/* ギザギザの口 */}
          <path className="alien-mouth alien-mouth-angry" d="M52 57 L56 53 L60 57 L64 53 L68 57" />

          {/* 怒りマーク。頭の横でチカチカさせる */}
          <g className="anger-mark">
            <path d="M86 7 L92 12 L98 7 M86 27 L92 22 L98 27 M82 12 L87 17 L82 22 M102 12 L97 17 L102 22" />
          </g>
        </g>
      </svg>

      <p className="scolding-title">まだ1つも進んでない！</p>
      <p className="scolding-text">宇宙の時間は有限だ。</p>
    </div>
  );
}

export default Scolding;
