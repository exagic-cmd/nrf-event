import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";
import { persist } from "zustand/middleware";

export const useUpsellStore = create(
  persist(
    (set, get) => ({
      upsellProducts: [],
      upsellDetail: null,
      productBasedUpsell: null, 
      isLoading: false,
      error: null,

      // Fetch all upsell products
      fetchUpsellProducts: async () => {
        set({ isLoading: true, error: null });
        try {
          const res = await apiRequest({
            endpoint: "upsellproducts",
            method: "GET",
          });

          set({
            upsellProducts: res?.data?.upsellproducts || [],
            isLoading: false,
          });
          console.log("Upsell Products:", res?.data?.upsellproducts);
        } catch (err) {
          console.error("Failed to fetch upsell products", err);
          set({
            isLoading: false,
            error: err.message || "Failed to fetch upsell products",
          });
        }
      },


fetchUpsellDetail: async (productId, langId = 1) => {
  set({ isLoading: true, error: null, upsellDetail: null });
  try {
    const res = await apiRequest({
      endpoint: `product/${productId}/${langId}`,
      method: "GET",
    });

    const basicInfo = res?.data?.basicinfo;

    if (basicInfo && basicInfo.product_description) {
      const formattedDetail = {
        ...basicInfo,
        ...basicInfo.product_description,
        image: basicInfo.images?.[0]?.image,
        features: basicInfo.product_description.highlights || [],
        description: basicInfo.product_description.short_desc,
        price: basicInfo.starting_price,
      };
      set({ upsellDetail: formattedDetail, isLoading: false });
      console.log("Formatted Upsell Detail:", formattedDetail);
    } else {
      set({ upsellDetail: null, isLoading: false });
      console.log("Upsell Detail data not in expected format:", res?.data);
    }
  } catch (err) {
    console.error("Failed to fetch upsell detail", err);
    set({
      isLoading: false,
      error: err.message || "Failed to fetch upsell detail",
    });
  }
},



      // Fetch product-based upsell
      fetchProductBasedUpsell: async (productIds) => {
        set({ isLoading: true, error: null });
        try {
          const idsString = productIds.join(',');
          const res = await apiRequest({
            endpoint: `upsellproducts/${idsString}`,
            method: "GET",
          });

          const products = res?.data?.upsellproducts || [];
          set({ productBasedUpsell: products, isLoading: false });
          console.log(`Product-based Upsell for ${idsString}:`, products);

        } catch (err) {
          console.error(`Failed to fetch product-based upsell for ${productIds}`, err);
          set({
            isLoading: false,
            error: err.message || "Failed to fetch product-based upsell",
          });
        }
      },
    }),
    {
      name: "upsell-storage", 
    }
  )
);
