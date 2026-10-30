export async function submitMiceInquiry(payload) {
  const response = await fetch(`${getApiBaseUrl()}/mice-inquiry/submit`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new Error(
      body?.message || body?.error || `Unable to submit your inquiry (${response.status}).`
    );
  }

  return body;
}

function getApiBaseUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("The API base URL is not configured.");
  }

  return baseUrl.replace(/\/+$/, "");
}
