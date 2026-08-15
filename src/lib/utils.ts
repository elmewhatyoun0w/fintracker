export function formatMoney(amount: number, currency = "₽"): string {
  return new Intl.NumberFormat("ru-RU").format(amount) + " " + currency;
}

export function getCurrentMonth(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getToday(): string {
  return new Date().toISOString().slice(0, 10);
}

export function getMonthName(monthStr: string): string {
  const [year, month] = monthStr.split("-").map(Number);
  const date = new Date(year, month - 1);
  return date.toLocaleDateString("ru-RU", { month: "long", year: "numeric" });
}
