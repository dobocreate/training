export const ControlArea = (props) => {
    const {onClickStart} = props;

    return (
        <div className="control-area">
            <button onClick={onClickStart}>学習開始</button>
        </div>
    )
}