import { useState } from "react";

const DAYS = ["일", "월", "화", "수", "목", "금", "토"];

function parseValue(value) {
  const d = value ? new Date(value) : new Date();
  const h = d.getHours();
  return {
    year: d.getFullYear(),
    month: d.getMonth(),
    day: d.getDate(),
    hour12: h % 12 || 12,
    minute: Math.round(d.getMinutes() / 5) * 5 % 60,
    ampm: h < 12 ? "오전" : "오후",
  };
}

function toISO({ year, month, day, hour12, minute, ampm }) {
  let h = hour12;
  if (ampm === "오후" && hour12 !== 12) h = hour12 + 12;
  if (ampm === "오전" && hour12 === 12) h = 0;
  return `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}T${String(h).padStart(2, "0")}:${String(minute).padStart(2, "0")}`;
}

function formatDisplay(value) {
  if (!value) return "날짜 / 시간 선택";
  const d = new Date(value);
  const h = d.getHours();
  const ampm = h < 12 ? "오전" : "오후";
  const h12 = h % 12 || 12;
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 ${ampm} ${h12}:${String(d.getMinutes()).padStart(2, "0")}`;
}

export default function DateTimePicker({ value, onChange, theme }) {
  const [open, setOpen] = useState(false);
  const [sel, setSel] = useState(() => parseValue(value));
  const [viewYear, setViewYear] = useState(sel.year);
  const [viewMonth, setViewMonth] = useState(sel.month);

  function handleOpen() {
    if (!open) {
      const p = parseValue(value);
      setSel(p);
      setViewYear(p.year);
      setViewMonth(p.month);
    }
    setOpen(o => !o);
  }

  function update(next) {
    setSel(next);
    onChange(toISO(next));
  }

  function changeMonth(dir) {
    let m = viewMonth + dir, y = viewYear;
    if (m > 11) { m = 0; y++; }
    if (m < 0) { m = 11; y--; }
    setViewYear(y);
    setViewMonth(m);
  }

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const today = new Date();

  function isToday(d) {
    return d === today.getDate() && viewMonth === today.getMonth() && viewYear === today.getFullYear();
  }
  function isSelected(d) {
    return d === sel.day && viewMonth === sel.month && viewYear === sel.year;
  }

  function adjHour(dir) {
    const h = (sel.hour12 - 1 + dir + 12) % 12 + 1;
    update({ ...sel, hour12: h });
  }

  function adjMinute(dir) {
    const m = (sel.minute + dir * 5 + 60) % 60;
    update({ ...sel, minute: m });
  }

  return (
    <div>
      {/* 표시 버튼 */}
      <button
        type="button"
        onClick={handleOpen}
        className="w-full px-3 py-2.5 rounded-xl border text-sm text-left flex items-center justify-between"
        style={{
          borderColor: open ? theme.main : theme.border,
          color: value ? "#555" : "#aaa",
          fontFamily: "'Pretendard', sans-serif",
          background: "white",
        }}
      >
        <span>{formatDisplay(value)}</span>
        <span style={{ color: theme.border, fontSize: 10 }}>{open ? "▲" : "▼"}</span>
      </button>

      {open && (
        <div className="mt-2 rounded-2xl border p-3" style={{ borderColor: theme.border, background: "#fff" }}>
          {/* 월 네비게이션 */}
          <div className="flex items-center justify-between mb-2">
            <button onClick={() => changeMonth(-1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: "#f5f5f5", color: theme.main }}>◀</button>
            <span className="text-sm font-medium" style={{ color: theme.main }}>
              {viewYear}년 {viewMonth + 1}월
            </span>
            <button onClick={() => changeMonth(1)}
              className="w-7 h-7 rounded-full flex items-center justify-center text-xs"
              style={{ background: "#f5f5f5", color: theme.main }}>▶</button>
          </div>

          {/* 요일 헤더 */}
          <div className="grid grid-cols-7 text-center mb-1">
            {DAYS.map(d => (
              <div key={d} className="text-xs py-1" style={{ color: theme.border }}>{d}</div>
            ))}
          </div>

          {/* 날짜 그리드 */}
          <div className="grid grid-cols-7 gap-y-0.5 text-center mb-4">
            {Array(firstDay).fill(null).map((_, i) => <div key={`e${i}`} />)}
            {Array(daysInMonth).fill(null).map((_, i) => {
              const d = i + 1;
              const selected = isSelected(d);
              const tod = isToday(d);
              return (
                <div
                  key={d}
                  onClick={() => update({ ...sel, year: viewYear, month: viewMonth, day: d })}
                  className="mx-auto w-7 h-7 flex items-center justify-center rounded-full text-xs cursor-pointer"
                  style={{
                    background: selected ? theme.main : tod ? theme.light : "transparent",
                    color: selected ? "white" : tod ? theme.main : "#555",
                    fontWeight: selected || tod ? 600 : 400,
                    border: tod && !selected ? `1px solid ${theme.border}` : "none",
                  }}
                >
                  {d}
                </div>
              );
            })}
          </div>

          {/* 시간 선택 */}
          <div className="flex items-center justify-center gap-4 pt-3 border-t"
            style={{ borderColor: theme.border }}>

            {/* 오전/오후 */}
            <button
              onClick={() => update({ ...sel, ampm: sel.ampm === "오전" ? "오후" : "오전" })}
              className="px-3 py-1.5 rounded-xl text-xs font-medium min-w-[52px]"
              style={{ background: theme.light, color: theme.main, border: `1.5px solid ${theme.border}` }}
            >
              {sel.ampm}
            </button>

            {/* 시 */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => adjHour(-1)}
                className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
                style={{ background: "#f0f0f0", color: "#666" }}>◀</button>
              <span className="w-5 text-center text-sm font-semibold" style={{ color: "#333" }}>
                {String(sel.hour12).padStart(2, "0")}
              </span>
              <button onClick={() => adjHour(1)}
                className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
                style={{ background: "#f0f0f0", color: "#666" }}>▶</button>
            </div>

            <span className="text-base font-bold" style={{ color: "#bbb" }}>:</span>

            {/* 분 */}
            <div className="flex items-center gap-1.5">
              <button onClick={() => adjMinute(-1)}
                className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
                style={{ background: "#f0f0f0", color: "#666" }}>◀</button>
              <span className="w-5 text-center text-sm font-semibold" style={{ color: "#333" }}>
                {String(sel.minute).padStart(2, "0")}
              </span>
              <button onClick={() => adjMinute(1)}
                className="w-6 h-6 rounded-full text-xs flex items-center justify-center"
                style={{ background: "#f0f0f0", color: "#666" }}>▶</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
