import { useState } from "react";
import { InputTodo } from "./components/InputTodo";
import { IncompleteTodos } from "./components/IncompleteTodos";
import { CompleteTodos } from "./components/CompleteTodos";
import './styles.css';

function Todo() {
  /* 各ステートの定義 */
  const [todoText, setTodoText] = useState("");
  const [incompleteTodos, setIncompleteTodos] = useState([
    "TODOです1",
    "TODOです2"
  ]);
  const [completeTodos, setCompleteTodos] = useState([
    "TODOでした1",
    "TODOでした2"
  ]);

  /* テキストボックスの値が変更されたとき */
  const onChangeTodoText = (event) => setTodoText(event.target.value);
  
  /* 追加ボタンが押されたとき */
  const onClickAdd = () => {
    if (todoText === "") return; // テキストボックスがからの場合は追加しない
    const newTodos = [...incompleteTodos, todoText]; // 配列に新しい要素を連結
    setIncompleteTodos(newTodos);
    setTodoText("");
  }

  /* 削除ボタンが押されたとき */
  const onClickDelete = (index) => {
    const newTodos = [...incompleteTodos]; // 新しい配列を定義
    newTodos.splice(index, 1); // indexから一要素を切り出す
    setIncompleteTodos(newTodos);
  }

  /* 完了ボタンを押されたとき */
  const onClickComplete = (index) => {
    const newIncompleteTodos = [...incompleteTodos]; // 新しい配列を定義
    newIncompleteTodos.splice(index, 1); // indexから一要素を切り出す

    const newCompleteTodos = [...completeTodos, incompleteTodos[index]]; // 配列に要素を追加

    setCompleteTodos(newCompleteTodos);
    setIncompleteTodos(newIncompleteTodos);
  }

  /* 戻るボタンを押されたとき */
  const onClickBack = (index) => {
    const newCompleteTodos = [...completeTodos]; // 新しい配列を定義
    newCompleteTodos.splice(index, 1); // indexから一要素を切り出す

    const newIncompleteTodos = [...incompleteTodos, completeTodos[index]]; // 配列に要素を追加

    setCompleteTodos(newCompleteTodos);
    setIncompleteTodos(newIncompleteTodos);
  }

  /* 未完了TODOの数をチェックする（Max:5個） */
  const isMaxLimitIncompletetodos = incompleteTodos.length >= 5;

  return (
    <>
      <InputTodo todoText={todoText} onChange={onChangeTodoText} onClick={onClickAdd} disabled={isMaxLimitIncompletetodos} />
      {isMaxLimitIncompletetodos && (
        <p style={{color: "red"}}>これ以上登録できません。未完了TODOを完了してください。</p>
      ) /* 未登録が多い場合は登録させない */ }
      <IncompleteTodos todos={incompleteTodos} onClickComplete={onClickComplete} onClickDelete={onClickDelete} />
      <CompleteTodos todos={completeTodos} onClickBack={onClickBack} />
    </>
  );
}

export default Todo;
