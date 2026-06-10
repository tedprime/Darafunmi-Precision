// dashboard.jsx
import { apiFetch } from "./api";
import { toastError } from "./useToast";

export async function getDashboardSummary() {
  try {
    const json = await apiFetch("/dashboard/summary");
    return json.data;
  } catch (err) {
    if (!err?.status) toastError("Dashboard: failed to load summary data.");
    throw err;
  }
}