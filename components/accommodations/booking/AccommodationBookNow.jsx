// components/accommodations/booking/AccommodationBookNow.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useCartStore } from "@/store/useCartStore";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
];

// Modal Component
const ConfirmationModal = ({ isOpen, onClose, onConfirm, bookingResponse }) => {
  if (!isOpen) return null;

  const { hotelData, selectedRoom, checkIn, checkOut, nights } = bookingResponse?.bookingData || {};

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl max-w-md w-full p-6 shadow-2xl">
        <h3 className="text-2xl font-bold text-gray-900 mb-4">Confirm Booking</h3>

        <div className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Hotel:</span>
            <span className="font-medium">{hotelData?.title || "N/A"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Room Type:</span>
            <span className="font-medium">{selectedRoom?.roomType || "Standard"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Meal Plan:</span>
            <span className="font-medium">{selectedRoom?.mealType || "Room Only"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-in:</span>
            <span className="font-medium">{checkIn}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Check-out:</span>
            <span className="font-medium">{checkOut}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Nights:</span>
            <span className="font-medium">{nights}</span>
          </div>
          <div className="flex justify-between text-lg font-bold text-[#CC9A55] pt-3 border-t">
            <span>Total Price:</span>
            <span>{selectedRoom?.price || "N/A"} AED</span>
          </div>
          {selectedRoom?.cancellationPolicy && (
            <p className="text-xs text-green-600 mt-2">
              Free cancellation until {selectedRoom.cancellationPolicy}
            </p>
          )}
        </div>

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-3 rounded-lg transition"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#CC9A55] hover:bg-[#b88a45] text-white font-medium py-3 rounded-lg transition"
          >
            Confirm & Add to Cart
          </button>
        </div>
      </div>
    </div>
  );
};

const AccommodationBookNow = () => {
  const { t } = useTranslation("accommodation");
  const { setJustAdded } = useDrawerStore();

  const rawData = sessionStorage.getItem("accommodationBookingData");
  const bookingData = rawData ? JSON.parse(rawData) : null;
console.log("🚀 Booking Data:", bookingData);
  if (!bookingData) {
    return (
      <div className="text-white text-center py-10">
        Loading booking data...
      </div>
    );
  }

  const rooms = bookingData?.searchParams?.rooms || [];
  const room = rooms[0] || {};
  const adultsCount = room.adult || 2;
  const childrenAges = room.children || [];

  const initGuests = () => ({
    adults: Array.from({ length: adultsCount }, () => ({
      title: "Mr",
      firstName: "",
      lastName: "",
    })),
    children: childrenAges.map((age) => ({
      title: age >= 12 ? "Mr" : "Ms",
      firstName: "",
      lastName: "",
      age,
    })),
  });

  const [guests, setGuests] = useState(initGuests);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCartOptions, setShowCartOptions] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState(null);

  useEffect(() => {
    setGuests(initGuests());
  }, [rawData]);

  const updateGuest = (type, idx, field, value) => {
    setGuests((prev) => ({
      ...prev,
      [type]: prev[type].map((g, i) =>
        i === idx ? { ...g, [field]: value } : g
      ),
    }));
  };

  const callPreBookingAPI = async () => {
    const payload = {
      region: bookingData.searchParams.region || false,
      hotel_id: bookingData.searchParams.hotel_id || false,
      start_date: bookingData.searchParams.start_date,
      nights: bookingData.nights,
      rooms: bookingData.searchParams.rooms,
      stars: bookingData.searchParams.stars || "0",
      quoteId: bookingData.hotelQuoteId,
      adult: guests.adults.map((a) => ({
        title: a.title,
        f_name: a.firstName,
        l_name: a.lastName,
        nationality: null,
      })),
      child: guests.children.map((c) => ({
        title: c.title,
        f_name: c.firstName,
        l_name: c.lastName,
        age: c.age,
      })),
      confiremed: false,
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba/booking`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Booking validation failed");

      const data = await res.json();
      return data; // This will be shown in modal
    } catch (err) {
      console.error(err);
      alert("Booking validation failed. Please try again.");
      return null;
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoadingButton("addToCart");
    setIsSubmitting(true);

    const response = await callPreBookingAPI();

    if (!response) {
      setLoadingButton(null);
      setIsSubmitting(false);
      return;
    }

    setBookingResponse(response);
    setModalOpen(true);
    setLoadingButton(null);
    setIsSubmitting(false);
  };

  const confirmAndAddToCart = () => {
    // Save final data
    const updatedBookingData = {
      ...bookingData,
      guestDetails: {
        adults: guests.adults,
        children: guests.children,
      },
      specialRequests,
      preBookingResponse: bookingResponse, // optional
    };

    sessionStorage.setItem("accommodationBookingData", JSON.stringify(updatedBookingData));

    const cartItem = {
      tourId: bookingData.hotelData.id,
      productTitle: bookingData.hotelData.title,
      productType: "accommodation",
      price: bookingData.selectedRoom.price,
      quantity: 1,
      date: bookingData.searchParams.start_date,
      guests: bookingData.searchParams.rooms?.[0]?.adult || 2,
      nights: bookingData.nights || 1,
      roomType: bookingData.selectedRoom.roomType,
      mealType: bookingData.selectedRoom.mealType,
      checkIn: bookingData.checkIn,
      checkOut: bookingData.checkOut,
      image: bookingData.hotelData.images?.[0]?.url || bookingData.hotelData.image,
      cancellationPolicy: bookingData.selectedRoom.cancellationPolicy,
      guestDetails: updatedBookingData.guestDetails,
      specialRequests: specialRequests || "",
    };

    useCartStore.getState().addAccommodationItem(cartItem);

    try {
      setJustAdded(true);
    } catch (e) {
      console.warn("Drawer store not available:", e);
    }

    setModalOpen(false);
    setShowCartOptions(true);
  };

  const handleContinueShopping = async () => {
    setLoadingButton("continue");
    await new Promise((r) => setTimeout(r, 1200));
    window.location.href = "/accommodation";
  };

  const handleViewCart = async () => {
    setLoadingButton("checkout");
    await new Promise((r) => setTimeout(r, 1200));
    sessionStorage.setItem("fromBooking", "true");
    window.location.href = "/checkout";
  };

  return (
    <>
      <div className="bg-gray-800 rounded-lg p-6">
        <h2 className="text-2xl font-bold text-white mb-6">Guest Information</h2>

        <form onSubmit={handleAddToCart} className="space-y-8">
          {/* === GUEST FIELDS (same as before) === */}
          {guests.adults.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Adults ({guests.adults.length})
              </h3>
              <div className="space-y-5">
                {guests.adults.map((adult, i) => (
                  <div
                    key={`adult-${i}`}
                    className="bg-gray-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4"
                  >
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
                      <select
                        value={adult.title}
                        onChange={(e) => updateGuest("adults", i, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        required
                      >
                        {TITLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        value={adult.firstName}
                        onChange={(e) => updateGuest("adults", i, "firstName", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={adult.lastName}
                        onChange={(e) => updateGuest("adults", i, "lastName", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        placeholder="Last name"
                        required
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {guests.children.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">
                Children ({guests.children.length})
              </h3>
              <div className="space-y-5">
                {guests.children.map((child, i) => (
                  <div
                    key={`child-${i}`}
                    className="bg-gray-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4"
                  >
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
                      <select
                        value={child.title}
                        onChange={(e) => updateGuest("children", i, "title", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        required
                      >
                        {TITLE_OPTIONS.map((o) => (
                          <option key={o.value} value={o.value}>{o.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">First Name *</label>
                      <input
                        type="text"
                        value={child.firstName}
                        onChange={(e) => updateGuest("children", i, "firstName", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        placeholder="First name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Last Name *</label>
                      <input
                        type="text"
                        value={child.lastName}
                        onChange={(e) => updateGuest("children", i, "lastName", e.target.value)}
                        className="w-full px-3 py-2 bg-gray-600 border border-gray-500 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
                        placeholder="Last name"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-gray-300 text-sm font-medium mb-2">Age</label>
                      <input
                        type="text"
                        value={child.age}
                        readOnly
                        className="w-full px-3 py-2 bg-gray-500 border border-gray-600 rounded-md text-gray-300 cursor-not-allowed"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <label className="block text-gray-300 text-sm font-medium mb-2">
              Special Requests (Optional)
            </label>
            <textarea
              value={specialRequests}
              onChange={(e) => setSpecialRequests(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#CC9A55]"
              placeholder="Late check-in, extra bed, dietary needs, etc..."
            />
          </div>

          {!showCartOptions ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#CC9A55] hover:bg-[#b88a45] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loadingButton === "addToCart" ? "Validating..." : "Add to Cart"}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={handleContinueShopping}
                disabled={loadingButton === "continue"}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium py-3 rounded-lg transition"
              >
                {loadingButton === "continue" ? "Loading..." : "Continue Shopping"}
              </button>
              <button
                type="button"
                onClick={handleViewCart}
                disabled={loadingButton === "checkout"}
                className="flex-1 bg-[#CC9A55] hover:bg-[#b88a45] text-white font-medium py-3 rounded-lg transition"
              >
                {loadingButton === "checkout" ? "Redirecting..." : "Proceed to Checkout"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={confirmAndAddToCart}
        bookingResponse={bookingResponse}
      />
    </>
  );
};

export default AccommodationBookNow;