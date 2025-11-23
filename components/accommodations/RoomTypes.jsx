// components/accommodations/RoomTypes.jsx
import { useState, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import {
  Check, X, Utensils, Calendar, Shield, Bed, Loader2,
  Star, MapPin, Clock
} from "lucide-react";

// === STUBA VERSION: List of Rooms ===
const StubaRoomList = ({
  allRooms = [],
  currency = "USD",
  onRoomSelect,
  onProceedBooking,
  nights = 1,
  totalRooms = 1,
  totalRoomsRequested = 1,
  selectedRoom = null,
}) => {
  const [internalSelectedRoom, setInternalSelectedRoom] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});

  useEffect(() => {
    setInternalSelectedRoom(selectedRoom?.id || null);
  }, [selectedRoom?.id]);

  if (!allRooms.length) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-black mb-6">Available Rooms</h2>
        <div className="text-gray-400 text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-lg mb-2">No rooms available</div>
          <div className="text-sm">Try different dates or check back later</div>
        </div>
      </div>
    );
  }

  const groupedRooms = allRooms.reduce((acc, room) => {
    const roomType = room.roomType || "Standard Room";
    if (!acc[roomType]) acc[roomType] = [];
    acc[roomType].push(room);
    return acc;
  }, {});

  const handleRoomSelect = (room) => {
    try {
      const result = onRoomSelect ? onRoomSelect(room) : { ok: true };

      // Accept multiple return forms for compatibility
      const normalized = (result === true || result === undefined)
        ? { ok: true }
        : (typeof result === 'boolean' ? { ok: result } : result);

      if (!normalized.ok) {
        // show inline message under this room's button
        setRoomMessages(prev => ({ ...prev, [room.id]: normalized.message || 'This room is not available on your selected dates' }));
        // clear message after 5s
        setTimeout(() => setRoomMessages(prev => { const c = { ...prev }; delete c[room.id]; return c; }), 5000);
        return;
      }

      setInternalSelectedRoom(room.id);

      // If parent provided a proceed handler (info card), call it to continue to booking
      try {
        if (typeof onProceedBooking === 'function') {
          onProceedBooking(room);
        }
      } catch (err) {
        console.error('onProceedBooking threw:', err);
      }
    } catch (e) {
      console.error('onRoomSelect handler threw:', e);
    }
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatedPrice = (price) => {
      const validPrice = parseFloat(price);
      if (isNaN(validPrice)) return "0";

      return Math.round(validPrice).toLocaleString("en-US");
  };

  const getPricePerNight = (price) => (price / nights).toFixed(2);

  const getPricePerNightFormatted = (price) => {
      const validPrice = parseFloat(price);
      if (isNaN(validPrice) || validPrice === 0) return "0";

      const perNight = validPrice / (nights || 1);
      return Math.round(perNight).toLocaleString('en-US');
  };

  const getCancellationDisplay = (policy) => {
    const p = (policy || "").toLowerCase();
    if (p.includes("nonrefundable") || p.includes("non-refundable")) {
      return { text: "Non-Refundable", color: "text-red-400", icon: <X className="w-4 h-4" />, desc: "No refund if cancelled" };
    }
    if (p.includes("refundable") || p.includes("free")) {
      return { text: "Free Cancellation", color: "text-green-400", icon: <Check className="w-4 h-4" />, desc: "Cancel for free" };
    }
    return { text: policy || "Check Policy", color: "text-yellow-400", icon: <Shield className="w-4 h-4" />, desc: "See terms" };
  };

  const getMealDisplay = (mealType) => {
    const m = (mealType || "").toLowerCase();
    // if (m.includes("breakfast")) return { text: "Breakfast", icon: "Egg Fried" };
    // if (m.includes("all inclusive")) return { text: "All Inclusive", icon: "Utensils" };
    // if (m.includes("half board")) return { text: "Half Board", icon: "Utensils" };
    // if (m.includes("full board")) return { text: "Full Board", icon: "Utensils" };
    return { text: mealType || "Room Only", icon: "Bed" };
  };

  return (
    <div id="room-types-section" className="px-4 sm:px-6 lg:px-12 py-2">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-[#233BA0] mb-1">Available Rooms</h2>
            <p className="text-black ">
              {allRooms.length} room option{allRooms.length !== 1 ? "s" : ""} for your stay
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-white bg-gray-800 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            <span>{nights} night{nights > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedRooms).map(([roomType, rooms]) => (
            <div key={roomType} className="bg-white rounded-2xl p-3 border border-gray-700 hover:border-gray-600 transition-all">
              <div className="mb-6">
                <h3 className="text-md md:text-lg font-bold text-black flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#D3202D]" />
                 {totalRoomsRequested} x {roomType}
                </h3>
                {/* <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Flexible check-in</div>
                  <div className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Meal options available</div>
                </div> */}
              </div>

              <div className="space-y-5">
                {rooms.map((room) => {
                  const isSelected = internalSelectedRoom === room.id;
                  const cancellation = getCancellationDisplay(room.cancellationPolicy);
                  const meal = getMealDisplay(room.mealType);

                  return (
                    <div
                      key={room.id}
                      className={`bg-white backdrop-blur-sm p-3 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#D3202D] bg-[#D3202D]/5 shadow-lg shadow-[#D3202D]/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            {/* <div className="text-2xl">{meal.icon}</div> */}
                            <div>
                              <div className="font-medium text-black">{meal.text} Bed</div>
                              {/* <div className="text-xs text-gray-400">Meal Plan</div> */}
                            </div>
                          </div>
                          {/* <div className="flex items-center gap-3">
                            <div className={cancellation.color}>{cancellation.icon}</div>
                            <div>
                              <div className={`font-medium ${cancellation.color}`}>{cancellation.text}</div>
                              <div className="text-xs text-gray-400">{cancellation.desc}</div>
                            </div>
                          </div> */}
                        </div>

                       <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-center lg:text-left w-full">
  <div className="text-md md:text-lg font-bold text-[#D3202D]">
    {currency} {formatedPrice(room.price)}
  </div>
  {nights > 1 && (
    <div className="text-xs text-gray-500 sm:ml-2">
      ({currency} {getPricePerNightFormatted(room.price)} per night)
    </div>
  )}
</div>

                        <div className="flex flex-col items-center lg:items-end">
  <button
    onClick={() => handleRoomSelect(room)}
    className={`px-4 py-2 rounded-xl font-bold text-sm transition-all w-full md:w-auto ${
      isSelected
        ? "bg-[#D3202D]  text-white"
        : "bg-[#D0E9FF]  text-black"
    }`}
  >
    {isSelected ? (
      <>
        <Check className="w-5 h-5 inline-block mr-2" />
        Selected
      </>
    ) : (
      "Select Room"
    )}
  </button>
  {roomMessages[room.id] && (
    <div className="text-red-400 text-sm mt-2 text-center w-full">
      {roomMessages[room.id]}
    </div>
  )}
</div>
</div>

                      {(room.roomCode || room.mealCode) && (
                        <div className="mt-4 pt-4 border-t border-gray-700 flex flex-wrap gap-4 text-xs text-gray-500">
                          {room.roomCode && <span>Room Code: {room.roomCode}</span>}
                          {room.mealCode && <span>Meal Code: {room.mealCode}</span>}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


// MAIN COMPONENT – now super simple
const RoomTypes = ({
  isNonStuba,
  allRooms = [],
  normalizedRoomData = [],
  allotments = [],
  currency = "SGD",
  nights = 1,
  onRoomSelect,
  onProceedBooking,
  roomsSearched,
  selectedRoom,
}) => {
  const roomsToDisplay = isNonStuba ? normalizedRoomData : allRooms;

  const { searchParams } = useAccommodationsStore();

  const totalGuests = useMemo(() => {
    if (!searchParams?.rooms) return 1;
    return searchParams.rooms.reduce((sum, r) => 
      sum + (Number(r.adult) || 0) + (r.children?.length || 0), 0) || 1;
  }, [searchParams?.rooms]);

  const totalRoomsRequested = (searchParams?.rooms || []).length || 1;

  // Normalize the `rooms` prop passed from parent into a simple count
  const roomsCount = typeof totalRoomsRequested === 'number' ? Number(totalRoomsRequested) : (Array.isArray(totalRoomsRequested) ? totalRoomsRequested.length : (Number(totalRoomsRequested) || 1));
  const stayDates = useMemo(() => {
    const from = searchParams?.start_date;
    const to = searchParams?.end_date;
    if (!from || !to) return [];
    const dates = [];
    let cur = new Date(from);
    const end = new Date(to);
    while (cur < end) {
      dates.push(cur.toISOString().split('T')[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [searchParams?.start_date, searchParams?.end_date]);

  const validateAndSelect = (room) => {
    if (!isNonStuba) {
      onRoomSelect?.(room);
      return true;
    }

    // 1. Date availability check (pre-check flag on room)
    if (!room.isHotelAvailable) {
      //alert("This hotel is sold out for one or more nights in your stay.");
      return false;
    }

    // 2. Detailed allotment check per date
    for (const date of stayDates) {
      const entry = allotments.find(a => String(a.date) === String(date));
      if (!entry) {
        return { ok: false, message: `No availability info for ${date}. Please change dates.` };
      }
      if (entry.available === false) {
        return { ok: false, message: `Room unavailable on ${date}.` };
      }
      const availQty = Number(entry.value ?? entry.available_qty ?? 0);
      if (availQty < totalRoomsRequested) {
        return { ok: false, message: `Not enough rooms available on ${date}. Only ${availQty} left for that date.` };
      }
    }

    // 3. Pax check
    if (!room.canAccommodate) {
      return { ok: false, message: room.paxMessage || `This room is too small for ${totalGuests} guests.` };
    }

    // All checks passed — call parent's handler and signal allowed
    onRoomSelect?.(room);
    return { ok: true };
  };

  if (!roomsToDisplay || roomsToDisplay.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-16 text-center">
        <p className="text-xl text-gray-400">No rooms available for selected dates</p>
      </div>
    );
  }

  return (
    <StubaRoomList
      allRooms={roomsToDisplay}
      currency={currency}
      nights={nights}
      onRoomSelect={validateAndSelect}
      onProceedBooking={onProceedBooking}
      totalRooms={roomsCount}
      totalRoomsRequested={totalRoomsRequested}
      selectedRoom={selectedRoom}
    />
  );
};

export default RoomTypes;