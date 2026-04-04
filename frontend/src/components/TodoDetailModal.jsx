import { useState, useEffect } from "react";
import DateTimePicker from "./DateTimePicker";

const CAT_COLORS = {
  공부: { bg: "#B5D4F4", text: "#0C447C" },
  개발: { bg: "#CECBF6", text: "#3C3489" },
  일상: { bg: "#C0DD97", text: "#27500A" },
};

function catStyle(cat) {
  return CAT_COLORS[cat] || { bg: "#E8E8F0", text: "#555" };
}

function daysLeft(due) {
  if (!due) return null;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const dueDate = new Date(due); dueDate.setHours(0, 0, 0, 0);
  return Math.round((dueDate - today) / 86400000);
}

function formatCreated(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일`;
}

export default function TodoDetailModal({ todo, onClose, onToggle, onDelete, onUpdate, theme }) {
  const [notes, setNotes] = useState(todo?.notes || "");
  const [notesDirty, setNotesDirty] = useState(false);
  const [due, setDue] = useState(todo?.due || "");
  const [dueDirty, setDueDirty] = useState(false);

  useEffect(() => {
    setNotes(todo?.notes || "");
    setNotesDirty(false);
    setDue(todo?.due || "");
    setDueDirty(false);
  }, [todo?._id]);

  if (!todo) return null;

  const d = daysLeft(due);
  const isUrgent = !todo.completed && d !== null && d <= 0;
  const isWarn = !todo.completed && d !== null && d > 0 && d <= 2;
  const cs = catStyle(todo.cat);

  function handleSaveNotes() {
    onUpdate(todo._id, { notes });
    setNotesDirty(false);
  }

  function handleDueChange(val) {
    setDue(val);
    setDueDirty(true);
  }

  function handleSaveDue() {
    onUpdate(todo._id, { due });
    setDueDirty(false);
  }

  function handleDelete() {
    onDelete(todo._id);
    onClose();
  }

  return (
    <div
      className="fixed inset-0 flex items-end justify-center z-50"
      style={{ background: "rgba(0,0,0,0.3)" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white w-full max-w-md rounded-t-3xl p-6 pb-8"
        style={{ maxHeight: "90vh", overflowY: "auto" }}
      >
        {/* 핸들 바 */}
        <div className="w-10 h-1 rounded-full mx-auto mb-5" style={{ background: "#ddd" }} />

        {/* 상태 + 제목 */}
        <div className="flex items-start gap-3 mb-4">
          <button
            onClick={() => onToggle(todo._id, todo.completed)}
            className="mt-0.5 w-7 h-7 rounded-full border-2 flex items-center justify-center text-sm flex-shrink-0"
            style={{
              borderColor: todo.completed ? "#7ec85e" : theme.main,
              background: todo.completed ? "#7ec85e" : "white",
              color: "white",
            }}
          >
            {todo.completed && "✓"}
          </button>
          <h2
            className="text-lg font-medium leading-snug flex-1"
            style={{
              color: todo.completed ? "#bbb" : "#333",
              textDecoration: todo.completed ? "line-through" : "none",
            }}
          >
            {todo.title}
          </h2>
        </div>

        {/* 뱃지 */}
        <div className="flex flex-wrap gap-2 mb-5">
          {todo.cat && (
            <span className="text-xs px-3 py-1 rounded-full font-medium"
              style={{ background: cs.bg, color: cs.text }}>
              {todo.cat}
            </span>
          )}
          <span className="text-xs px-3 py-1 rounded-full font-medium"
            style={{
              background: todo.completed ? "#f0fbea" : "#f5f5f5",
              color: todo.completed ? "#3e8a1e" : "#888",
            }}>
            {todo.completed ? "✓ 완료" : "진행중"}
          </span>
          {due && !todo.completed && (() => {
            if (d < 0)  return <span key="d" className="text-xs px-3 py-1 rounded-full font-medium" style={{ background:"#FCEBEB", color:"#791F1F" }}>D+{Math.abs(d)} 초과</span>;
            if (d === 0) return <span key="d" className="text-xs px-3 py-1 rounded-full font-medium" style={{ background:"#FCEBEB", color:"#791F1F" }}>오늘 마감</span>;
            if (d <= 2)  return <span key="d" className="text-xs px-3 py-1 rounded-full font-medium" style={{ background:"#FAEEDA", color:"#633806" }}>D-{d} 마감임박</span>;
            return <span key="d" className="text-xs px-3 py-1 rounded-full font-medium" style={{ background:"#EAF3DE", color:"#3B6D11" }}>D-{d}</span>;
          })()}
        </div>

        {/* 마감 일시 편집 */}
        <div className="mb-3">
          <div className="flex items-center justify-between mb-1.5">
            <label className="text-xs font-medium" style={{ color: theme.border }}>마감 일시</label>
            {dueDirty && (
              <button
                onClick={handleSaveDue}
                className="text-xs px-3 py-1 rounded-full text-white"
                style={{ background: theme.main }}
              >
                저장
              </button>
            )}
          </div>
          <DateTimePicker
            value={due}
            onChange={handleDueChange}
            theme={isUrgent ? { ...theme, main: "#E24B4A", light: "#fff5f5", border: "#f5c0c0" } : isWarn ? { ...theme, main: "#BA7517", light: "#fffbf0", border: "#FAC775" } : theme}
          />
        </div>

        {/* 등록일 */}
        {todo.createdAt && (
          <div className="bg-gray-50 rounded-2xl p-4 mb-3">
            <p className="text-xs mb-1" style={{ color: theme.border }}>등록일</p>
            <p className="text-sm" style={{ color: "#555" }}>{formatCreated(todo.createdAt)}</p>
          </div>
        )}

        {/* 메모 */}
        <div className="mb-5">
          <label className="text-xs font-medium mb-1.5 block" style={{ color: theme.border }}>
            메모
          </label>
          <textarea
            value={notes}
            onChange={e => { setNotes(e.target.value); setNotesDirty(true); }}
            placeholder="메모를 입력하세요..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none resize-none"
            style={{
              borderColor: notesDirty ? theme.main : theme.border,
              fontFamily: "'Pretendard', sans-serif",
              color: "#555",
            }}
          />
          {notesDirty && (
            <button
              onClick={handleSaveNotes}
              className="mt-1.5 text-xs px-3 py-1 rounded-full text-white"
              style={{ background: theme.main }}
            >
              저장
            </button>
          )}
        </div>

        {/* 액션 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={handleDelete}
            className="flex-1 py-3 rounded-2xl text-sm font-medium"
            style={{ background: "#fde8e8", color: "#e24b4a" }}
          >
            삭제
          </button>
          <button
            onClick={() => onToggle(todo._id, todo.completed)}
            className="py-3 rounded-2xl text-sm font-medium text-white"
            style={{ flex: 2, background: todo.completed ? "#aaa" : theme.main }}
          >
            {todo.completed ? "다시 진행" : "완료 처리"}
          </button>
        </div>
      </div>
    </div>
  );
}
