import logo from "./logo.svg";
import { useState } from "react";
import { InputTodo } from "./components/inputTodo";
import { IncompleteTodos } from "./components/IncompleteTodos";
import "./Todo.css";
import { CompleteTodos } from "./components/CompleteTodos";

const Todo = () => {
  const [todoText, setTodoText] = useState("");
  const [incompleteTodos, setIncompleteTodos] = useState([]);
  const [completeTodos, setCompleteTodos] = useState([]);
  // eventのtargetのvalueに入力された文字が入る
  const onChangeTodoText = (event) => setTodoText(event.target.value);
  const onClickAdd = () => {
    if (todoText === "") return; // もし空欄なら終わり
    const newTodos = [...incompleteTodos, todoText]; //順番に中身を展開
    setIncompleteTodos(newTodos); // 新しく追加
    setTodoText(""); // 入力後空欄に
  };

  const onClickDelete = (index) => {
    const newTodos = [...incompleteTodos];
    newTodos.splice(index, 1); // spliceはindex番目から、後番目を削除・簡単に削除可能
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
      <InputTodo
        todoText={todoText}
        onChange={onChangeTodoText}
        onClick={onClickAdd}
      ></InputTodo>
      {/* {incompleteTodos.length>= 5 && ()}
<p style={color: "red"}}>
</p> */}
      <IncompleteTodos
        todos={incompleteTodos}
        onClickComplete={onClickComplete}
        onClickDelete={onClickDelete}
      ></IncompleteTodos>

      <CompleteTodos
        todos={completeTodos}
        onClickBack={onClickBack}
      ></CompleteTodos>
    </>
  );
};

export default Todo;
