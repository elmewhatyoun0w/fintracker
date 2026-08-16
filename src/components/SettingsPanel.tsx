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

  useEffect(() => {
    getSettings().then(s => { setIncome(s.monthlyIncome || "0"); setCurrency(s.currency || "₽"); setLoading(false); });
  }, []);

  const handleSave = async () => {
    await updateSettings({ monthlyIncome: income, currency });
    setSaved(true); setTimeout(() => setSaved(false), 2000);
  };

  const handleResetPassword = () => {
    if (confirm("Сбросить пароль? Нужно будет установить новый.")) {
      localStorage.removeItem("fintracker_password");
      sessionStorage.removeItem("fintracker_authenticated");
      alert("Пароль сброшен. Обновите страницу.");
    }
  };

  const mi = parseFloat(income || "0");

  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold">⚙️ Настройки</h2>
      
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4">Основные параметры</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="text-sm font-medium block mb-1">Месячный доход</label>
            <input type="number" value={income} onChange={e => setIncome(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm" placeholder="100000" />
          </div>
          <div>
            <label className="text-sm font-medium block mb-1">Валюта</label>
            <select value={currency} onChange={e => setCurrency(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm">
              <option value="₽">₽ Рубли</option><option value="$">$ Доллары</option><option value="€">€ Евро</option>
            </select>
          </div>
        </div>
        <button onClick={handleSave} className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
          {saved ? "✓ Сохранено!" : "Сохранить"}
        </button>
      </div>

      {mi > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-4">📊 Бюджет 50/30/20</h3>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="p-4 bg-blue-50 rounded-lg"><h4 className="font-medium text-blue-800">🏠 Необходимое — 50%</h4><p className="text-2xl font-bold text-blue-700 mt-2">{formatMoney(mi * 0.5, currency)}</p></div>
            <div className="p-4 bg-purple-50 rounded-lg"><h4 className="font-medium text-purple-800">🎉 Желания — 30%</h4><p className="text-2xl font-bold text-purple-700 mt-2">{formatMoney(mi * 0.3, currency)}</p></div>
            <div className="p-4 bg-emerald-50 rounded-lg"><h4 className="font-medium text-emerald-800">💰 Сбережения — 20%</h4><p className="text-2xl font-bold text-emerald-700 mt-2">{formatMoney(mi * 0.2, currency)}</p></div>
          </div>
        </div>
      )}

      {/* Экспорт данных */}
      <ExportData />

      {/* Управление паролем */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="font-semibold mb-4">🔐 Безопасность</h3>
        <p className="text-sm text-slate-600 mb-4">
          {localStorage.getItem("fintracker_password") 
            ? "Пароль установлен. Вы можете сбросить его ниже."
            : "Пароль не установлен. Обновите страницу чтобы установить."}
        </p>
        <button onClick={handleResetPassword} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-200">
          Сбросить пароль
        </button>
      </div>
    </div>
  );
}