"use client";
import { useEffect, useState } from "react";
import { getDashboard } from "@/lib/api";
import { formatMoney, getCurrentMonth } from "@/lib/utils";
import MonthSelector from "./MonthSelector";

export default function Dashboard() {
  const [month, setMonth] = useState(getCurrentMonth());
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getDashboard(month).then(d => { setData(d); setLoading(false); }).catch(() => setLoading(false));
  }, [month]);

  if (loading || !data) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;

  const currency = data.settings?.currency || "₽";
  const monthlyIncome = parseFloat(data.settings?.monthlyIncome || "0");

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">📊 Дашборд</h2>
        <MonthSelector month={month} onChange={setMonth} />
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { label: "Доходы", value: data.income, color: "text-green-600", bg: "bg-green-50", icon: "💰" },
          { label: "Расходы", value: data.expenses, color: "text-red-600", bg: "bg-red-50", icon: "💸" },
          { label: "Баланс", value: data.balance, color: data.balance >= 0 ? "text-blue-600" : "text-red-600", bg: "bg-blue-50", icon: "📊" },
          { label: "Долги", value: data.totalDebt, color: "text-orange-600", bg: "bg-orange-50", icon: "💳" },
          { label: "Накопления", value: data.totalSavings, color: "text-emerald-600", bg: "bg-emerald-50", icon: "🏦" },
          { label: "Чистый капитал", value: data.netWorth, color: data.netWorth >= 0 ? "text-purple-600" : "text-red-600", bg: "bg-purple-50", icon: "💎" },
        ].map((card, i) => (
          <div key={i} className={`${card.bg} rounded-xl p-4 border border-slate-100`}>
            <div className="flex items-center gap-2 mb-1">
              <span>{card.icon}</span>
              <span className="text-xs font-medium text-slate-500">{card.label}</span>
            </div>
            <p className={`text-lg font-bold ${card.color}`}>{formatMoney(card.value, currency)}</p>
          </div>
        ))}
      </div>

      {monthlyIncome > 0 && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-semibold mb-4">🎯 Бюджет 50/30/20</h3>
          {[
            { label: "Необходимое (50%)", spent: data.budgetBreakdown.needs, budget: monthlyIncome * 0.5, color: "bg-blue-500" },
            { label: "Желания (30%)", spent: data.budgetBreakdown.wants, budget: monthlyIncome * 0.3, color: "bg-purple-500" },
            { label: "Сбережения (20%)", spent: data.budgetBreakdown.savings, budget: monthlyIncome * 0.2, color: "bg-emerald-500" },
          ].map((bar, i) => {
            const pct = bar.budget > 0 ? Math.min((bar.spent / bar.budget) * 100, 100) : 0;
            const over = bar.spent > bar.budget;
            return (
              <div key={i} className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>{bar.label}</span>
                  <span className={over ? "text-red-600" : ""}>{formatMoney(bar.spent, currency)} / {formatMoney(bar.budget, currency)}</span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full ${over ? "bg-red-500" : bar.color}`} style={{ width: `${pct}%` }} />
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
        <h3 className="text-lg font-semibold mb-4">🕐 Последние операции</h3>
        {data.recentTransactions.length > 0 ? (
          <div className="space-y-2">
            {data.recentTransactions.map((tx: any) => (
              <div key={tx.id} className="flex justify-between py-2 px-3 rounded-lg hover:bg-slate-50">
                <div className="flex items-center gap-2">
                  <span>{tx.categoryIcon || (tx.type === "income" ? "💰" : "💸")}</span>
                  <div>
                    <p className="text-sm font-medium">{tx.description}</p>
                    <p className="text-xs text-slate-500">{tx.date}</p>
                  </div>
                </div>
                <span className={`text-sm font-medium ${tx.type === "income" ? "text-green-600" : "text-red-600"}`}>
                  {tx.type === "income" ? "+" : "-"}{formatMoney(parseFloat(tx.amount), currency)}
                </span>
              </div>
            ))}
          </div>
        ) : <p className="text-slate-500 text-sm">Нет операций</p>}
      </div>
    </div>
  );
}
