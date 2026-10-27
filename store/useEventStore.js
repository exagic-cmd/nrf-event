import { create } from "zustand";
import useCurrencyStore from "@/store/useCurrencyStore";
import { encodeEventId } from "@/utils/cryptoUtils";

let requestSequence = 0;
const pendingRequests = new Map();
const ONE_HOUR = 60 * 60 * 1000;
export const EVENT_PARTNERSHIP_ENDPOINT = "/events/partnership/register";

class EventRequestError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

function getApiBaseUrl() {
  const baseUrl =
    (typeof $helpers !== "undefined" && $helpers?.getEnv?.("API_BASE_URL")) ||
    process.env.NEXT_PUBLIC_API_BASE_URL;

  if (!baseUrl) {
    throw new Error("The event API base URL is not configured.");
  }

  return baseUrl.replace(/\/+$/, "");
}

async function readResponse(response) {
  let body;
  try {
    body = await response.json();
  } catch {
    body = null;
  }

  if (!response.ok) {
    throw new EventRequestError(
      body?.message || body?.error || `Event request failed (${response.status}).`,
      response.status
    );
  }

  if (!body || typeof body !== "object") {
    throw new Error("The event API returned an invalid response.");
  }

  return body;
}

function getResolvedEvent(body) {
  const payload = body.data ?? body;
  return payload?.event ?? payload;
}

function getEventData(body, fallbackBody = {}) {
  const payload = body.data ?? body;
  const fallbackPayload = fallbackBody.data ?? fallbackBody;
  const event =
    payload?.event && typeof payload.event === "object"
      ? payload.event
      : payload;
  const fallbackEvent = getResolvedEvent(fallbackBody);

  if (!event || typeof event !== "object" || Array.isArray(event)) {
    throw new Error("The event-detail API returned invalid event details.");
  }

  const recommendedProducts = [
    event.recommended_products,
    payload?.recommended_products,
    fallbackEvent?.recommended_products,
    fallbackPayload?.recommended_products,
  ].find(Array.isArray);

  return {
    ...(fallbackPayload?.event ? fallbackPayload : {}),
    ...payload,
    event: {
      ...(fallbackEvent && typeof fallbackEvent === "object" ? fallbackEvent : {}),
      ...event,
      ...(recommendedProducts ? { recommended_products: recommendedProducts } : {}),
    },
  };
}

function isExpiredEvent(body, event) {
  const payload = body.data ?? body;
  const status = String(
    payload?.status ?? payload?.event_status ?? event?.status ?? ""
  ).toLowerCase();

  if (
    payload?.is_expired === true ||
    payload?.expired === true ||
    payload?.is_available === false ||
    event?.is_expired === true ||
    event?.expired === true ||
    event?.is_available === false ||
    ["expired", "closed", "unavailable", "not_published"].includes(status)
  ) {
    return true;
  }

  const endDate = event?.end_date ?? event?.end_at;
  if (endDate) {
    const parsedEndDate = new Date(endDate);
    if (/^\d{4}-\d{2}-\d{2}$/.test(String(endDate))) {
      parsedEndDate.setHours(23, 59, 59, 999);
    }
    const endTime = parsedEndDate.getTime();
    if (Number.isFinite(endTime) && endTime < Date.now()) return true;
  }

  return false;
}

function setCurrencies(eventData) {
  if (Array.isArray(eventData?.currencies)) {
    useCurrencyStore.getState().setCurrencies(eventData.currencies);
  }
}

export const useEventStore = create((set, get) => ({
  event: null,
  eventSlug: null,
  lastFetched: null,
  isLoading: false,
  status: "idle",
  error: null,

  submitEventPartnership: async (payload) => {
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
      throw new Error("Event partnership submission requires a payload object.");
    }

    const request = {
      method: "POST",
      endpoint: EVENT_PARTNERSHIP_ENDPOINT,
      payload,
    };

    console.info("Event partnership API placeholder; request not sent:", request);
    return request;
  },

  setEvent: (data, slug = get().eventSlug) => {
    set({
      event: data,
      eventSlug: slug,
      lastFetched: Date.now(),
      isLoading: false,
      status: "ready",
      error: null,
    });
    setCurrencies(data);
  },

  clearEvent: () => {
    requestSequence += 1;
    set({
      event: null,
      eventSlug: null,
      lastFetched: null,
      isLoading: false,
      status: "idle",
      error: null,
    });
  },

  FetchEventById: async (id) => {
    if (id === null || id === undefined || id === "") {
      return null;
    }

    const normalizedId = String(id);
    const requestKey = `id:${normalizedId}`;
    const current = get();

    if (
      current.eventSlug === null &&
      current.status === "ready" &&
      String(current.event?.event?.id ?? current.event?.id) === normalizedId &&
      current.lastFetched &&
      Date.now() - current.lastFetched < ONE_HOUR
    ) {
      return current.event;
    }

    if (current.eventSlug === null && current.status === "loading") {
      return pendingRequests.get(requestKey) ?? null;
    }

    const sequence = ++requestSequence;
    set({
      event: null,
      eventSlug: null,
      lastFetched: null,
      isLoading: true,
      status: "loading",
      error: null,
    });

    let task;
    task = Promise.resolve().then(async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const detailResponse = await fetch(
          `${apiBaseUrl}/events/details/${encodeURIComponent(encodeEventId(id))}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const detailBody = await readResponse(detailResponse);
        const resolvedEvent = getResolvedEvent(detailBody);

        if (isExpiredEvent(detailBody, resolvedEvent)) {
          if (sequence === requestSequence && get().eventSlug === null) {
            set({
              event: null,
              isLoading: false,
              status: "expired",
              error: "This event is no longer available.",
            });
          }
          return null;
        }

        const eventData = getEventData(detailBody);
        if (sequence === requestSequence && get().eventSlug === null) {
          set({
            event: eventData,
            lastFetched: Date.now(),
            isLoading: false,
            status: "ready",
            error: null,
          });
          setCurrencies(eventData);
        }

        return eventData;
      } catch (error) {
        const status = error instanceof EventRequestError ? error.status : null;
        const isNotFound = status === 404;
        const isExpired = status === 410;
        const message = isNotFound
          ? "This event could not be found."
          : isExpired
          ? "This event is no longer available."
          : error.message || "Unable to load this event. Please try again.";

        if (sequence === requestSequence && get().eventSlug === null) {
          set({
            event: null,
            isLoading: false,
            status: isNotFound ? "not-found" : isExpired ? "expired" : "error",
            error: message,
          });
        }

        console.error(`Failed to load event ID "${normalizedId}":`, error);
        return null;
      } finally {
        if (pendingRequests.get(requestKey) === task) {
          pendingRequests.delete(requestKey);
        }
      }
    });

    pendingRequests.set(requestKey, task);
    return task;
  },

  FetchEvent: async (slug) => {
    if (typeof slug !== "string" || !slug.trim()) {
      return null;
    }

    const normalizedSlug = slug.trim();
    const current = get();

    if (
      current.eventSlug === normalizedSlug &&
      current.status === "ready" &&
      current.lastFetched &&
      Date.now() - current.lastFetched < ONE_HOUR
    ) {
      return current.event;
    }

    if (current.eventSlug === normalizedSlug && current.isLoading) {
      return pendingRequests.get(normalizedSlug) ?? null;
    }

    const sequence = ++requestSequence;
    set({
      event: null,
      eventSlug: normalizedSlug,
      lastFetched: null,
      isLoading: true,
      status: "loading",
      error: null,
    });

    let task;
    task = Promise.resolve().then(async () => {
      try {
        const apiBaseUrl = getApiBaseUrl();
        const slugResponse = await fetch(
          `${apiBaseUrl}/events/slug/${encodeURIComponent(normalizedSlug)}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const slugBody = await readResponse(slugResponse);
        const resolvedEvent = getResolvedEvent(slugBody);

        if (isExpiredEvent(slugBody, resolvedEvent)) {
          if (sequence === requestSequence && get().eventSlug === normalizedSlug) {
            set({
              event: null,
              isLoading: false,
              status: "expired",
              error: "This event is no longer available.",
            });
          }
          return null;
        }

        const eventId =
          resolvedEvent?.id ??
          resolvedEvent?.event_id ??
          slugBody?.data?.event_id ??
          slugBody?.event_id;

        if (eventId === null || eventId === undefined || eventId === "") {
          throw new Error("The slug API response did not include an event ID.");
        }

        const encodedEventId = encodeEventId(eventId);
        const detailResponse = await fetch(
          `${apiBaseUrl}/events/details/${encodeURIComponent(encodedEventId)}`,
          { method: "GET", headers: { "Content-Type": "application/json" } }
        );
        const detailBody = await readResponse(detailResponse);
        const eventData = getEventData(detailBody, slugBody);

        if (isExpiredEvent(detailBody, eventData.event)) {
          if (sequence === requestSequence && get().eventSlug === normalizedSlug) {
            set({
              event: null,
              isLoading: false,
              status: "expired",
              error: "This event is no longer available.",
            });
          }
          return null;
        }

        if (sequence === requestSequence && get().eventSlug === normalizedSlug) {
          set({
            event: eventData,
            lastFetched: Date.now(),
            isLoading: false,
            status: "ready",
            error: null,
          });
          setCurrencies(eventData);
        }

        return eventData;
      } catch (error) {
        const status = error instanceof EventRequestError ? error.status : null;
        const isNotFound = status === 404;
        const isExpired = status === 410;
        const message = isNotFound
          ? "This event could not be found."
          : isExpired
          ? "This event is no longer available."
          : error.message || "Unable to load this event. Please try again.";

        if (sequence === requestSequence && get().eventSlug === normalizedSlug) {
          set({
            event: null,
            isLoading: false,
            status: isNotFound ? "not-found" : isExpired ? "expired" : "error",
            error: message,
          });
        }

        console.error(`Failed to load event "${normalizedSlug}":`, error);
        return null;
      } finally {
        if (pendingRequests.get(normalizedSlug) === task) {
          pendingRequests.delete(normalizedSlug);
        }
      }
    });

    pendingRequests.set(normalizedSlug, task);
    return task;
  },
}));
