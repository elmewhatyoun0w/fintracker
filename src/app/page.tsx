"use client";
import { useEffect, useState } from "react";
import { seedDB } from "@/lib/api";
import Dashboard from "@/components/Dashboard";
import TransactionsTable from "@/components/TransactionsTable";
import DebtsManager from "@/components/DebtsManager";
import SettingsPanel from "@/components/SettingsPanel";

type Tab = "dashboard" | "transactions" | "debts" | "settings";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: "📊" },
  { id: "transactions", label: "Операции", icon: "📝" },
  { id: "debts", label: "Долги", icon: "💳" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
];

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [ready, setReady] = useState(false);

  useEffect(() => { seedDB().finally(() => setReady(true)); }, []);

  if (!ready) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
        <p className="text-slate-600">Загрузка...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold">FinTracker</h1>
            </div>
            <nav className="flex gap-1">
              {tabs.map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium ${activeTab === tab.id ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}>
                  <span className="mr-1.5">{tab.icon}</span>{tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "transactions" && <TransactionsTable />}
        {activeTab === "debts" && <DebtsManager />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>
    </div>
  );
}
