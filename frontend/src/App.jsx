import { useState, useEffect } from "react";
import axios from "axios";
import TodoPanel from "./components/TodoPanel";
import StatsPanel from "./components/StatsPanel";
import CalendarPanel from "./components/CalendarPanel";
import SettingsPanel from "./components/SettingsPanel";
import AuthPage from "./components/AuthPage";

const API = window.location.hostname === 'localhost' 
  ? 'http://localhost:5000' 
  : '';

const DEFAULT_CATS = ["공부", "개발", "일상"];

const THEMES = {
  핑크: { main: "#e8789e", light: "#fff0f5", border: "#F4C0D1" },
  퍼플: { main: "#7F77DD", light: "#f0f0ff", border: "#CECBF6" },
  민트: { main: "#1D9E75", light: "#f0fbf7", border: "#9FE1CB" },
  옐로: { main: "#BA7517", light: "#fff8ef", border: "#FAC775" },
};

export default function App() {
  const [todos, setTodos] = useState([]);
  const [tab, setTab] = useState("todo");
  const [theme, setTheme] = useState("핑크");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [catFilter, setCatFilter] = useState("전체");

  // 인증 상태
  const [userEmail, setUserEmail] = useState(null);

  // 커스텀 카테고리 (localStorage 영속)
  const [customCategories, setCustomCategories] = useState(() => {
    try {
      const stored = localStorage.getItem("customCategories");
      return stored ? JSON.parse(stored) : [...DEFAULT_CATS];
    } catch { return [...DEFAULT_CATS]; }
  });
  const categories = customCategories;

  const saveCustomCategories = (cats) => {
    setCustomCategories(cats);
    localStorage.setItem("customCategories", JSON.stringify(cats));
  };

  const t = THEMES[theme];

  // 앱 시작 시 로컬스토리지에서 토큰 복원
  useEffect(() => {
    const token = localStorage.getItem("token");
    const email = localStorage.getItem("userEmail");
    if (token && email) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      setUserEmail(email);
    }
  }, []);

  // 로그인 후 todos 불러오기
  useEffect(() => {
    if (userEmail) fetchTodos();
  }, [userEmail]);

  const handleLogin = (token, email) => {
    localStorage.setItem("token", token);
    localStorage.setItem("userEmail", email);
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    setUserEmail(email);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userEmail");
    delete axios.defaults.headers.common["Authorization"];
    setUserEmail(null);
    setTodos([]);
    setSidebarOpen(false);
  };

  const fetchTodos = async () => {
    const res = await axios.get(`${API}/api/todos`);
    setTodos(res.data);
  };

  const addTodo = async (title, cat, due) => {
    const res = await axios.post(`${API}/api/todos`, { title, cat, due });
    setTodos(prev => [...prev, res.data]);
    // 새 카테고리면 자동 저장
    if (cat && !categories.includes(cat)) {
      saveCustomCategories([...customCategories, cat]);
    }
  };

  const handleDeleteAccount = async () => {
    try { await axios.delete(`${API}/api/auth/account`); } catch {}
    handleLogout();
  };

  const toggleTodo = async (id, completed) => {
    const res = await axios.put(`${API}/api/todos/${id}`, { completed: !completed });
    setTodos(prev => prev.map(t => t._id === id ? res.data : t));
  };

  const updateTodo = async (id, fields) => {
    const res = await axios.put(`${API}/api/todos/${id}`, fields);
    setTodos(prev => prev.map(t => t._id === id ? res.data : t));
  };

  const deleteTodo = async (id) => {
    await axios.delete(`${API}/api/todos/${id}`);
    setTodos(prev => prev.filter(t => t._id !== id));
  };

  // 로그인 전: 인증 페이지 표시
  if (!userEmail) {
    return <AuthPage onLogin={handleLogin} />;
  }

  const panels = { todo: TodoPanel, stats: StatsPanel, cal: CalendarPanel, settings: SettingsPanel };
  const Panel = panels[tab];

  return (
    <div className="relative flex min-h-screen overflow-hidden"
      style={{ fontFamily: "'Pretendard', sans-serif" }}>

      {/* 사이드바 — 슬라이드 (flex item) */}
      <aside
        className="flex-shrink-0 flex flex-col p-4 gap-1 border-r overflow-hidden"
        style={{
          width: sidebarOpen ? 200 : 0,
          background: t.light,
          borderColor: sidebarOpen ? t.border : "transparent",
          transition: "width 0.25s cubic-bezier(.4,0,.2,1)",
          paddingLeft: sidebarOpen ? undefined : 0,
          paddingRight: sidebarOpen ? undefined : 0,
        }}
      >
        {/* 닫기 버튼 */}
        <button onClick={() => setSidebarOpen(false)}
          className="self-end w-7 h-7 rounded-full flex items-center justify-center text-sm flex-shrink-0"
          style={{ background: t.light, color: t.main, border: `1px solid ${t.border}` }}>
          ✕
        </button>

        {/* 로고 */}
        <div className="text-center mb-4 mt-1">
          <div className="text-3xl">🌸</div>
          <p className="text-xs mt-1 font-medium" style={{ color: t.main }}>My Todos</p>
        </div>

        {/* 메뉴 */}
        <p className="text-xs mb-1 ml-2" style={{ color: t.border }}>메뉴</p>
        {[
          { key: "todo", icon: "📝", label: "할 일" },
          { key: "stats", icon: "📊", label: "통계" },
          { key: "cal", icon: "📅", label: "달력" },
          { key: "settings", icon: "⚙️", label: "설정" },
        ].map(({ key, icon, label }) => (
          <button key={key}
            onClick={() => setTab(key)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left"
            style={{
              background: tab === key ? t.border : "transparent",
              color: tab === key ? t.main : "#999",
              fontWeight: tab === key ? 500 : 400,
              fontFamily: "'Pretendard', sans-serif",
            }}>
            <span style={{ fontSize: 14 }}>{icon}</span> {label}
          </button>
        ))}

        {/* 카테고리 */}
        <p className="text-xs mt-3 mb-1 ml-2" style={{ color: t.border }}>카테고리</p>
        {[{ name: "전체", icon: "🗂" }, ...categories.map((name, i) => ({
          name,
          color: { 공부:"#378ADD", 개발:"#7F77DD", 일상:"#639922" }[name]
            ?? ["#E28B4A","#4A9E88","#D45E8B","#8BAA33","#C25E5E","#5E8BC2"][i % 6],
        }))].map(({ name, icon, color }) => (
          <button key={name}
            onClick={() => { setCatFilter(name); setTab("todo"); }}
            className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm w-full text-left"
            style={{
              background: catFilter === name && tab === "todo" ? t.border : "transparent",
              color: catFilter === name && tab === "todo" ? t.main : "#999",
              fontWeight: catFilter === name && tab === "todo" ? 500 : 400,
            }}>
            {icon
              ? <span style={{ fontSize: 13 }}>{icon}</span>
              : <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
            }
            <span className="truncate">{name}</span>
            <span className="ml-auto text-xs flex-shrink-0" style={{ color: t.border }}>
              {name === "전체" ? todos.length : todos.filter(td => td.cat === name).length}
            </span>
          </button>
        ))}

        {/* 테마 + 로그아웃 */}
        <div className="mt-auto pt-3 border-t" style={{ borderColor: t.border }}>
          <p className="text-xs text-center mb-2" style={{ color: t.border }}>테마</p>
          <div className="flex justify-center gap-2 mb-3">
            {Object.entries({ 핑크:"#e8789e", 퍼플:"#7F77DD", 민트:"#1D9E75", 옐로:"#BA7517" })
              .map(([name, color]) => (
                <button key={name} onClick={() => setTheme(name)}
                  className="w-4 h-4 rounded-full"
                  style={{
                    background: color,
                    border: theme === name ? "2.5px solid #555" : "2px solid transparent",
                  }} />
              ))}
          </div>
          {/* 사용자 이메일 & 로그아웃 */}
          <div className="border-t pt-3" style={{ borderColor: t.border }}>
            <p className="text-xs text-center truncate mb-2" style={{ color: "#999" }}>{userEmail}</p>
            <button
              onClick={handleLogout}
              className="w-full py-1.5 rounded-xl text-xs font-medium transition-opacity hover:opacity-80"
              style={{ background: t.border, color: t.main }}
            >
              로그아웃
            </button>
          </div>
        </div>
      </aside>

      {/* 메인 */}
      <main className="flex-1 flex flex-col min-h-screen" style={{ background: t.light }}>
        <Panel
          todos={todos}
          addTodo={addTodo}
          toggleTodo={toggleTodo}
          updateTodo={updateTodo}
          deleteTodo={deleteTodo}
          theme={t}
          onMenuClick={() => setSidebarOpen(true)}
          setTheme={setTheme}
          themeName={theme}
          THEMES={THEMES}
          categories={categories}
          customCategories={customCategories}
          onCategoriesChange={saveCustomCategories}
          userEmail={userEmail}
          onDeleteAccount={handleDeleteAccount}
          onLogout={handleLogout}
          catFilter={catFilter}
          onCatFilterChange={setCatFilter}
        />
      </main>
    </div>
  );
}
