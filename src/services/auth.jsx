import { apiFetch } from "./api";

export async function login(email, password) {
  const res = await apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  // Adjust the key below if your API returns a different shape
  // e.g. res.accessToken or res.data.accessToken
  const token =
    res.token ?? res.data?.token ?? res.accessToken ?? res.data?.accessToken;

  if (!token) throw new Error("No token received from server.");

  localStorage.setItem("token", token);
  return res;
}

export function logout() {
  localStorage.removeItem("token");
}
