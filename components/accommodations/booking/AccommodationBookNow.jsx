// components/accommodations/booking/AccommodationBookNow.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useCartStore } from "@/store/useCartStore"; // Named import

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
];

const AccommodationBookNow = () => {
  const { t } = useTranslation("accommodation");
  const { setJustAdded } = useDrawerStore();

  // === Load booking data from sessionStorage ===
  const rawData = sessionStorage.getItem("accommodationBookingData");
  const bookingData = rawData ? JSON.parse(rawData) : null;

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

  // === Initialize guest objects ===
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

  // === Re-init guests only when rawData changes (prevents loop) ===
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

  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoadingButton("addToCart");
    setIsSubmitting(true);

    // Simulate API delay
    await new Promise((r) => setTimeout(r, 800));

    // === Save guest details to sessionStorage ===
    const updatedBookingData = {
      ...bookingData,
      guestDetails: {
        adults: guests.adults,
        children: guests.children,
      },
      specialRequests,
    };

    sessionStorage.setItem("accommodationBookingData", JSON.stringify(updatedBookingData));

    // === Build cart item (same as Day Tour) ===
    const cartItem = {
      tourId: bookingData.hotelData.id,
      productTitle: bookingData.hotelData.title,
      productType: "accommodation",
      price: bookingData.selectedRoom.price * (bookingData.nights || 1),
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

    // === Add to cart using Zustand ===
    useCartStore.getState().addAccommodationItem(cartItem);

    // === Show success + drawer trigger ===
    try {
      setJustAdded(true);
    } catch (e) {
      console.warn("Drawer store not available:", e);
    }

    setShowCartOptions(true);
    setLoadingButton(null);
    setIsSubmitting(false);
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
    <div className="bg-gray-800 rounded-lg p-6">
      <h2 className="text-2xl font-bold text-white mb-6">Guest Information</h2>

      <form onSubmit={handleAddToCart} className="space-y-8">

        {/* === ADULTS === */}
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

        {/* === CHILDREN === */}
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

        {/* === SPECIAL REQUESTS === */}
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

        {/* === ACTION BUTTONS === */}
        {!showCartOptions ? (
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full bg-[#CC9A55] hover:bg-[#b88a45] text-white font-semibold py-3 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loadingButton === "addToCart" ? "Adding to Cart..." : "Add to Cart"}
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
  );
};

export default AccommodationBookNow;