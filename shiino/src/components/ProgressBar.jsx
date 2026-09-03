// 完了率を表示するバー。件数から計算した値を受け取って表示するだけ
function ProgressBar({ completeCount, totalCount }) {
  const percent =
    totalCount === 0 ? 0 : Math.round((completeCount / totalCount) * 100);

  return (
    <div className="progress">
      <div className="progress-head">
        <span className="progress-label">進捗</span>
        <span className="progress-percent">{percent}%</span>
      </div>

      <div className="progress-track">
        {/* 幅だけをJS側から指定し、色や光り方はCSSに任せる */}
        <div className="progress-bar" style={{ width: `${percent}%` }}>
          <span className="progress-shine" />
        </div>
      </div>

      <p className="progress-note">
        {totalCount === 0
          ? "まずは1つ追加してみよう"
          : percent === 100
            ? "🎉 全部おわった！"
            : `${totalCount}件中 ${completeCount}件 完了`}
      </p>
    </div>
  );
}

export default ProgressBar;
