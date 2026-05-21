const BASE_URL = import.meta.env.VITE_API_BASE_URL;
console.log("ENV BASE_URL:", BASE_URL);

export async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem("token");

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...options,
  });

  if (!response.ok) throw new Error(`API error: ${response.status}`);
  return response.json();
}
