"use client";
import { useEffect, useState, useCallback } from "react";
import { getDebts, createDebt, updateDebt, deleteDebt, addDebtPayment, getSettings, updateSettings } from "@/lib/api";
import { formatMoney, getToday } from "@/lib/utils";
const CARD_COLORS = [
  { name: "Серая", value: "from-slate-700 to-slate-900" },
  { name: "Синяя", value: "from-blue-600 to-blue-900" },
  { name: "Зелёная", value: "from-emerald-600 to-emerald-900" },
  { name: "Фиолетовая", value: "from-purple-600 to-purple-900" },
  { name: "Золотая", value: "from-amber-500 to-amber-700" },
  { name: "Чёрная", value: "from-zinc-800 to-black" },
];
export default function DebtsManager() {
  const [debts, setDebts] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<"cards" | "loans">("cards");
  const [showForm, setShowForm] = useState(false);
  const [payId, setPayId] = useState<number | null>(null);
  const [payAmount, setPayAmount] = useState("");
  const [cardForm, setCardForm] = useState({ name: "", bankName: "", creditLimit: "", currentBalance: "", interestRate: "", minimumPayment: "", cardLastDigits: "", cardColor: CARD_COLORS[0].value });
  const [loanForm, setLoanForm] = useState({ name: "", bankName: "", balance: "", currentBalance: "", interestRate: "", minimumPayment: "", totalTerm: "", remainingTerm: "" });
  const load = useCallback(async () => {
    setLoading(true);
    const [d, s] = await Promise.all([getDebts(), getSettings()]);
    setDebts(d); setSettings(s); setLoading(false);
  }, []);
  useEffect(() => { load(); }, [load]);
  const cards = debts.filter(d => d.debtType === "credit_card");
  const loans = debts.filter(d => d.debtType === "loan" || d.debtType === "mortgage");
  const currency = settings?.currency || "₽";
  const totalDebt = debts.reduce((s, d) => s + parseFloat(d.currentBalance || d.balance), 0);
  const handleAddCard = async () => {
    if (!cardForm.name || !cardForm.creditLimit) return;
    await createDebt({
      name: cardForm.name, debtType: "credit_card", balance: parseFloat(cardForm.creditLimit),
      currentBalance: parseFloat(cardForm.currentBalance || "0"), interestRate: parseFloat(cardForm.interestRate || "0"),
      minimumPayment: parseFloat(cardForm.minimumPayment || "0"), creditLimit: parseFloat(cardForm.creditLimit),
      cardLastDigits: cardForm.cardLastDigits, cardColor: cardForm.cardColor, bankName: cardForm.bankName,
    });
    setCardForm({ name: "", bankName: "", creditLimit: "", currentBalance: "", interestRate: "", minimumPayment: "", cardLastDigits: "", cardColor: CARD_COLORS[0].value });
    setShowForm(false); load();
  };
  const handleAddLoan = async () => {
    if (!loanForm.name || !loanForm.balance) return;
    await createDebt({
      name: loanForm.name, debtType: "loan", balance: parseFloat(loanForm.balance),
      currentBalance: parseFloat(loanForm.currentBalance || loanForm.balance), interestRate: parseFloat(loanForm.interestRate || "0"),
      minimumPayment: parseFloat(loanForm.minimumPayment || "0"), bankName: loanForm.bankName,
      totalTerm: loanForm.totalTerm ? parseInt(loanForm.totalTerm) : undefined,
      remainingTerm: loanForm.remainingTerm ? parseInt(loanForm.remainingTerm) : undefined,
    });
    setLoanForm({ name: "", bankName: "", balance: "", currentBalance: "", interestRate: "", minimumPayment: "", totalTerm: "", remainingTerm: "" });
    setShowForm(false); load();
  };
  const handlePay = async () => {
    if (!payId || !payAmount) return;
    const debt = debts.find(d => d.id === payId);
    if (!debt) return;
    await addDebtPayment(payId, { amount: parseFloat(payAmount), date: getToday() });
    const cur = parseFloat(debt.currentBalance || debt.balance);
    await updateDebt(payId, { currentBalance: Math.max(0, cur - parseFloat(payAmount)) });
    setPayId(null); setPayAmount(""); load();
  };
  const handleDel = async (id: number) => { if (confirm("Удалить?")) { await deleteDebt(id); load(); } };
  if (loading) return <div className="flex justify-center py-20"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div></div>;
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">💳 Долги и кредиты</h2>
        <button onClick={() => setShowForm(!showForm)} className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600">
          {showForm ? "Отмена" : tab === "cards" ? "+ Добавить карту" : "+ Добавить кредит"}
        </button>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <div className="bg-red-50 rounded-xl p-4 border border-red-100">
          <p className="text-xs text-red-600 font-medium">Общий долг</p>
          <p className="text-xl font-bold text-red-700">{formatMoney(totalDebt, currency)}</p>
        </div>
        <div className="bg-orange-50 rounded-xl p-4 border border-orange-100">
          <p className="text-xs text-orange-600 font-medium">Карты</p>
          <p className="text-xl font-bold text-orange-700">{formatMoney(cards.reduce((s, c) => s + parseFloat(c.currentBalance || "0"), 0), currency)}</p>
        </div>
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <p className="text-xs text-blue-600 font-medium">Кредиты</p>
          <p className="text-xl font-bold text-blue-700">{formatMoney(loans.reduce((s, l) => s + parseFloat(l.currentBalance || l.balance), 0), currency)}</p>
        </div>
      </div>
      <div className="flex gap-2 bg-slate-100 p-1 rounded-lg">
        <button onClick={() => { setTab("cards"); setShowForm(false); }} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === "cards" ? "bg-white shadow-sm" : "text-slate-600"}`}>💳 Кредитные карты ({cards.length})</button>
        <button onClick={() => { setTab("loans"); setShowForm(false); }} className={`px-4 py-2 rounded-md text-sm font-medium ${tab === "loans" ? "bg-white shadow-sm" : "text-slate-600"}`}>🏦 Кредиты ({loans.length})</button>
      </div>
      {showForm && tab === "cards" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-4">Новая кредитная карта</h3>
          <div className="grid md:grid-cols-3 gap-3">
            <input type="text" placeholder="Название (Тинькофф Platinum)" value={cardForm.name} onChange={e => setCardForm({ ...cardForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="Банк" value={cardForm.bankName} onChange={e => setCardForm({ ...cardForm, bankName: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Лимит карты" value={cardForm.creditLimit} onChange={e => setCardForm({ ...cardForm, creditLimit: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Текущий долг" value={cardForm.currentBalance} onChange={e => setCardForm({ ...cardForm, currentBalance: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Ставка %" value={cardForm.interestRate} onChange={e => setCardForm({ ...cardForm, interestRate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Мин. платёж" value={cardForm.minimumPayment} onChange={e => setCardForm({ ...cardForm, minimumPayment: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="Посл. 4 цифры" value={cardForm.cardLastDigits} onChange={e => setCardForm({ ...cardForm, cardLastDigits: e.target.value.slice(0, 4) })} className="border rounded-lg px-3 py-2 text-sm" maxLength={4} />
            <div>
              <p className="text-xs text-slate-500 mb-1">Цвет:</p>
              <div className="flex gap-1">{CARD_COLORS.map(c => (
                <button key={c.value} onClick={() => setCardForm({ ...cardForm, cardColor: c.value })} className={`w-7 h-7 rounded-lg bg-gradient-to-br ${c.value} ${cardForm.cardColor === c.value ? "ring-2 ring-blue-500 ring-offset-1" : ""}`} />
              ))}</div>
            </div>
            <button onClick={handleAddCard} className="bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">Добавить</button>
          </div>
        </div>
      )}
      {showForm && tab === "loans" && (
        <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
          <h3 className="font-semibold mb-4">Новый кредит</h3>
          <div className="grid md:grid-cols-4 gap-3">
            <input type="text" placeholder="Название" value={loanForm.name} onChange={e => setLoanForm({ ...loanForm, name: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="text" placeholder="Банк" value={loanForm.bankName} onChange={e => setLoanForm({ ...loanForm, bankName: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Сумма кредита" value={loanForm.balance} onChange={e => setLoanForm({ ...loanForm, balance: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Текущий остаток" value={loanForm.currentBalance} onChange={e => setLoanForm({ ...loanForm, currentBalance: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Ставка %" value={loanForm.interestRate} onChange={e => setLoanForm({ ...loanForm, interestRate: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Платёж/мес" value={loanForm.minimumPayment} onChange={e => setLoanForm({ ...loanForm, minimumPayment: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <input type="number" placeholder="Осталось мес." value={loanForm.remainingTerm} onChange={e => setLoanForm({ ...loanForm, remainingTerm: e.target.value })} className="border rounded-lg px-3 py-2 text-sm" />
            <button onClick={handleAddLoan} className="bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600">Добавить</button>
          </div>
        </div>
      )}
      {tab === "cards" && (cards.length > 0 ? (
        <div className="grid md:grid-cols-2 gap-6">{cards.map(card => {
          const limit = parseFloat(card.creditLimit || card.balance);
          const debt = parseFloat(card.currentBalance || "0");
          const available = limit - debt;
          const used = limit > 0 ? (debt / limit) * 100 : 0;
          return (
            <div key={card.id} className="space-y-3">
              <div className={`bg-gradient-to-br ${card.cardColor || "from-slate-700 to-slate-900"} rounded-2xl p-6 text-white shadow-lg relative overflow-hidden`}>
                <div className="absolute inset-0 opacity-10"><div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full -translate-y-1/2 translate-x-1/2" /></div>
                <button onClick={() => handleDel(card.id)} className="absolute top-3 right-3 text-white/40 hover:text-white">✕</button>
                <div className="relative">
                  <p className="text-white/60 text-xs">{card.bankName || "Банк"}</p>
                  <p className="font-semibold text-lg mb-4">{card.name}</p>
                  <p className="text-white/60 text-xs">Текущий долг</p>
                  <p className="text-3xl font-bold mb-4">{formatMoney(debt, currency)}</p>
                  <div className="flex justify-between items-end">
                    <div><p className="text-white/60 text-xs">Лимит</p><p className="font-medium">{formatMoney(limit, currency)}</p></div>
                    <div><p className="text-white/60 text-xs">Доступно</p><p className="font-medium text-emerald-300">{formatMoney(available, currency)}</p></div>
                    <div className="text-xl tracking-widest">•••• {card.cardLastDigits || "0000"}</div>
                  </div>
                </div>
              </div>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-200">
                <div className="mb-3">
                  <div className="flex justify-between text-xs mb-1"><span>Использовано</span><span className={used > 80 ? "text-red-600" : ""}>{used.toFixed(0)}%</span></div>
                  <div className="h-2 bg-slate-100 rounded-full overflow-hidden"><div className={`h-full rounded-full ${used > 80 ? "bg-red-500" : used > 50 ? "bg-amber-500" : "bg-emerald-500"}`} style={{ width: `${Math.min(used, 100)}%` }} /></div>
                </div>
                <div className="grid grid-cols-2 gap-2 text-center text-xs mb-3">
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">Ставка</p><p className="font-medium">{card.interestRate}%</p></div>
                  <div className="p-2 bg-slate-50 rounded-lg"><p className="text-slate-500">Мин. платёж</p><p className="font-medium">{formatMoney(parseFloat(card.minimumPayment), currency)}</p></div>
                </div>
                <button onClick={() => setPayId(card.id)} className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">💵 Внести платёж</button>
              </div>
            </div>
          );
        })}</div>
      ) : <div className="bg-white rounded-xl p-12 text-center border border-slate-200"><p className="text-4xl mb-4">💳</p><p className="text-lg font-medium">Нет кредитных карт</p><p className="text-sm text-slate-500 mt-1">Нажмите &quot;+ Добавить карту&quot;</p></div>)}
      {tab === "loans" && (loans.length > 0 ? (
        <div className="space-y-4">{loans.map(loan => {
          const original = parseFloat(loan.balance);
          const current = parseFloat(loan.currentBalance || loan.balance);
          const paid = original - current;
          const progress = original > 0 ? (paid / original) * 100 : 0;
          return (
            <div key={loan.id} className="bg-white rounded-xl p-6 shadow-sm border border-slate-200">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3"><span className="text-2xl">🏦</span><div><h4 className="font-semibold">{loan.name}</h4><p className="text-xs text-slate-500">{loan.bankName || "Банк"} • {loan.interestRate}%</p></div></div>
                <button onClick={() => handleDel(loan.id)} className="text-slate-400 hover:text-red-500">🗑️</button>
              </div>
              <div className="mb-4">
                <div className="flex justify-between text-sm mb-1"><span>Выплачено: {formatMoney(paid, currency)}</span><span>{progress.toFixed(1)}%</span></div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden"><div className="h-full bg-emerald-500 rounded-full" style={{ width: `${progress}%` }} /></div>
              </div>
              <div className="grid grid-cols-3 gap-3 text-center mb-4">
                <div className="p-2 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Остаток</p><p className="font-bold text-red-600">{formatMoney(current, currency)}</p></div>
                <div className="p-2 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Платёж/мес</p><p className="font-medium">{formatMoney(parseFloat(loan.minimumPayment), currency)}</p></div>
                <div className="p-2 bg-slate-50 rounded-lg"><p className="text-xs text-slate-500">Осталось мес.</p><p className="font-medium">{loan.remainingTerm || "—"}</p></div>
              </div>
              <button onClick={() => setPayId(loan.id)} className="w-full bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium hover:bg-emerald-600">💵 Внести платёж</button>
            </div>
          );
        })}</div>
      ) : <div className="bg-white rounded-xl p-12 text-center border border-slate-200"><p className="text-4xl mb-4">🏦</p><p className="text-lg font-medium">Нет кредитов</p><p className="text-sm text-slate-500 mt-1">Нажмите &quot;+ Добавить кредит&quot;</p></div>)}
      {payId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-sm shadow-xl">
            <h3 className="font-semibold mb-4">💵 Внести платёж</h3>
            <input type="number" placeholder="Сумма" value={payAmount} onChange={e => setPayAmount(e.target.value)} className="w-full border rounded-lg px-3 py-2 text-sm mb-3" autoFocus />
            <div className="flex gap-2">
              <button onClick={handlePay} className="flex-1 bg-emerald-500 text-white py-2 rounded-lg text-sm font-medium">Оплатить</button>
              <button onClick={() => setPayId(null)} className="flex-1 bg-slate-100 py-2 rounded-lg text-sm font-medium">Отмена</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
