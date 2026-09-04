import { create } from 'zustand';
import { apiRequest } from '@/lib/clientApi';
import useCurrencyStore from '@/store/useCurrencyStore';

// import { ensureCsrfCookie, getCookie } from "@/utils/CSRFtoken";

const useBookingStore = create((set) => ({
  pickupPoints: [],
  dropoffPoints: [],
  clusterGroups: [],
    availableTransfers: [],
  loadingPickup: false,
  loadingDropoff: false,
  loadingClusterGroups: false,
  errorPickup: '',
  errorDropoff: '',
  errorClusterGroups: '',

  fetchPickupPoints: async (id) => {
    set({ loadingPickup: true, errorPickup: '' });
    try {
      const data = await apiRequest({
        endpoint: `get-distinct-pickup-points/${id}`,
        method: "GET",
      });
      set({ pickupPoints: Array.isArray(data) ? data : [], loadingPickup: false });
      set({ dropoffPoints: Array.isArray(data) ? data : [], loadingDropoff: false });
    } catch (err) {
      set({ errorPickup: 'Failed to load pickup points', loadingPickup: false });
    }
  },

  fetchClusterGroups: async (id) => {
    set({ loadingClusterGroups: true, errorClusterGroups: '' });
    try {
      const data = await apiRequest({
        endpoint: `get-product-transfer-pickup-group/${id}`,
        method: "GET",
      });
      set({ clusterGroups: data, loadingClusterGroups: false });
    } catch (err) {
      set({ errorClusterGroups: 'Failed to load cluster groups', loadingClusterGroups: false });
    }
  },

  fetchAvailableTransport: async ({  from_hotel, to_hotel,product_id }) => {
    set({ loading: true, error: null });
    try {
      const data = await apiRequest({
        endpoint: "get-transfer-cluster",
        method: "POST",
        data: {
          product_id:product_id ,
          from_hotel,
          to_hotel,
        },
      });
      console.log("dsfdg",data)
      set({ availableTransfers: data|| [], loading: false }); // Save to state
      return data;
    } catch (error) {
      set({ error: 'Failed to fetch available transport', loading: false, availableTransfers: [] });
      throw error;
    }
  },


submitBooking: async (payload) => {
  try {
    const response = await apiRequest({
      endpoint: "create_new_order", 
      method: "POST",
      data: payload,
    });
    return response;
  } catch (error) {
    console.error("Create order failed:", error);
    throw error;
  }
},

   getPaymentOptions: async (id,langId) => {
        try {
          const res = await apiRequest({
            endpoint: `payment_methods/${id}/${langId}`,
            method: "GET",
          });
          console.log("payment options", res);
          return res;
        } catch (err) {
          console.error("Failed to accept policy", err);
          throw err;
        }
      },

//pickup hotel for tours
      fetchPickupPointCity: async (cityId) => {
  set({ loadingPickup: true, errorPickup: '' });
  try {
    const data = await apiRequest({
      endpoint: `pickupPointCity/${cityId}`,
      method: "GET",
    });
  set({ pickupPoints: data?.data?.pickup_points || [], loadingPickup: false });
    return data;
  } catch (err) {
    set({ errorPickup: 'Failed to load city pickup points', loadingPickup: false });
    throw err;
  }
},

// Fetch pickup locations by product
fetchProductPickupLocations: async (productId) => {
  set({ loadingPickup: true, errorPickup: '' });
  try {
    const data = await apiRequest({
      endpoint: `getProductPickupLocation/${productId}`,
      method: "GET",
    });
    set({ pickupPoints: Array.isArray(data) ? data : [], loadingPickup: false });
    return data;
  } catch (error) {
    set({ errorPickup: 'Failed to load product pickup locations', loadingPickup: false });
    throw error;
  }
},
searchPickupPoints: async (productId, query) => {
  try {
    const data = await apiRequest({
      endpoint: `products/${productId}/pickup-points/search?q=${encodeURIComponent(query)}`,
      method: "GET",
    });
    return data?.data?.pickup_points || [];
  } catch (error) {
    console.error("Pickup point search failed", error);
    return [];
  }
},

// Fetch available dates by product ID
fetchAvailableDatesTR: async (productId, children = 0, adults = 2) => {
  set({ loading: true });
  try {
    const data = await apiRequest({
    endpoint: "check-dates-availability",
      method: "POST",
       data: {
        product_id: productId,
        adults,
        children,
      },
    });
    set({ loading: false });
      return data?.availability || [];
  } catch (error) {
    set({ loading: false });
    console.error("Failed to fetch available dates", error);
    throw error;
  }
},
fetchAvailableDates: async (productId, adults, children) => {
  set({ loading: true });
  try {
    const data = await apiRequest({
      endpoint: "check-dates-availability",
      method: "POST",
      data: {
        product_id: productId,
        adults,
        children,
      },
    });
    set({ loading: false });
    return data?.availability || [];
  } catch (error) {
    set({ loading: false });
    console.error("Failed to fetch available dates", error);
    throw error;
  }
},


  //book now  when APi end point ill get 
//   submitBooking: async (payload) => {
//   try {
//     const response = await apiRequest({
//       endpoint: "submit-booking", 
//       method: "POST",
//       data: payload,
//     });
//     return response;
//   } catch (error) {
//     throw error;
//   }
// },

  transferAddons: [],
  loadingTransferAddons: false,
  errorTransferAddons: '',

  fetchTransferAddons: async ({ language_id=1, product_id, pickup_id, dropoff_id, currency_id }) => {
    set({ loadingTransferAddons: true, errorTransferAddons: '' });
    try {
      const resolvedCurrencyId =
        currency_id ||
        useCurrencyStore.getState()?.currencyId ||
        (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
        2;

      const data = await apiRequest({
        endpoint: 'transfer-adons',
        method: "POST",
        data: {
          language_id: language_id || "1",
          product_id,
          pickup_id,
          dropoff_id,
          currency_id: resolvedCurrencyId,
        },
      });
      set({ transferAddons: data?.data?.transfer_add_ons || [], loadingTransferAddons: false });
      return data;
    } catch (err) {
      set({ errorTransferAddons: 'Failed to load transfer addons', loadingTransferAddons: false });
      throw err;
    }
  },
getPromoExist: async () => {
  try {
    const res = await apiRequest({
      endpoint: `getpromoexist`,
      method: "GET",
    });
    return res?.data?.flag || false;
  } catch (err) {
    console.error("Failed to check promo exist", err);
    return false;
  }
},

 postfetchPromoCode: async ({ promo_code, itinerary }) => {
  set({ loadingTransferAddons: true, errorTransferAddons: '' });
  try {
    const payload = {
      promo_code,
      itinerary: Array.isArray(itinerary) ? itinerary : []
    };

    const data = await apiRequest({
      endpoint: 'check_promocode',
      method: "POST",
     data: payload,
    });

    set({ 
      transferAddons: data?.data?.transfer_add_ons || [], 
      loadingTransferAddons: false 
    });

    return data;
  } catch (err) {
    set({ 
      errorTransferAddons: 'Failed to load transfer addons', 
      loadingTransferAddons: false 
    });
    throw err;
  }
},
}));

export default useBookingStore;