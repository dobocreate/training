// 時間の計算と表示形式をまとめたファイル。Reactに依存しない純粋な関数だけを置く。

// 計測中の表示用。秒を 00:12:34 の形にする
export function formatClock(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const s = String(seconds % 60).padStart(2, "0");
  return `${h}:${m}:${s}`;
}

// 合計時間の表示用。「1時間23分」のように、意味のある単位だけ出す
export function formatDuration(totalSeconds) {
  const seconds = Math.max(0, Math.floor(totalSeconds));
  if (seconds < 60) return `${seconds}秒`;

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  if (hours === 0) return `${minutes}分`;
  if (minutes === 0) return `${hours}時間`;
  return `${hours}時間${minutes}分`;
}

// その日のローカル日付を YYYY-MM-DD で返す。
// toISOString() はUTCになってしまうので、自前で組み立てる
export function toDateKey(date) {
  const d = new Date(date);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

const WEEKDAYS = ["日", "月", "火", "水", "木", "金", "土"];

export function formatDateLabel(dateKey) {
  const [y, m, d] = dateKey.split("-").map(Number);
  const date = new Date(y, m - 1, d);
  const today = toDateKey(new Date());

  if (dateKey === today) return "今日";
  const yesterday = toDateKey(new Date(Date.now() - 24 * 60 * 60 * 1000));
  if (dateKey === yesterday) return "昨日";

  return `${m}/${d}(${WEEKDAYS[date.getDay()]})`;
}

export function formatTimeLabel(isoString) {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

// 直近n日分の日付キーを、古い順に並べて返す（グラフの横軸に使う）
export function recentDateKeys(days) {
  const keys = [];
  for (let i = days - 1; i >= 0; i -= 1) {
    keys.push(toDateKey(new Date(Date.now() - i * 24 * 60 * 60 * 1000)));
  }
  return keys;
}

// 今週（月曜はじまり）の開始日を返す
export function startOfWeekKey() {
  const now = new Date();
  // getDay() は日曜が0。月曜を週のはじめにしたいので、日曜だけ6日戻す
  const back = (now.getDay() + 6) % 7;
  return toDateKey(new Date(now.getFullYear(), now.getMonth(), now.getDate() - back));
}
