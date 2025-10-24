import { useState } from "react";

function App() {
  /** 入力フォームの表の文字 */
  const [cardFrontText, setCardFrontText] = useState("");
  /** 入力フォームの裏の文字 */
  const [cardBackText, setCardBackText] = useState("");
  /** カードのリスト（初期カード5枚） */
  const [cardList, setCardList] = useState([
    { front: "表 0" , back: "裏 1", checked: false },
    { front: "表 2" , back: "裏 3", checked: false },
    { front: "表 4" , back: "裏 5", checked: false },
    { front: "表 6" , back: "裏 7", checked: false },
    { front: "表 8" , back: "裏 9", checked: false }
  ])
  /** 学習画面が実行中かどうか */
  const [isRunned, setIsRunned] = useState(false);
  /** 学習画面のカードのインデックス */
  const [learningCardIndex, setLearningCardIndex] = useState(0);

  /** 入力フォームの値が変わったらステートを更新 */
  const onChangeCardFront = (event) => setCardFrontText(event.target.value);
  const onChangeCardBack = (event) => setCardBackText(event.target.value);

  /** カードを追加するボタンが押されたとき */
  const onClickAddCard = () => {
    if (cardFrontText === "" || cardBackText === "") return; // 表もしくは裏が空文字のときは追加しない
    const newCardList = [...cardList, {front: cardFrontText, back: cardBackText, checked: false}]; // カードリストを新要素を追加
    
    setCardFrontText(""); // 入力フォームをリセット
    setCardBackText(""); // 入力フォームをリセット
    
    setCardList(newCardList); // カードリストを更新
  }

  /** カードのチェックボタンが押されたとき */
  const onClickCardCheck = (index) => {
    const newCardList = [...cardList]; // カードリストを新規作成

    newCardList[index].checked = !newCardList[index].checked; // インデックスで指定したカードのチェックを反転

    setCardList(newCardList); // カードリストを更新
  }
  
  /** 学習画面のチェックボタンが押されたとき */
  const onClickCheck = () => {
    const newCardList = [...cardList]; // カードリストを新規作成

    newCardList[parseInt(learningCardIndex/2)].checked = !newCardList[parseInt(learningCardIndex/2)].checked; /// 現在の学習画面のカードのチェックを反転

    setCardList(newCardList); // カードリストを更新
  }

  /** 現在の学習画面のカードの文字を読み上げ */
  const onClickReadCard = () => {
    const uttr = new SpeechSynthesisUtterance(learningCardIndex%2 ? cardList[parseInt(learningCardIndex/2)].back : cardList[parseInt(learningCardIndex/2)].front);
    speechSynthesis.speak(uttr);
  }

  /** 学習パネルの起動と停止 */
  const onClickStart = () => setIsRunned(true); // 学習画面をオン
  const onClickStop = () => setIsRunned(false); // 学習画面をオフ
  const onClickReset = () => setLearningCardIndex(0); // 現在の学習画面のカードインデックスを0にリセット

  const onClickPrevCard = () =>  setLearningCardIndex(learningCardIndex > 0 ? learningCardIndex-1 : 0); // 次のカードに移動（インデックス0のときは移動しない）
  const onClickNextCard = () =>  setLearningCardIndex(learningCardIndex < cardList.length*2-1 ? learningCardIndex+1 : cardList.length*2-1); // 次のカードに移動（インデックス最大のときは移動しない）

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
            <div className="card-text">
              <div className="card-front">
                <span>{card.front}</span>
              </div>
              <div className="card-back">
                <span>{card.back}</span>
              </div>
            </div>
            <div className="card-check">
              <button style={{backgroundColor: card.checked ? "#8080dd" : "#dd8080"}} onClick={() => onClickCardCheck(index)}>{card.checked ? "〇" : "×" }</button>
            </div>
          </li>
        ))}
      </ul>
      <div className="control-area">
        <button onClick={onClickStart}>学習開始</button>
      </div>
      { isRunned && /*学習パネルがオンか否か */
      <div className="learning-panel">
        <div className="header">
          <button className="stop-btn" onClick={onClickStop}>＜ 戻る</button>
          <span>学習パネル</span>
          <button className="reset-btn" onClick={onClickReset}>リセット</button>
        </div>
        <div className="contents">
          <button className="prev-btn" onClick={onClickPrevCard}>＜</button>
          <button className="next-btn" onClick={onClickNextCard}>＞</button>
          <button className="read-btn" onClick={onClickReadCard}>♪</button>
          <button className="check-btn" style={{backgroundColor: cardList[parseInt(learningCardIndex/2)].checked ? "#8080dd" : "#dd8080"}} onClick={() => onClickCheck(parseInt(learningCardIndex/2))}>{ cardList[parseInt(learningCardIndex/2)].checked ? "〇" : "×" }</button>
          <span className="active-card">{learningCardIndex%2 ? cardList[parseInt(learningCardIndex/2)].back : cardList[parseInt(learningCardIndex/2)].front}</span>
        </div>
        <div className="footer">
          <div className="progress"><span className="progress-bar" style={{width: learningCardIndex/(cardList.length*2-1)*100 + "%"}}>{parseInt(learningCardIndex/(cardList.length*2-1)*100)}%</span></div>
        </div>
      </div>
      }
    </>
  );
}

export default App;
