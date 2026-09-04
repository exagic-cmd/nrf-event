// stores/useAccommodationsStore.js
import { create } from "zustand";
import helpers from "@/lib/helpers";
import useCurrencyStore from "@/store/useCurrencyStore";


let hotelRegionDebounceTimeout = null;

export const useAccommodationsStore = create((set, get) => ({
  accommodations: [],
  searchResults: [],
  filteredResults: [],
  suggestedResults: [],
  nationalities: [],
  hotels: [],
  regions: [],
  // Store last fetched hotelQuoteId and map by hotel id when available
  lastHotelQuoteId: null,
  hotelQuoteMap: {},
  isLoading: false,
  isSubLoading: false,
  isCheckingAvailability: false,
  accommodationFilters: null,
  lastFetchSignature: null,
  lastFetchTime: null,
  error: null,
  subLoadingText: "", // Sub-loader message

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
  fetchHotelsAndRegions: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const res = await fetch(
        `${helpers.getApiAbsoluteURL("/accommodations/search-titles")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload || {}),
        }
      );

      if (!res.ok) throw new Error("Network response was not ok");

      const data = await res.json();
      const tagsList = data?.data?.tags || [];

      set({
        // The component expects the tag groups in the 'regions' state
        regions: tagsList,
        hotels: [], // Clear hotels as the new structure doesn't use it
        isLoading: false,
      });

      return { regions: tagsList };
    } catch (err) {
      console.error("fetchHotelsAndRegions error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch hotels and regions",
      });
      return { hotels: [], regions: [] };
    }
  },

  // DEBOUNCED VERSION — This is the one you call from input
  fetchSuggestedAccommodations: (query) => {
    // Clear previous timeout
    if (hotelRegionDebounceTimeout) {
      clearTimeout(hotelRegionDebounceTimeout);
    }

    // If query is empty, clear results immediately
    if (!query?.trim()) {
      set({ suggestedResults: [], hotels: [], regions: [], isLoading: false });
      return;
    }

    set({ isLoading: true });

    // Set new timeout
    hotelRegionDebounceTimeout = setTimeout(async () => {
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

        const suggestions = [...hotelSuggestions, ...regionSuggestions].slice(0, 10);

        set({
          suggestedResults: suggestions,
          isLoading: false,
        });
      } catch (err) {
        set({ suggestedResults: [], isLoading: false });
      }
    }, 400); // 400ms delay — feels instant but avoids spam
  },

  // Optional: Cancel pending request when component unmounts or search is cleared
  cancelHotelRegionSearch: () => {
    if (hotelRegionDebounceTimeout) {
      clearTimeout(hotelRegionDebounceTimeout);
      hotelRegionDebounceTimeout = null;
    }
    set({ suggestedResults: [], hotels: [], regions: [], isLoading: false });
  },

  // Set search parameters and trigger search immediately
  setSearchParamsAndSearch: async (payload) => {
    console.log("Setting search params and triggering search:", payload);

    set({ searchParams: payload, isLoading: true, error: null });

    try {
      const results = await get().fetchAccommodations(payload);

      // If no results (likely due to !data.status), return null
      if (!results || results.length === 0) {
        set({ isLoading: false });
        return null;
      }

      set({ isLoading: false });
      return results;
    } catch (err) {
      set({ isLoading: false, error: err.message || "Search failed" });
      return null;
    }
  },

  // Fetch accommodations search results
  fetchAccommodations: async (payload) => {

    if (
      !payload ||
      !payload.start_date ||
      payload.start_date === "" ||
      !payload.end_date ||
      payload.end_date === ""
    ) {
      console.warn("❌ fetchAccommodations skipped — missing dates:", payload);
      set({ isLoading: false, error: "Missing start or end date" });
      return [];
    }

    // If no payload provided, use existing searchParams
    const searchPayload = payload;
    console.log("🛎️ fetchAccommodations called with payload:", searchPayload);
    if (!searchPayload) {
      console.error("❌ No search payload provided");
      set({ isLoading: false, error: "No search criteria provided" });
      return [];
    }

    const currencyId =
      searchPayload?.currency_id ||
      useCurrencyStore.getState()?.currencyId ||
      (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
      2;

    // Fix 2: Deduplication guard — skip if same params are already being fetched
    const fetchSig = JSON.stringify({ ...searchPayload, currency_id: currencyId });
    const now = Date.now();

    if (get().lastFetchSignature === fetchSig) {
      if (get().isLoading) {
        console.warn("⚠️ Duplicate fetchAccommodations call skipped (already loading)");
        return get().accommodations;
      }
      // If we fetched the exact same payload within the last 5 seconds, it's definitely a double-fire bug.
      if (get().lastFetchTime && (now - get().lastFetchTime < 5000)) {
        console.warn("⚠️ Duplicate fetchAccommodations call skipped (debounced within 5s)");
        return get().accommodations;
      }
    }

    // Fix 3: Single set() call instead of two to avoid double re-renders
    console.log("🔍 Fetching accommodations with payload:", searchPayload, "currency_id:", currencyId);
    set({
      isLoading: true,
      error: null,
      accommodations: [],
      searchResults: [],
      filteredResults: [],
      accommodationFilters: null,
      lastFetchSignature: fetchSig,
      lastFetchTime: now,
      subLoadingText: "",
    });

    // process&append
    const processAndAppend = (sourceName, data) => {
      const results = data?.data?.accommodations || data?.accommodations || data?.data?.data || data?.data || data || [];
      const filters = data?.data?.meta?.filters || null;

      const enriched = Array.isArray(results)
        ? results.map((r) => {
          let price = 0;
          let currency = '';

          // Ratehawk: extract min price from rates[].payment_options.payment_types[0].amount
          if ((r.link_type_id === 10 || r.Hotel_Data?.link_type_id === 10) && Array.isArray(r.rates) && r.rates.length > 0) {
            const ratePrices = r.rates
              .map(rate => parseFloat(rate?.payment_options?.payment_types?.[0]?.amount || 0))
              .filter(p => p > 0);
            price = ratePrices.length > 0 ? Math.min(...ratePrices) : 0;

            // Extract currency from the first valid payment type
            currency = r.rates[0]?.payment_options?.payment_types?.[0]?.currency_code ||
              r.rates[0]?.payment_options?.payment_types?.[0]?.show_currency_code ||
              'USD';
          } else {
            price = parseFloat(r.starting_price || r.min_rate || r.price || r?.pricing?.min_price || 0);
            currency = r.currency || r.Hotel_Data?.currency || r.pricing?.currency || 'USD';
          }

          return {
            ...r,
            hotelId: r.id,
            starting_price: price,
            price: price,
            currency: currency
          };
        })
        : (results && typeof results === 'object' ? [{
          ...results,
          hotelId: results.id,
          starting_price: parseFloat(results.starting_price || results.min_rate || results.price || 0),
          currency: results.currency || results.Hotel_Data?.currency || results.pricing?.currency || 'USD'
        }] : []);

      if (enriched.length > 0) {
        set((state) => {
          const combined = [...state.accommodations, ...enriched];
          const newFilters = state.accommodationFilters || filters;
          return {
            accommodations: combined,
            searchResults: combined,
            filteredResults: combined,
            accommodationFilters: newFilters,
          };
        });
      }
      console.log(`✅ ${sourceName} loaded ${enriched.length} items`);

      // Only hide loading state early if the API call actually returned some accommodations.
      // If the first API returns success: true but accommodations: [], we should keep the loader
      // spinning until Ratehawk or Stuba finishes, to prevent the screen from flashing "0 results"
      if (enriched.length > 0 && (data?.success === true || data?.status === true || data?.data?.success === true || data?.data?.status === true)) {
        set({ isLoading: false });
      }
    };

    try {
      // --- API 1 (GET) ---
      const fetchApi1 = async () => {
        try {
          const params = {
            text: searchPayload.text || '',
            start_date: searchPayload.start_date,
            //  get_stb_items: true,
            region: 18196,
            is_b2b_only: 1,
            currency_id: currencyId,
          };
          if (searchPayload.end_date) params.end_date = searchPayload.end_date;
          const baseParams = new URLSearchParams(params).toString();
          const rooms = searchPayload.rooms || [{ adult: 1, children: [] }];
          const roomsParams = rooms.map((room, index) => {
            const adultParam = `rooms[${index}][adult]=${room.adult}`;
            let childrenParams = '';
            if (room.children && room.children.length > 0) {
              childrenParams = room.children.map(childAge => `rooms[${index}][children][]=${childAge}`).join('&');
            }
            return [adultParam, childrenParams].filter(Boolean).join('&');
          }).join('&');
          const queryString = [baseParams, roomsParams].filter(Boolean).join('&');
          const url = `${helpers.getApiAbsoluteURL(`/accommodations/search?${queryString}`)}`;
          const res = await fetch(url, { method: "GET", headers: { "Content-Type": "application/json" } });
          if (!res.ok) throw new Error(`API 1 Failed: ${res.status}`);
          const data = await res.json();
          processAndAppend("API 1", data);
          return true;
        } catch (err) {
          console.error("API 1 Error:", err.message);
          return false;
        }
      };

      const api1Success = await fetchApi1();
      
      // Set sub-loading text after the first API response (API 1 finished)
      if (api1Success) {
        set({ subLoadingText: "crafting hotels" });
      }

      if (api1Success) {
        set({ isSubLoading: true });
      }

      // API 2 & 3
      const postPayload = {
        text: searchPayload.text || '',
        start_date: searchPayload.start_date,
        end_date: searchPayload.end_date,
        region: 18196,
        rooms: searchPayload.rooms || [{ adult: 1, children: [] }],
        // get_stb_items: true,
        is_b2b_only: 1,
        currency_id: currencyId,
      };

      const fetchPostApi = async (endpoint, label) => {
        try {
          const specificPayload = { ...postPayload };
          if (label === 'Ratehawk') {
            specificPayload.rh_type = 'search_by_ids';
          }

          const url = helpers.getApiAbsoluteURL(endpoint);
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(specificPayload)
          });
          if (!res.ok) throw new Error(`${label} Failed: ${res.status}`);
          const data = await res.json();
          processAndAppend(label, data);
          return true;
        } catch (err) {
          console.error(`${label} Error:`, err.message);
          return false;
        }
      };

      // Call sequentially after the first successfully loaded
      if (api1Success) {
        const stubaSuccess = await fetchPostApi('/customer/stuba', 'Stuba');
        if (stubaSuccess) {
          await fetchPostApi('/ratehawk/get_hotels', 'Ratehawk');
        }
      }

      set({ isLoading: false, isSubLoading: false });
      return get().accommodations;
    } catch (err) {
      console.error("fetchAccommodations error:", err.message);
      set({
        isLoading: false,
        isSubLoading: false,
        error: err.message || "Failed to fetch accommodations",
      });
      return [];
    }
  },


  // stores/useAccommodationsStore.js
  fetchNonStubaAccommodation: async (hotelId) => {
    set({ isLoading: true, error: null });

    try {
      const currencyId =
        useCurrencyStore.getState()?.currencyId ||
        (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
        2;
      const payload = { ids: [Number(hotelId)], currency_id: currencyId };

      // console.log("Calling /affliate/get_public_products with:", payload);

      const res = await fetch(
        `${helpers.getApiAbsoluteURL("/affliate/get_public_products")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      const rawResponse = await res.json();
      // console.log("Raw non-Stuba API response:", rawResponse);

      if (!res.ok) {
        throw new Error(rawResponse.message || `HTTP ${res.status}`);
      }

      // ———————————————————————————————
      // 1. CORRECT PATH: rawResponse.products (NOT rawResponse.data)
      // ———————————————————————————————
      const allProducts = Array.isArray(rawResponse?.products) ? rawResponse.products : [];
      // console.log("All products from API:", allProducts);

      // Choose a product from the returned products without filtering by link_type_id/category_id.
      // Prefer the product that matches the requested hotelId (if present), otherwise fall back to the first product.
      if (allProducts.length === 0) {
        throw new Error("No non-Stuba products returned from API");
      }

      const hotel = allProducts.find(item => Number(item.id) === Number(hotelId)) || allProducts[0];
      // console.log("Selected non-Stuba hotel product:", hotel);

      // ———————————————————————————————
      // 4. NORMALIZE (match your UI)
      // ———————————————————————————————
      const normalized = {
        normalizedHotelData: {
          id: hotel.id,
          stuba_id: null,
          title: hotel.product_title || hotel.product_content_title,
          name: hotel.product_title || hotel.product_content_title,
          description: hotel.short_desc,
          country: hotel.country_name || "Singapore", // fallback
          city: hotel.city_name || "Singapore",       // fallback
          address: hotel.address || hotel.short_desc.split('.')[0],
          latitude: hotel.latitude || 1.3521,         // Singapore default
          longitude: hotel.longitude || 103.8198,     // Singapore default
          image: hotel.image,
          images: hotel.image ? [{
            url: hotel.image,
            thumb: hotel.image,
            type: "photo"
          }] : [],
          stars: hotel.stars || 4,                    // fallback
          //  amenities: hotel?.amenities || "WiFi, AC, TV",
          //  features: (hotel?.amenities || "WiFi, AC, TV").split(",").map(s => s.trim()),
          starting_price: parseFloat(hotel.starting_price) || 0,
          price: parseFloat(hotel.starting_price) || 0,
          category_name: hotel.category_name,
          currency: hotel.currency || "SGD"
        },
        normalizedRoomData: [], // No rooms in response → empty for now
        lowestPriceRoom: null
      };

      const result = { ...hotel, ...normalized };

      // console.log("✅ Normalized non-Stuba data:", result);

      set({ isLoading: false });
      return result;
    } catch (err) {
      console.error("❌ fetchNonStubaAccommodation failed:", err);
      set({ isLoading: false, error: err.message });
      return null;
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
      const filtered = typeof filterFn === "function" ? all.filter(filterFn) : all;
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
      isSubLoading: false,
    }),
}));
