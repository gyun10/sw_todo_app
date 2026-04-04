const CATS = [
  { name: "전체", icon: "🗂" },
  { name: "공부", color: "#378ADD" },
  { name: "개발", color: "#7F77DD" },
  { name: "일상", color: "#639922" },
];

export default function Sidebar({ tab, setTab, theme, themeName, setTheme, todos }) {
  const navItems = [
    { key: "todo", icon: "📝", label: "할 일" },
    { key: "stats", icon: "📊", label: "통계" },
    { key: "cal", icon: "📅", label: "달력" },
    { key: "settings", icon: "⚙️", label: "설정" },
  ];

  return (
    <aside className="w-52 flex flex-col p-4 gap-1 border-r"
      style={{ background: theme.light, borderColor: theme.border, minHeight: "100vh" }}>

      {/* 로고 */}
      <div className="text-center mb-4">
        <div className="text-4xl">🌸</div>
        <p className="text-sm mt-1" style={{ color: theme.main }}>My Todos</p>
      </div>

      {/* 메인 메뉴 */}
      <p className="text-xs mb-1 ml-2" style={{ color: theme.border }}>메뉴</p>
      {navItems.map(({ key, icon, label }) => (
        <button key={key} onClick={() => setTab(key)}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-left transition-colors"
          style={{
            background: tab === key ? theme.border : "transparent",
            color: tab === key ? theme.main : "#888",
          }}>
          <span>{icon}</span> {label}
        </button>
      ))}

      {/* 카테고리 */}
      <p className="text-xs mt-4 mb-1 ml-2" style={{ color: theme.border }}>카테고리</p>
      {CATS.map(({ name, icon, color }) => (
        <div key={name} className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm text-gray-500 cursor-default">
          {icon
            ? <span>{icon}</span>
            : <div className="w-2 h-2 rounded-full" style={{ background: color }} />
          }
          <span>{name}</span>
          <span className="ml-auto text-xs text-gray-300">
            {name === "전체" ? todos.length : todos.filter(t => t.cat === name).length}
          </span>
        </div>
      ))}

      {/* 테마 선택 */}
      <div className="mt-auto pt-4 border-t" style={{ borderColor: theme.border }}>
        <p className="text-xs text-center mb-2" style={{ color: theme.border }}>테마</p>
        <div className="flex justify-center gap-2">
          {Object.entries({ 핑크:"#e8789e", 퍼플:"#7F77DD", 민트:"#1D9E75", 옐로:"#BA7517" }).map(([name, color]) => (
            <button key={name} onClick={() => setTheme(name)}
              className="w-5 h-5 rounded-full transition-all"
              style={{
                background: color,
                border: themeName === name ? "2.5px solid #555" : "2px solid transparent",
              }} />
          ))}
        </div>
      </div>
    </aside>
  );
}