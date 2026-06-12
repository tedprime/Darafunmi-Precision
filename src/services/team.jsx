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

export async function getTeamMembers() {
  return wrap("Load team", () => apiFetch("/team/admin"));
}

export async function createTeamMember(formData) {
  return wrap("Create member", () =>
    apiFetch("/team", {
      method: "POST",
      body: formData,
      headers: {},  // let browser set multipart boundary
    })
  );
}

export async function updateTeamMember(id, formData) {
  return wrap("Update member", () =>
    apiFetch(`/team/${id}`, {
      method: "PATCH",
      body: formData,
      headers: {},
    })
  );
}

export async function deleteTeamMember(id) {
  return wrap("Delete member", () =>
    apiFetch(`/team/${id}`, { method: "DELETE" })
  );
}