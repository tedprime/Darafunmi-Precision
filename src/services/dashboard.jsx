import { apiFetch } from "./api";

export async function getDashboardSummary() {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: {
      accept: "application/json",
    },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  return res.json();
}
