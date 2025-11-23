export async function ensureCsrfCookie() {
  const res = await fetch("https://app.exploresingapore.ai/sanctum/csrf-cookie", {
    credentials: "include",   // important to send cookies cross-origin
  });
  if (!res.ok) {
    throw new Error("Failed to get CSRF cookie");
  }
}


export function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop().split(';').shift();
}
