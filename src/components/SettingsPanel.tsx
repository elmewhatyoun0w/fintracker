"use client";
import { useEffect, useState } from "react";
import { getSettings, updateSettings } from "@/lib/api";
import { formatMoney } from "@/lib/utils";
import ExportData from "./ExportData";

export default function SettingsPanel() {
  const [loading, setLoading] = useState(true);
  const [income, setIncome] = useState("");
  const [currency, setCurrency] = useState("₽");
  const [saved, setSaved] = useState(false);
  const [hasPassword, setHasPassword] = useState(false);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    getSettings().then(s => {
      setIncome(s.monthlyIncome || "0");
      setCurrency(s.currency || "₽");
      setLoading(false);
    });
    setHasPassword(!!localStorage.getItem("fintracker_password"));
    setDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const handleSave = async () => {
    await updateSettings({ monthlyIncome: income, currency });
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChangePassword = () => {
    const newPass = prompt("Введите новый пароль (минимум 4 символа):");
    if (!newPass) return;
    if (newPass.length < 4) { alert("Минимум 4 символа!"); return; }
    localStorage.setItem("fintracker_password", newPass);
    setHasPassword(true);
    alert("Пароль изменён!");
  };

  const handleRemovePassword = () => {
    if (!confirm("Убрать пароль?")) return;
    localStorage.removeItem("fintracker_password");
    sessionStorage.removeItem("fintracker_authenticated");
    setHasPassword(false);
    alert("Пароль удалён");
  };

  const toggleDarkMode = () => {
    const isDark = document.documentElement.classList.contains("dark");
    if (isDark) {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("fintracker_theme", "light");
      setDarkMode(false);
    } else {
      document.documentElement.classList.add("dark");
      localStorage.setItem("fintracker_theme", "dark");
      setDarkMode(true);
    }
  };

  const mi = parseFloat(income || "0");

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Настройки</h2>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4">📋 Основные параметры</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Месячный доход</label>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm" placeholder="100000" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Валюта</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full border border-slate-300 rounded-lg px-3 py-2 text-sm">
              <option value="₽">₽ Рубли</option>
              <option value="$">$ Доллары</option>
              <option value="€">€ Евро</option>
              <option value="₸">₸ Тенге</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className={`mt-4 px-6 py-2 rounded-lg text-sm font-medium ${saved ? "bg-green-500 text-white" : "bg-blue-500 text-white hover:bg-blue-600"}`}>
          {saved ? "✓ Сохранено!" : "💾 Сохранить"}
        </button>
      </div>

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4">🌙 Внешний вид</h3>
        <div className="flex items-center justify-between">
          <div>
            <p className="font-medium">{darkMode ? "Тёмная тема" : "Светлая тема"}</p>
            <p className="text-sm text-slate-500">Переключение оформления сайта</p>
          </div>
          <button
            onClick={toggleDarkMode}
            className={`relative w-16 h-8 rounded-full transition-colors ${darkMode ? "bg-blue-500" : "bg-slate-300"}`}
          >
            <div className={`absolute top-1 w-6 h-6 bg-white rounded-full transition-transform ${darkMode ? "translate-x-9" : "translate-x-1"}`} />
          </button>
        </div>
      </div>

      {mi > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-4">📊 Бюджет 50/30/20</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
              <h4 className="font-medium text-blue-800">🏠 Необходимое — 50%</h4>
              <p className="text-2xl font-bold text-blue-700 mt-2">{formatMoney(mi * 0.5, currency)}</p>
            </div>
            <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
              <h4 className="font-medium text-purple-800">🎉 Желания — 30%</h4>
              <p className="text-2xl font-bold text-purple-700 mt-2">{formatMoney(mi * 0.3, currency)}</p>
            </div>
            <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
              <h4 className="font-medium text-emerald-800">💰 Сбережения — 20%</h4>
              <p className="text-2xl font-bold text-emerald-700 mt-2">{formatMoney(mi * 0.2, currency)}</p>
            </div>
          </div>
        </div>
      )}

      <ExportData />

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4">🔐 Безопасность</h3>
        <div className="flex items-center gap-3 mb-4">
          <div className={`w-3 h-3 rounded-full ${hasPassword ? "bg-green-500" : "bg-red-500"}`}></div>
          <span className="text-sm">{hasPassword ? "Пароль установлен" : "Пароль не установлен"}</span>
        </div>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleChangePassword} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
            {hasPassword ? "🔄 Сменить пароль" : "🔐 Установить пароль"}
          </button>
          {hasPassword && (
            <button onClick={handleRemovePassword} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
              🗑️ Убрать пароль
            </button>
          )}
        </div>
      </div>
    </div>
  );
}