import { useState } from "react";

function daysLeft(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return Math.ceil((new Date(due) - today) / 86400000);
}

const CAT_STYLE = {
  공부: { bg: "#B5D4F4", text: "#0C447C" },
  개발: { bg: "#CECBF6", text: "#3C3489" },
  일상: { bg: "#C0DD97", text: "#27500A" },
};

export default function CalendarPanel({ todos, theme, onMenuClick }) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [selectedDay, setSelectedDay] = useState(null);

  const first = new Date(year, month, 1).getDay();
  const last = new Date(year, month + 1, 0).getDate();

  const dueDays = new Set(
    todos.filter(t => t.due).map(t => {
      const d = new Date(t.due);
      return d.getFullYear() === year && d.getMonth() === month ? d.getDate() : null;
    }).filter(Boolean)
  );

  const changeMonth = (dir) => {
    let m = month + dir, y = year;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setMonth(m); setYear(y); setSelectedDay(null);
  };

  const selectedTodos = selectedDay
    ? todos.filter(t => {
        const ds = `${year}-${String(month + 1).padStart(2,"0")}-${String(selectedDay).padStart(2,"0")}`;
        return t.due && t.due.startsWith(ds);
      })
    : [];

  return (
    <div className="px-5 pt-7 pb-6" style={{ fontFamily: "'Pretendard', sans-serif" }}>
      <h2 className="mb-6 flex items-center gap-3">
        <button onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 rounded-xl text-base flex-shrink-0"
          style={{ background: theme.light, color: theme.main, border: `1px solid ${theme.border}` }}>
          ☰
        </button>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold" style={{ color: theme.main }}>달력</span>
          <span style={{ fontFamily: "'Dancing Script', cursive", fontSize: 22, color: theme.border, letterSpacing: 0.5 }}>Calendar</span>
        </div>
      </h2>

      <div className="bg-white rounded-2xl p-4 border mb-4 w-2/3 mx-auto" style={{ borderColor: theme.border }}>
        <div className="flex justify-between items-center mb-4 text-sm" style={{ color: theme.main }}>
          <button onClick={() => changeMonth(-1)} className="px-2 py-1">◀</button>
          <span className="font-medium">{year}년 {month + 1}월</span>
          <button onClick={() => changeMonth(1)} className="px-2 py-1">▶</button>
        </div>

        <div className="grid grid-cols-7 text-center mb-1">
          {["일","월","화","수","목","금","토"].map(d => (
            <div key={d} className="text-xs py-1" style={{ color: theme.border }}>{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1 text-center">
          {Array(first).fill(null).map((_, i) => <div key={`e${i}`} />)}
          {Array(last).fill(null).map((_, i) => {
            const d = i + 1;
            const isToday = d === now.getDate() && month === now.getMonth() && year === now.getFullYear();
            const hasDue = dueDays.has(d);
            const isSelected = selectedDay === d;
            return (
              <div key={d} onClick={() => setSelectedDay(d)}
                className="relative flex items-center justify-center cursor-pointer py-1 transition-colors rounded-lg"
                style={{
                  background: isSelected && !isToday ? theme.light : "transparent",
                }}>
                <span className="flex items-center justify-center text-sm w-7 h-7 rounded-full"
                  style={{
                    background: isToday ? theme.main : "transparent",
                    color: isToday ? "white" : hasDue ? theme.main : "#888",
                    fontWeight: hasDue ? 500 : 400,
                  }}>
                  {d}
                </span>
                {hasDue && (
                  <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                    style={{ background: isToday ? "white" : theme.main }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* 선택한 날 할 일 */}
      {selectedDay ? (
        <div className="w-2/3 mx-auto">
          <p className="text-xs mb-2 font-medium" style={{ color: theme.main }}>
            {month + 1}월 {selectedDay}일 마감
          </p>
          {selectedTodos.length === 0 ? (
            <p className="text-xs text-center py-4" style={{ color: theme.border }}>마감 할 일 없음</p>
          ) : selectedTodos.map(todo => {
            const d = daysLeft(todo.due);
            const urgent = !todo.completed && d !== null && d <= 0;
            const warn = !todo.completed && d !== null && d <= 2 && d > 0;
            return (
              <div key={todo._id}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border mb-2"
                style={{
                  borderColor: todo.completed ? "#C0DD97" : urgent ? "#E24B4A" : warn ? "#EF9F27" : theme.border,
                  background: todo.completed ? "#f4fbea" : urgent ? "#fff5f5" : warn ? "#fffbf0" : "white",
                }}>
                <span className="flex-1 text-sm" style={{
                  color: todo.completed ? "#bbb" : "#555",
                  textDecoration: todo.completed ? "line-through" : "none",
                }}>
                  {todo.title}
                </span>
                {todo.cat && (
                  <span className="text-xs px-2 py-0.5 rounded-full"
                    style={{ background: CAT_STYLE[todo.cat]?.bg, color: CAT_STYLE[todo.cat]?.text }}>
                    {todo.cat}
                  </span>
                )}
                {urgent && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FCEBEB", color: "#791F1F" }}>초과</span>}
                {warn && <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: "#FAEEDA", color: "#633806" }}>D-{d}</span>}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-xs text-center w-2/3 mx-auto" style={{ color: theme.border }}>
          날짜를 클릭하면 마감 할 일을 확인해요
        </p>
      )}
    </div>
  );
}