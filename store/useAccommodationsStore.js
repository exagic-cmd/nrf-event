// stores/useAccommodationsStore.js
import { create } from "zustand";


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
    // If no payload provided, use existing searchParams
    const searchPayload = payload;
    console.log("🛎️ fetchAccommodations called with payload:", searchPayload);
    if (!searchPayload) {
      console.error("❌ No search payload provided");
      set({ isLoading: false, error: "No search criteria provided" });
      return [];
    }

    set({ isLoading: true, error: null });
    console.log("🔍 Fetching accommodations with payload:", searchPayload);
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
        category_id: 4,
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
        visitor_id: searchPayload.visitor_id || $helpers.getVisitorId(),
        ids: searchPayload.ids || '',
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
      if (!data.status){
  alert(data.msg);
  set({ isLoading: false, error: data.msg || "No results" });
  return null; // ← Change from [] to null
}

      // Assume API returns accommodations in data.accommodations or data.data
      const results = data?.accommodations || data?.data || data || [];

      // Normalize and enrich each result: attach hotelQuoteId and a normalized hotelId
      const enrichedResults = Array.isArray(results)
        ? results.map((r) => {
            const quote = r?.["@attributes"]?.hotelQuoteId || r?.Hotel?.["@attributes"]?.hotelQuoteId || r?.Hotel_Data?.["@attributes"]?.hotelQuoteId || r?.Hotel_stuba_id || null;
            const hotelId = r?.Hotel_Data?.stuba_id || r?.stuba_id || r?.hotel_id || r?.Hotel?.["@attributes"]?.id || r?.Hotel_stuba_id || null;
            return {
              ...r,
              hotelQuoteId: quote || null,
              hotelId: hotelId || null,
            };
          })
        : (results && typeof results === 'object'
            ? [{
                ...results,
                hotelQuoteId: results?.["@attributes"]?.hotelQuoteId || results?.Hotel?.["@attributes"]?.hotelQuoteId || null,
                hotelId: results?.Hotel_Data?.stuba_id || results?.stuba_id || results?.Hotel?.["@attributes"]?.id || null,
              }]
            : []);

      // Build a mapping of hotelId -> hotelQuoteId for all results
      const quoteMap = (enrichedResults || []).reduce((acc, item) => {
        if (item?.hotelId) acc[item.hotelId] = item.hotelQuoteId || acc[item.hotelId] || null;
        return acc;
      }, {});

      // Determine lastHotelQuoteId (prefer top-level attribute, fallback to first result)
      const topLevelQuote = data?.["@attributes"]?.hotelQuoteId || data?.data?.[0]?.["@attributes"]?.hotelQuoteId || null;
      const firstResultQuote = enrichedResults[0]?.hotelQuoteId || null;
      const hotelQuoteId = topLevelQuote || firstResultQuote || null;

      // Update store with enriched results and the extracted quote id(s)
      set((state) => ({
        accommodations: enrichedResults,
        searchResults: enrichedResults,
        filteredResults: enrichedResults,
        isLoading: false,
        lastHotelQuoteId: hotelQuoteId || state.lastHotelQuoteId,
        hotelQuoteMap: { ...(state.hotelQuoteMap || {}), ...quoteMap },
      }));

      console.log("✅ Accommodations API Response:", data, "extracted hotelQuoteId:", hotelQuoteId, "quoteMap size:", Object.keys(quoteMap).length);
      return enrichedResults;
    } catch (err) {
      console.error("fetchAccommodations error:", err);
      set({
        isLoading: false,
        error: err.message || "Failed to fetch accommodations",
      });
      return [];
    }
  },


// stores/useAccommodationsStore.js
fetchNonStubaAccommodation: async (hotelId) => {
  set({ isLoading: true, error: null });

  try {
    const payload = { ids: [Number(hotelId)] };

    console.log("Calling /affliate/get_public_products with:", payload);

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/affliate/get_public_products`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    const rawResponse = await res.json();
    console.log("Raw non-Stuba API response:", rawResponse);

    if (!res.ok) {
      throw new Error(rawResponse.message || `HTTP ${res.status}`);
    }

    // ———————————————————————————————
    // 1. CORRECT PATH: rawResponse.products (NOT rawResponse.data)
    // ———————————————————————————————
    const allProducts = Array.isArray(rawResponse?.products) ? rawResponse.products : [];
    console.log("All products from API:", allProducts);

    // Choose a product from the returned products without filtering by link_type_id/category_id.
    // Prefer the product that matches the requested hotelId (if present), otherwise fall back to the first product.
    if (allProducts.length === 0) {
      throw new Error("No non-Stuba products returned from API");
    }

    const hotel = allProducts.find(item => Number(item.id) === Number(hotelId)) || allProducts[0];
    console.log("Selected non-Stuba hotel product:", hotel);

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
        amenities: hotel.amenities || "WiFi, AC, TV",
        features: (hotel.amenities || "WiFi, AC, TV").split(",").map(s => s.trim()),
        starting_price: parseFloat(hotel.starting_price) || 0,
        price: parseFloat(hotel.starting_price) || 0,
        category_name: hotel.category_name,
        currency: hotel.currency || "SGD"
      },
      normalizedRoomData: [], // No rooms in response → empty for now
      lowestPriceRoom: null
    };

    console.log("✅ Normalized non-Stuba data:", normalized);

    set({ isLoading: false });
    return normalized;
  } catch (err) {
    console.error("❌ fetchNonStubaAccommodation failed:", err);
    set({ isLoading: false, error: err.message });
    return null;
  }
},

fetchNonStubaRooms: async (accommodationId) => {
  set({ isLoading: true, error: null });

  try {
    const productId = Number(accommodationId);
    if (!productId) throw new Error("Invalid product id");
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/product_tiered_pricing/${productId}`,
      {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      }
    );

    const rawResponse = await res.json();
    console.log("product_tiered_pricing full response:", rawResponse);

    if (!res.ok || rawResponse.success !== true) {
      throw new Error(rawResponse.message || `HTTP ${res.status}`);
    }

    const data = rawResponse.data;

    set({ isLoading: false });

    return {
      rawResponse,
      room_categories: data.room_categories || [],
      room_types: data.room_types || [],
      product_pricing: data.product_pricing || [],   // ← THIS IS THE KEY
    };
  } catch (err) {
    console.error("fetchNonStubaRooms failed:", err);
    set({ isLoading: false, error: err.message });
    return {
      rawResponse: null,
      room_categories: [],
      room_types: [],
      product_pricing: [],
    };
  }
},

// Add this inside your store (keep everything else exactly as is)
checkNonStubaAvailability: async (productId, startDate, endDate) => {
  if (!productId || !startDate || !endDate) return { isFullyAvailable: true };

  const dates = [];
  let cur = new Date(startDate);
  const end = new Date(endDate);
  while (cur < end) {
    dates.push(cur.toISOString().split('T')[0]);
    cur.setDate(cur.getDate() + 1);
  }

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/check-dates-availability`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        product_id: Number(productId),
        adults: 1,
        children: 0,
      }),
    });

    if (!res.ok) throw new Error("Failed");

    const data = await res.json();
    if (data.status !== "success" || !Array.isArray(data.availability)) {
      return { isFullyAvailable: false };
    }

    const isFullyAvailable = dates.every(date => {
      const entry = data.availability.find(a => a.date === date);
      return entry && entry.available === true && entry.available_qty >= 1;
    });

    return { 
      isFullyAvailable,
      allotments: data.availability.map(a => ({
        date: a.date,
        value: a.available_qty,
        available: a.available
      }))
    };
  } catch (err) {
    console.warn("Availability check failed:", err);
    return { isFullyAvailable: true, allotments: [] }; // safe fallback
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
    }),
}));
