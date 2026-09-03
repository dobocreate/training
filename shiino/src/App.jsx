import { useRef, useState } from "react";
import SpaceBackground from "./components/SpaceBackground";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import ProgressBar from "./components/ProgressBar";
import Mascot from "./components/Mascot";
import "./App.css";

function App() {
  // TODOの一覧。1件は { id, text, done } の形で持つ
  const [todos, setTodos] = useState([]);

  // idを1,2,3...と振るためのカウンター。
  // 画面の見た目には関わらない値なので、stateではなくrefで持つ（更新しても再描画されない）
  const nextId = useRef(1);

  const addTodo = (text) => {
    const newTodo = { id: nextId.current, text: text, done: false };
    nextId.current += 1;

    // 元の配列を書き換えず、新しい配列を作って渡す（Reactが変化に気づけるようにするため）
    setTodos((prevTodos) => [...prevTodos, newTodo]);
  };

  // 完了 / 未完了 を切り替える
  const toggleTodo = (id) => {
    setTodos((prevTodos) =>
      prevTodos.map((todo) =>
        todo.id === id ? { ...todo, done: !todo.done } : todo,
      ),
    );
  };

  const deleteTodo = (id) => {
    setTodos((prevTodos) => prevTodos.filter((todo) => todo.id !== id));
  };

  // 未完了と完了を別々のstateで持つと2つの同期がずれるので、
  // todosだけを持って、描画のたびにここで振り分ける
  const incompleteTodos = todos.filter((todo) => !todo.done);
  const completeTodos = todos.filter((todo) => todo.done);

  return (
    <div className="container">
      <SpaceBackground />

      <header className="app-header">
        <h1 className="app-title">TODO</h1>
        <p className="app-subtitle">今日のミッションを、片づけていこう</p>
      </header>

      <TodoInput onAdd={addTodo} />

      <ProgressBar
        completeCount={completeTodos.length}
        totalCount={todos.length}
      />

      <TodoList
        title="未完了"
        todos={incompleteTodos}
        emptyMessage="未完了のミッションはありません"
        onToggle={toggleTodo}
        onDelete={deleteTodo}
      />

      <TodoList
        title="完了"
        todos={completeTodos}
        emptyMessage="完了したミッションはまだありません"
        onToggle={toggleTodo}
        onDelete={deleteTodo}
        complete
      />

      {/* 広い画面では右横に固定し、狭い画面ではここ（リストの下）に並ぶ。
          セリフは件数から宇宙人側で決める */}
      <aside className="mascot">
        <Mascot
          completeCount={completeTodos.length}
          totalCount={todos.length}
        />
      </aside>
    </div>
  );
}

export default App;
