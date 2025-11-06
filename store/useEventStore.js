// src/store/useEventStore.js
import { create } from "zustand";

export const useEventStore = create((set, get) => ({
  // STATE
  event: [],
  isLoading: false,
  error: null,

  // SETTER
  setEvent: (data) => set({ event: data }),

  // ACTION: Fetch event details
  FetchEvent: async () => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(
        `${$helpers.getEnv("API_BASE_URL")}/events/details/3`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const eventData = data?.data || [];

      // ✅ Save event to store
      set({ event: eventData, isLoading: false });

      return eventData;
    } catch (err) {
      console.error("FetchEvent error:", err);

      set({
        isLoading: false,
        error: err.message || "Failed to fetch event",
      });

      return [];
    }
  },
}));
