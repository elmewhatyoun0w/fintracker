"use client";
import { formatMoney } from "@/lib/utils";

export default function SpendingChart({ data, currency = "₽" }: { data: { name: string; amount: number }[]; currency?: string }) {
  if (data.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-3xl mb-2">📊</p>
        <p className="text-slate-400 text-sm">Нет данных — добавьте расходы</p>
      </div>
    );
  }

  const maxVal = Math.max(...data.map(d => d.amount));
  const colors = [
    "bg-blue-500", "bg-purple-500", "bg-emerald-500", "bg-amber-500",
    "bg-red-500", "bg-cyan-500", "bg-pink-500", "bg-indigo-500"
  ];

  return (
    <div className="space-y-3">
      {data.map((item, i) => {
        const pct = maxVal > 0 ? (item.amount / maxVal) * 100 : 0;
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="font-medium truncate">{item.name}</span>
              <span className="text-slate-500 ml-2 whitespace-nowrap">{formatMoney(item.amount, currency)}</span>
            </div>
            <div className="h-6 bg-slate-100 dark:bg-slate-700 rounded-lg overflow-hidden">
              <div
                className={`h-full ${colors[i % colors.length]} rounded-lg transition-all duration-700`}
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}