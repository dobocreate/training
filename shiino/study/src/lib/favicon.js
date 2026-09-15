// タブのアイコン（ファビコン）を、今日の勉強時間に合わせて描き替える。
// カップにコーヒーが少しずつ溜まり、今日の目標ぶん勉強すると満タンになって湯気が立つ。
//
// SVG ではなく canvas で PNG を作る。SVG のファビコンを出せないブラウザがあるため

import { toDateKey } from "./time.js";

// カップが満タンになる勉強時間（今日の目標）
export const DAILY_GOAL_SECONDS = 60 * 60;

// 今日の勉強時間。記録に、計測中のぶんを足す
export function todayStudySeconds(records, running, elapsedSeconds, now = new Date()) {
  const todayKey = toDateKey(now);
  const recorded = records
    .filter((record) => toDateKey(record.startedAt) === todayKey)
    .reduce((sum, record) => sum + record.seconds, 0);
  const current = running && toDateKey(running.startedAt) === todayKey ? elapsedSeconds : 0;
  return recorded + current;
}

// 満ち具合（0〜1）。目標を超えても満タンまで
export function fillRatio(seconds) {
  return Math.min(1, Math.max(0, seconds / DAILY_GOAL_SECONDS));
}

const SIZE = 64;
// 32px のデザインを 64px に描くので 2 倍
const S = SIZE / 32;

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// ratio（0〜1）ぶんコーヒーが入ったカップを PNG の data URL にして返す。
// 満タンになると湯気が立つ
export function drawFavicon(ratio) {
  const canvas = document.createElement("canvas");
  canvas.width = SIZE;
  canvas.height = SIZE;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  // 白い角丸の四角に、茶色の細い枠
  ctx.fillStyle = "#ffffff";
  roundedRect(ctx, 0, 0, SIZE, SIZE, 7 * S);
  ctx.fill();
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 1.5 * S;
  roundedRect(ctx, 0.75 * S, 0.75 * S, SIZE - 1.5 * S, SIZE - 1.5 * S, 6.25 * S);
  ctx.stroke();

  // カップの形。上が広く、底が丸い
  const cupPath = () => {
    ctx.beginPath();
    ctx.moveTo(7 * S, 11 * S);
    ctx.lineTo(22 * S, 11 * S);
    ctx.lineTo(22 * S, 20 * S);
    ctx.arcTo(22 * S, 25 * S, 17 * S, 25 * S, 5 * S);
    ctx.lineTo(12 * S, 25 * S);
    ctx.arcTo(7 * S, 25 * S, 7 * S, 20 * S, 5 * S);
    ctx.closePath();
  };

  // カップの中（薄い茶色）
  cupPath();
  ctx.fillStyle = "rgba(146, 64, 14, 0.12)";
  ctx.fill();

  // コーヒー。カップの形で切り抜いて、下から満たす
  if (ratio > 0) {
    ctx.save();
    cupPath();
    ctx.clip();
    // 少しでも勉強したら見えるように、いきなり底から 2.5 ぶん上から始める
    const level = (21.5 - 8.5 * ratio) * S;
    ctx.fillStyle = "#92400e";
    ctx.fillRect(7 * S, level, 15 * S, 14 * S);
    ctx.restore();
  }

  // カップのふちと取っ手
  ctx.strokeStyle = "#92400e";
  ctx.lineWidth = 2 * S;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  cupPath();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(22 * S, 13 * S);
  ctx.lineTo(24.5 * S, 13 * S);
  ctx.arc(24.5 * S, 16 * S, 3 * S, -Math.PI / 2, Math.PI / 2);
  ctx.lineTo(22 * S, 19 * S);
  ctx.stroke();

  // 満タンなら湯気
  if (ratio >= 1) {
    ctx.strokeStyle = "rgba(146, 64, 14, 0.85)";
    ctx.lineWidth = 1.6 * S;
    for (const x of [12, 16]) {
      ctx.beginPath();
      ctx.moveTo(x * S, 8 * S);
      ctx.quadraticCurveTo((x + 1) * S, 6 * S, x * S, 4 * S);
      ctx.stroke();
    }
  }

  return canvas.toDataURL("image/png");
}

let lastKey = null;

// <link rel="icon"> を差し替える。同じ絵なら描き直さない
export function updateFavicon(ratio) {
  if (typeof document === "undefined") return;
  // 1% きざみに丸めて、1秒ごとの更新で毎回描き直さないようにする
  const key = Math.round(ratio * 100);
  if (key === lastKey) return;

  const url = drawFavicon(key / 100);
  if (!url) return;

  let link = document.querySelector('link[rel="icon"]');
  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }
  link.type = "image/png";
  link.href = url;
  lastKey = key;
}
