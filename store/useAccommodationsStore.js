// stores/useAccommodationsStore.js
import { create } from "zustand";

export const useAccommodationsStore = create((set, get) => ({
  accommodations: [],
  searchResults: [],
  filteredResults: [],
  suggestedResults: [],
  nationalities: [],
  hotels: [],
  regions: [],
  isLoading: false,
  error: null,

  // Selected search context
  selectedRegion: null,
  selectedHotel: null,
  searchParams: null,

  // Fetch nationalities
  fetchNationalities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/nationalities`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const nationalitiesList = data?.data?.nationalities || [];

      set({
        nationalities: nationalitiesList,
        isLoading: false,
      });

      console.log("Fetched nationalities:", nationalitiesList);
      return nationalitiesList;
    } catch (err) {
      console.error("fetchNationalities error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch nationalities",
      });
      return [];
    }
  },

  // Fetch hotels and regions
  fetchHotelsAndRegions: async (searchTerm = "") => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/get_public_terms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: searchTerm,
            local: false,
          }),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const hotelsList = data?.data || [];
      const regionsList = data?.regions || [];

      set({
        hotels: hotelsList,
        regions: regionsList,
        isLoading: false,
      });

      console.log("Fetched hotels and regions:", {
        hotels: hotelsList,
        regions: regionsList,
      });
      return { hotels: hotelsList, regions: regionsList };
    } catch (err) {
      console.error("fetchHotelsAndRegions error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch hotels and regions",
      });
      return { hotels: [], regions: [] };
    }
  },

  // Fetch accommodations search results
  fetchAccommodations: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      // ✅ Safely use nights if provided, or calculate if dates exist
      const nights =
        payload?.nights ||
        (payload.start_date && payload.end_date
          ? Math.ceil(
              (new Date(payload.end_date) - new Date(payload.start_date)) /
                (1000 * 60 * 60 * 24)
            )
          : 1);

      // ✅ Build the exact payload structure required by API
      const apiPayload = {
        hotel_id:
          payload.hotel_id === undefined || payload.hotel_id === null
            ? false
            : payload.hotel_id,
        nationality: payload.nationality || "SG",
        nights,
        refund_policy: payload.refund_policy || "all",
        region: payload.region || payload.region_id || null,
        rooms: payload.rooms || [{ adult: 1, children: [] }],
        stars: payload.stars || "0",
        start_date:
          payload.start_date || new Date().toISOString().split("T")[0],
      };

      // ✅ Store this payload immediately in Zustand for reference
      //set({ searchParams: apiPayload });

      console.log("🧾 Zustand Search Params (Saved):", apiPayload);
      console.log("🌐 Sending payload to /public_stuba:", apiPayload);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(apiPayload),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();

      // ✅ Assume API returns accommodations in data.accommodations or data.data
      const results = data?.accommodations || data?.data || data || [];

      set({
        accommodations: results,
        searchResults: results,
        filteredResults: results,
        isLoading: false,
      });

      console.log("✅ Accommodations API Response:", data);
      return results;
    } catch (err) {
      console.error("fetchAccommodations error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch accommodations",
      });
      return [];
    }
  },

  // Suggestions for hotel/region search
  fetchSuggestedAccommodations: async (query) => {
    try {
      const { hotels, regions } = await get().fetchHotelsAndRegions(query);

      const hotelSuggestions = hotels.map((hotel) => ({
        ...hotel,
        type: "hotel",
      }));

      const regionSuggestions = regions.map((region) => ({
        ...region,
        type: "region",
      }));

      const suggestions = [...hotelSuggestions, ...regionSuggestions].slice(
        0,
        10
      );

      set({ suggestedResults: suggestions });
      return suggestions;
    } catch (err) {
      console.error("fetchSuggestedAccommodations error:", err);
      set({ suggestedResults: [] });
      return [];
    }
  },

  // Local filtering (no API call)
  applyAccommodationFilter: (filterFn) => {
    const all = get().searchResults;
    setTimeout(() => {
      const filtered =
        typeof filterFn === "function" ? all.filter(filterFn) : all;
      set({ filteredResults: filtered });
    }, 0);
  },

  resetAccommodationFilters: () => {
    const all = get().searchResults;
    set({ filteredResults: all });
  },

  // State setters
  setSelectedRegion: (region) => set({ selectedRegion: region }),
  setSelectedHotel: (hotel) => set({ selectedHotel: hotel }),
  setSearchResults: (results) =>
    set({
      searchResults: results,
      filteredResults: results,
    }),
  setSuggestedResults: (results) => set({ suggestedResults: results }),
  setSearchParams: (params) =>
    set({
      searchParams: {
        ...get().searchParams,
        ...params,
      },
    }),

  // Reset between searches
  clearAccommodationResults: () =>
    set({
      accommodations: [],
      searchResults: [],
      filteredResults: [],
      suggestedResults: [],
      searchParams: null,
      selectedRegion: null,
      selectedHotel: null,
    }),
}));
