"use client";
import { getMonthName } from "@/lib/utils";

export default function MonthSelector({ month, onChange }: { month: string; onChange: (m: string) => void }) {
  const shift = (delta: number) => {
    const [y, m] = month.split("-").map(Number);
    const d = new Date(y, m - 1 + delta);
    onChange(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  };

  return (
    <div className="flex items-center gap-2">
      <button onClick={() => shift(-1)} className="p-2 rounded-lg hover:bg-slate-200">←</button>
      <span className="text-lg font-semibold capitalize min-w-[180px] text-center">{getMonthName(month)}</span>
      <button onClick={() => shift(1)} className="p-2 rounded-lg hover:bg-slate-200">→</button>
    </div>
  );
}
