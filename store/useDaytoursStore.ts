import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";

export const useDaytoursStore = create((set, get) => ({
  countries: [],
  searchResults: [],
  suggestedResults: [],
  isLoading: false,
  error: null,
  selectedCity: null,
  selectedCountry: null,
  currentCategory: null, // 'daytour' or 'accommodation'

  /**
   * ✅ Fetch list of countries and cities
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
      set({
        isLoading: false,
        error: err.message || "Failed to fetch countries",
      });
      console.error("❌ fetchCountriesCities error:", err);
    }
  },

  /**
   * ✅ Fetch search results for both Day Tours (3) and Accommodation (4)
   * Endpoint: /affliate/get_public_products
   */
  fetchSearchResults: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const results = data?.products || data?.data || [];

      set({
        searchResults: results,
        isLoading: false,
        currentCategory: payload.category_id === 3 ? 'daytour' : 'accommodation'
      });

      console.log(`✅ ${payload.category_id === 3 ? 'Day Tours' : 'Accommodation'} API Response:`, data);
      return results; // Return results for immediate use
    } catch (err) {
      console.error("❌ fetchSearchResults error:", err);
      set({ isLoading: false, error: err.message });
      return [];
    }
  },

  /**
   * ✅ Fetch suggested results for search input
   */
  fetchSuggestedResults: async (query) => {
    try {
      // You might want to implement a separate endpoint for suggestions
      // For now, we'll use the same endpoint with minimal payload
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_products`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: query,
            is_b2c_only: 1,
            // Add other necessary fields for suggestions
          }),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const suggestions = data?.products || data?.data || [];

      set({ suggestedResults: suggestions.slice(0, 5) }); // Limit to 5 suggestions
    } catch (err) {
      console.error("❌ fetchSuggestedResults error:", err);
      set({ suggestedResults: [] });
    }
  },

  // ✅ Setters
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchResults: (results) => set({ searchResults: results }),
  setSuggestedResults: (results) => set({ suggestedResults: results }),
  setCurrentCategory: (category) => set({ currentCategory: category }),
  clearResults: () => set({ searchResults: [], suggestedResults: [] }),
}));