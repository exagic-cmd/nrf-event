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
        set({ isLoading: true, error: null });

        try {
          const res = await fetch(
            `${$helpers.getEnv("API_BASE_URL")}/events/details/3`,
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
