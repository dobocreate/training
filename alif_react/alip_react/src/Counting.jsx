import { useState, useEffect } from "react";

function Counting() {
  const [count, setCount] = useState(0);
  const [oCount, setOCount] = useState(0);
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const timerId = setInterval(() => {
      setSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timerId);
  }, [count]);

  return (
    <div className="counter">
      <p> SECONDS: {seconds} 秒</p>

      <p>X win counter: {count}</p>
      <button onClick={() => setCount((count) => count + 1)}>X</button>

      <p>O win counter: {oCount}</p>
      <button onClick={() => setOCount((cnt) => cnt + 1)}>O</button>
    </div>
  );
}

export default Counting;
