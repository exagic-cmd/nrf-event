import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiRequest } from "@/lib/clientApi"; // adjust path as needed

export const useAppStore = create(persist((set, get) => ({
  showOnlyCarousel: false,
  showMenuFullView: false,
  selectedView: null,
  recommendedData: null,
  filteredProducts: [],
  paginatedProducts: [],
  productsPage: 1,
  productsHasMore: true,
  productsLoading: false,

  setShowOnlyCarousel: (value) => set({ showOnlyCarousel: value }),
  setShowMenuFullView: (value) => set({ showMenuFullView: value }),
  setSelectedView: (view) => set({ selectedView: view }),
  setFilteredProducts: (products) => set({ filteredProducts: products }),
  setRecommendedData: (data) => set({ recommendedData: data }),

  // New: fetch paginated products
 fetchPaginatedProducts: async ({ categoryId, page = 1 }) => {
  set({ productsLoading: true });
  try {
    const res = await apiRequest({
      endpoint: `products?category_id=${categoryId}&page=${page}`,
    });
    const newProducts = Array.isArray(res?.data?.data?.data)
      ? res.data.data.data
      : [];
    set(state => ({
      filteredProducts: page === 1
        ? newProducts
        : [...(state.filteredProducts || []), ...newProducts],
      productsPage: page,
      productsHasMore: newProducts.length > 0,
      productsLoading: false,
    }));
  } catch (e) {
    set({ productsLoading: false, productsHasMore: false });
  }
},
resetPaginatedProducts: () => set({ filteredProducts: [], productsPage: 1, productsHasMore: true }),
})));