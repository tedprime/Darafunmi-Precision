// contact.jsx
import { apiFetch } from "./api.jsx";
import { toastError } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function getContactSubmissions({ page = 1, status = "" } = {}) {
  return wrap("Load messages", async () => {
    const params = new URLSearchParams({ page });
    if (status) params.set("status", status);
    const res = await apiFetch(`/contact?${params.toString()}`);
    return {
      data: res.data ?? [],
      pagination: res.pagination ?? {},
    };
  });
}

export async function getContactSubmission(id) {
  return wrap("Load message", async () => {
    const res = await apiFetch(`/contact/${id}`);
    return res.data;
  });
}

export async function updateContactStatus(id, status) {
  return wrap("Update message status", () =>
    apiFetch(`/contact/${id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    })
  );
}

export async function deleteContactSubmission(id) {
  return wrap("Delete message", () =>
    apiFetch(`/contact/${id}`, { method: "DELETE" })
  );
}