import { apiFetch } from "./api.jsx";

// ─── GET /contact ─────────────────────────────────────────────────────────────
// Params: page (int), status ("new" | "read" | "replied")
export async function getContactSubmissions({ page = 1, status = "" } = {}) {
  const params = new URLSearchParams({ page });
  if (status) params.set("status", status);

  const res = await apiFetch(`/contact?${params.toString()}`);
  return {
    data: res.data ?? [],
    pagination: res.pagination ?? {},
  };
}

// ─── GET /contact/{id} ────────────────────────────────────────────────────────
export async function getContactSubmission(id) {
  const res = await apiFetch(`/contact/${id}`);
  return res.data;
}

// ─── PATCH /contact/{id}/status ───────────────────────────────────────────────
// status: "new" | "read" | "replied"
export async function updateContactStatus(id, status) {
  return apiFetch(`/contact/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
}


export async function deleteContactSubmission(id) {
  return apiFetch(`/contact/${id}`, { method: "DELETE" });
}