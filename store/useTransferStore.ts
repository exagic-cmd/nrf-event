import { create } from "zustand"
import { persist } from "zustand/middleware"

export const useTransferStore = create(
  persist(
    (set, get) => ({
      pickupOptions: [],
      dropoffOptions: [],
      selectedPickupDate: null,
selectedReturnDate: null,
      surchargeDetails: null,
      surchargePickup: null,
      surchargeReturn: null,
      selectedPickup: null,
      selectedDropoff: null,
      isLoading: false,
      error: null,
      searchResults: [],
    productFeature: [],
selectedFeatureResponse: null,
      searchTimeoutId: null,
      tripType: "one-way",
      selectedTransfer: null,
      vehicles: [],
      addons: [],
      addonsTotal: 0,

      userBookingDetails: {
        pickupDate: "",
        pickupTime: "",
        returnDate: "",
        returnTime: "",
        pickupFlightNumber: "",
        returnTimeSchedule: "",
        pickupTimeSchedule: "",
        returnFlightNumber: "",
        pickupFlightTime: "", 
returnFlightTime: "",

        baggage: 2,
      },

      searchParams: {
        pickup: null,
        dropoff: null,
        tripType: "one-way",
      },

      setSearchParams: (params) =>
        set({
          searchParams: {
            ...get().searchParams,
            ...params,
          },
        }),

      // Static category options - now multilingual ready
      // The translation keys will be used in the component
      categoryOptions: [
        {
          id: "hotel",
          nameKey: "Hotel",
          subtitleKey: "categories.hotel.subtitle",
          icon: "🏨",
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          id: "Hotel",
          nameKey: "Hotel",
          subtitleKey: "categories.hotel.subtitle",
          icon: "🏨",
          color: "text-green-600",
          bgColor: "bg-green-50",
        },
        {
          id: "airport",
          nameKey: "Airport",
          subtitleKey: "categories.airport.subtitle",
          icon: "✈️",
          color: "text-blue-600",
          bgColor: "bg-blue-50",
        },
        {
          id: "ferry",
          nameKey: "Ferry Terminal",
          subtitleKey: "categories.ferry.subtitle",
          icon: "⛴️",
          color: "text-cyan-600",
          bgColor: "bg-cyan-50",
        },
        // {
        //   id: 'railway',
        //   nameKey: 'categories.railway.name',
        //   subtitleKey: 'categories.railway.subtitle',
        //   icon: '🚄',
        //   color: 'text-purple-600',
        //   bgColor: 'bg-purple-50'
        // }
      ],
setAddons: (tripPart, addonsWithTotal) =>
  set((state) => {
    const updatedAddons = { ...state.addons, [tripPart]: addonsWithTotal };
    const totalAddonsAmount =
      (updatedAddons.pickup?.reduce((sum, a) => sum + a.total, 0) || 0) +
      (updatedAddons.return?.reduce((sum, a) => sum + a.total, 0) || 0);

    return {
      addons: updatedAddons,
      addonsTotal: totalAddonsAmount,
    };
  }),
setSelectedDates: ({ pickupDate, returnDate }) => set((state) => ({
  selectedPickupDate: pickupDate ?? state.selectedPickupDate,
  selectedReturnDate: returnDate ?? state.selectedReturnDate,
})),

      fetchPickupOptions: (query) => {
        const { searchTimeoutId } = get()
        if (searchTimeoutId) {
          clearTimeout(searchTimeoutId)
        }

        if (!query?.trim()) return
        const timeoutId = setTimeout(async () => {
          set({ isLoading: true })
          try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/pickup-options?search=${query}`)
            const result = await res.json()
            set({ pickupOptions: result?.pickup_points || [], isLoading: false })
          } catch (err) {
            set({ isLoading: false, error: err.message || "Pickup fetch failed" })
          }
        }, 500)
        set({ searchTimeoutId: timeoutId })
      },

      fetchDropoffOptions: async (pickupId) => {
        if (!pickupId) return
        set({ isLoading: true })
        try {
          const res = await fetch(
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/dropoff-options?pickup_point_id=${pickupId}`,
          )
          const result = await res.json()
          set({ dropoffOptions: result?.dropoff_points || [], isLoading: false })
        } catch (err) {
          set({ isLoading: false, error: err.message || "Dropoff fetch failed" })
        }
      },

      fetchTransfers: async (payload) => {
        set({ isLoading: true })
        try {
          const apiPayload = {
            tripType: payload.tripType,
            returnDate: payload.returnDate,
            pickup_point_id: payload.pickup?.id,
            dropoff_point_id: payload.dropoff?.id,
          };

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayload),
          })
          const result = await res.json()
          set({ searchResults: result.results || [], isLoading: false })
        } catch (err) {
          set({ isLoading: false, error: err.message || "Search failed" })
        }
      },
     fetchProductSurcharge: async ({ productId, pickupTime, leg, reset = false }) => {
  if (reset) {
    if (leg === "pickup") {
      set({ surchargePickup: null });
    } else if (leg === "return") {
      set({ surchargeReturn: null });
    }
    set({ surchargeDetails: null });
    return; 
  }
  if (!productId || !pickupTime) return;

  set({ isLoading: true });

  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/product-surcharges?product_id=${productId}&pickup_time=${pickupTime}`;
    const res = await fetch(url);
    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const text = await res.text();
      throw new Error("Invalid response from server: " + text);
    }

    const result = await res.json();

    if (leg === "pickup") {
      set({ surchargePickup: result });
    } else if (leg === "return") {
      set({ surchargeReturn: result });
    }
    set({ surchargeDetails: result, isLoading: false });
  } catch (err) {
    set({ isLoading: false, error: err.message || "Failed to fetch surcharge" });
  }
},


      setSelectedPickup: (pickup) => set({ selectedPickup: pickup }),
      setSelectedDropoff: (dropoff) => set({ selectedDropoff: dropoff }),
      setTripType: (type) => set({ tripType: type }),

      setSelectedTransfer: (transfer) => {
        set({
          selectedTransfer: transfer,
          userBookingDetails: {
            pickupDate: "",
            pickupTime: "",
            returnDate: "",
            returnTime: "",
            pickupFlightNumber: "",
            returnFlightNumber: "",
            pickupFlightTime: "", 
             returnTimeSchedule: "",
        pickupTimeSchedule: "",
returnFlightTime: "", 

            baggage: 0,
          },
        })
      },

      fetchVehicles: async () => {
        set({ isLoading: true })
        try {
          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/getvehicles`)
          const result = await res.json()
          if (result.success) {
            set({ vehicles: result.data.vehicles || [], isLoading: false })
          } else {
            set({ vehicles: [], isLoading: false, error: result.message || "Failed to fetch vehicles" })
          }
        } catch (err) {
          set({ isLoading: false, error: err.message || "Vehicles fetch failed" })
        }
      },

   fetchTravelInfo: async (params) => {
  const { origin_lat, origin_lng, dest_lat, dest_lng, date, start_time } = params
  set({ isLoading: true })
  try {
    const url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/travel-info?origin_lat=${origin_lat}&origin_lng=${origin_lng}&dest_lat=${dest_lat}&dest_lng=${dest_lng}&date=${date}&start_time=${start_time}`
    const res = await fetch(url)
    const result = await res.json()

    if (result.success) {
      set({ vehicles: result.data || [], isLoading: false })
    } else {
      set({
        vehicles: [],
        isLoading: false,
        error: result.message || "Failed to fetch travel info",
      })
    }

    return result   // ✅ return the API response
  } catch (err) {
    set({
      isLoading: false,
      error: err.message || "Travel info fetch failed",
    })
    return { success: false, message: err.message } // ✅ return error too
  }
},
fetchProductFeature: async (payload) => {
  if (!payload?.product_id) return;
  set({ isLoading: true });

  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/productfeaturetype`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const contentType = res.headers.get("content-type");
    if (!res.ok || !contentType?.includes("application/json")) {
      const text = await res.text();
      throw new Error("Invalid response from server: " + text);
    }

    const result = await res.json();

    // ✅ Extract only the features array from API response
    const features = Array.isArray(result?.features) ? result.features : [];

    // ✅ Persist both full API response and extracted features if needed later
    set({
      productFeature: features,
      selectedFeatureResponse: result, // 👈 keep full API object for other uses
      isLoading: false,
    });

    return features;
  } catch (err) {
    console.error("❌ fetchProductFeature error:", err);
    set({
      isLoading: false,
      error: err.message || "Failed to fetch product feature",
    });
    return { success: false, message: err.message };
  }
},



      setUserBookingDetails: (details) =>
        set({
          userBookingDetails: {
            ...get().userBookingDetails,
            ...details,
          },
        }),

      resetFormData: () =>
        set({
          userBookingDetails: {
            pickupDate: "",
            pickupTime: "",
            returnDate: "",
            returnTime: "",
            productFeature: [],
            pickupFlightNumber: "",
            returnFlightNumber: "",
            pickupFlightTime: "", 
             returnTimeSchedule: "",
        pickupTimeSchedule: "",
returnFlightTime: "", 

            baggage: 0,
          },
        }),


      resetTransferStore: () => {
        set({
          pickupOptions: [],
          dropoffOptions: [],
          productFeature:[],
          surchargeDetails: null,
          surchargePickup: null,
          surchargeReturn: null,
          selectedPickup: null,
          selectedDropoff: null,
          selectedTransfer: null,
          searchResults: [],
          tripType: "one-way",
          vehicles: [],
addons: [],
  addonsTotal: 0,
          userBookingDetails: {
            pickupDate: "",
            pickupTime: "",
            returnDate: "",
            returnTime: "",
            pickupFlightNumber: "",
            returnFlightNumber: "",
            baggage: 0,
          },

          searchParams: {
            pickup: null,
            dropoff: null,
            tripType: "one-way",
          },
        })

        sessionStorage.removeItem("transfer-store")
      },
    }),

    {
      name: "transfer-store",
      partialize: (state) => ({
        selectedTransfer: state.selectedTransfer,
        selectedPickup: state.selectedPickup,
        selectedDropoff: state.selectedDropoff,
        userBookingDetails: state.userBookingDetails,
        searchParams: state.searchParams,
        tripType: state.tripType,
      //  vehicles: state.vehicles,
         addons: state.addons, 
         productFeature: state.productFeature,
selectedFeatureResponse: state.selectedFeatureResponse,

      }),
      getStorage: () => sessionStorage,
    },
  ),
)
