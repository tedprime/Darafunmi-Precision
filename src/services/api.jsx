import { apiFetch } from "./api";

export async function getDashboardSummary() {
  const json = await apiFetch("/dashboard/summary");
  return json.data;
}