import logo from "./logo.svg";
import { useState } from "react";
import { inputTodo } from "./components/inputTodo";
import "./Todo.css";

const Todo = () => {
  const [todoText, setTodoText] = useState("");
  const [incompleteTodos, setIncompleteTodos] = useState([]);
  const [completeTodos, setCompleteTodos] = useState([]);
  //eventのtargetのvalueに入力された文字が入る
  const onChangeTodoText = (event) => setTodoText(event.target.value);
  const onClickAdd = () => {
    if (todoText === "") return; //もし空欄なら終わり
    const newTodos = [...incompleteTodos, todoText]; //順番に中身を展開
    setIncompleteTodos(newTodos); //新しく追加
    setTodoText(""); //入力後空欄に
  };

  const onClickDelete = (index) => {
    const newTodos = [...incompleteTodos];
    newTodos.splice(index); //spliceはindex番目から、後番目を削除・簡単に削除可能
    setIncompleteTodos(newTodos);
  };

  const onClickComplete = (index) => {
    const newIncompleteTodos = [...incompleteTodos];
    newIncompleteTodos.splice(index, 1);

    const newcompleteTodos = [...completeTodos, incompleteTodos[index]];
    setIncompleteTodos(newIncompleteTodos);
    setCompleteTodos(newcompleteTodos);
  };

  const onClickBack = (index) => {
    const newcompleteTodos = [...completeTodos];
    newcompleteTodos.splice(index, 1);

    const newIncompleteTodos = [...incompleteTodos, completeTodos[index]];
    setCompleteTodos(newcompleteTodos);
    setIncompleteTodos(newIncompleteTodos);
  };

  return (
    <>
      <inputTodo
        todoText={todoText}
        onChange={onChangeTodoText}
        onClick={onClickAdd}
      ></inputTodo>
      <div className="incomplete-area">
        <p className="title">未完了のTODO</p>
        <ul>
          {incompleteTodos.map(
            (
              todo,
              index //indexにより何番目なのかわかる
            ) => (
              <li key={todo}>
                <div className="list-row">
                  <p className="todo-item">{todo}</p>
                  <button onClick={() => onClickComplete(index)}>完了</button>
                  <button onClick={() => onClickDelete(index)}>削除</button>
                </div>
              </li>
            )
          )}
        </ul>
      </div>
      <div className="complete-area">
        <p className="title">完了のTODO</p>
        <ul>
          {completeTodos.map((todo, index) => (
            <li key={todo}>
              <div className="list-row">
                <p className="todo-item">{todo}</p>
                <button onClick={() => onClickBack(index)}>戻す</button>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <div></div>
    </>
  );
};

export default Todo;
