// stores/useDaytoursStore.js
import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";
import useCurrencyStore from "@/store/useCurrencyStore";

export const useDaytoursStore = create((set, get) => ({
  countries: [],
  cities: [],
  searchResults: [],
  filteredResults: [],
  suggestedResults: [],
  isLoading: false,
  error: null,

  // Selected search context
  selectedCity: null,
  selectedCountry: null,
  currentCategory: null, // "daytour" | "accommodation"
  searchParams: null,
  searchQuery: "",
  lastSuggestedQuery: "",

  // Fetch countries & cities
  fetchCountriesCities: async () => {
    // Skip if already loading or already fetched
    if (get().isLoading || get().countries.length > 0) return;
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

      console.log("Fetched countries:", res?.data?.result);
    } catch (err) {
      console.error("fetchCountriesCities error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch countries",
      });
    }
  },

  // Unified fetch for Day Tours (3) and Accommodation (4)
  fetchSearchResults: async (payload) => {
    set({ isLoading: true, error: null });

    const currencyId =
      payload?.currency_id ||
      useCurrencyStore.getState()?.currencyId ||
      (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
      2;

    const requestPayload = {
      ...payload,
      currency_id: currencyId,
    };

    console.log("fetchSearchResults payload:", requestPayload);

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_b2b_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestPayload),
        }
      );

      if (!res.ok) {
        let errorBody = "";
        try {
          errorBody = await res.text();
        } catch (_) {}
        console.error(
          `fetchSearchResults failed: HTTP ${res.status} ${res.statusText}`,
          errorBody
        );
        throw new Error(
          `API request failed with status ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();
      const results = data?.products || data?.data || [];

      const isDayTour = requestPayload.category_id === 3;
      const categoryType = isDayTour ? "daytour" : "accommodation";

      // Keep only first language
      const processedResults = results.map((item) => {
        if (Array.isArray(item.languages) && item.languages.length > 0) {
          return item.languages[0];
        }
        return item;
      });

      const finalResults = isDayTour ? processedResults : results;

      set({
        searchResults: finalResults,
        filteredResults: finalResults,
        isLoading: false,
        currentCategory: categoryType,
        searchParams: requestPayload,
      });

      console.log(`${categoryType.toUpperCase()} API Response:`, data);
      return finalResults;
    } catch (err) {
      console.error("fetchSearchResults error:", err);
      set({ isLoading: false, error: err.message });
      return [];
    }
  },

  // Alias for listings/other components
  fetchDaytours: async (payload) => {
    return get().fetchSearchResults(payload);
  },

  // Suggestions for input search
  fetchSuggestedResults: async (query, currency_id) => {
    const q = typeof query === "string" ? query : get().lastSuggestedQuery;
    if (!q || !q.trim()) {
      set({ suggestedResults: [], lastSuggestedQuery: "" });
      return [];
    }

    set({ lastSuggestedQuery: q });

    const currencyId =
      currency_id ||
      useCurrencyStore.getState()?.currencyId ||
      (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
      2;

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: q,
            is_b2c_only: 1,
            is_active: true,
            category_id: 3, // Daytour category
            currency_id: currencyId,
          }),
        }
      );

      if (!res.ok) {
        let errorBody = "";
        try {
          errorBody = await res.text();
        } catch (_) {}
        console.error(
          `fetchSuggestedResults failed: HTTP ${res.status} ${res.statusText}`,
          errorBody
        );
        throw new Error(
          `API request failed with status ${res.status}: ${res.statusText}`
        );
      }

      const data = await res.json();
      const suggestions = data?.products || data?.data || [];

      set({ suggestedResults: suggestions.slice(0, 5) });
      return suggestions.slice(0, 5);
    } catch (err) {
      console.error("fetchSuggestedResults error:", err);
      set({ suggestedResults: [] });
      return [];
    }
  },

  // Local filtering (no API call)
  applyClientFilter: (filterFn) => {
    const all = get().searchResults;
    const filtered = typeof filterFn === "function" ? all.filter(filterFn) : all;
    set({ filteredResults: filtered });
  },

  resetFilters: () => {
    const all = get().searchResults;
    set({ filteredResults: all });
  },

  // State setters
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchResults: (results) => set({ searchResults: results, filteredResults: results }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setSuggestedResults: (results) => set({ suggestedResults: results }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  setSearchParams: (params) =>
    set({
      searchParams: {
        ...get().searchParams,
        ...params,
      },
    }),

  // Reset between searches
  clearResults: () =>
    set({
      searchResults: [],
      filteredResults: [],
      suggestedResults: [],
      searchParams: null,
      selectedCity: null,
      selectedCountry: null,
      currentCategory: null,
      searchQuery: "",
      lastSuggestedQuery: "",
    }),
}));

// Automatically re-fetch records when currency changes
if (typeof window !== "undefined") {
  const handleCurrencyChange = (newCurrencyId) => {
    if (!newCurrencyId) return;
    const state = useDaytoursStore.getState();

    // 1. Refetch suggested results if there is an active search query
    const activeQuery = state.lastSuggestedQuery || state.searchQuery;
    if (activeQuery && activeQuery.trim().length > 1) {
      state.fetchSuggestedResults(activeQuery, newCurrencyId);
    }

    // 2. Refetch search results if there are existing searchParams
    if (state.searchParams) {
      state.fetchSearchResults({
        ...state.searchParams,
        currency_id: newCurrencyId,
      });
    }
  };

  window.addEventListener("currencyChange", (e) => {
    const newCurrencyId = e?.detail?.currencyId || e?.detail?.currency_id;
    handleCurrencyChange(newCurrencyId);
  });

  useCurrencyStore.subscribe((state, prevState) => {
    if (state?.currencyId && state.currencyId !== prevState?.currencyId) {
      handleCurrencyChange(state.currencyId);
    }
  });
}