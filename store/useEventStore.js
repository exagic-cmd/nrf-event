// src/store/useEventStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useEventStore = create(
  persist(
    (set, get) => ({
      event: null,
      lastFetched: null,       // add timestamp
      isLoading: false,
      error: null,

      setEvent: data => set({ event: data, lastFetched: Date.now() }),

      FetchEvent: async (router) => {
        const { isLoading, lastFetched, event } = get();

        // Skip if already fetching (concurrent call guard)
        if (isLoading) return event;

        // Skip if data is still fresh (within 1 hour)
        const ONE_HOUR = 60 * 60 * 1000;
        if (lastFetched && Date.now() - lastFetched < ONE_HOUR && event?.event) {
          return event;
        }

        set({ isLoading: true, error: null });

        try {
          const apiBaseUrl = (typeof $helpers !== "undefined" && $helpers?.getEnv)
            ? $helpers.getEnv("API_BASE_URL")
            : (process.env.NEXT_PUBLIC_API_BASE_URL || "");

          const res = await fetch(
            `${apiBaseUrl}/events/details/3`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );

          if (!res.ok) throw new Error("Network response was not ok");

          const json = await res.json();

          // If not published redirect to the error page.
          if (json?.data?.event?.is_published === 0) {
            const message = encodeURIComponent("This event is not currently available.");
            if (router) {
              router.push(`/error?message=${message}`);
            } else {
              console.warn("Router instance not passed to FetchEvent. Using window.location for redirection.");
              window.location.href = `/error?message=${message}`;
            }
            set({ isLoading: false, error: "Event not published." });
            return null;
          }

          const eventData = json?.data || null;

          set({
            event: eventData,
            lastFetched: Date.now(),
            isLoading: false
          });
          return eventData;
        } catch (err) {
          set({
            isLoading: false,
            error: err.message || "Failed to fetch event"
          });
          return null;
        }
      }
    }),

    {
      name: "event-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
