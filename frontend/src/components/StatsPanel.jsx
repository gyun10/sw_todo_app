import { useState } from "react";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
ChartJS.register(ArcElement, Tooltip, Legend);

function daysLeft(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(due) - today) / 86400000);
}

const CAT_COLOR_FIXED = { 공부: "#378ADD", 개발: "#7F77DD", 일상: "#639922" };
const CAT_COLOR_PALETTE = ["#E28B4A", "#4A9E88", "#D45E8B", "#8BAA33", "#C25E5E", "#5E8BC2", "#AA7ACC"];

function getCatColor(cat, index) {
  return CAT_COLOR_FIXED[cat] ?? CAT_COLOR_PALETTE[index % CAT_COLOR_PALETTE.length];
}

export default function StatsPanel({ todos, theme, onMenuClick }) {
  const [expandedCat, setExpandedCat] = useState(null);
  const cats = [...new Set(todos.map(t => t.cat).filter(Boolean))];
  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const remain = total - done;
  const urgent = todos.filter(t => !t.completed && daysLeft(t.due) !== null && daysLeft(t.due) <= 2).length;
  const rate = total ? Math.round(done / total * 100) : 0;

  const doughnutData = {
    labels: ["완료", "남은 할 일"],
    datasets: [{
      data: [done || 0.001, remain || 0.001],
      backgroundColor: ["#7ec85e", "#F4C0D1"],
      borderWidth: 0,
      hoverOffset: 4,
    }],
  };

  const centerTextPlugin = {
    id: "centerText",
    afterDraw(chart) {
      const { ctx, chartArea: { width, height, left, top } } = chart;
      ctx.save();
      ctx.font = "500 28px Pretendard, sans-serif";
      ctx.fillStyle = theme.main;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(`${rate}%`, left + width / 2, top + height / 2 - 10);
      ctx.font = "13px Pretendard, sans-serif";
      ctx.fillStyle = "#bbb";
      ctx.fillText("달성률", left + width / 2, top + height / 2 + 14);
      ctx.restore();
    },
  };

  return (
    <div className="px-5 pt-7 pb-6" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      <h2 className="mb-6 flex items-center gap-3">
        <button onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-base flex-shrink-0"
          style={{ background: theme.light, color: theme.main, border: `1px solid ${theme.border}` }}>
          ☰
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color: theme.main }}>통계</span>
          <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: theme.border, letterSpacing: 0.5 }}>Statistics</span>
        </div>
      </h2>

      {/* 수치 카드 */}
      <div className="grid grid-cols-4 gap-2 mb-5">
        {[
          { label: "전체", value: total, color: theme.main },
          { label: "완료", value: done, color: "#7ec85e" },
          { label: "진행중", value: remain, color: "#e8789e" },
          { label: "마감임박", value: urgent, color: "#E24B4A" },
        ].map(s => (
          <div key={s.label} className="rounded-2xl p-3 text-center"
            style={{ background: "white", boxShadow: `0 2px 10px ${theme.border}` }}>
            <div className="text-xl font-medium" style={{ color: s.color }}>{s.value}</div>
            <div className="text-xs mt-1" style={{ color: theme.border }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* 2분할: 왼쪽 도넛 차트 / 오른쪽 카테고리 */}
      <div className="grid grid-cols-2 gap-4">
        {/* 왼쪽: 도넛 차트 + 범례 */}
        <div className="flex flex-col items-center justify-center">
          <div className="relative mb-3" style={{ width: "100%", maxWidth: 200, aspectRatio: "1" }}>
            <Doughnut
              data={doughnutData}
              options={{
                responsive: true,
                maintainAspectRatio: true,
                cutout: "72%",
                plugins: { legend: { display: false }, tooltip: {
                  callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}개` }
                }},
              }}
              plugins={[centerTextPlugin]}
            />
          </div>
          <div className="flex flex-col gap-1.5 text-xs" style={{ color: "#999" }}>
            {[["#7ec85e", `완료 ${rate}%`], ["#F4C0D1", `나머지 ${100 - rate}%`]].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: color }} />
                {label}
              </span>
            ))}
            {urgent > 0 && (
              <span className="flex items-center gap-1.5">
                <span className="inline-block w-2.5 h-2.5 rounded-sm flex-shrink-0" style={{ background: "#E24B4A" }} />
                마감임박 {urgent}개
              </span>
            )}
          </div>
        </div>

        {/* 오른쪽: 카테고리별 */}
        <div className="flex flex-col gap-2 justify-center">
          {cats.map((cat, catIndex) => {
            const color = getCatColor(cat, catIndex);
            const ct = todos.filter(t => t.cat === cat).length;
            const cd = todos.filter(t => t.cat === cat && t.completed).length;
            const cp = ct ? Math.round(cd / ct * 100) : 0;
            const isOpen = expandedCat === cat;
            const catTodos = todos.filter(t => t.cat === cat);
            return (
              <div key={cat}>
                <div
                  className="flex items-center gap-2 bg-white rounded-xl px-3 py-2 border cursor-pointer select-none"
                  style={{ borderColor: theme.border }}
                  onClick={() => setExpandedCat(isOpen ? null : cat)}
                >
                  <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
                  <span className="text-xs truncate flex-1 min-w-0" style={{ color: "#888" }}>{cat}</span>
                  <div className="w-10 h-1.5 rounded-full flex-shrink-0" style={{ background: theme.border }}>
                    <div className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${cp}%`, background: color }} />
                  </div>
                  <span className="text-xs flex-shrink-0 font-medium w-8 text-right" style={{ color }}>{cp}%</span>
                  <span className="text-xs flex-shrink-0" style={{ color: "#bbb" }}>{isOpen ? "▲" : "▼"}</span>
                </div>
                {isOpen && (
                  <div className="mt-1 rounded-xl border overflow-hidden" style={{ borderColor: theme.border }}>
                    {catTodos.length === 0 ? (
                      <div className="px-3 py-2 text-xs text-center" style={{ color: "#bbb" }}>일정이 없습니다</div>
                    ) : (
                      catTodos.map(todo => (
                        <div key={todo._id} className="flex items-center gap-2 px-3 py-2 bg-white border-b last:border-b-0"
                          style={{ borderColor: theme.border }}>
                          <span className="text-xs flex-shrink-0" style={{ color: todo.completed ? "#7ec85e" : "#e8789e" }}>
                            {todo.completed ? "✓" : "○"}
                          </span>
                          <span className="text-xs flex-1 truncate" style={{ color: todo.completed ? "#aaa" : "#555", textDecoration: todo.completed ? "line-through" : "none" }}>
                            {todo.title}
                          </span>
                          {todo.due && (
                            <span className="text-xs flex-shrink-0" style={{ color: "#bbb" }}>
                              {new Date(todo.due).toLocaleDateString("ko-KR", { month: "numeric", day: "numeric" })}
                            </span>
                          )}
                        </div>
                      ))
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}