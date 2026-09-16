import { useId } from "react";

// 「STUDY LOG」の左に置くコーヒーカップ。タブのアイコンと同じ絵で、
// 今日の勉強時間ぶんコーヒーが溜まり、満タンで湯気が立つ。
// 大きさは文字に合わせるので、CSS の font-size で決まる（height: 1em）
function CoffeeCup({ ratio, className }) {
  // 同じ画面に複数置いても clipPath がぶつからないように、固有の id を作る
  const clipId = useId();
  // 少しでも勉強したら見えるように、いきなり底から 2.5 ぶん上から始める（タブのアイコンと同じ）
  const level = 21.5 - 8.5 * Math.min(1, Math.max(0, ratio));

  return (
    <svg
      className={className ? `logo-cup ${className}` : "logo-cup"}
      viewBox="0 0 32 32"
      aria-hidden="true"
    >
      <defs>
        <clipPath id={clipId}>
          <path d="M7 11h15v9a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5z" />
        </clipPath>
      </defs>
      <rect x="0.75" y="0.75" width="30.5" height="30.5" rx="6.25" fill="#ffffff" stroke="#92400e" strokeWidth="1.5" />
      {ratio > 0 && (
        <rect x="7" y={level} width="15" height="14" fill="#92400e" clipPath={`url(#${clipId})`} />
      )}
      <path
        d="M7 11h15v9a5 5 0 0 1-5 5h-5a5 5 0 0 1-5-5z"
        fill="#92400e"
        fillOpacity="0.12"
        stroke="#92400e"
        strokeWidth="2"
        strokeLinejoin="round"
      />
      <path
        d="M22 13h2.5a3 3 0 0 1 0 6H22"
        fill="none"
        stroke="#92400e"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {ratio >= 1 && (
        <path
          d="M12 8q1-2 0-4M16 8q1-2 0-4"
          fill="none"
          stroke="#92400e"
          strokeWidth="1.6"
          strokeLinecap="round"
          opacity="0.85"
        />
      )}
    </svg>
  );
}

export default CoffeeCup;
