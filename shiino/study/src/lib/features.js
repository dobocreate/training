// メニューに並べる機能の一覧。並び順と、各画面の見出しに使う。
// icon は Icon.jsx に用意した名前と合わせる

export const FEATURES = [
  { key: "timer", icon: "timer", label: "計測", description: "科目を選んで時間をはかる" },
  { key: "summary", icon: "chart", label: "合計", description: "今日・今週・全期間の集計" },
  { key: "records", icon: "list", label: "記録", description: "日付ごとの記録を見る・消す" },
  { key: "milestones", icon: "flag", label: "マイルストーン", description: "累計時間で進む段階" },
  { key: "goal", icon: "target", label: "目標", description: "期限までに何時間やるか" },
  { key: "subjects", icon: "book", label: "科目", description: "科目の追加と削除" },
  { key: "manual", icon: "pencil", label: "手入力", description: "あとから記録を足す" },
];
