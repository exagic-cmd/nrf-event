import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSearchValuesStore = create(
  persist(
    (set) => {
      const initialTransferParams = {
        pickup: null,
        dropoff: null,
        tripType: "one-way",
        returnDate: null,
      };

      const initialDaytourParams = {
        country: null,
        city: null,
        searchQuery: "",
        search: "", // Added for consistency
      };

      const initialAccommodationParams = {
        checkin: null,
        checkout: null,
        rooms: [{ adult: 2, children: [] }],
        text: "",
        stars: "0",
        nationality: null,
      };

      return {
      // Transfer search values
      transferParams: initialTransferParams,
      setTransferParams: (params) =>
        set((state) => ({
          transferParams: { ...state.transferParams, ...params },
        })),

      // Daytour search values
      daytourParams: initialDaytourParams,
      setDaytourParams: (params) =>
        set((state) => ({
          daytourParams: { ...state.daytourParams, ...params },
        })),

      // Accommodation search values
      accommodationParams: initialAccommodationParams,
      setAccommodationParams: (params) =>
        set((state) => ({
          accommodationParams: { ...state.accommodationParams, ...params },
        })),

      // Function to clear all search values
      clearAllSearchParams: () =>
        set({
          transferParams: initialTransferParams,
          daytourParams: initialDaytourParams,
          accommodationParams: initialAccommodationParams,
        }),
      };
    },
    {
      name: "search-values-storage", // name of the item in localStorage
    }
  )
);