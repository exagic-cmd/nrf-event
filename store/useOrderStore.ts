import { create } from "zustand"
import { persist } from "zustand/middleware"
import { apiRequest } from "@/lib/clientApi"

export const useOrderStore = create(
  persist(
    (set, get) => ({
      upcomingBookings: [],
      pastBookings: [],
      selectedOrder: null,
      selectedTrip: null,
       weatherInfo: null,
      reviewQuestions: [],
      categoryId: null,
      loading: false,
      error: null,
fetchWeatherInfo: async ( userId) => {
  set({ loading: true, error: null })
  try {
    const res = await apiRequest({
      endpoint: `customer/weather-info?user_id=${userId}`,
      method: "GET",

    })

    const weatherData = res?.data || {}
    console.log("Weather info response:", weatherData)

    set({ weatherInfo: weatherData, loading: false })
  } catch (err) {
    set({
      loading: false,
      error: err.message || "Failed to fetch weather info",
    })
  }
},

     fetchUpcomingBookings: async (token) => {
  set({ loading: true, error: null });
  try {
    const res = await apiRequest({
      endpoint: "customer/itinerary",
      method: "POST",
      data: { access_token: token },
    });

    const bookings = (res?.data?.orders || []).map((order) => {
      const itineraries = order.itineraries || [];
      const firstItinerary = itineraries[0] || {};

      return {
        ...order,
        itineraries,
        title: firstItinerary.title || "",
        hotel_name: firstItinerary.hotel_name || "",
        arrivalDate: firstItinerary.arrivalDate || order.checkin_date || "",
        checkin_date: order.checkin_date || "",
        image: firstItinerary.image || "",
        arrivalTime: firstItinerary.pickup_time || "",
      };
    });

    set({ upcomingBookings: bookings, loading: false });
    if (bookings.length > 0 && bookings[0].itineraries?.length > 0) {
      const firstOrder = bookings[0];
      const firstItinerary = firstOrder.itineraries[0];

      const prefillData = {
        order_id: firstOrder.order_id,
        itinerary_id: firstItinerary.id,
        title: firstItinerary.title,
        date: firstItinerary.date,
        pickup_time: firstItinerary.pickup_time,
        pickup_point: firstItinerary.pickup_point, 
        total_adult: firstOrder.total_adult ?? 0,
        total_child: firstOrder.total_child ?? 0,
      };

      set({ prefillData });
      console.log("Prefill data automatically saved:", prefillData);
    }
  } catch (err) {
    set({
      error: err.message || "Failed to fetch upcoming bookings",
      loading: false,
    });
  }
},


      fetchPastBookings: async (token) => {
        set({ loading: true, error: null })
        try {
          const res = await apiRequest({
            endpoint: "customer/prevItinerary",
            method: "POST",
            data: { access_token: token },
          })

          const bookings = (res?.data?.orders || []).map((order) => {
            const itineraries = order.itineraries || []
            const firstItinerary = itineraries[0] || {}

            return {
              ...order,
              itineraries,
              title: firstItinerary.title || "",
              hotel_name: firstItinerary.hotel_name || "",
              arrivalDate: firstItinerary.arrivalDate || order.checkin_date || "",
              checkin_date: order.checkin_date || "",
              image: firstItinerary.image || "",
              arrivalTime: firstItinerary.pickup_time || "",
              category_id: firstItinerary.category_id || null,
            }
          })

          console.log("Past bookings processed:", bookings)
          console.log(
            "Total itineraries across all past orders:",
            bookings.reduce((total, order) => total + (order.itineraries?.length || 0), 0),
          )

          set({ pastBookings: bookings, loading: false })
        } catch (err) {
          set({
            error: err.message || "Failed to fetch past bookings",
            loading: false,
          })
        }
      },

   fetchOrderDetail: async (token, orderId, itineraryId) => {
  set({ loading: true, error: null })
  try {
    const payload = { access_token: token, order_id: orderId, itinerary_id: itineraryId }
    const res = await apiRequest({
      endpoint: "customer/itinerary/item",
      method: "POST",
      data: payload,
    })

    const orderData = res?.data?.order || {}
    const itinerary = res?.data?.itinerary ? [res.data.itinerary] : []

    const order = {
      ...orderData,
      itineraries: itinerary,
    }

    set({ selectedOrder: order, loading: false })
  } catch (err) {
    set({
      loading: false,
      error: err.message || "Failed to fetch order details",
    })
  }
},


fetchReviewQuestions: async (itineraryId, qrcode) => {
  set({ loading: true, error: null });
  try {
    const res = await apiRequest({
      endpoint: `get_customer_questions/${itineraryId}/${qrcode}`,
      method: "GET",
    });

    const rawQuestions = res?.review_questions || [];

    const normalized = rawQuestions.map((q) => ({
      id: q.id,
      question: q.question,
      type: q.review_type?.toLowerCase(),
    }));

    set({
      reviewQuestions: normalized,
      loading: false,
      error: null,
    });

    return {
      success: true,
      message: res.message,
      itinerary_id: res.itinerary_id,
      customer_id: res.customer_id,
      category_id: res.category_id,
      booking_id: res.booking_id,
      product_id: res.product_id,
    };
  } catch (err) {
    set({
      error: err.message || "Failed to fetch review questions",
      loading: false,
    });

    return {
      success: false,
      error: err.message || "Failed to fetch review questions",
    };
  }
},

cancelOrder: async (itineraryId, reason, accessCode) => {
  set({ loading: true, error: null });
  try {
    const res = await apiRequest({
      endpoint: "cancelOrder",
      method: "POST",
      data: {
        itineraryId,
        reason,
        accessCode,
      },
    });

    console.log("Cancel order response:", res);

 
    const { fetchUpcomingBookings } = get();
    if (res?.success) {
      const token = localStorage.getItem("access_token"); 
      if (token) {
        await fetchUpcomingBookings(token);
      }
    }

    set({ loading: false });
    return res;
  } catch (err) {
    set({
      loading: false,
      error: err.message || "Failed to cancel order",
    });
    return { error: err.message || "Failed to cancel order" };
  }
},




      setSelectedTrip: (trip) => set({ selectedTrip: trip }),
      setSelectedOrder: (order) => set({ selectedOrder: order }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "order-store",
     partialize: (state) => ({
  selectedTrip: state.selectedTrip,
  selectedOrder: state.selectedOrder,
  prefillData: state.prefillData, 
}),
    },
  ),
)
