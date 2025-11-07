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
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/get_terms`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            term: searchTerm,
            local: false,
            caterogry_id: 4,
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

  // Set search parameters and trigger search immediately
  setSearchParamsAndSearch: async (payload) => {
    console.log("🚀 Setting search params and triggering search:", payload);
    
    // First, set the search params in store
    set({ searchParams: payload, isLoading: true, error: null });
    
    // Then immediately trigger the search
    await get().fetchAccommodations(payload);
  },

  // Fetch accommodations search results
  fetchAccommodations: async (payload) => {
    // If no payload provided, use existing searchParams
    const searchPayload = payload || get().searchParams;
    
    if (!searchPayload) {
      console.error("❌ No search payload provided");
      set({ isLoading: false, error: "No search criteria provided" });
      return [];
    }

    set({ isLoading: true, error: null });

    try {
      const apiPayload = {
        hotel_id:
          searchPayload.hotel_id === undefined || searchPayload.hotel_id === null
            ? false
            : searchPayload.hotel_id,
        region: searchPayload.region || searchPayload.region_id || false,
        nationality: searchPayload.nationality || "SG",
        refund_policy: searchPayload.refund_policy || "all",
        stars: searchPayload.stars || "0",
        rooms: searchPayload.rooms || [{ adult: 1, children: [] }],
        nights:
          searchPayload.nights ||
          (searchPayload.start_date && searchPayload.end_date
            ? Math.ceil(
                (new Date(searchPayload.end_date) - new Date(searchPayload.start_date)) /
                  (1000 * 60 * 60 * 24)
              )
            : 1),
        start_date:
          searchPayload.start_date || new Date().toISOString().split("T")[0],
        end_date: searchPayload.end_date || null,
        search: searchPayload.search || "",
        visitor_id: searchPayload.visitor_id || null,
      };

      console.log("🧾 Final API Payload:", apiPayload);

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(apiPayload),
      });

      if (!res.ok) {
        const txt = await res.text().catch(() => null);
        throw new Error(`Network response was not ok: ${res.status} ${res.statusText} ${txt || ''}`);
      }

      const data = await res.json();

      // Assume API returns accommodations in data.accommodations or data.data
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
  
  // Set search params without triggering search
  setSearchParams: (params) => {
    const current = get().searchParams;
    const next = { ...current, ...params };

    // Prevent unnecessary updates
    if (JSON.stringify(current) === JSON.stringify(next)) {
      return;
    }

    set({ searchParams: next });
  },

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
