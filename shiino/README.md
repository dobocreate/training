# shiino

練習用のアプリ置き場。それぞれ独立したプロジェクトなので、使うほうのフォルダで
`npm install` → `npm run dev` する。

| フォルダ | アプリ | 起動 |
| --- | --- | --- |
| [`todo/`](./todo) | TODOリスト（UFOに乗った宇宙人が進捗に応じて話しかけてくる） | `cd todo && npm run dev` |
| [`study/`](./study) | 勉強記録（科目ごとの時間を計測・集計。localStorageに保存） | `cd study && npm run dev` |

同時に動かすときは、あとから起動するほうでポートを変える。

```bash
cd todo  && npm run dev              # http://localhost:5173
cd study && npm run dev -- --port 5176
```

どれも React + Vite。見た目は宇宙をテーマにした共通の雰囲気でそろえている。
