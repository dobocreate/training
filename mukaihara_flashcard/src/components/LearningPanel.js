export const LearningPanel = (props) => {
    const {cardList, setCardList, learningCardIndex, setLearningCardIndex, onClickStop, onClickReset} = props;

    /** 学習画面のチェックボタンが押されたとき */
    const onClickCheck = () => {
        const newCardList = [...cardList]; // カードリストを新規作成

        newCardList[parseInt(learningCardIndex/2)].checked = !newCardList[parseInt(learningCardIndex/2)].checked; /// 現在の学習画面のカードのチェックを反転

        setCardList(newCardList); // カードリストを更新
    }

    /** 現在の学習画面のカードの文字を読み上げ */
    const onClickReadCard = () => {
        const pattern = /^[a-zA-Z0-9!-/:-@[-`{-~]*$/g;
        const readText = learningCardIndex%2 ? cardList[parseInt(learningCardIndex/2)].back : cardList[parseInt(learningCardIndex/2)].front;
        const uttr = new SpeechSynthesisUtterance(readText);
        uttr.lang = readText.match(pattern) ? 'en-US' : 'ja-JP';
        speechSynthesis.speak(uttr);
    }

    /** 前のカード・次のカードへ移動 */
    const onClickPrevCard = () =>  setLearningCardIndex(learningCardIndex > 0 ? learningCardIndex-1 : 0); // 次のカードに移動（インデックス0のときは移動しない）
    const onClickNextCard = () =>  setLearningCardIndex(learningCardIndex < cardList.length*2-1 ? learningCardIndex+1 : cardList.length*2-1); // 次のカードに移動（インデックス最大のときは移動しない）

    return (
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
                <div className="progress">
                    <span className="progress-bar" style={{width: learningCardIndex/(cardList.length*2-1)*100 + "%"}}>{parseInt(learningCardIndex/(cardList.length*2-1)*100)}%</span>
                </div>
            </div>
        </div>
    )
}