// 画面の一番後ろに敷く宇宙。飾りだけなのでaria-hiddenで読み上げ対象から外す。
// 星は画像を使わず、CSSのradial-gradientを並べて描いている
function SpaceBackground() {
  return (
    <div className="space" aria-hidden="true">
      <div className="nebula" />
      <div className="stars stars-far" />
      <div className="stars stars-near" />
      <div className="planet" />
      <div className="shooting-star" />
    </div>
  );
}

export default SpaceBackground;
