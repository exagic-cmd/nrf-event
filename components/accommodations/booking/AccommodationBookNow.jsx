// components/accommodations/booking/AccommodationBookNow.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useCartStore } from "@/store/useCartStore";
import $helpers from "@/lib/helpers";
import {
  Calendar, Home, Bed, Utensils, AlertCircle,
  CheckCircle, XCircle, DollarSign, Info
} from "lucide-react";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
];

// LARGE & BEAUTIFUL Confirmation Modal
const ConfirmationModal = ({ isOpen, onClose, onConfirm, bookingResponse }) => {
  const api = bookingResponse?.apiResponse || bookingResponse;
  if (!isOpen || !api?.data?.[0]) return null;

  const item = api.data[0];
  const room = item.Room;
  const totalPrice = (parseFloat(room.TotalSellingPrice?.["@attributes"]?.amt) || 0).toFixed(2);
  const currency = api.currency || "USD";
  const roomType = room.RoomType?.["@attributes"]?.text || "N/A";
  const mealType = room.MealType?.["@attributes"]?.text || "N/A";
  const hotelName = item.HotelName || "Unknown Hotel";
  const checkIn = item.ArrivalDate;
  const nights = parseInt(item.Nights) || 1;
  const cancellationStatus = room.CancellationPolicyStatus || "Unknown";

  // Nightly costs
  const nightCosts = Array.isArray(room.NightCost) ? room.NightCost : [room.NightCost].filter(Boolean);
  const perNightPrice = nightCosts.length > 0
    ? (parseFloat(nightCosts[0]?.SellingPrice?.["@attributes"]?.amt) || 0).toFixed(2)
    : (parseFloat(totalPrice) / nights).toFixed(2);

  const messages = room.Messages?.Message || [];
  const generalMessages = messages.filter(m => m.Type === "General");
  const internalNotes = messages.filter(m => m.Type === "Internal Note");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      {/* LARGE MODAL */}
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[92vh] overflow-y-auto shadow-3xl">
        <div className="p-6 md:p-10">

          {/* Header */}
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-1xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Booking Summary
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-700 transition"
            >
              <XCircle className="h-8 w-8" />
            </button>
          </div>

          {/* Hotel Banner */}
          <div className="bg-gradient-to-r from-[#CC9A55] to-[#b88a45] text-white rounded-2xl p-6 mb-8">
            <h4 className="text-1xl font-bold flex items-center gap-3">
              <Home className="h-7 w-7" />
              {hotelName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-5 text-sm">
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="opacity-90">Check-in</p>
                  <p className="font-bold text-lg">{checkIn}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Calendar className="h-5 w-5" />
                <div>
                  <p className="opacity-90">Nights</p>
                  <p className="font-bold text-lg">{nights}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Bed className="h-5 w-5" />
                <div>
                  <p className="opacity-90">Room</p>
                  <p className="font-bold">{roomType}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Utensils className="h-5 w-5" />
                <div>
                  <p className="opacity-90">Meal</p>
                  <p className="font-bold">{mealType}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-[#CC9A55]" />
              Price Details
            </h4>

            <div className="space-y-4">
              {/* Per Night */}
              {/* <div className="flex justify-between items-center py-3 border-b border-dashed border-gray-300">
                <span className="text-gray-700 font-medium">Per Night Rate</span>
                <span className="text-2xl font-bold text-[#CC9A55]">
                  {perNightPrice} {currency}
                </span>
              </div> */}

              {/* Nightly Breakdown */}
              {nightCosts.length > 1 && (
                <div className="bg-blue-50 rounded-xl p-4 mt-4">
                  <p className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Nightly Rate Breakdown
                  </p>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    {nightCosts.map((nc, i) => (
                      <div key={i} className="bg-white rounded-lg p-3 text-center shadow-sm">
                        <p className="text-gray-600">Night {parseInt(nc.Night) + 1}</p>
                        <p className="font-bold text-[#CC9A55]">
                          {nc.SellingPrice?.["@attributes"]?.amt || "0.00"} {currency}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Total */}
              <div className="flex justify-between items-center pt-5 border-t-4 border-double border-gray-300">
                <span className="text-1xl font-bold text-gray-800">Total Amount</span>
                <span className="text-2xl font-extrabold text-[#CC9A55]">
                  {totalPrice} {currency}
                </span>
              </div>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="mb-8">
            <h5 className="text-xl font-bold text-gray-800 mb-3 flex items-center gap-2">
              <AlertCircle className={`h-6 w-6 ${cancellationStatus === "NonRefundable" ? "text-red-600" : "text-green-600"}`} />
              Cancellation Policy
            </h5>
            <div className={`inline-block px-6 py-3 rounded-xl font-semibold text-md ${
              cancellationStatus === "NonRefundable"
                ? "bg-red-100 text-red-800 border-2 border-red-300"
                : "bg-green-100 text-green-800 border-2 border-green-300"
            }`}>
              {cancellationStatus === "NonRefundable"
                ? "Non-Refundable – 100% charge on cancellation"
                : "Refundable – Free cancellation available"}
            </div>
          </div>

          {/* Important Messages */}
          {generalMessages.length > 0 && (
            <div className="mb-8">
              <h5 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                <AlertCircle className="h-6 w-6 text-orange-600" />
                Important Information
              </h5>
              <div className="space-y-4">
                {generalMessages.map((msg, i) => (
                  <div
                    key={i}
                    className="bg-orange-50 border-2 border-orange-300 rounded-xl p-5 text-orange-900"
                    dangerouslySetInnerHTML={{ __html: msg.Text }}
                  />
                ))}
              </div>
            </div>
          )}

          {internalNotes.length > 0 && (
            <div className="mb-8">
              <p className="text-sm font-semibold text-gray-700 mb-3">Additional Notes</p>
              <div className="bg-gray-50 rounded-xl p-5 text-sm text-gray-600 space-y-2">
                {internalNotes.map((note, i) => (
                  <p key={i} dangerouslySetInnerHTML={{ __html: note.Text }} />
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-5 mt-10">
            <button
              onClick={onClose}
              className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-5 rounded-2xl transition text-xl shadow-md"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-[#CC9A55] hover:bg-[#b88a45] text-white font-bold py-5 rounded-2xl transition text-xl shadow-xl"
            >
              Confirm & Add to Cart
            </button>
          </div>
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

  if (!bookingData) {
    return (
      <div className="text-white text-center py-10">
        Loading booking data...
      </div>
    );
  }

  const rooms = bookingData?.searchParams?.rooms || [];
  const nights = bookingData.nights || 1;

  // Initialize guests per room
  const initGuestsByRoom = () => {
    return rooms.map((room) => {
      const adultsCount = room.adult || 2;
      const childrenAges = room.children || [];

      return {
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
      };
    });
  };

  const [guestsByRoom, setGuestsByRoom] = useState(initGuestsByRoom);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCartOptions, setShowCartOptions] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState(null);

  useEffect(() => {
    setGuestsByRoom(initGuestsByRoom());
  }, [rawData]);

  // Update guest in specific room
  const updateGuest = (roomIdx, type, guestIdx, field, value) => {
    setGuestsByRoom((prev) =>
      prev.map((room, rIdx) =>
        rIdx === roomIdx
          ? {
              ...room,
              [type]: room[type].map((g, gIdx) =>
                gIdx === guestIdx ? { ...g, [field]: value } : g
              ),
            }
          : room
      )
    );
  };

  const callPreBookingAPI = async () => {
  const flatAdults = [];
  const flatChildren = [];

  guestsByRoom.forEach((roomGuests) => {
    // Adults
    roomGuests.adults.forEach((a) => {
      flatAdults.push({
        title: a.title,
        f_name: a.firstName,
        l_name: a.lastName,
        nationality: null,
      });
    });

    // Children
    roomGuests.children.forEach((c) => {
      flatChildren.push({
        title: c.title,
        f_name: c.firstName,
        l_name: c.lastName,
        age: String(c.age),          // API expects a string
        nationality: null,
      });
    });
  });

  const payload = {
    region: bookingData.searchParams?.region ?? false,
    hotel_id: bookingData.searchParams?.hotel_id ?? false,
    start_date: bookingData.searchParams?.start_date,
    nights: bookingData.nights,
    rooms: bookingData.searchParams?.rooms ?? [], // original room config
    stars: bookingData.searchParams?.stars ?? "0",
    quoteId: bookingData.selectedRoom?.id ?? "", // <-- this is the Result.@attributes.id
    visitor_id: $helpers.getVisitorId(),

    // FLAT arrays
    adult: flatAdults,
    child: flatChildren,

    confiremed: false,
  };

  try {
    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba/booking`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      }
    );

    if (!res.ok) {
      const err = await res.text();
      console.error("Booking API error:", err);
      throw new Error("Booking validation failed");
    }

    const data = await res.json();
    return { apiResponse: data, requestPayload: payload };
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
  const updatedBookingData = {
    ...bookingData,
    guestDetailsByRoom: guestsByRoom,
    specialRequests,
    request_response: bookingResponse?.apiResponse ?? null,
    request: bookingResponse?.requestPayload
      ? { callPreBookingAPI: bookingResponse.requestPayload }
      : null,
  };

  // ---- Build roomsDetailsArray (one entry per room) -----------------
  const roomsDetailsArray = guestsByRoom.map((roomGuests, idx) => ({
    ...(bookingData.selectedRoom || {}),
    roomTypeId: idx + 1,
    guestDetails: {
      adults: roomGuests.adults,
      children: roomGuests.children,
    },
  }));

  const hotelId =
    bookingData.hotelData?.id ||
    bookingData.hotelData?.stuba_id ||
    bookingData.hotelData?.stubaId ||
    null;

  updatedBookingData.hotelData = {
    id: hotelId,
    roomsDetails: roomsDetailsArray,
    request_response: bookingResponse?.apiResponse ?? null,
    request: bookingResponse?.requestPayload
      ? { callPreBookingAPI: bookingResponse.requestPayload }
      : null,
  };

  sessionStorage.setItem(
    "accommodationBookingData",
    JSON.stringify(updatedBookingData)
  );

  // ---- Cart item (still ONE product, price = total for ALL nights) ----
  const totalAdults = rooms.reduce(
    (s, r) => s + (r.adult || 0),
    0
  );
  const totalChildren = rooms.reduce(
    (s, r) => s + (r.children?.length || 0),
    0
  );
  const unitPrice = parseFloat(bookingData.selectedRoom?.price || 0) || 0;
  const totalPrice = (unitPrice * nights).toFixed(2);

  const cartItem = {
    product_id: hotelId,
    tourId: hotelId,
    productTitle:
      bookingData.hotelData?.title || bookingData.hotelData?.name || "",
    productType: "accommodation",

    adult_count: totalAdults,
    child_count: totalChildren,
    price: unitPrice,
    total: Number(totalPrice),
    tour_date: bookingData.checkIn || bookingData.searchParams?.start_date,
    check_in: bookingData.checkIn || null,
    check_out: bookingData.checkOut || null,

    // transfer fields (null)
    pickup_date: null,
    pickup_time: null,
    pickup_point: null,
    dropoff_point: null,
    vehicle_id: null,
    transfer_type: null,
    flight_number: "",
    flight_dep_number: "",
    flight_estimated_time: "",
    flight_dep_estimated_time: "",
    two_way_dropoff_date: "",
    two_way_dropoff_time: "",
    baggage: null,
    pickup_surcharge: 0,
    return_surcharge: 0,
    return_surcharge_id: 0,
    pickup_surcharge_id: 0,

    addons: [],
    addons_round: [],
    exceptions: [],

    nights,
    roomType: bookingData.selectedRoom?.roomType || "",
    mealType: bookingData.selectedRoom?.mealType || "",
    quoteId: bookingData.selectedRoom?.id || null,
    cancellationPolicy:
      bookingData.selectedRoom?.cancellationPolicy || null,

    hotel_info: {
      id: hotelId,
      roomsDetails: roomsDetailsArray,
      checkInDate: bookingData.checkIn || null,
      checkOutDate: bookingData.checkOut || null,
      request_response: bookingResponse?.apiResponse ?? null,
      request: bookingResponse?.requestPayload
        ? { callPreBookingAPI: bookingResponse.requestPayload }
        : null,
    },

    guestDetailsByRoom: guestsByRoom,
    specialRequests: specialRequests || "",

    image:
      bookingData.hotelData?.images?.[0]?.url ||
      bookingData.hotelData?.image ||
      null,
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
    window.location.href = "/";
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

        <form onSubmit={handleAddToCart} className="space-y-10">
          {rooms.map((room, roomIdx) => {
            const roomGuests = guestsByRoom[roomIdx] || { adults: [], children: [] };
            const roomNumber = roomIdx + 1;

            return (
              <div key={roomIdx} className="border border-gray-600 rounded-xl p-6 bg-gray-750">
                <h3 className="text-xl font-bold text-[#CC9A55] mb-5">
                  Room {roomNumber} – {room.adult} Adult{room.adult > 1 ? "s" : ""}
                  {room.children?.length > 0 && `, ${room.children.length} Child${room.children.length > 1 ? "ren" : ""}`}
                </h3>

                {/* Adults */}
                {roomGuests.adults.length > 0 && (
                  <div className="mb-6">
                    <h4 className="text-lg font-semibold text-white mb-4">Adults</h4>
                    <div className="space-y-5">
                      {roomGuests.adults.map((adult, i) => (
                        <div key={`room${roomIdx}-adult-${i}`} className="bg-gray-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
                            <select
                              value={adult.title}
                              onChange={(e) => updateGuest(roomIdx, "adults", i, "title", e.target.value)}
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
                              onChange={(e) => updateGuest(roomIdx, "adults", i, "firstName", e.target.value)}
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
                              onChange={(e) => updateGuest(roomIdx, "adults", i, "lastName", e.target.value)}
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

                {/* Children */}
                {roomGuests.children.length > 0 && (
                  <div>
                    <h4 className="text-lg font-semibold text-white mb-4">Children</h4>
                    <div className="space-y-5">
                      {roomGuests.children.map((child, i) => (
                        <div key={`room${roomIdx}-child-${i}`} className="bg-gray-700 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4">
                          <div>
                            <label className="block text-gray-300 text-sm font-medium mb-2">Title *</label>
                            <select
                              value={child.title}
                              onChange={(e) => updateGuest(roomIdx, "children", i, "title", e.target.value)}
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
                              onChange={(e) => updateGuest(roomIdx, "children", i, "firstName", e.target.value)}
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
                              onChange={(e) => updateGuest(roomIdx, "children", i, "lastName", e.target.value)}
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
              </div>
            );
          })}

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

          {/* Submit Buttons */}
          {!showCartOptions ? (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#CC9A55] hover:bg-[#b88a45] text-white font-bold py-4 rounded-xl transition text-xl disabled:opacity-50"
            >
              {loadingButton === "addToCart" ? "Validating Booking..." : "Add to Cart"}
            </button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                type="button"
                onClick={handleContinueShopping}
                disabled={loadingButton === "continue"}
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold py-4 rounded-xl transition"
              >
                {loadingButton === "continue" ? "Loading..." : "Continue Shopping"}
              </button>
              <button
                type="button"
                onClick={handleViewCart}
                disabled={loadingButton === "checkout"}
                className="flex-1 bg-[#CC9A55] hover:bg-[#b88a45] text-white font-bold py-4 rounded-xl transition"
              >
                {loadingButton === "checkout" ? "Redirecting..." : "Proceed to Checkout"}
              </button>
            </div>
          )}
        </form>
      </div>

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