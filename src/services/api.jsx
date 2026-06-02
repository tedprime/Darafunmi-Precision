const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export async function apiFetch(endpoint, options = {}, retries = 3) {
  const token = localStorage.getItem("token");

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const response = await fetch(`${BASE_URL}${endpoint}`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        ...options,
      });

      if (response.status === 401) {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }

      if (!response.ok) throw new Error(`API error: ${response.status}`);
      return response.json();

    } catch (err) {
      const isLast = attempt === retries;
      if (isLast) throw err; // give up after 3 tries
      await new Promise((res) => setTimeout(res, attempt * 1000)); // wait 1s, 2s, 3s
    }
  }
}