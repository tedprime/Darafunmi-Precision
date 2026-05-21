import { apiFetch } from "./api";

export async function getDashboardSummary() {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: {
      accept: "application/json",
      // "Authorization": `Bearer ${localStorage.getItem("token")}`
    },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  const json = await res.json();
  return json.data;
}
