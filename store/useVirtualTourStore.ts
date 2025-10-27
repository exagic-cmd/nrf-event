import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";

export const useVirtualTourStore = create((set) => ({
  tour: null, // full raw data
  locations: [],
  product: null,
  reviews: [],
  totals: {},
  lang: "EN",

  fetchVirtualTour: async (productId, langId) => {
    try {
      const response = await apiRequest({
        endpoint: `virtual-tour/${productId}?lang=${langId}`,
        method: "GET",
      });

      if (!response?.data) return;

      const data = response.data;

      // Normalize data
      const normalized = {
        lang: data.lang,
        languages: data.languages || [],
        product: data.product || {},
        reviews: data.reviews || [],
        totals: data.totals || {},
        locations: (data.locations || []).map((loc) => ({
          id: loc.id,
          title: loc.translations?.EN?.title || "",
          description: loc.translations?.EN?.description || "",
          images: loc.images || [],
          details: loc.details || {},
          audio: {
            EN: loc.audio_urls?.location?.EN || null,
            CH: loc.audio_urls?.location?.CH || null,
            JA: loc.audio_urls?.location?.JA || null,
            ES: loc.audio_urls?.location?.ES || null,
          },
          travelAudio: loc.audio_urls?.travel || {},
        })),
      };

      // Save to store
      set({
        tour: data,
        lang: normalized.lang,
        product: normalized.product,
        reviews: normalized.reviews,
        totals: normalized.totals,
        locations: normalized.locations,
      });

      return normalized;
    } catch (error) {
      console.error("❌ Failed to fetch virtual tour:", error);
      throw error;
    }
  },
}));
