import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";
export const useProductFeature = create((set) => ({
  productfeature: [],
  
  fetchProductFeature: async (langId) => {
    try {
      const response = await apiRequest({
        endpoint: `product_feature/1/${langId}`,
        method: "GET",
      });
      set({ productfeature: response.data });
      return response.data;
    } catch (error) {
      console.error("Failed to fetch tour map:", error);
      throw error;
    }
  },
}));