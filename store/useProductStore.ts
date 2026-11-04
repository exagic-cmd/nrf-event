import { create } from "zustand";
import { apiRequest } from "@/lib/clientApi";
import { persist } from "zustand/middleware";
import useLanguageStore from "@/store/useLanguageStore"
import useCurrencyStore from "@/store/useCurrencyStore"

function resolveCurrencyId(explicit?: number | string | null): number {
  const direct = Number(explicit);
  if (Number.isFinite(direct) && direct > 0) return direct;
  const fromStore = Number(useCurrencyStore.getState()?.currencyId);
  if (Number.isFinite(fromStore) && fromStore > 0) return fromStore;
  if (typeof window !== "undefined") {
    const fromStorage = Number(localStorage.getItem("currency_id"));
    if (Number.isFinite(fromStorage) && fromStorage > 0) return fromStorage;
  }
  return 2;
}

export const useProductStore = create(
  persist(
    (set, get) => ({
      bookingStatus: null,
      bookingData: {},
      bookedProducts: [],
      bookedProductDetail: null,
      bookingCategoryId: null,
      tieredPricingData: {}, 
      tourMap: [],
      selectedVariant: null,
setSelectedVariant: (variant) => set({ selectedVariant: variant }),
      setBookingCategoryId: (categoryId) => set({ bookingCategoryId: categoryId }),
      setBookingStatus: (status) => set({ bookingStatus: status }),

      setBookingProduct: (product) =>
        set((state) => ({
          bookingData: { ...state.bookingData, product },
        })),

      setBookingDetails: (details) =>
        set((state) => ({
          bookingData: { ...state.bookingData, details },
        })),

      setPersonalInfo: (personal) =>
        set((state) => ({
          bookingData: { ...state.bookingData, personal },
        })),

      clearBookingData: () => set({ bookingData: {}, tieredPricingData: {} }),

      //  hydratefor SSR props
      setBookedProductDetail: (detail) => set({ bookedProductDetail: detail }),
      setTieredPricingData: (data) => set({ tieredPricingData: data }),
      setTourMap: (mapData) => set({ tourMap: mapData }),

      // for client-side
      bookProduct: async (id, lang_id, currency_id) => {
        console.log("Booking product with ID (client-side re-fetch):", id)
        try {
          const currencyId = resolveCurrencyId(currency_id);
          const currencyQuery = `?currency_id=${currencyId}`;

          const productData = await apiRequest({
            endpoint: `product/${id}/${lang_id}${currencyQuery}`,
            method: "GET",
          });

          const tieredPricing = await apiRequest({
            endpoint: `product_tiered_pricing/${id}${currencyQuery}`,
            method: "GET",
          });


            set({
            bookingStatus: "success",
            bookedProducts: [productData],
            bookedProductDetail: productData,
            tieredPricingData: { ...get().tieredPricingData, tieredPricing }
            });

          console.log("Product booked successfully:", productData);
          console.log("Tiered Pricing Data:", tieredPricing);

          return productData;
        } catch (error) {
          console.error("Booking error:", error);
          set({ bookingStatus: "error" });
          throw error;
        }
      },

   
       fetchBookingNotes: async (id, langId) => {
        try {
          const res = await apiRequest({
            endpoint: `bookingnotes/${id}/${langId}`,
            method: "GET",
          });
          return res;
        } catch (err) {
          console.error("Failed to fetch booking notes", err);
          throw err;
        }
      },
      fetchCancellationPolicy: async (id, langId) => {
        try {
          const res = await apiRequest({
            endpoint: `cancellationpolicies/${id}/${langId}`,
            method: "GET",
          });
          return res;
        } catch (err) {
          console.error("Failed to fetch cancellation policy", err);
          throw err;
        }
      },
      fetchTermsConditions: async (id, langId) => {
        try {
          const res = await apiRequest({
            endpoint: `termconditions/${id}/${langId}`,
            method: "GET",
          });
          return res;
        } catch (err) {
          console.error("Failed to fetch terms & conditions", err);
          throw err;
        }
      },
      // tourroute for client-side
      fetchTourMap: async (id, langId, currency_id) => {
        const currencyId = resolveCurrencyId(currency_id);
        const res = await apiRequest({
          endpoint: `tour_location/${id}/${langId}?currency_id=${currencyId}`,
          method: "GET",
        })
        set({ tourMap: res?.data?.markers || [] })
        return res?.data?.markers || []
      },
    }),
    {
      name: "zustand-storage1",
    }
  )
);


export const useCategoryStore = create(
  persist(
    (set) => ({
      categories: [],
      fetchCategories: async () => {
        const { languageId } = useLanguageStore.getState();
        try {
          const res = await apiRequest({
            endpoint: `category/${languageId || 1}`,
            method: "GET", 
          });
          const data = res?.data?.category || [];
          set({ categories: data });
          console.log("Fetched categories:", data);
        } catch (err) {
          console.error("Failed to fetch categories", err);
        }
      },
    }),
    {
      name: "zustand-storage2",
    }
  )
);
