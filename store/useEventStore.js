// src/store/useEventStore.js
import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

export const useEventStore = create(
  persist(
    (set, get) => ({
      event: [],
      lastFetched: null,       // add timestamp
      isLoading: false,
      error: null,

      setEvent: data => set({ event: data, lastFetched: Date.now() }),

      FetchEvent: async () => {
        set({ isLoading: true, error: null });

        try {
          const res = await fetch(
            `${$helpers.getEnv("API_BASE_URL")}/events/details/3`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
          );

          if (!res.ok) throw new Error("Network response was not ok");

          const json = await res.json();
          const eventData = json?.data || [];

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

          return [];
        }
      }
    }),

    {
      name: "event-store",
      storage: createJSONStorage(() => sessionStorage)
    }
  )
);
