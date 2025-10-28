export const CardList = (props) => {
    const {cardList, setCardList} = props;
    
    /** カードのチェックボタンが押されたとき */
    const onClickCardCheck = (index) => {
        const newCardList = [...cardList]; // カードリストを新規作成

        newCardList[index].checked = !newCardList[index].checked; // インデックスで指定したカードのチェックを反転

        setCardList(newCardList); // カードリストを更新
    }

    return (
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
    )
}