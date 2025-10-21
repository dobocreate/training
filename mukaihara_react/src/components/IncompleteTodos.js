export const IncompleteTodos = (props) => {
    const {todos, onClickComplete, onClickDelete} = props; // プロップの分割代入（注意：呼び出しと同じ名前にする）

    return (
        <div className="incomplete-area">
            <p className="title">未完了のTODO</p>
            <ul>
            {todos.map((todo, index) => (
                <li key={todo}>
                <div className="list-row">
                    <p className="todo-item">{todo}</p>
                    <button onClick={() => onClickComplete(index) /* 関数を生成する形で書かないと、ループごとに関数が実行される */ }>完了</button>
                    <button onClick={() => onClickDelete(index) }>削除</button>
                </div>
                </li>
            ))}
            </ul>
        </div>
    )
}