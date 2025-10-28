export const CreateForm = (props) => {
    const {cardFrontText, cardBackText, setCardFrontText, setCardBackText, cardList, setCardList} = props;

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

    return (
        <div className="create-form">
            <div className="create-form-text">
                <input placeholder="表のテキスト" value={cardFrontText} onChange={onChangeCardFront}/>
                <input placeholder="裏のテキスト" value={cardBackText} onChange={onChangeCardBack}/>
            </div>
            <button onClick={onClickAddCard}>追加</button>
        </div>
    )
}