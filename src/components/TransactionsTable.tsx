"use client";
import { useEffect, useState, useCallback } from "react";
import { getTransactions, createTransaction, deleteTransaction, getCategories } from "@/lib/api";
import { formatMoney, getCurrentMonth, getToday } from "@/lib/utils";
import MonthSelector from "./MonthSelector";

export default function TransactionsTable() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [txs, setTxs] = useState<any[]>([]);
  const [cats, setCats] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ type: "expense", amount: "", description: "", categoryId: "", date: getToday(), notes: "" });

  const load = useCallback(async () => {
    setLoading(true);
    const [t, c] = await Promise.all([getTransactions({ month }), getCategories()]);
    setTxs(t); setCats(c); setLoading(false);
  }, [month]);

  useEffect(() => { load(); }, [load]);

  const handleAdd = async () => {
    if (!form.description || !form.amount) return;
    await createTransaction({ type: form.type, amount: parseFloat(form.amount), description: form.description, categoryId: form.categoryId ? parseInt(form.categoryId) : null, date: form.date, notes: form.notes });
    setForm({ type: "expense", amount: "", description: "", categoryId: "", date: getToday(), notes: "" });
    load();
  };

  const handleDelete = async (id: number) => { if (confirm("Удалить?")) { await deleteTransaction(id); load(); } };

  const totalIncome = txs.filter(t => t.type === "income").reduce((s, t) => s + parseFloat(t.amount), 0);
  const totalExpense = txs.filter(t => t.type === "expense").reduce((s, t) => s + parseFloat(t.amount), 0);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap justify-between items-center gap-4">
        <h2 className="text-2xl font-bold">📝 Операции</h2>
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      <div className="flex gap-4 text-sm">
        <div className="bg-green-50 px-4 py-2 rounded-lg"><span className="text-green-700 font-medium">Доходы: {formatMoney(totalIncome)}</span></div>
        <div className="bg-red-50 px-4 py-2 rounded-lg"><span className="text-red-700 font-medium">Расходы: {formatMoney(totalExpense)}</span></div>
        <div className={`px-4 py-2 rounded-lg ${totalIncome - totalExpense >= 0 ? "bg-blue-50" : "bg-red-50"}`}>
          <span className={`font-medium ${totalIncome - totalExpense >= 0 ? "text-blue-700" : "text-red-700"}`}>Баланс: {formatMoney(totalIncome - totalExpense)}</span>
        </div>
      </div>

      <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
        <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
          <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value, categoryId: "" })} className="border rounded-lg px-3 py-2 text-sm">
            <option value="expense">Расход</option><option value="income">Доход</option>
          </select>
          <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
          <input type="text" placeholder="Описание" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAdd()} className="border rounded-lg px-3 py-2 text-sm col-span-2" />
          <select value={form.categoryId} onChange={e => setForm({ ...form, categoryId: e.target.value })} className="border rounded-lg px-3 py-2 text-sm">
            <option value="">Категория</option>
            {cats.filter(c => c.type === form.type).map(c => <option key={c.id} value={c.id}>{c.icon} {c.name}</option>)}
          </select>
          <input type="number" placeholder="Сумма" value={form.amount} onChange={e => setForm({ ...form, amount: e.target.value })} onKeyDown={e => e.key === "Enter" && handleAdd()} className="border rounded-lg px-3 py-2 text-sm" />
          <button onClick={handleAdd} className="bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">＋</button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead><tr className="bg-slate-50 border-b">
            <th className="text-left px-3 py-3 font-medium text-slate-600">Тип</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600">Дата</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600">Описание</th>
            <th className="text-left px-3 py-3 font-medium text-slate-600">Категория</th>
            <th className="text-right px-3 py-3 font-medium text-slate-600">Сумма</th>
            <th className="px-3 py-3"></th>
          </tr></thead>
          <tbody>
            {loading ? <tr><td colSpan={6} className="py-12 text-center text-slate-500">Загрузка...</td></tr>
            : txs.length === 0 ? <tr><td colSpan={6} className="py-12 text-center text-slate-500">Нет операций</td></tr>
            : txs.map(tx => (
              <tr key={tx.id} className="border-b border-slate-100 hover:bg-slate-50">
                <td className="px-3 py-2"><span className={`px-2 py-0.5 text-xs rounded-full ${tx.type === "income" ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>{tx.type === "income" ? "Доход" : "Расход"}</span></td>
                <td className="px-3 py-2 text-slate-600">{tx.date}</td>
                <td className="px-3 py-2 font-medium">{tx.description}</td>
                <td className="px-3 py-2 text-slate-600">{tx.categoryIcon} {tx.categoryName || "—"}</td>
                <td className={`px-3 py-2 text-right font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>{tx.type === "income" ? "+" : "-"}{formatMoney(parseFloat(tx.amount))}</td>
                <td className="px-3 py-2"><button onClick={() => handleDelete(tx.id)} className="text-slate-400 hover:text-red-500">🗑️</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
