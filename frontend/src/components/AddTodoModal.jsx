import { useState } from "react";
import DateTimePicker from "./DateTimePicker";

const DEFAULT_CATS = ["공부", "개발", "일상"];

function nowDT() {
  const d = new Date();
  d.setSeconds(0, 0);
  return d.toISOString().slice(0, 16);
}

export default function AddTodoModal({ isOpen, onClose, onAdd, theme, categories = DEFAULT_CATS }) {
  const [title, setTitle] = useState("");
  const [cat, setCat] = useState(categories[0] ?? "공부");
  const [due, setDue] = useState(nowDT());

  const isPreset = categories.includes(cat);

  function handleSave() {
    if (!title.trim()) return;
    onAdd(title.trim(), cat.trim() || "일상", due || null);
    setTitle(""); setCat(categories[0] ?? "공부"); setDue(nowDT());
    onClose();
  }

  function handleKeyDown(e) {
    if (e.key === "Enter") handleSave();
    if (e.key === "Escape") onClose();
  }

  if (!isOpen) return null;

  return (
    <div
      className="absolute inset-0 flex items-center justify-center z-10"
      style={{ background: "rgba(180,100,130,0.15)", borderRadius: "20px" }}
      onClick={e => e.target === e.currentTarget && onClose()}
    >
      <div
        className="bg-white rounded-2xl p-6 w-80 border"
        style={{ borderColor: theme.border }}
      >
        <h3 className="text-base font-medium mb-5" style={{ color: theme.main }}>
          새 일정 추가
        </h3>

        {/* 일정 이름 */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: theme.border }}>
            일정 이름
          </label>
          <input
            autoFocus
            value={title}
            onChange={e => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="무엇을 할 건가요?"
            className="w-full px-3 py-2.5 rounded-xl border text-sm outline-none"
            style={{
              borderColor: theme.border,
              fontFamily: "'Pretendard', sans-serif",
              color: "#555",
            }}
          />
        </div>

        {/* 카테고리 */}
        <div className="mb-4">
          <label className="block text-xs font-medium mb-1.5" style={{ color: theme.border }}>
            카테고리
          </label>
          {/* 프리셋 */}
          <div className="flex gap-2 mb-2 flex-wrap">
            {categories.map(name => (
              <button
                key={name}
                onClick={() => setCat(name)}
                className="px-3 py-1.5 rounded-xl border text-xs transition-all"
                style={{
                  borderColor: cat === name ? theme.main : theme.border,
                  background: cat === name ? theme.light : "white",
                  color: cat === name ? theme.main : "#999",
                  fontFamily: "'Pretendard', sans-serif",
                  fontWeight: cat === name ? 500 : 400,
                }}
              >
                {name}
              </button>
            ))}
          </div>
          {/* 직접 입력 */}
          <input
            value={isPreset ? "" : cat}
            onChange={e => setCat(e.target.value)}
            onFocus={() => { if (isPreset) setCat(""); }}
            placeholder="직접 입력..."
            className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
            style={{
              borderColor: !isPreset && cat ? theme.main : theme.border,
              fontFamily: "'Pretendard', sans-serif",
              color: "#555",
            }}
          />
        </div>

        {/* 마감 일시 */}
        <div className="mb-5">
          <label className="block text-xs font-medium mb-1.5" style={{ color: theme.border }}>
            마감 일시
          </label>
          <DateTimePicker value={due} onChange={setDue} theme={theme} />
        </div>

        {/* 버튼 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl border text-sm"
            style={{
              borderColor: theme.border,
              color: "#bbb",
              fontFamily: "'Pretendard', sans-serif",
            }}
          >
            취소
          </button>
          <button
            onClick={handleSave}
            className="py-2.5 rounded-xl text-white text-sm font-medium"
            style={{
              flex: 2,
              background: title.trim() ? theme.main : "#f0c0d0",
              fontFamily: "'Pretendard', sans-serif",
              cursor: title.trim() ? "pointer" : "not-allowed",
            }}
          >
            추가하기
          </button>
        </div>
      </div>
    </div>
  );
}
