import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useSearchValuesStore = create(
  persist(
    (set) => ({
      // Transfer search values
      transferParams: {
        pickup: null,
        dropoff: null,
        tripType: "one-way",
        returnDate: null,
      },
      setTransferParams: (params) =>
        set((state) => ({
          transferParams: { ...state.transferParams, ...params },
        })),

      // Daytour search values
      daytourParams: {
        country: null,
        city: null,
        searchQuery: "",
      },
      setDaytourParams: (params) =>
        set((state) => ({
          daytourParams: { ...state.daytourParams, ...params },
        })),

      // Accommodation search values
      accommodationParams: {
        checkin: null,
        checkout: null,
        rooms: [{ adult: 2, children: [] }],
        text: "",
        stars: "0",
        nationality: null,
      },
      setAccommodationParams: (params) =>
        set((state) => ({
          accommodationParams: { ...state.accommodationParams, ...params },
        })),
    }),
    {
      name: "search-values-storage", // name of the item in localStorage
    }
  )
);