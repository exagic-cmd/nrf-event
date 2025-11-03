import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";

export const useDaytoursStore = create((set, get) => ({
  countries: [],
  cities: [],
  searchResults: [],
  filteredResults: [],
  suggestedResults: [],
  isLoading: false,
  error: null,

  // 🌍 Selected search context
  selectedCity: null,
  selectedCountry: null,
  currentCategory: null, // "daytour" | "accommodation"

  // 🧭 Last search params (so Listings can use them)
  searchParams: null,

  /**
   * ✅ Fetch countries & cities
   * Endpoint: getcitiescountries
   */
  fetchCountriesCities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest({
        endpoint: "getcitiescountries",
        method: "GET",
      });

      set({
        countries: res?.data?.result || [],
        isLoading: false,
      });

      console.log("✅ Fetched countries:", res?.data?.result);
    } catch (err) {
      console.error("❌ fetchCountriesCities error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch countries",
      });
    }
  },

  /**
   * ✅ Unified fetch for Day Tours (3) and Accommodation (4)
   * Endpoint: /affliate/get_public_b2b_products
   */
  fetchSearchResults: async (payload) => {
    set({ isLoading: true, error: null });

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_b2b_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const results = data?.products || data?.data || [];

      const isDayTour = payload.category_id === 3;
      const categoryType = isDayTour ? "daytour" : "accommodation";

      // 🧠 Keep only index 0 language (if available)
      const processedResults = results.map((item) => {
        if (Array.isArray(item.languages) && item.languages.length > 0) {
          return item.languages[0];
        }
        return item;
      });

      // 🧩 For Day Tours — enable client-side filtering
      const finalResults = isDayTour ? processedResults : results;

      set({
        searchResults: finalResults,
        filteredResults: finalResults,
        isLoading: false,
        currentCategory: categoryType,
        searchParams: payload,
      });

      console.log(`✅ ${categoryType.toUpperCase()} API Response:`, data);
      return finalResults;
    } catch (err) {
      console.error("❌ fetchSearchResults error:", err);
      set({ isLoading: false, error: err.message });
      return [];
    }
  },

  /**
   * ✅ Suggestions for input search
   */
  fetchSuggestedResults: async (query) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: query,
            is_b2c_only: 1,
          }),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const suggestions = data?.products || data?.data || [];

      set({ suggestedResults: suggestions.slice(0, 5) });
    } catch (err) {
      console.error("❌ fetchSuggestedResults error:", err);
      set({ suggestedResults: [] });
    }
  },

  // ✅ Local filtering (no API call)
  applyClientFilter: (filterFn) => {
    const all = get().searchResults;
    const filtered = typeof filterFn === "function" ? all.filter(filterFn) : all;
    set({ filteredResults: filtered });
  },

  resetFilters: () => {
    const all = get().searchResults;
    set({ filteredResults: all });
  },

  // ✅ State setters
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchResults: (results) => set({ searchResults: results, filteredResults: results }),
  setSuggestedResults: (results) => set({ suggestedResults: results }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setSearchParams: (params) =>
    set({
      searchParams: {
        ...get().searchParams,
        ...params,
      },
    }),

  /**
   * 🧹 Reset between searches or on HomePage mount
   */
  clearResults: () =>
    set({
      searchResults: [],
      filteredResults: [],
      suggestedResults: [],
      searchParams: null,
      selectedCity: null,
      selectedCountry: null,
      currentCategory: null,
    }),
}));
