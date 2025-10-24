import { useState } from "react";

function App() {
  /** ステートを定義 */
  const [cardFrontText, setCardFrontText] = useState("");
  const [cardBackText, setCardBackText] = useState("");
  const [cardList, setCardList] = useState([
    { front: "表の文字" , back: "裏の文字", checked: false },
    { front: "0" , back: "1", checked: false },
    { front: "2" , back: "3", checked: false },
    { front: "4" , back: "5", checked: false },
    { front: "6" , back: "7", checked: false },
    { front: "8" , back: "9", checked: false }
  ])

  const [isRunned, setIsRunned] = useState(false);
  const [learningCardIndex, setLearningCardIndex] = useState(0);

  /** 入力フォームの値の更新 */
  const onChangeCardFront = (event) => setCardFrontText(event.target.value);
  const onChangeCardBack = (event) => setCardBackText(event.target.value);

  /** カードを追加するボタンが押されたとき */
  const onClickAddCard = () => {
    if (cardFrontText === "" || cardBackText === "") return;
    const newCardList = [...cardList, {front: cardFrontText, back: cardBackText, checked: false}]; // カードリストを新要素を追加
    
    setCardFrontText("");
    setCardBackText("");
    
    setCardList(newCardList);
  }

  /** カードのチェックボタンが押されたとき */
  const onClickCardCheck = (index) => {
    const newCardList = [...cardList];

    newCardList[index].checked = !newCardList[index].checked; // チェックを反転

    setCardList(newCardList);
  }
  
  /** 学習パネルのチェックボタンが押されたとき */
  const onClickCheck = (index) => {
    const newCardList = [...cardList];

    newCardList[parseInt(learningCardIndex/2)].checked = !newCardList[parseInt(learningCardIndex/2)].checked; // チェックを反転

    setCardList(newCardList);
  }

  /** 学習パネルの起動と停止 */
  const onClickStart = () => setIsRunned(true);
  const onClickStop = () => setIsRunned(false);

  const onClickPrevCard = () =>  setLearningCardIndex(learningCardIndex > 0 ? learningCardIndex-1 : 0);
  const onClickNextCard = () =>  setLearningCardIndex(learningCardIndex < cardList.length*2-1 ? learningCardIndex+1 : cardList.length*2-1);

  return (
    <>
      <div className="create-form">
        <div className="create-form-text">
          <input placeholder="表のテキスト" value={cardFrontText} onChange={onChangeCardFront}/>
          <input placeholder="裏のテキスト" value={cardBackText} onChange={onChangeCardBack}/>
        </div>
        <button onClick={onClickAddCard}>追加</button>
      </div>
      <ul className="card-list">
        {cardList.map((card, index) => (
          <li key={index}>
            <div className="card-front">
              <span>{card.front}</span>
            </div>
            <div className="card-back">
              <span>{card.back}</span>
            </div>
            <div className="card-check">
              <button onClick={() => onClickCardCheck(index)}>{card.checked ? "〇" : "×" }</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="control-area">
        <button onClick={onClickStop}>停止</button>
        <button onClick={onClickStart}>開始</button>
      </div>
      { isRunned && /*学習パネルが起動中か否か */
      <div className="learning-panel">
        <div className="header">
          <button onClick={onClickStop}>＜ 戻る</button>
          <span>学習パネル</span>
        </div>
        <div className="contents">
          <button className="prev-btn" onClick={onClickPrevCard}>＜</button>
          <button className="next-btn" onClick={onClickNextCard}>＞</button>
          <button className="check-btn" onClick={() => onClickCheck(parseInt(learningCardIndex/2))}>{cardList[parseInt(learningCardIndex/2)].checked ? "〇" : "×" }</button>
          <span className="active-card">{learningCardIndex%2 ? cardList[parseInt(learningCardIndex/2)].back : cardList[parseInt(learningCardIndex/2)].front}</span>
        </div>
      </div>
      }
    </>
  );
}

export default App;
