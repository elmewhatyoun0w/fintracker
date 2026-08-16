"use client";
import { useState } from "react";
import { getTransactions, getDebts, getSavingsGoals, getSettings } from "@/lib/api";

export default function ExportData() {
  const [loading, setLoading] = useState(false);

  const exportToCSV = async (type: "transactions" | "debts" | "all") => {
    setLoading(true);
    try {
      if (type === "transactions" || type === "all") {
        const txs = await getTransactions({});
        const csv = "Дата,Тип,Описание,Категория,Сумма\n" + 
          txs.map((t: any) => `${t.date},${t.type === 'income' ? 'Доход' : 'Расход'},${t.description},${t.categoryName || ''},${t.amount}`).join("\n");
        downloadCSV(csv, "transactions.csv");
      }
      
      if (type === "debts" || type === "all") {
        const debts = await getDebts();
        const csv = "Название,Тип,Банк,Баланс,Текущий долг,Ставка,Мин.платёж\n" + 
          debts.map((d: any) => `${d.name},${d.debtType},${d.bankName || ''},${d.balance},${d.currentBalance || d.balance},${d.interestRate},${d.minimumPayment}`).join("\n");
        downloadCSV(csv, "debts.csv");
      }
    } catch (e) {
      alert("Ошибка экспорта");
    }
    setLoading(false);
  };

  const downloadCSV = (content: string, filename: string) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    link.click();
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="font-semibold mb-4">📊 Экспорт данных в Excel/CSV</h3>
      <p className="text-sm text-slate-600 mb-4">Скачай данные в формате CSV (открывается в Excel)</p>
      <div className="flex flex-wrap gap-3">
        <button 
          onClick={() => exportToCSV("transactions")} 
          disabled={loading}
          className="bg-green-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50"
        >
          📝 Скачать операции
        </button>
        <button 
          onClick={() => exportToCSV("debts")} 
          disabled={loading}
          className="bg-orange-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50"
        >
          💳 Скачать долги
        </button>
        <button 
          onClick={() => exportToCSV("all")} 
          disabled={loading}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50"
        >
          📦 Скачать всё
        </button>
      </div>
      {loading && <p className="text-sm text-slate-500 mt-2">Загрузка...</p>}
    </div>
  );
}