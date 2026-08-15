async function fetchJSON<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json() as Promise<T>;
}

export function getDashboard(month: string) { return fetchJSON<any>(`/api/dashboard?month=${month}`); }
export function getTransactions(params?: { month?: string }) {
  const sp = new URLSearchParams();
  if (params?.month) sp.set("month", params.month);
  return fetchJSON<any[]>(`/api/transactions?${sp}`);
}
export function createTransaction(data: any) { return fetchJSON("/api/transactions", { method: "POST", body: JSON.stringify(data) }); }
export function updateTransaction(id: number, data: any) { return fetchJSON(`/api/transactions/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteTransaction(id: number) { return fetchJSON(`/api/transactions/${id}`, { method: "DELETE" }); }
export function getCategories(type?: string) { return fetchJSON<any[]>(`/api/categories${type ? `?type=${type}` : ""}`); }
export function getDebts() { return fetchJSON<any[]>("/api/debts"); }
export function createDebt(data: any) { return fetchJSON("/api/debts", { method: "POST", body: JSON.stringify(data) }); }
export function updateDebt(id: number, data: any) { return fetchJSON(`/api/debts/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteDebt(id: number) { return fetchJSON(`/api/debts/${id}`, { method: "DELETE" }); }
export function addDebtPayment(debtId: number, data: any) { return fetchJSON(`/api/debts/${debtId}/payments`, { method: "POST", body: JSON.stringify(data) }); }
export function getSavingsGoals() { return fetchJSON<any[]>("/api/savings"); }
export function createSavingsGoal(data: any) { return fetchJSON("/api/savings", { method: "POST", body: JSON.stringify(data) }); }
export function updateSavingsGoal(id: number, data: any) { return fetchJSON(`/api/savings/${id}`, { method: "PUT", body: JSON.stringify(data) }); }
export function deleteSavingsGoal(id: number) { return fetchJSON(`/api/savings/${id}`, { method: "DELETE" }); }
export function getSettings() { return fetchJSON<any>("/api/settings"); }
export function updateSettings(data: any) { return fetchJSON("/api/settings", { method: "PUT", body: JSON.stringify(data) }); }
export function seedDB() { return fetchJSON("/api/seed", { method: "POST" }); }
