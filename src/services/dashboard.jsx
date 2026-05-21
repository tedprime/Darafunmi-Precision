const BASE_URL = import.meta.env.VITE_API_URL;

export async function getDashboardSummary() {
  const res = await fetch(`${BASE_URL}/dashboard/summary`, {
    headers: { "accept": "application/json" },
  });
  if (!res.ok) throw new Error("Failed to fetch dashboard summary");
  const json = await res.json();
  return json.data;
}