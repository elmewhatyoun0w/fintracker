"use client";
import { useEffect, useState } from "react";
import { seedDB } from "@/lib/api";
import Dashboard from "@/components/Dashboard";
import TransactionsTable from "@/components/TransactionsTable";
import DebtsManager from "@/components/DebtsManager";
import SettingsPanel from "@/components/SettingsPanel";
import PasswordProtect from "@/components/PasswordProtect";

type Tab = "dashboard" | "transactions" | "debts" | "settings";

const tabs: { id: Tab; label: string; icon: string }[] = [
  { id: "dashboard", label: "Дашборд", icon: "📊" },
  { id: "transactions", label: "Операции", icon: "📝" },
  { id: "debts", label: "Долги", icon: "💳" },
  { id: "settings", label: "Настройки", icon: "⚙️" },
];

function App() {
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("fintracker_theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
    }
    seedDB().finally(() => setReady(true));
  }, []);

  if (!ready) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-slate-600 dark:text-slate-300">Загрузка...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      <header className="bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <span className="text-2xl">💰</span>
              <h1 className="text-xl font-bold">FinTracker</h1>
            </div>
            <nav className="hidden md:flex gap-1">
              {tabs.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeTab === tab.id
                      ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                  }`}
                >
                  <span className="mr-1.5">{tab.icon}</span>
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        <div className="md:hidden border-t border-slate-100 dark:border-slate-700 overflow-x-auto">
          <div className="flex px-2 py-1 gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-shrink-0 px-3 py-2 rounded-lg text-xs font-medium ${
                  activeTab === tab.id
                    ? "bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300"
                    : "text-slate-600 dark:text-slate-300"
                }`}
              >
                <span className="mr-1">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        {activeTab === "dashboard" && <Dashboard />}
        {activeTab === "transactions" && <TransactionsTable />}
        {activeTab === "debts" && <DebtsManager />}
        {activeTab === "settings" && <SettingsPanel />}
      </main>

      <footer className="text-center py-4 text-xs text-slate-400 dark:text-slate-500">
        💰 FinTracker — Твой финансовый помощник
      </footer>
    </div>
  );
}

export default function Home() {
  return (
    <PasswordProtect>
      <App />
    </PasswordProtect>
  );
}