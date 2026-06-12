// newsletter.jsx
import { apiFetch } from "./api.jsx";
import { toastError, toastSuccess } from "./useToast";

const wrap = async (label, fn) => {
  try {
    return await fn();
  } catch (err) {
    if (!err?.status) toastError(`${label}: an unexpected error occurred.`);
    throw err;
  }
};

export async function getNewsletterSubscribers({ page = 1, limit = 50 } = {}) {
  return wrap("Load subscribers", () => {
    const params = new URLSearchParams();
    params.set("page", String(page));
    params.set("limit", String(limit));
    return apiFetch(`/newsletter?${params.toString()}`);
  });
}

// export async function unsubscribeNewsletter(email) {
//   return wrap("Unsubscribe", () =>
//     apiFetch("/newsletter/unsubscribe", {
//       method: "POST",
//       body: JSON.stringify({ email }),
//     })
//   );
// }
export async function unsubscribeNewsletter(email) {
  return wrap("Unsubscribe", () =>
    apiFetch("/newsletter/unsubscribe", {
      method: "POST",
      body: JSON.stringify({ email }),
    }).then((res) => {
      console.log("Unsubscribe response:", res);
      return res;
    })
  );
}