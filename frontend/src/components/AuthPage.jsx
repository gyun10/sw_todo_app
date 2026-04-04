import { useState } from "react";
import axios from "axios";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000";

export default function AuthPage({ onLogin }) {
  const [mode, setMode] = useState("login"); // "login" | "signup"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/signup";
      const res = await axios.post(`${API}${endpoint}`, { email, password });
      onLogin(res.data.token, res.data.email);
    } catch (err) {
      setError(err.response?.data?.message || "오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setMode(m => m === "login" ? "signup" : "login");
    setError("");
    setEmail("");
    setPassword("");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 px-4">
      <div className="w-full max-w-sm">
        {/* 로고 */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🌸</div>
          <h1 className="text-2xl font-bold text-zinc-100">My Todos</h1>
          <p className="text-zinc-500 text-sm mt-1">할 일을 체계적으로 관리하세요</p>
        </div>

        {/* 카드 */}
        <div className="bg-zinc-900 rounded-2xl border border-zinc-800 p-6">
          {/* 탭 토글 */}
          <div className="flex bg-zinc-800 rounded-xl p-1 mb-6">
            <button
              onClick={() => { setMode("login"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={mode === "login"
                ? { background: "#e8789e", color: "#fff" }
                : { color: "#a1a1aa" }}
            >
              로그인
            </button>
            <button
              onClick={() => { setMode("signup"); setError(""); }}
              className="flex-1 py-2 rounded-lg text-sm font-medium transition-colors"
              style={mode === "signup"
                ? { background: "#e8789e", color: "#fff" }
                : { color: "#a1a1aa" }}
            >
              회원가입
            </button>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {/* 이메일 */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">이메일</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="example@email.com"
                required
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {/* 비밀번호 */}
            <div>
              <label className="block text-xs text-zinc-400 mb-1.5">비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder={mode === "signup" ? "6자 이상 입력해주세요" : "비밀번호 입력"}
                required
                minLength={mode === "signup" ? 6 : 1}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-2.5 text-sm text-zinc-100 placeholder-zinc-600 outline-none focus:border-pink-400 transition-colors"
              />
            </div>

            {/* 에러 메시지 */}
            {error && (
              <p className="text-xs text-red-400 bg-red-900/20 border border-red-800/40 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            {/* 제출 버튼 */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 rounded-xl text-sm font-semibold text-white transition-opacity disabled:opacity-60"
              style={{ background: "#e8789e" }}
            >
              {loading ? "처리 중..." : mode === "login" ? "로그인" : "회원가입"}
            </button>
          </form>

          {/* 모드 전환 링크 */}
          <p className="text-center text-xs text-zinc-500 mt-5">
            {mode === "login" ? "계정이 없으신가요?" : "이미 계정이 있으신가요?"}
            {" "}
            <button onClick={toggleMode} className="text-pink-400 hover:text-pink-300 font-medium underline underline-offset-2">
              {mode === "login" ? "회원가입" : "로그인"}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
