function getApiBaseUrl() {
  const baseUrl =
    process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL;
  if (!baseUrl) {
    throw new Error("The API base URL is not configured.");
  }

  return baseUrl.replace(/\/+$/, "");
}

async function readJsonResponse(response, action) {
  let body;
  try {
    body = await response.json();
  } catch {
    throw new Error("The event registration service returned an invalid response.");
  }

  if (!response.ok || body?.status === false) {
    throw new Error(
      body?.message || body?.error || `Unable to ${action} (${response.status}).`
    );
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Error("The event registration service returned an invalid response.");
  }

  return body;
}

export async function fetchEventRegistrationForm(eventSlug, { signal } = {}) {
  const response = await fetch(
    `${getApiBaseUrl()}/events/${encodeURIComponent(eventSlug)}/registration-form`,
    {
      method: "GET",
      headers: { Accept: "application/json" },
      cache: "no-store",
      signal,
    }
  );
  const body = await readJsonResponse(response, "load the registration form");
  const rawForm = body.data ?? body;

  if (!rawForm || typeof rawForm !== "object") {
    throw new Error("The event registration service returned an incomplete form.");
  }

  const questions = Array.isArray(rawForm.questions)
    ? rawForm.questions
    : Array.isArray(rawForm.registration_questions)
      ? rawForm.registration_questions
      : null;
  const tiers = Array.isArray(rawForm.tiers) ? rawForm.tiers : null;

  if (!questions || !tiers) {
    throw new Error("The event registration service returned an incomplete form.");
  }

  return { ...rawForm, questions, tiers };
}

export async function submitEventRegistration(eventSlug, payload) {
  const response = await fetch(
    `${getApiBaseUrl()}/events/${encodeURIComponent(eventSlug)}/register`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    }
  );

  return readJsonResponse(response, "submit your registration");
}
