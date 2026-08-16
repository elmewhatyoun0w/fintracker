"use client";
import { useState } from "react";
import { getTransactions, getDebts } from "@/lib/api";

export default function ExportData() {
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState("");

  const downloadCSV = (content: string, filename: string) => {
    const BOM = "\uFEFF";
    const blob = new Blob([BOM + content], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportTransactions = async () => {
    setLoading(true);
    try {
      const txs = await getTransactions({});
      const header = "Дата;Тип;Описание;Категория;Сумма";
      const rows = txs.map((t: any) =>
        `${t.date};${t.type === "income" ? "Доход" : "Расход"};${t.description};${t.categoryName || "Без категории"};${t.amount}`
      );
      downloadCSV(header + "\n" + rows.join("\n"), `операции_${new Date().toISOString().slice(0, 10)}.csv`);
      setDone("transactions");
      setTimeout(() => setDone(""), 3000);
    } catch { alert("Ошибка экспорта"); }
    setLoading(false);
  };

  const exportDebts = async () => {
    setLoading(true);
    try {
      const debts = await getDebts();
      const header = "Название;Тип;Банк;Начальная сумма;Текущий долг;Ставка %;Мин. платёж;Лимит карты;Последние 4 цифры";
      const rows = debts.map((d: any) => {
        const type = d.debtType === "credit_card" ? "Кредитная карта" : d.debtType === "loan" ? "Кредит" : "Другое";
        return `${d.name};${type};${d.bankName || ""};${d.balance};${d.currentBalance || d.balance};${d.interestRate};${d.minimumPayment};${d.creditLimit || ""};${d.cardLastDigits || ""}`;
      });
      downloadCSV(header + "\n" + rows.join("\n"), `долги_${new Date().toISOString().slice(0, 10)}.csv`);
      setDone("debts");
      setTimeout(() => setDone(""), 3000);
    } catch { alert("Ошибка экспорта"); }
    setLoading(false);
  };

  const exportAll = async () => {
    await exportTransactions();
    await exportDebts();
    setDone("all");
    setTimeout(() => setDone(""), 3000);
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
      <h3 className="font-semibold mb-2">📊 Экспорт в Excel</h3>
      <p className="text-sm text-slate-500 mb-4">
        Скачай CSV файл — открывается в Excel, Google Таблицах, LibreOffice
      </p>
      <div className="flex flex-wrap gap-3">
        <button onClick={exportTransactions} disabled={loading}
          className="flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-green-600 disabled:opacity-50">
          📝 Операции {done === "transactions" && "✓"}
        </button>
        <button onClick={exportDebts} disabled={loading}
          className="flex items-center gap-2 bg-orange-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-orange-600 disabled:opacity-50">
          💳 Долги и карты {done === "debts" && "✓"}
        </button>
        <button onClick={exportAll} disabled={loading}
          className="flex items-center gap-2 bg-blue-500 text-white px-4 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-600 disabled:opacity-50">
          📦 Скачать всё {done === "all" && "✓"}
        </button>
      </div>
      {loading && <p className="text-sm text-slate-400 mt-2 animate-pulse">Загружаю данные...</p>}
    </div>
  );
}