import { useState } from "react";
import { normalizeConfidence } from "../lib/confidence";

// 自信を数字で入れる欄。
// type="number" だと、0 の状態で「4」を打ったときに「04」と残ってしまう
// （React が数として同じ値なら入力欄を書き換えないため）。
// そこで文字として持ち、先頭の 0 と数字以外をその場で落とす。
// 値は 0〜100 に丸めて親へ渡し、欄から抜けたときに表示もそろえる。
// commitOnBlur を付けると、打っている途中は親へ渡さず、抜けたときにまとめて渡す
function ConfidenceInput({ value, onChange, commitOnBlur = false, ...rest }) {
  const [draft, setDraft] = useState(String(value));
  const [last, setLast] = useState(value);

  // スライダーなど、外から値が変わったときは表示を合わせる
  if (value !== last) {
    setLast(value);
    setDraft(String(value));
  }

  const commit = (text) => {
    const next = normalizeConfidence(text === "" ? 0 : text);
    setLast(next);
    onChange(next);
    return next;
  };

  return (
    <input
      {...rest}
      className="field is-number is-confidence"
      type="text"
      inputMode="numeric"
      value={draft}
      onChange={(event) => {
        const text = event.target.value
          .replace(/[^0-9]/g, "")
          .replace(/^0+(?=[0-9])/, "");
        setDraft(text);
        if (!commitOnBlur) commit(text);
      }}
      onBlur={() => {
        const next = commitOnBlur ? commit(draft) : normalizeConfidence(draft === "" ? 0 : draft);
        setDraft(String(next));
      }}
      onKeyDown={(event) => {
        if (event.key === "Enter" && commitOnBlur) event.currentTarget.blur();
      }}
    />
  );
}

export default ConfidenceInput;
