# shiino_TODO(React)

React + Vite で作ったTODOアプリ。

## 起動方法

```bash
npm install   # 初回のみ
npm run dev   # 表示されたURL（既定は http://localhost:5173）を開く
```

その他のコマンド:

- `npm run build` … 本番用にビルド（`dist/` に出力）
- `npm run preview` … ビルド結果を確認
- `npm run lint` … oxlint でチェック

## 機能

- TODOの追加（追加ボタン / Enterキー）
- 完了 ⇄ 戻す の切り替え
- 削除
- 空・空白のみの入力はエラーメッセージを出して追加しない
- 未完了 / 完了それぞれの件数表示と、0件のときの案内メッセージ
- 完了率のプログレスバー
- 進捗100%で、万歳する宇宙人と舞い落ちる星でお祝い
- 進捗0%（1件も終わっていない）で、怒っている宇宙人が催促
  - 画面幅1100px以上では本文カードの右横に固定表示、それ未満ではリストの下に表示

## 見た目

宇宙をテーマにしたネオン調。背景（`SpaceBackground.jsx`）は画像を1枚も使わず、
CSSの `radial-gradient` だけで星・星雲・惑星・流れ星を描いている。
星は2層に分けて速さを変え、奥行きが出るようにしている。
その上に半透明ガラス風のパネルを重ねる構成。アニメーションは
`prefers-reduced-motion` を有効にしている環境では自動的に止まる。

## ファイル構成

```
src/
├── App.jsx                    TODOの一覧（state）と、追加・完了・削除の処理
├── App.css                    見た目
├── index.css                  body の基本スタイル
├── main.jsx                   Appを画面に描画する入口
└── components/
    ├── TodoInput.jsx          入力欄と追加ボタン
    ├── TodoList.jsx           リスト1つ分（未完了・完了の両方で使い回す）
    └── TodoItem.jsx           TODO1件分の行
```

## 設計のメモ

- TODOのデータは `App.jsx` の `todos` だけが持ち、子コンポーネントには props で渡す。
  子は「押された」ことを関数で親に伝えるだけで、自分ではデータを書き換えない。
- 未完了リストと完了リストを別々の state で持つと2つの同期がずれるため、
  `todos` 1つだけを持ち、描画のたびに `filter` で振り分けている。
- 入力中の文字は `TodoInput.jsx` の中だけで完結させ、追加が確定したときだけ親に渡している。
