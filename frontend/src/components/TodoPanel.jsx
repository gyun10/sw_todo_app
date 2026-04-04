import { useState } from "react";
import AddTodoModal from "./AddTodoModal";
import TodoDetailModal from "./TodoDetailModal";

function daysLeft(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due); dueDate.setHours(0, 0, 0, 0);
  return Math.round((dueDate - today) / 86400000);
}

function formatDue(due) {
  if (!due) return null;
  const d = new Date(due);
  const mm = d.getMonth() + 1;
  const dd = d.getDate();
  const h = d.getHours();
  const min = String(d.getMinutes()).padStart(2, "0");
  const ampm = h < 12 ? "오전" : "오후";
  return `${mm}/${dd} ${ampm} ${h % 12 || 12}:${min}`;
}

function greeting() {
  const h = new Date().getHours();
  if (h < 12) return "좋은 아침이에요 ☀️";
  if (h < 18) return "오늘도 화이팅이에요 💪";
  return "수고하셨어요 🌙";
}

export default function TodoPanel({ todos, addTodo, toggleTodo, updateTodo, deleteTodo, theme, onMenuClick, categories = [] }) {
  const [filter, setFilter] = useState("전체");
  const [modalOpen, setModalOpen] = useState(false);
  const [detailTodo, setDetailTodo] = useState(null);

  const total = todos.length;
  const done = todos.filter(t => t.completed).length;
  const remain = total - done;
  const urgent = todos.filter(t => !t.completed && daysLeft(t.due) !== null && daysLeft(t.due) <= 2).length;
  const rate = total ? Math.round(done / total * 100) : 0;

  const filtered = [...todos]
    .sort((a, b) => {
      if (a.completed !== b.completed) return a.completed ? 1 : -1;
      return (daysLeft(a.due) ?? 999) - (daysLeft(b.due) ?? 999);
    })
    .filter(t => {
      if (filter === "진행중") return !t.completed;
      if (filter === "완료") return t.completed;
      if (filter === "마감임박") {
        const d = daysLeft(t.due);
        return !t.completed && d !== null && d <= 2;
      }
      return true;
    });

  return (
    <div className="flex flex-col min-h-screen relative" style={{ fontFamily: "'Pretendard', sans-serif" }}>

      {/* 헤더 배너 */}
      <div className="relative overflow-hidden px-5 pt-5 pb-7 flex-shrink-0"
        style={{ background: theme.main }}>

        {[
          { w:160, h:160, top:-60, right:-40 },
          { w:80,  h:80,  top:20,  right:80  },
          { w:50,  h:50,  bottom:-10, right:30 },
        ].map((s, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width:s.w, height:s.h, top:s.top, bottom:s.bottom,
              right:s.right, background:"rgba(255,255,255,0.08)" }} />
        ))}

        <button onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 rounded-xl mb-3 text-base"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none",
            fontFamily: "'Pretendard', sans-serif" }}>
          ☰
        </button>

        <p className="text-xs mb-1" style={{ color: "rgba(255,255,255,0.75)" }}>{greeting()}</p>
        <p className="text-lg font-medium mb-4" style={{ color: "white" }}>오늘의 할 일 ✨</p>

        <div className="flex gap-2 mb-4">
          {[
            { label: "전체", value: total },
            { label: "완료", value: done },
            { label: "남은 할 일", value: remain },
            { label: "마감임박", value: urgent, highlight: true },
          ].map(s => (
            <div key={s.label} className="flex-1 rounded-xl py-2 text-center"
              style={{ background: s.highlight ? "rgba(255,255,255,0.28)" : "rgba(255,255,255,0.18)" }}>
              <div className="text-lg font-medium" style={{ color: "white" }}>{s.value}</div>
              <div className="text-xs mt-0.5" style={{ color: "rgba(255,255,255,0.75)" }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div>
          <div className="flex justify-between text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.8)" }}>
            <span>달성률</span><span>{rate}%</span>
          </div>
          <div className="h-1.5 rounded-full" style={{ background: "rgba(255,255,255,0.25)" }}>
            <div className="h-full rounded-full transition-all duration-500"
              style={{ width: `${rate}%`, background: "white" }} />
          </div>
        </div>
      </div>

      {/* 콘텐츠 */}
      <div className="flex-1 px-5 pt-4 pb-6" style={{ background: theme.light }}>
        <div className="flex items-center gap-2 mb-4 flex-wrap">
          {["전체","진행중","완료","마감임박"].map(f => (
            <button key={f} onClick={() => setFilter(f)}
              className="px-3 py-1 rounded-full text-xs border-2 transition-colors"
              style={{
                borderColor: filter === f ? theme.main : "transparent",
                background: filter === f ? theme.light : "white",
                color: filter === f ? theme.main : "#aaa",
                fontFamily: "'Pretendard', sans-serif",
              }}>
              {f === "마감임박" ? "⚠ " : ""}{f}
            </button>
          ))}
          <button onClick={() => setModalOpen(true)}
            className="ml-auto flex items-center gap-1.5 px-4 py-1.5 rounded-full text-xs font-medium text-white"
            style={{ background: theme.main, fontFamily: "'Pretendard', sans-serif" }}>
            <span style={{ fontSize: 15, lineHeight: 1 }}>+</span> 일정 추가
          </button>
        </div>

        <div className="flex flex-col gap-2">
          {filtered.length === 0 && (
            <div className="text-center py-10 text-sm" style={{ color: theme.border }}>
              할 일이 없어요 🎉
            </div>
          )}
          {filtered.map(todo => {
            const d = daysLeft(todo.due);
            const isUrgent = !todo.completed && d !== null && d <= 0;
            const isWarn = !todo.completed && d !== null && d > 0 && d <= 2;
            return (
              <div key={todo._id}
                className="flex items-center gap-2 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer"
                style={{
                  borderColor: todo.completed ? "#C0DD97" : isUrgent ? "#E24B4A" : isWarn ? "#EF9F27" : theme.border,
                  background: todo.completed ? "#f4fbea" : isUrgent ? "#fff5f5" : isWarn ? "#fffbf0" : "white",
                }}
                onClick={() => setDetailTodo(todo)}
              >
                <button onClick={e => { e.stopPropagation(); toggleTodo(todo._id, todo.completed); }}
                  className="w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs flex-shrink-0"
                  style={{
                    borderColor: todo.completed ? "#7ec85e" : isUrgent ? "#E24B4A" : theme.border,
                    background: todo.completed ? "#7ec85e" : "white",
                    color: "white",
                  }}>
                  {todo.completed && "✓"}
                </button>

                <div className="flex-1 min-w-0">
                  <p className="text-sm" style={{
                    color: todo.completed ? "#bbb" : "#555",
                    textDecoration: todo.completed ? "line-through" : "none",
                  }}>{todo.title}</p>
                  {todo.due && (
                    <p className="text-xs mt-0.5" style={{ color: isUrgent ? "#E24B4A" : isWarn ? "#EF9F27" : "#ccc" }}>
                      {formatDue(todo.due)}
                    </p>
                  )}
                </div>

                {/* D-day 뱃지 */}
                {todo.due && !todo.completed && (() => {
                  if (d < 0)  return <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:"#FCEBEB", color:"#791F1F" }}>D+{Math.abs(d)}</span>;
                  if (d === 0) return <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:"#FCEBEB", color:"#791F1F" }}>오늘</span>;
                  if (d <= 2)  return <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:"#FAEEDA", color:"#633806" }}>D-{d}</span>;
                  return <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{ background:"#EAF3DE", color:"#3B6D11" }}>D-{d}</span>;
                })()}

                {todo.cat && (() => {
                  const CAT_BG = { 공부:"#B5D4F4", 개발:"#CECBF6", 일상:"#C0DD97" };
                  const CAT_TX = { 공부:"#0C447C", 개발:"#3C3489", 일상:"#27500A" };
                  return (
                    <span className="text-xs px-2 py-0.5 rounded-full flex-shrink-0" style={{
                      background: CAT_BG[todo.cat] || "#E8E8F0",
                      color: CAT_TX[todo.cat] || "#555",
                    }}>{todo.cat}</span>
                  );
                })()}

                <button onClick={e => { e.stopPropagation(); deleteTodo(todo._id); }}
                  className="w-6 h-6 rounded-full text-xs flex items-center justify-center flex-shrink-0"
                  style={{ background: "#fde8e8", color: "#e24b4a" }}>✕</button>
              </div>
            );
          })}
        </div>
      </div>

      <AddTodoModal isOpen={modalOpen} onClose={() => setModalOpen(false)} onAdd={(title, cat, due) => {
        addTodo(title, cat, due);
      }} theme={theme} categories={categories} />

      {detailTodo && (
        <TodoDetailModal
          todo={todos.find(t => t._id === detailTodo._id) ?? detailTodo}
          onClose={() => setDetailTodo(null)}
          onToggle={(id, completed) => toggleTodo(id, completed)}
          onDelete={(id) => { deleteTodo(id); setDetailTodo(null); }}
          onUpdate={updateTodo}
          theme={theme}
        />
      )}
    </div>
  );
}
