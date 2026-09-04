// 見出しの横に置く小さなアイコン。
// 絵文字は環境によって表示が崩れるので、線画をSVGで描いている。
// 色は currentColor なので、見出しの文字色に自動でそろう。
const SHAPES = {
  // ストップウォッチ
  timer: (
    <>
      <circle cx="8" cy="9.2" r="5.2" />
      <path d="M8 9.2 V6.4 M6.4 2.2 H9.6 M8 2.2 V4" />
    </>
  ),
  // 的（目標）
  target: (
    <>
      <circle cx="8" cy="8" r="6" />
      <circle cx="8" cy="8" r="2.4" />
      <path d="M8 0.8 V3 M8 13 V15.2 M0.8 8 H3 M13 8 H15.2" />
    </>
  ),
  // 旗（マイルストーン）
  flag: (
    <>
      <path d="M4 1.8 V14.2" />
      <path d="M4 2.8 H12.8 L10.7 5.9 L12.8 9 H4 Z" />
    </>
  ),
  // 折れ線（ペース）
  trend: (
    <>
      <path d="M2 11.6 L6 7.4 L9 10 L14 4.6" />
      <path d="M10.6 4.6 H14 V8" />
    </>
  ),
  // 棒グラフ
  chart: (
    <>
      <path d="M2 14 H14" />
      <path d="M4 14 V8.5 M8 14 V4 M12 14 V10.5" />
    </>
  ),
  // 一覧
  list: (
    <>
      <circle cx="3.4" cy="4.4" r="1" />
      <circle cx="3.4" cy="8" r="1" />
      <circle cx="3.4" cy="11.6" r="1" />
      <path d="M6.6 4.4 H13.6 M6.6 8 H13.6 M6.6 11.6 H13.6" />
    </>
  ),
  // 本（科目）
  book: (
    <>
      <path d="M4 2.4 H13 V13.6 H4 C3.3 13.6 2.8 13.1 2.8 12.4 V3.6 C2.8 2.9 3.3 2.4 4 2.4 Z" />
      <path d="M6 2.4 V13.6" />
    </>
  ),
  // 鉛筆（手入力）
  pencil: (
    <>
      <path d="M11.4 2.2 L13.8 4.6 L5.4 13 L2.4 13.8 L3.2 10.8 Z" />
      <path d="M9.8 3.8 L12.2 6.2" />
    </>
  ),
};

// 既定は見出し用の小さいサイズ。メニューでは className を渡して大きく描く
function Icon({ name, className = "card-icon" }) {
  return (
    <svg className={className} viewBox="0 0 16 16" aria-hidden="true">
      {SHAPES[name]}
    </svg>
  );
}

export default Icon;
