"use client";
import { useState, useEffect } from "react";

const PASSWORD_KEY = "fintracker_password";
const AUTH_KEY = "fintracker_authenticated";

export default function PasswordProtect({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [password, setPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    const authenticated = sessionStorage.getItem(AUTH_KEY);

    if (savedPassword && authenticated === "true") {
      setIsAuthenticated(true);
      setHasPassword(true);
    } else if (savedPassword) {
      setHasPassword(true);
      setIsAuthenticated(false);
    } else {
      setHasPassword(false);
      setIsAuthenticated(false);
    }
    setLoading(false);
  }, []);

  const handleLogin = () => {
    const savedPassword = localStorage.getItem(PASSWORD_KEY);
    if (password === savedPassword) {
      sessionStorage.setItem(AUTH_KEY, "true");
      setIsAuthenticated(true);
      setError("");
    } else {
      setError("Неверный пароль");
    }
  };

  const handleSetupPassword = () => {
    if (newPassword.length < 4) {
      setError("Минимум 4 символа");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Пароли не совпадают");
      return;
    }
    localStorage.setItem(PASSWORD_KEY, newPassword);
    sessionStorage.setItem(AUTH_KEY, "true");
    setIsAuthenticated(true);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isAuthenticated) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-100 to-blue-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl p-8 w-full max-w-md border border-slate-200 dark:border-slate-700">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="text-4xl">💰</span>
          </div>
          <h1 className="text-2xl font-bold">FinTracker</h1>
          <p className="text-slate-500 mt-2">
            {hasPassword ? "Введите пароль для входа" : "Защитите свои данные паролем"}
          </p>
        </div>

        {hasPassword ? (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Введите пароль"
              value={password}
              onChange={e => { setPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleLogin()}
              className="w-full border border-slate-300 rounded-lg px-4 py-3 text-lg text-center"
              autoFocus
            />
            {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 py-2 rounded-lg">{error}</p>}
            <button onClick={handleLogin} className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600">
              🔓 Войти
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <input
              type="password"
              placeholder="Придумайте пароль (мин. 4 символа)"
              value={newPassword}
              onChange={e => { setNewPassword(e.target.value); setError(""); }}
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
              autoFocus
            />
            <input
              type="password"
              placeholder="Повторите пароль"
              value={confirmPassword}
              onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
              onKeyDown={e => e.key === "Enter" && handleSetupPassword()}
              className="w-full border border-slate-300 rounded-lg px-4 py-3"
            />
            {error && <p className="text-red-500 text-sm text-center bg-red-50 dark:bg-red-900/30 py-2 rounded-lg">{error}</p>}
            <button onClick={handleSetupPassword} className="w-full bg-blue-500 text-white py-3 rounded-lg font-medium hover:bg-blue-600">
              🔐 Установить пароль
            </button>
            <div className="text-center">
              <button onClick={() => setIsAuthenticated(true)} className="text-sm text-slate-400 hover:text-slate-600 underline">
                Пропустить (без пароля)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}