// components/accommodations/booking/AccommodationBookNow.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import useUserStore from "@/store/useAuthStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useCartStore } from "@/store/useCartStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import $helpers from "@/lib/helpers";
import LoaderSvg from "@/components/common/LoaderSvg";

import {
  Calendar, Home, Bed, Utensils, AlertCircle,
  CheckCircle, XCircle, DollarSign, Info, Loader2
} from "lucide-react";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
];

// === CONFIRMATION MODAL (ONLY FOR STUBA) ===
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

  const nightCosts = Array.isArray(room.NightCost) ? room.NightCost : [room.NightCost].filter(Boolean);
  const perNightPrice = nightCosts.length > 0
    ? (parseFloat(nightCosts[0]?.SellingPrice?.["@attributes"]?.amt) || 0).toFixed(2)
    : (parseFloat(totalPrice) / nights).toFixed(2);

  const messages = room.Messages?.Message || [];
  const generalMessages = messages.filter(m => m.Type === "General");
  const internalNotes = messages.filter(m => m.Type === "Internal Note");

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-7xl w-full max-h-[92vh] overflow-y-auto shadow-3xl">
        <div className="p-6 md:p-10">
          <div className="flex justify-between items-start mb-8">
            <h3 className="text-1xl font-bold text-gray-900 flex items-center gap-3">
              <CheckCircle className="h-6 w-6 text-green-600" />
              Booking Summary
            </h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-700 transition">
              <XCircle className="h-8 w-8" />
            </button>
          </div>

          <div className="bg-gradient-to-r from-[#D3202D] to-[#b88a45] text-white rounded-2xl p-6 mb-8">
            <h4 className="text-1xl font-bold flex items-center gap-3">
              <Home className="h-7 w-7" />
              {hotelName}
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-5 text-sm">
              <div className="flex items-center gap-3"><Calendar className="h-5 w-5" /><div><p className="opacity-90">Check-in</p><p className="font-bold text-lg">{checkIn}</p></div></div>
              <div className="flex items-center gap-3"><Calendar className="h-5 w-5" /><div><p className="opacity-90">Nights</p><p className="font-bold text-lg">{nights}</p></div></div>
              <div className="flex items-center gap-3"><Bed className="h-5 w-5" /><div><p className="opacity-90">Room</p><p className="font-bold">{roomType}</p></div></div>
              <div className="flex items-center gap-3"><Utensils className="h-5 w-5" /><div><p className="opacity-90">Meal</p><p className="font-bold">{mealType}</p></div></div>
              <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5" /><div><p className="opacity-90">Cancellation Policy</p><p className="font-bold">{cancellationStatus}</p></div></div>
            </div>
          </div>

          <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200">
            <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
              <DollarSign className="h-6 w-6 text-[#D3202D]" />
              Price Details
            </h4>
            <div className="space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-6 md:grid-cols-7 gap-3">
  {(Array.isArray(nightCosts) && nightCosts.length > 0
    ? nightCosts
    : Array.from({ length: nights }, (_, i) => ({
        SellingPrice: { "@attributes": { amt: perNightPrice } },
        Date: null,
      }))
  ).map((nc, idx) => {
    const amt = parseFloat(nc?.SellingPrice?.["@attributes"]?.amt) || parseFloat(perNightPrice);
    const label = nc?.Date || nc?.["@attributes"]?.date || `Night ${idx + 1}`;
    return (
      <div key={idx} className="bg-white rounded-xl shadow p-1 flex flex-col items-center justify-center text-center border border-gray-500/50">
        <div className="text-sm text-gray-600 mb-2">{label}</div>
        <div className="text-lg font-semibold text-gray-800">{amt.toFixed(2)} {currency}</div>
      </div>
    );
  })}
</div>

            </div>
            <div className="flex justify-between items-center pt-5 border-t-4 border-double border-gray-300">
              <span className="text-1xl font-bold text-gray-800">Total Amount</span>
              <span className="text-2xl font-extrabold text-[#D3202D]">
                {totalPrice} {currency}
              </span>
            </div>
          </div>

          {/* <div className="mb-8">
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
          </div> */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-white/0 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5 text-blue-600" />
              <h5 className="text-lg font-semibold text-gray-800">General Messages</h5>
              <span className="ml-auto text-sm text-gray-500">{(generalMessages?.length || 0)} found</span>
            </div>

            {generalMessages && generalMessages.length > 0 ? (
              <div className="space-y-3">
  {generalMessages.map((m, i) => {
    const rawText =
      m?.Text || m?.Message || m?.["@attributes"]?.text || (typeof m === "string" ? m : "");

    return (
      <div
        key={i}
        className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700"
        dangerouslySetInnerHTML={{ __html: rawText || "No message text available" }}
      />
    );
  })}
</div>

            ) : (
              <div className="text-sm text-gray-500">No general messages provided.</div>
            )}
          </div>

          <div className="bg-white/0 p-4 rounded-2xl border border-gray-200">
            <div className="flex items-center gap-3 mb-4">
              <Info className="h-5 w-5 text-yellow-600" />
              <h5 className="text-lg font-semibold text-gray-800">Internal Notes</h5>
              <span className="ml-auto text-sm text-gray-500">{(internalNotes?.length || 0)} found</span>
            </div>

            {internalNotes && internalNotes.length > 0 ? (
              <div className="space-y-3">
                {internalNotes.map((m, i) => {
                  const text = m?.Text || m?.Message || m?.["@attributes"]?.text || (typeof m === "string" ? m : "");
                  return (
                    <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700">
                      {text || "No note text available"}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-gray-500">No internal notes available.</div>
            )}
          </div>
        </div>

          <div className="flex gap-5 mt-10">
            <button onClick={onClose} className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-bold py-5 rounded-2xl transition text-xl shadow-md">
              Cancel
            </button>
            <button onClick={onConfirm} className="flex-1 bg-[#D3202D] hover:bg-[#b88a45] text-white font-bold py-5 rounded-2xl transition text-xl shadow-xl">
              Confirm & Add to Cart
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// === MAIN COMPONENT ===
const AccommodationBookNow = ({ isNonStuba = false, bookingData = {} }) => {
  const { t } = useTranslation("accommodation");
  const { setJustAdded } = useDrawerStore();
  const user = useUserStore((state) => state.user);
  const { checkAvailability } = useAccommodationsStore();

  const rooms = bookingData?.searchParams?.rooms || [];
  const nights = bookingData.nights || 1;

  const initGuestsByRoom = () => {
    return rooms.map((room) => {
      const adultsCount = room.adult || 2;
      const childrenAges = room.children || [];
      return {
        adults: Array.from({ length: adultsCount }, () => ({
          title: "Mr", firstName: "", lastName: "",
        })),
        children: childrenAges.map((age) => ({
          title: age >= 12 ? "Mr" : "Ms",
          firstName: "", lastName: "", age,
        })),
      };
    });
  };

  const [guestsByRoom, setGuestsByRoom] = useState(initGuestsByRoom);
  const [specialRequests, setSpecialRequests] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showCartOptions, setShowCartOptions] = useState(false);
  const [loadingButton, setLoadingButton] = useState(null);
  const [errors, setErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [bookingResponse, setBookingResponse] = useState(null);

  useEffect(() => {
    const initialGuests = initGuestsByRoom();
    const storedData = JSON.parse(sessionStorage.getItem("accommodationBookingData"));
    
    // Pre-fill lead passenger details from auth store if available
    if (user?.name && initialGuests.length > 0 && initialGuests[0].adults.length > 0) {
      const nameParts = user.name.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      const leadGuest = initialGuests[0].adults[0];
      leadGuest.title = "Mr"; // Default title
      leadGuest.firstName = firstName;
      leadGuest.lastName = lastName;
    }

    // If booking data with guest details exists in session, it means it was added to cart.
    if (storedData?.guestDetailsByRoom) {
      setGuestsByRoom(storedData.guestDetailsByRoom);
      setShowCartOptions(true); // Show "Continue Shopping" / "Checkout" buttons
    } else {
    setGuestsByRoom(initialGuests);
    }
  }, [bookingData, user]);

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

  const validateGuestInfo = () => {
    const newErrors = {};
    let isValid = true;
    const nameRegex = /^[a-zA-Z\s'-]{2,}$/;

    // Only the lead guest (Room 1, Adult 1) is mandatory
    const leadGuest = guestsByRoom[0]?.adults[0];

    if (!leadGuest) {
      // This case should not happen if rooms are configured
      return false;
    }

    if (!leadGuest.firstName || !leadGuest.firstName.trim()) {
      newErrors.leadFirstName = "First name is required.";
      isValid = false;
    } else if (!nameRegex.test(leadGuest.firstName)) {
      newErrors.leadFirstName = "Please enter a valid first name (letters only, min 2).";
      isValid = false;
    }

    if (!leadGuest.lastName || !leadGuest.lastName.trim()) {
      newErrors.leadLastName = "Last name is required.";
      isValid = false;
    } else if (!nameRegex.test(leadGuest.lastName)) {
      newErrors.leadLastName = "Please enter a valid last name (letters only, min 2).";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };


  // === STUBA: CALL PRE-BOOKING API ===
  const callPreBookingAPI = async () => {
    const flatAdults = [];
    const flatChildren = [];

    guestsByRoom.forEach((roomGuests) => {
      roomGuests.adults.forEach((a) => {
        flatAdults.push({
          title: a.title,
          f_name: a.firstName,
          l_name: a.lastName,
          nationality: null,
        });
      });
      roomGuests.children.forEach((c) => {
        flatChildren.push({
          title: c.title,
          f_name: c.firstName,
          l_name: c.lastName,
          age: String(c.age),
          nationality: null,
        });
      });
    });

    const payload = {
      region: bookingData.searchParams?.region ?? false,
      hotel_id: bookingData.searchParams?.hotel_id ?? false,
      start_date: bookingData.searchParams?.start_date,
      nights: bookingData.nights,
      rooms: bookingData.searchParams?.rooms ?? [],
      stars: bookingData.searchParams?.stars ?? "0",
      quoteId: bookingData.selectedRoom?.id ?? "",
      visitor_id: $helpers.getVisitorId(),
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

      if (!res.ok) throw new Error("Booking validation failed");
      const data = await res.json();
      // If API responds with a validation status=false, show the server message
      // to the user and return null so the flow can be corrected by the user.
      if (data && data.status === false) {
        const serverMsg = data.msg || "Booking validation failed.";
        // Show server-provided validation message instead of throwing
        alert(serverMsg);
        return null;
      }

      return { apiResponse: data, requestPayload: payload };
    } catch (err) {
      alert("Booking validation failed. Please try again.");
      return null;
    }
  };

  // === HANDLE SUBMIT ===
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoadingButton("addToCart");
    setIsSubmitting(true);

    if (!validateGuestInfo()) {
      setIsSubmitting(false);
      setLoadingButton(null);
      // alert("Please fill in all required guest details correctly.");
      return;
    }

    const availabilityPayload = {
      start_date: bookingData.searchParams.start_date,
      end_date: bookingData.searchParams.end_date,
      rooms: bookingData.searchParams.rooms,
      rate_plan_id: bookingData.selectedRoom.id,
    };

    const availabilityResult = await checkAvailability(availabilityPayload);

    if (!availabilityResult.success) {
      alert(availabilityResult.message || "This room is no longer available.");
      setIsSubmitting(false);
      setLoadingButton(null);
      return;
    }

      addToCartDirectly();setShowCartOptions(true);
    setLoadingButton(null); 
    setIsSubmitting(false); 
  };

  // === DIRECT ADD TO CART (NON-STUBA) ===
  const addToCartDirectly = () => {
    const updatedBookingData = {
      ...bookingData,
      guestDetailsByRoom: guestsByRoom,
      specialRequests,
    };

    const roomsDetailsArray = guestsByRoom.map((roomGuests, idx) => ({
      ...(bookingData.selectedRoom || {}),
      roomTypeId: idx + 1,
      roomType: bookingData.selectedRoom?.name || "",
      Guests: roomGuests,
    }));

    const hotelId = bookingData.hotelData?.id || null;
    updatedBookingData.hotelData = bookingData.hotelData; // FIX: Preserve the original hotelData object

    sessionStorage.setItem("accommodationBookingData", JSON.stringify(updatedBookingData));

    const totalAdults = rooms.reduce((s, r) => s + (r.adult || 0), 0);
    const totalChildren = rooms.reduce((s, r) => s + (r.children?.length || 0), 0);
    const totalRoomsRequested = rooms.length || 1;

    // bookingData.selectedRoom.price is already the total for ALL nights for 1 room
    const priceFor1Room = parseFloat(bookingData.selectedRoom?.price || 0) || 0;
    const totalPrice = (priceFor1Room).toFixed(2);

    const cartItem = {
      productType: "accommodation",
      product_id: hotelId,
      tourId: hotelId,
      productTitle: bookingData.hotelData?.title || "",
      productType: "accommodation",
      adult_count: totalAdults,
      child_count: totalChildren,
      price: priceFor1Room,
      total: Number(totalPrice),
      tour_date: bookingData.checkIn,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      nights,
      roomType: bookingData.selectedRoom?.name || "",
      mealType: bookingData.selectedRoom?.mealPlanCode ||  bookingData.selectedRoom?.mealType || '',
      cancellationPolicy: bookingData.selectedRoom?.cancellationPolicy || null,
      hotel_info: {
        id: hotelId,
        roomsDetails: roomsDetailsArray,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        Guests: guestsByRoom,

      },
      guestDetailsByRoom: guestsByRoom,
      special_request: specialRequests || "",
      meal_plan:0,
      check_in_time:"15:00",
      check_out_time:"11:00",
      bed_type: bookingData.selectedRoom?.rawData?.cat?.id || null,
      room_type: bookingData.selectedRoom?.rawData?.type?.id || null,
      hotel_ref_no:hotelId,
      image: bookingData.hotelData?.images?.[0]?.url || null,
    };

    useCartStore.getState().addAccommodationItem(cartItem);
    setJustAdded(true);
    setShowCartOptions(true);
  };

  // === CONFIRM & ADD (STUBA) ===
  const confirmAndAddToCart = () => {
    // Same logic as addToCartDirectly but with bookingResponse
    const updatedBookingData = {
      ...bookingData,
      guestDetailsByRoom: guestsByRoom,
      specialRequests,
      request_response: bookingResponse?.apiResponse ?? null,
      request: bookingResponse?.requestPayload ? { callPreBookingAPI: bookingResponse.requestPayload } : null,
    };

    const roomsDetailsArray = guestsByRoom.map((roomGuests, idx) => ({
      ...(bookingData.selectedRoom || {}),
      roomTypeId: idx + 1,
      roomType: bookingData.selectedRoom?.name || "",
      Guests: roomGuests,
    }));

    const hotelId = bookingData.hotelData?.id || null;
    updatedBookingData.hotelData = bookingData.hotelData; // FIX: Preserve the original hotelData object

    sessionStorage.setItem("accommodationBookingData", JSON.stringify(updatedBookingData));

    const totalAdults = rooms.reduce((s, r) => s + (r.adult || 0), 0);
    const totalChildren = rooms.reduce((s, r) => s + (r.children?.length || 0), 0);
    const totalRoomsRequested = rooms.length || 1;

    // bookingData.selectedRoom.price is already the total for ALL nights for 1 room
    const priceFor1Room = parseFloat(bookingData.selectedRoom?.price || 0) || 0;
    const totalPrice = (priceFor1Room).toFixed(2);

    const cartItem = {
      product_id: hotelId,
      tourId: hotelId,
      productTitle: bookingData.hotelData?.title || "",
      productType: "accommodation",
      adult_count: totalAdults,
      child_count: totalChildren,
      price: priceFor1Room,
      total: Number(totalPrice),
      tour_date: bookingData.checkIn,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      nights,
      roomType: bookingData.selectedRoom?.name || bookingData.selectedRoom?.roomType || "",
      mealType: bookingData.selectedRoom?.mealType || "",
      quoteId: bookingData.selectedRoom?.id || null,
      cancellationPolicy: bookingData.selectedRoom?.cancellationPolicy || null,
      hotel_info: {
        id: hotelId,
        roomsDetails: roomsDetailsArray,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        request_response: bookingResponse?.apiResponse ?? null,
        guestDetailsByRoom: guestsByRoom,
        request: bookingResponse?.requestPayload ? { callPreBookingAPI: bookingResponse.requestPayload } : null,
      },
      guestDetailsByRoom: guestsByRoom,
      special_request: "Sajid" || "",
      meal_plan:0,
      check_in_time:null,
      check_out_time:null,
      bed_type: bookingData.selectedRoom?.rawData?.cat?.id || null,
      room_type: bookingData.selectedRoom?.rawData?.type?.id || null,
      hotel_ref_no:hotelId,
      image: bookingData.hotelData?.images?.[0]?.url || null,
    };
 console.log("cartItem: accomodation Booking", cartItem);
    useCartStore.getState().addAccommodationItem(cartItem);
    setJustAdded(true);
    setModalOpen(false);
    setShowCartOptions(true);
  };

  const handleContinueShopping = async () => {
    setLoadingButton("continue");
    await new Promise(r => setTimeout(r, 1200));
    window.location.href = "/";
  };

  const handleViewCart = async () => {
    setLoadingButton("checkout");
    await new Promise(r => setTimeout(r, 1200));
    sessionStorage.setItem("fromBooking", "true");
    window.location.href = "/checkout";
  };

  return (
    <>
     <div className="bg-white rounded-lg p-6">
  <h2 className="font-bold text-md lg:text-md text-black mb-6">
    Guest Information
  </h2>

  <form onSubmit={handleAddToCart} className="space-y-5">
    {rooms.map((room, roomIdx) => {
      const roomGuests = guestsByRoom[roomIdx] || { adults: [], children: [] };
      const roomNumber = roomIdx + 1;

      return (
        <div key={roomIdx} className="rounded-lg p-0 md:p-4">
          <h3 className="font-bold text-md lg:text-md text-black mb-5">
            Room {roomNumber} – {room.adult} Adult{room.adult > 1 ? "s" : ""}
            {room.children?.length > 0 &&
              `, ${room.children.length} Child${
                room.children.length > 1 ? "ren" : ""
              }`}
          </h3>

          {/* Adults */}
          {roomGuests.adults.map((adult, i) => (
            <div
              key={`adult-${i}`}
              className="bg-gray-100  p-2 grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              {/* Title */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                   {roomIdx === 0 && i === 0 ? "Title" : ""} {roomIdx === 0 && i === 0 && <span className="text-blue-600 font-semibold">(Lead)</span>} {roomIdx === 0 && i === 0 && <span className="text-red-500">*</span>}
                </label>
                <select
                  value={adult.title}
                  onChange={(e) =>
                    updateGuest(roomIdx, "adults", i, "title", e.target.value)
                  }
                  className="w-full px-3 h-[42px] py-2.5 bg-white border border-gray-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
                  required={roomIdx === 0 && i === 0}
                >
                  {TITLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                 {roomIdx === 0 && i === 0 ? "First Name" : ""} {roomIdx === 0 && i === 0 && <span className="text-blue-600 font-semibold">(Lead)</span>} {roomIdx === 0 && i === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="First Name"
                  value={adult.firstName}
                  onChange={(e) =>
                    updateGuest(
                      roomIdx,
                      "adults",
                      i,
                      "firstName",
                      e.target.value
                    )
                  }
                  className={`w-full px-3 py-2 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D] ${
                    roomIdx === 0 && i === 0 && user?.name
                      ? "bg-gray-300"
                      : "bg-white"
                  }`}
                  readOnly={showCartOptions}
                />
                 {roomIdx === 0 && i === 0 && errors.leadFirstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.leadFirstName}</p>
                )}
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  {roomIdx === 0 && i === 0 ? "Last Name" : ""} {roomIdx === 0 && i === 0 && <span className="text-blue-600 font-semibold">(Lead)</span>} {roomIdx === 0 && i === 0 && <span className="text-red-500">*</span>}
                </label>
                <input
                  type="text"
                  placeholder="Last Name"
                  value={adult.lastName}
                  onChange={(e) =>
                    updateGuest(roomIdx, "adults", i, "lastName", e.target.value)
                  }
                  className={`w-full px-3 py-2 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D] ${
                    roomIdx === 0 && i === 0 && user?.name
                      ? "bg-gray-300"
                      : "bg-white"
                  }`}
                  readOnly={showCartOptions}
                />
                {roomIdx === 0 && i === 0 && errors.leadLastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.leadLastName}</p>
                )}
              </div>
            </div>
          ))}

          {/* Children */}
          {roomGuests.children.map((child, i) => (
            <div
              key={`child-${i}`}
              className="bg-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4"
            >
              {/* Title */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  Title
                </label>
                <select
                  value={child.title}
                  onChange={(e) =>
                    updateGuest(roomIdx, "children", i, "title", e.target.value)
                  }
                  className="w-full px-3 py-2.5 bg-white border border-gray-500 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
                >
                  {TITLE_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* First Name */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  First Name
                </label>
                <input
                  type="text"
                  value={child.firstName}
                  onChange={(e) =>
                    updateGuest(
                      roomIdx,
                      "children",
                      i,
                      "firstName",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
                />
              </div>

              {/* Last Name */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  Last Name
                </label>
                <input
                  type="text"
                  value={child.lastName}
                  onChange={(e) =>
                    updateGuest(
                      roomIdx,
                      "children",
                      i,
                      "lastName",
                      e.target.value
                    )
                  }
                  className="w-full px-3 py-2 bg-white border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
                />
              </div>

              {/* Age */}
              <div>
                <label className="block text-black text-sm font-medium mb-2">
                  Age
                </label>
                <input
                  type="text"
                  value={child.age}
                  readOnly
                  className="w-full px-3 py-2 bg-gray-300 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none cursor-not-allowed"
                />
              </div>
            </div>
          ))}
        </div>
      );
    })}

    {/* Special Requests */}
    <div>
      <label className="block text-black text-sm font-medium mb-2">
        Special Requests (Optional)
      </label>
      <textarea
        value={specialRequests}
        onChange={(e) => setSpecialRequests(e.target.value)}
        rows={4}
        className="w-full px-3 py-2 bg-white border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
        placeholder="Late check-in, extra bed, dietary needs, etc..."
      />
    </div>

{/* BUTTONS (RIGHT ALIGNED) */}
<div className="w-full flex justify-end">
  {!showCartOptions ? (
    <button
      type="submit"
      disabled={isSubmitting}
      className="
        w-full sm:w-auto
        bg-[#D3202D] text-white 
        font-semibold text-base lg:px-10
        py-3 px-6 rounded-lg 
        transition disabled:opacity-50 
        flex items-center justify-center gap-2
      "
    >
      {isSubmitting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          {isNonStuba ? "Adding to Cart..." : "Validating Booking..."}
        </>
      ) : (
        "Add to Cart"
      )}
    </button>
  ) : (
    <div className="flex flex-col sm:flex-row justify-end gap-3">
      <button
        type="button"
        onClick={handleContinueShopping}
        disabled={loadingButton === "continue"}
        className="
          flex-1 sm:flex-none
          bg-gray-100 hover:bg-gray-200 
          text-gray-800 
          font-semibold text-base lg:px-10
          py-3 px-6 rounded-lg 
          transition
        "
      >
        {loadingButton === "continue" ? (
    <LoaderSvg />   
  ) : (
  "Continue Shopping")}
      </button>

      <button
        type="button"
        onClick={handleViewCart}
        disabled={loadingButton === "checkout"}
        className="
          flex-1 sm:flex-none
          bg-[#D3202D] text-white 
          font-semibold text-base lg:px-10
          py-3 px-6 rounded-lg 
          transition
        "
      >
       {loadingButton === "checkout" ? (
    <LoaderSvg />   
  ) : (
    "Proceed to Checkout"
  )}
      </button>
    </div>
  )}
</div>


  </form>
</div>


      {/* MODAL ONLY FOR STUBA */}
      {!isNonStuba && (
        <ConfirmationModal
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onConfirm={confirmAndAddToCart}
          bookingResponse={bookingResponse}
        />
      )}
    </>
  );
};

export default AccommodationBookNow;