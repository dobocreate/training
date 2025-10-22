import { useState } from "react";

function App() {
  /** ステートを定義 */
  const [cardFrontText, setCardFrontText] = useState("");
  const [cardBackText, setCardBackText] = useState("");
  const [cardList, setCardList] = useState([
    { front: "表の文字" , back: "裏の文字", checked: false }
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

    newCardList[learningCardIndex/2].checked = !newCardList[learningCardIndex/2].checked; // チェックを反転

    setCardList(newCardList);
  }

  /** 学習パネルの起動と停止 */
  const onClickStart = () => setIsRunned(true);
  const onClickStop = () => setIsRunned(false);

  const onClickPrevCard = () =>  setLearningCardIndex(learningCardIndex > 0 ? learningCardIndex-1 : 0);
  const onClickNextCard = () =>  setLearningCardIndex(learningCardIndex+1);

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
              <input type="checkbox" defaultChecked={card.checked} onClick={() => onClickCardCheck(index)} />
            </div>
          </li>
        ))}
      </ul>
      <div className="control-area">
        <button onClick={onClickStart}>開始</button>
        <button onClick={onClickStop}>停止</button>
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
          <button className="check-btn" onClick={onClickCheck}>{cardList[learningCardIndex].checked ? "✓" : "" }</button>
          <span>{learningCardIndex%2}</span>
        </div>
      </div>
      }
    </>
  );
}

export default App;
