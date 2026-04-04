import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";
const CAT_COLORS_FIXED = { 공부: "#378ADD", 개발: "#7F77DD", 일상: "#639922" };
const CAT_PALETTE = ["#E28B4A", "#4A9E88", "#D45E8B", "#8BAA33", "#C25E5E", "#5E8BC2", "#AA7ACC"];

function catColor(cat, index) {
  return CAT_COLORS_FIXED[cat] ?? CAT_PALETTE[index % CAT_PALETTE.length];
}

export default function SettingsPanel({
  theme, themeName, setTheme, THEMES, onMenuClick,
  userEmail, customCategories = [], onCategoriesChange,
  onDeleteAccount, onLogout,
}) {
  const [pwOpen, setPwOpen] = useState(false);
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [pwMsg, setPwMsg] = useState({ text: "", ok: false });
  const [pwLoading, setPwLoading] = useState(false);

  const [newCat, setNewCat] = useState("");
  const [deleteConfirm, setDeleteConfirm] = useState(false);

  const allCategories = [...new Set(customCategories)];

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setPwLoading(true);
    setPwMsg({ text: "", ok: false });
    try {
      await axios.put(`${API}/api/auth/password`, { currentPassword: currentPw, newPassword: newPw });
      setPwMsg({ text: "비밀번호가 변경되었습니다.", ok: true });
      setCurrentPw(""); setNewPw(""); setPwOpen(false);
    } catch (err) {
      setPwMsg({ text: err.response?.data?.message || "오류가 발생했습니다.", ok: false });
    } finally {
      setPwLoading(false);
    }
  };

  const addCat = () => {
    const trimmed = newCat.trim();
    if (!trimmed || allCategories.includes(trimmed)) return;
    onCategoriesChange([...customCategories, trimmed]);
    setNewCat("");
  };

  const removeCat = (cat) => {
    onCategoriesChange(customCategories.filter(c => c !== cat));
  };

  return (
    <div className="flex flex-col min-h-screen" style={{ fontFamily: "'Pretendard', sans-serif" }}>

      {/* 헤더 배너 */}
      <div className="relative overflow-hidden px-5 pt-5 pb-6 flex-shrink-0" style={{ background: theme.main }}>
        {[
          { w: 160, h: 160, top: -60, right: -40 },
          { w: 80,  h: 80,  top: 20,  right: 80  },
          { w: 50,  h: 50,  bottom: -10, right: 30 },
        ].map((s, i) => (
          <div key={i} className="absolute rounded-full pointer-events-none"
            style={{ width: s.w, height: s.h, top: s.top, bottom: s.bottom,
              right: s.right, background: "rgba(255,255,255,0.08)" }} />
        ))}
        <button onClick={onMenuClick}
          className="flex items-center justify-center w-9 h-9 rounded-xl mb-3 text-base"
          style={{ background: "rgba(255,255,255,0.2)", color: "white", border: "none" }}>
          ☰
        </button>
        <p className="text-lg font-medium" style={{ color: "white" }}>⚙️ 설정</p>
      </div>

      <div className="flex-1 px-5 pt-5 pb-8">

      {/* 내 계정 */}
      <div className="bg-white rounded-2xl border mb-4 overflow-hidden" style={{ borderColor: theme.border }}>
        {/* 계정 정보 */}
        <div className="px-5 py-4 border-b" style={{ borderColor: theme.border }}>
          <p className="text-xs mb-3" style={{ color: theme.border }}>👤 내 계정</p>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-sm font-semibold flex-shrink-0"
              style={{ background: theme.main }}>
              {userEmail?.[0]?.toUpperCase() ?? "?"}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium truncate" style={{ color: "#555" }}>{userEmail}</p>
              <p className="text-xs mt-0.5" style={{ color: "#bbb" }}>로그인된 계정</p>
            </div>
          </div>
        </div>

        {/* 비밀번호 변경 */}
        <div className="px-5 py-3 border-b" style={{ borderColor: theme.border }}>
          <button
            className="w-full flex items-center justify-between text-sm"
            style={{ color: "#555" }}
            onClick={() => { setPwOpen(o => !o); setPwMsg({ text: "", ok: false }); }}
          >
            <span>🔑 비밀번호 변경</span>
            <span style={{ color: "#bbb", fontSize: 11 }}>{pwOpen ? "▲" : "▼"}</span>
          </button>
          {pwOpen && (
            <form onSubmit={handlePasswordChange} className="mt-3 flex flex-col gap-2">
              <input
                type="password"
                value={currentPw}
                onChange={e => setCurrentPw(e.target.value)}
                placeholder="현재 비밀번호"
                required
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{ borderColor: theme.border, color: "#555" }}
              />
              <input
                type="password"
                value={newPw}
                onChange={e => setNewPw(e.target.value)}
                placeholder="새 비밀번호 (6자 이상)"
                required
                minLength={6}
                className="w-full px-3 py-2 rounded-xl border text-xs outline-none"
                style={{ borderColor: theme.border, color: "#555" }}
              />
              {pwMsg.text && (
                <p className="text-xs" style={{ color: pwMsg.ok ? "#7ec85e" : "#e24b4a" }}>{pwMsg.text}</p>
              )}
              <button
                type="submit"
                disabled={pwLoading}
                className="py-2 rounded-xl text-xs font-medium text-white disabled:opacity-60"
                style={{ background: theme.main }}
              >
                {pwLoading ? "변경 중..." : "변경하기"}
              </button>
            </form>
          )}
        </div>

        {/* 로그아웃 */}
        <div className="px-5 py-3 border-b" style={{ borderColor: theme.border }}>
          <button onClick={onLogout} className="w-full text-left text-sm" style={{ color: "#555" }}>
            🚪 로그아웃
          </button>
        </div>

        {/* 계정 탈퇴 */}
        <div className="px-5 py-3">
          {!deleteConfirm ? (
            <button
              onClick={() => setDeleteConfirm(true)}
              className="w-full text-left text-sm"
              style={{ color: "#e24b4a" }}
            >
              🗑️ 계정 탈퇴
            </button>
          ) : (
            <div>
              <p className="text-xs mb-2" style={{ color: "#e24b4a" }}>
                정말 탈퇴하시겠습니까? 모든 할 일 데이터가 삭제됩니다.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setDeleteConfirm(false)}
                  className="flex-1 py-1.5 rounded-xl border text-xs"
                  style={{ borderColor: theme.border, color: "#999" }}
                >
                  취소
                </button>
                <button
                  onClick={onDeleteAccount}
                  className="flex-1 py-1.5 rounded-xl text-xs text-white"
                  style={{ background: "#e24b4a" }}
                >
                  탈퇴 확인
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 카테고리 관리 */}
      <div className="bg-white rounded-2xl border mb-4 p-5" style={{ borderColor: theme.border }}>
        <p className="text-xs mb-3" style={{ color: theme.border }}>🏷 카테고리 관리</p>
        <div className="flex flex-col gap-2 mb-3">
          {allCategories.map((cat, i) => (
            <div key={cat}
              className="flex items-center gap-2 px-3 py-2 rounded-xl border"
              style={{ borderColor: theme.border }}
            >
              <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: catColor(cat, i) }} />
              <span className="text-sm flex-1" style={{ color: "#555" }}>{cat}</span>
              <button
                onClick={() => removeCat(cat)}
                className="w-5 h-5 rounded-full flex items-center justify-center text-xs flex-shrink-0"
                style={{ background: "#fde8e8", color: "#e24b4a" }}
              >✕</button>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <input
            value={newCat}
            onChange={e => setNewCat(e.target.value)}
            onKeyDown={e => e.key === "Enter" && addCat()}
            placeholder="새 카테고리 이름"
            maxLength={12}
            className="flex-1 px-3 py-2 rounded-xl border text-xs outline-none"
            style={{ borderColor: newCat.trim() ? theme.main : theme.border, color: "#555" }}
          />
          <button
            onClick={addCat}
            disabled={!newCat.trim() || allCategories.includes(newCat.trim())}
            className="px-4 py-2 rounded-xl text-xs text-white font-medium disabled:opacity-40"
            style={{ background: theme.main }}
          >
            추가
          </button>
        </div>
        {newCat.trim() && allCategories.includes(newCat.trim()) && (
          <p className="text-xs mt-1.5" style={{ color: "#e24b4a" }}>이미 존재하는 카테고리입니다.</p>
        )}
      </div>

      {/* 테마 색상 */}
      <div className="bg-white rounded-2xl p-5 border mb-4" style={{ borderColor: theme.border }}>
        <p className="text-xs mb-3" style={{ color: theme.border }}>🎨 테마 색상</p>
        <div className="flex gap-2 flex-wrap">
          {Object.keys(THEMES).map(name => (
            <button key={name} onClick={() => setTheme(name)}
              className="px-4 py-1.5 rounded-full text-xs border-2 transition-colors"
              style={{
                borderColor: themeName === name ? theme.main : theme.border,
                background: themeName === name ? theme.light : "white",
                color: themeName === name ? theme.main : "#aaa",
                fontFamily: "'Pretendard', sans-serif",
              }}>
              {name === "핑크" ? "🌸" : name === "퍼플" ? "💜" : name === "민트" ? "🌿" : "🌼"} {name}
            </button>
          ))}
        </div>
      </div>

      {/* 앱 정보 */}
      <div className="bg-white rounded-2xl p-5 border" style={{ borderColor: theme.border }}>
        <p className="text-xs mb-2" style={{ color: theme.border }}>ℹ️ 앱 정보</p>
        <p className="text-xs leading-relaxed" style={{ color: "#bbb" }}>
          스택: React + Vite + Express + MongoDB<br />
          배포: Vercel
        </p>
      </div>
      </div>
    </div>
  );
}
