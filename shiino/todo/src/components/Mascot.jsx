// 舞い落ちる星（100%達成のときだけ出す）の1粒ごとの設定
const SPARKS = [
  { left: "6%", color: "#22d3ee", delay: "0s", duration: "2.4s" },
  { left: "17%", color: "#86efac", delay: "0.5s", duration: "3s" },
  { left: "28%", color: "#facc15", delay: "1.1s", duration: "2.6s" },
  { left: "39%", color: "#ec4899", delay: "0.2s", duration: "3.2s" },
  { left: "50%", color: "#a5b4fc", delay: "1.6s", duration: "2.5s" },
  { left: "61%", color: "#22d3ee", delay: "0.8s", duration: "3.4s" },
  { left: "72%", color: "#86efac", delay: "1.9s", duration: "2.7s" },
  { left: "83%", color: "#facc15", delay: "0.4s", duration: "3.1s" },
  { left: "94%", color: "#ec4899", delay: "1.3s", duration: "2.3s" },
];

// 進み具合ごとのセリフと見た目。
// tone はパネルの色、face は表情、arms は腕のポーズ
const MOODS = {
  idle: {
    tone: "idle",
    face: "calm",
    arms: "wave",
    title: "ミッションが空だぞ",
    text: "まずは1つ登録してくれ。",
  },
  angry: {
    tone: "angry",
    face: "angry",
    arms: "hips",
    title: "まだ1つも進んでない！",
    text: "宇宙の時間は有限だ。",
  },
  start: {
    tone: "go",
    face: "calm",
    arms: "wave",
    title: "発進したな",
    text: "その調子で進もう。",
  },
  half: {
    tone: "go",
    face: "smile",
    arms: "wave",
    title: "折り返し地点だ",
    text: "あと少しで完了だ。",
  },
  last: {
    tone: "go",
    face: "smile",
    arms: "up",
    title: "ラスト1つだ",
    text: "ここまで来たら、やりきろう。",
  },
  done: {
    tone: "done",
    face: "happy",
    arms: "up",
    title: "全ミッション完了！",
    text: "おつかれさま。母星へ帰ろう。",
  },
};

// 件数から、どのセリフを出すかを決める。
// コンポーネントの外に出しておくと、描画のたびに作り直されない
function selectMood(completeCount, totalCount) {
  if (totalCount === 0) return MOODS.idle;
  if (completeCount === 0) return MOODS.angry;
  if (completeCount === totalCount) return MOODS.done;
  if (totalCount - completeCount === 1) return MOODS.last;
  if (completeCount / totalCount >= 0.5) return MOODS.half;
  return MOODS.start;
}

// 腕のポーズ。肩の位置は共通で、そこから伸ばす向きだけを変える
function Arms({ arms }) {
  if (arms === "up") {
    return (
      <>
        <path className="alien-limb alien-arm-left" d="M75 76 L53 50" />
        <path className="alien-limb alien-arm-right" d="M95 76 L117 50" />
      </>
    );
  }
  if (arms === "hips") {
    return (
      <>
        <path className="alien-limb" d="M75 72 L55 82 L71 94" />
        <path className="alien-limb" d="M95 72 L115 82 L99 94" />
      </>
    );
  }
  // wave: 右手だけ上げて振る
  return (
    <>
      <path className="alien-limb" d="M75 74 L57 86" />
      <path className="alien-limb alien-arm-right" d="M95 76 L114 52" />
    </>
  );
}

// 表情
function Face({ face }) {
  if (face === "angry") {
    return (
      <>
        <ellipse className="alien-eye" cx="74" cy="46" rx="6" ry="6.5" transform="rotate(-30 74 46)" />
        <ellipse className="alien-eye" cx="96" cy="46" rx="6" ry="6.5" transform="rotate(30 96 46)" />
        <path className="alien-brow" d="M64 31 L81 39" />
        <path className="alien-brow" d="M106 31 L89 39" />
        <path className="alien-mouth alien-mouth-angry" d="M77 60 L81 56 L85 60 L89 56 L93 60" />
      </>
    );
  }

  return (
    <>
      <ellipse className="alien-eye" cx="74" cy="44" rx="6.5" ry="9" transform="rotate(-18 74 44)" />
      <ellipse className="alien-eye" cx="96" cy="44" rx="6.5" ry="9" transform="rotate(18 96 44)" />
      <circle className="alien-glint" cx="72" cy="39" r="1.9" />
      <circle className="alien-glint" cx="94" cy="39" r="1.9" />

      {face === "happy" && <path className="alien-mouth" d="M78 58 Q85 64 92 58" />}
      {face === "smile" && <path className="alien-mouth" d="M79 59 Q85 62 91 59" />}
      {face === "calm" && <path className="alien-mouth" d="M80 59 L90 59" />}
    </>
  );
}

// UFOに乗った宇宙人。件数を受け取って、セリフとポーズを切り替える
function Mascot({ completeCount, totalCount }) {
  const mood = selectMood(completeCount, totalCount);

  return (
    <div className={`mascot-card mascot-${mood.tone}`} role="status">
      {/* 全ミッション完了のときだけ星が舞う */}
      {mood.tone === "done" && (
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
      )}

      <svg className="mascot-figure" viewBox="0 0 170 155" aria-hidden="true">
        <defs>
          <linearGradient id="alien-skin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#bbf7d0" />
            <stop offset="100%" stopColor="#4ade80" />
          </linearGradient>
          <linearGradient id="suit-done" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#7c3aed" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="suit-angry" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="100%" stopColor="#f97316" />
          </linearGradient>
          <linearGradient id="suit-go" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
          <linearGradient id="ufo-hull" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#e2e8f0" />
            <stop offset="55%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>
          <linearGradient id="ufo-beam" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#67e8f9" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#67e8f9" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 地面に落ちる影 */}
        <ellipse className="mascot-shadow" cx="85" cy="148" rx="40" ry="5" />

        {/* UFOごとふわふわ浮かせる */}
        <g className="ufo">
          {/* 下に伸びる光。UFOの手前に描くと濁るので先に描く */}
          <path className="ufo-beam" d="M62 112 L36 152 L134 152 L108 112 Z" />

          {/* 宇宙人。下半身はこのあとUFOの円盤で隠れる */}
          <g className="alien">
            <path className="alien-antenna" d="M75 26 Q69 13 63 9" />
            <path className="alien-antenna" d="M95 26 Q101 13 107 9" />
            <circle className="alien-antenna-tip" cx="63" cy="9" r="3.6" />
            <circle className="alien-antenna-tip" cx="107" cy="9" r="3.6" />

            <Arms arms={mood.arms} />

            <path className="alien-limb alien-neck" d="M85 62 L85 74" />
            <rect className="alien-suit" x="71" y="70" width="28" height="34" rx="14" />

            <ellipse className="alien-head" cx="85" cy="44" rx="20" ry="22" />
            <Face face={mood.face} />

            {/* 怒っているときだけ出す怒りマーク */}
            {mood.face === "angry" && (
              <g className="anger-mark">
                <path d="M113 5 L119 10 L125 5 M113 25 L119 20 L125 25 M109 10 L114 15 L109 20 M129 10 L124 15 L129 20" />
              </g>
            )}
          </g>

          {/* UFO本体 */}
          <ellipse className="ufo-under" cx="85" cy="108" rx="46" ry="15" />
          <ellipse className="ufo-disc" cx="85" cy="100" rx="62" ry="16" />
          <ellipse className="ufo-gloss" cx="85" cy="95" rx="38" ry="7" />

          {/* 底のライト。1つずつ時間をずらして光らせる */}
          <circle className="ufo-light" cx="58" cy="115" r="3.4" style={{ animationDelay: "0s" }} />
          <circle className="ufo-light" cx="71" cy="118" r="3.4" style={{ animationDelay: "0.16s" }} />
          <circle className="ufo-light" cx="85" cy="119" r="3.4" style={{ animationDelay: "0.32s" }} />
          <circle className="ufo-light" cx="99" cy="118" r="3.4" style={{ animationDelay: "0.48s" }} />
          <circle className="ufo-light" cx="112" cy="115" r="3.4" style={{ animationDelay: "0.64s" }} />
        </g>
      </svg>

      <p className="mascot-title">{mood.title}</p>
      <p className="mascot-text">{mood.text}</p>
    </div>
  );
}

export default Mascot;
