import { useState } from "react";
import { CreateForm } from "./components/CreateForm";
import { CardList } from "./components/CardList";
import { ControlArea } from "./components/ControlArea";
import { LearningPanel } from "./components/LearningPanel";

function App() {

  /** ステートの初期設定 */
  const [cardFrontText, setCardFrontText] = useState(""); // 入力フォームの表の文字
  const [cardBackText, setCardBackText] = useState(""); // 入力フォームの裏の文字
  const [cardList, setCardList] = useState([
    { front: "走る" , back: "run", checked: false },
    { front: "歩く" , back: "walk", checked: false },
    { front: "寝る" , back: "sleep", checked: false },
    { front: "食べる" , back: "eat", checked: false },
    { front: "飲む" , back: "drink", checked: false },
    { front: "書く" , back: "write", checked: false },
    { front: "読む" , back: "read", checked: false }
  ]); // カードのリスト（初期カード7枚）
  const [isRunned, setIsRunned] = useState(false); // 学習画面が実行中かどうか
  const [learningCardIndex, setLearningCardIndex] = useState(0); // 学習画面のカードのインデックス


  /** 学習パネルの起動と停止 */
  const onClickStart = () => setIsRunned(true); // 学習画面をオン
  const onClickStop = () => setIsRunned(false); // 学習画面をオフ
  const onClickReset = () => setLearningCardIndex(0); // 現在の学習画面のカードインデックスを0にリセット

  return (
    <>
      <CreateForm cardFrontText={cardFrontText} cardBackText={cardBackText} setCardFrontText={setCardFrontText} setCardBackText={setCardBackText} cardList={cardList} setCardList={setCardList} />
      <CardList cardList={cardList} setCardList={setCardList} />
      <ControlArea onClickStart={onClickStart} />
      { isRunned && /*学習パネルがオンか否か */
      <LearningPanel cardList={cardList} setCardList={setCardList} learningCardIndex={learningCardIndex} setLearningCardIndex={setLearningCardIndex} onClickStop={onClickStop} onClickReset={onClickReset} />
      }
    </>
  );
}

export default App;
