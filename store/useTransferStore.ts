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

      // ... (your categoryOptions, setAddons, etc. stay the same)

      fetchPickupOptions: (query) => {
        const { searchTimeoutId } = get()
        if (searchTimeoutId) clearTimeout(searchTimeoutId)

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
            `${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/dropoff-options?pickup_point_id=${pickupId}`
          )
          const result = await res.json()
          set({ dropoffOptions: result?.dropoff_points || [], isLoading: false })
        } catch (err) {
          set({ isLoading: false, error: err.message || "Dropoff fetch failed" })
        }
      },

      fetchTransfers: async (payload) => {
        if (!payload?.pickup?.id || !payload?.dropoff?.id) {
          console.warn("fetchTransfers blocked: invalid payload", payload)
          return
        }

        const state = get()

        if (state.isLoading) {
          console.log("fetchTransfers already in progress, skipping")
          return
        }

        if (
          state.searchParams.pickup?.id === payload.pickup.id &&
          state.searchParams.dropoff?.id === payload.dropoff.id &&
          state.searchParams.tripType === payload.tripType &&
          state.searchResults.length > 0
        ) {
          console.log("Same search already done, skipping")
          return
        }

        console.log("fetchTransfers →", payload.pickup.name, "→", payload.dropoff.name, payload.tripType)

        set({ isLoading: true, error: null, searchResults: [] })

        try {
          const apiPayload = {
            tripType: payload.tripType,
            returnDate: payload.returnDate,
            pickup_point_id: payload.pickup.id,
            dropoff_point_id: payload.dropoff.id,
          }

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/transfer/search`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(apiPayload),
          })

          if (!res.ok) throw new Error(`HTTP ${res.status}`)

          const result = await res.json()

          set({
            searchResults: result.results || [],
            isLoading: false,
            searchParams: {
              pickup: payload.pickup,
              dropoff: payload.dropoff,
              tripType: payload.tripType,
            },
          })
        } catch (err) {
          set({ isLoading: false, error: err.message })
          console.error("Transfer search failed:", err)
        }
      },

      // ... (rest of your actions: fetchProductSurcharge, setSelectedPickup, etc.)

      setSelectedPickup: (pickup) => set({ selectedPickup: pickup }),
      setSelectedDropoff: (dropoff) => set({ selectedDropoff: dropoff }),
      setTripType: (type) => set({ tripType: type }),

      // Only reset TEMPORARY data — keep search context!
      resetTransferStore: () => {
        set({
          pickupOptions: [],
          dropoffOptions: [],
          productFeature: [],
          surchargeDetails: null,
          surchargePickup: null,
          surchargeReturn: null,
          selectedTransfer: null,
          searchResults: [],
          vehicles: [],
          addons: [],
          addonsTotal: 0,
          isLoading: false,
          error: null,
          searchTimeoutId: null,

          userBookingDetails: {
            pickupDate: "",
            pickupTime: "",
            returnDate: "",
            returnTime: "",
            pickupFlightNumber: "",
            returnFlightNumber: "",
            pickupFlightTime: "",
            returnFlightTime: "",
            returnTimeSchedule: "",
            pickupTimeSchedule: "",
            baggage: 2,
          },

          // DO NOT RESET THESE — they are needed on listings page!
          // selectedPickup: null,
          // selectedDropoff: null,
          // tripType: "one-way",
          // searchParams: { pickup: null, dropoff: null, tripType: "one-way" },
        })

        // Only clear sessionStorage if you want FULL reset (e.g. logout)
        // Remove this line to keep search context alive:
        // sessionStorage.removeItem("transfer-store")
      },
    }),
    {
      name: "transfer-store",
      partialize: (state) => ({
        // These are the ones you WANT to persist across page refresh
        selectedPickup: state.selectedPickup,
        selectedDropoff: state.selectedDropoff,
        tripType: state.tripType,
        searchParams: state.searchParams,
        userBookingDetails: state.userBookingDetails,
        addons: state.addons,
        addonsTotal: state.addonsTotal,
        productFeature: state.productFeature,
        selectedFeatureResponse: state.selectedFeatureResponse,
        selectedTransfer: state.selectedTransfer,
      }),
      getStorage: () => sessionStorage,
    }
  )
)