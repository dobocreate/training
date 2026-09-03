import { useRef, useState } from "react";
import SpaceBackground from "./components/SpaceBackground";
import TodoInput from "./components/TodoInput";
import TodoList from "./components/TodoList";
import ProgressBar from "./components/ProgressBar";
import Celebration from "./components/Celebration";
import Scolding from "./components/Scolding";
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

  // 1件以上あって、未完了が0件になったときが「全部完了」。
  // TODOが空のときは達成ではないので出さない
  const isAllDone = todos.length > 0 && incompleteTodos.length === 0;

  // 逆に、1件以上あるのに1つも終わっていない状態。
  // TODOが空のときは怒られる筋合いがないので出さない
  const isNothingDone = todos.length > 0 && completeTodos.length === 0;

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

      {/* 広い画面では右横に固定し、狭い画面ではここ（リストの下）に並ぶ */}
      {(isAllDone || isNothingDone) && (
        <aside className="mascot">
          {isAllDone ? <Celebration /> : <Scolding />}
        </aside>
      )}
    </div>
  );
}

export default App;
