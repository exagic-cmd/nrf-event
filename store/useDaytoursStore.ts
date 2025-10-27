import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";

export const useDaytoursStore = create((set, get) => ({
  countries: [],
  isLoading: false,
  error: null,
  selectedCity: null,
  selectedCountry: null,
  suggestedResults: [],
  searchResults: [],
  allResults: [],

  fetchCountriesCities: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await apiRequest({
        endpoint: "getcitiescountries",
        method: "GET",
      });
      set({ countries: res?.data?.result || [], isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: err.message || "Failed to fetch" });
    }
  },

  fetchSearchSuggestions: async (langID) => {
    set({ isLoading: true });
    try {
      const response = await fetch(`https://app.exploresingapore.ai/api/products/${langID}/search-list?categoryId=3`);
      const res = await response.json();
      const items = res?.results || [];
      set({ suggestedResults: items, isLoading: false });
    } catch (err) {
      set({ isLoading: false });
    }
  },


searchProductsByKeyword: async (query, langID) => {
  if (!query?.trim()) return [];

  set({ isLoading: true });

  try {
    const response = await fetch("https://ai.exploresingapore.ai/search-index", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ query }),
    });

    const res = await response.json();
    const products = res?.results || [];

    if (products.length > 0) {
      set({ allResults: products, isLoading: false });
      return products;   
    } else {
      const fallbackProducts = await get().searchProducts(langID);
      set({ allResults: fallbackProducts, isLoading: false });
      return fallbackProducts;  
    }
  } catch (err) {
    console.error("Search error", err);
    set({ isLoading: false });
    return [];
  }
},

  searchProducts: async (langID) => {
    try {
      const res = await apiRequest({
        endpoint: `getcitiespax/1/2/${langID}`,
        method: "GET",
      });
      const products = res?.data?.products || res?.data?.results || [];
      return products;
    } catch (err) {
      console.error("Fallback searchProducts error", err);
      return [];
    }
  },

  setAllResults: (items) => set({ allResults: items }),
  setSelectedCity: (city) => set({ selectedCity: city }),
  setSelectedCountry: (country) => set({ selectedCountry: country }),
  setSearchResults: (results) => set({ searchResults: results }),
}));
