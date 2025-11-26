// components/accommodations/RoomTypes.jsx
import { useState, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import {
  Check, X, Utensils, Calendar, Shield, Bed,BathIcon ,Loader2,CameraIcon,Wifi,Tv,
  Star, MapPin, Clock
} from "lucide-react";

// === STUBA VERSION: List of Rooms ===
// === REVISED STUBA VERSION: List of Rooms ===
const StubaRoomList = ({
  allRooms = [],
  currency = "SGD", // Defaulting to SGD based on the image
  onRoomSelect,
  onProceedBooking,
  nights = 1,
  totalRooms = 1,
  totalRoomsRequested = 1,
  selectedRoom = null,
}) => {
  const [internalSelectedRoomKey, setInternalSelectedRoomKey] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});

  useEffect(() => {
    // The logic to initialize from `selectedRoom` prop is difficult if `selectedRoom.id` is not unique.
    // A more robust solution would require a unique identifier for each room option from the parent.
    // For now, we clear selection on room list change to avoid incorrect selections.
    setInternalSelectedRoomKey(null);
  }, [allRooms]);

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
   const roomTypeKey = `${room.roomType || "Standard Room"} | ${room.bedDetails || "Non-specified Bed"}`;
    if (!acc[roomTypeKey]) acc[roomTypeKey] = [];
    acc[roomTypeKey].push(room);
    return acc;
  }, {});
  const getRoomDisplayName = (key) => key.split(' | ')[0];
  const getRoomBedDetails = (key) => key.split(' | ')[1];

  const handleRoomSelect = (room, uniqueKey) => {
    try {
      const result = onRoomSelect ? onRoomSelect(room) : { ok: true };

      const normalized = (result === true || result === undefined)
        ? { ok: true }
        : (typeof result === 'boolean' ? { ok: result } : result);

      if (!normalized.ok) {
        setRoomMessages(prev => ({ ...prev, [uniqueKey]: normalized.message || 'This room is not available on your selected dates' }));
        setTimeout(() => setRoomMessages(prev => { const c = { ...prev }; delete c[uniqueKey]; return c; }), 5000);
        return;
      }

      setInternalSelectedRoomKey(uniqueKey);

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

  const formatedPrice = (price) => {
      const validPrice = parseFloat(price);
      if (isNaN(validPrice)) return "0";

      return Math.round(validPrice).toLocaleString("en-US");
  };

  const getPricePerNightFormatted = (price) => {
      const validPrice = parseFloat(price);
      if (isNaN(validPrice) || validPrice === 0) return "0";

      const perNight = validPrice / (nights || 1);
      return Math.round(perNight).toLocaleString('en-US');
  };

  const getCancellationDisplay = (policy) => {
    const p = (policy || "").toLowerCase();
    if (p.includes("nonrefundable") || p.includes("non-refundable")) {
      return { text: "Non-Refundable", color: "text-red-400", icon: <X className="w-4 h-4" />, desc: "No refund if cancelled", staticDate: "No" };
    }
    if (p.includes("refundable") || p.includes("free")) {
      return { text: "Free Cancellation", color: "text-green-400", icon: <Check className="w-4 h-4" />, desc: "Cancel for free", staticDate: "SGD 0 until Nov 26" }; 
    }
    return { text: policy || "Check Policy", color: "text-yellow-400", icon: <Shield className="w-4 h-4" />, desc: "See terms", staticDate: "Check Policy" };
  };

  const getMealDisplay = (mealType) => {
    const m = (mealType || "").toLowerCase();
    if (m.includes("breakfast")) return { text: "Breakfast included", icon: "Utensils" };
    return { text: "Not included", icon: "Bed" };
  };

  return (
    <div id="room-types-section" className="py-2">
      <div className="">
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

        <div className="space-y-5">
          {Object.entries(groupedRooms).map(([roomTypeKey, rooms]) => (
            <div key={roomTypeKey} className="bg-white rounded-2xl p-0 overflow-hidden">
              
              <div className="p-4 bg-gray-50 flex items-center gap-4 border-b border-gray-200">
                 <div>
                    <h3 className="text-xl font-bold text-black">{totalRoomsRequested} &times; {getRoomDisplayName(roomTypeKey)}</h3>
                    <div className="flex flex-wrap gap-x-4 gap-y-2 mt-2 text-xs text-gray-500">
                      <span><Bed className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.bedDetails || rooms?.[0]?.mealType || getRoomBedDetails(roomTypeKey) || "Bed info"}</span>
                      <span><Shield className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.nonSmoking === false ? "Smoking" : "Non-smoking"}</span>
                      <span><Wifi className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.nonSmoking === false ? "Free Wifi" :  "Wifi"}</span>
                      <span><CameraIcon className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.nonSmoking === false ? "Safe" : "Safe"}</span>
                      <span><Tv className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.nonSmoking === false ? "TV" : "TV"}</span>
                      <span><BathIcon className="w-3 h-3 inline mr-1"/> {rooms?.[0]?.privateBathroom === false ? "Shared Bathroom" : "Private Bathroom"}</span>
                    </div>
                  </div>
              </div>

              {/* Rate Table Header */}
              <div className="hidden lg:grid grid-cols-7 text-xs font-bold uppercase text-gray-500 bg-gray-100 border-b border-gray-200 py-3 px-4">
                  <div className="col-span-2">Room</div>
                  <div>Meals</div>
                  <div>Cancellation</div>
                  <div>NET Price</div>
                  <div>Payment type</div>
                  <div></div>
              </div>

              {/* Rate Items */}
              <div className="space-y-0 divide-y divide-gray-200">
                {rooms.map((room, index) => {
                  const uniqueKey = `${room.id}-${index}`;
                  const isSelected = internalSelectedRoomKey === uniqueKey;
                  const cancellation = getCancellationDisplay(room.cancellationPolicy);
                  const meal = getMealDisplay(room.mealType);
                  const netPriceStatic = `${currency} ${formatedPrice(room.price)}`;
                  const paymentTypeStatic = "By card"; // Sta
                  const surchargeStatic = "No surcharge"; // Sta

                  return (
                    <div
                      key={uniqueKey}
                      
                      className={`grid grid-cols-1 md:grid-cols-7 gap-2 lg:gap-4 items-center p-4 transition-all duration-200 ${
                        isSelected
                          ? "border-l-4 border-[#D3202D]" 
                          : "bg-white hover:bg-gray-50"
                      }`}
                    >
                      <div className="col-span-2 flex flex-col space-y-1">
                          <div className="font-medium text-black">{getRoomDisplayName(roomTypeKey)}</div>
                          <div className="text-xs text-gray-500">{room.roomCat || room.room_cat || ""}</div>
                      </div>
                      <div className="text-sm text-gray-700">
                          {meal.text}
                      </div> 
                      <div className="text-sm text-gray-700 flex flex-col">
                          <div>{cancellation.staticDate}</div>
                      </div>
                      <div className="text-sm text-black font-semibold flex flex-col">
                          <div>{netPriceStatic}</div>
                          <div className="text-[12px] text-gray-500">{surchargeStatic}</div>
                      </div>
                      <div className="flex flex-col items-center justify-between gap-2 md:gap-4 md:flex-row">
                          <div className="text-xs text-green-700 font-medium whitespace-nowrap">
                              {paymentTypeStatic} 
                          </div>             
                      </div>
                      <div className="flex justify-end"> 
                          <button
                            onClick={() => handleRoomSelect(room, uniqueKey)}
                            className={`px-6 py-2 rounded-lg font-bold text-sm transition-all w-full md:w-auto flex items-center justify-center whitespace-nowrap ${
                              isSelected
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-[#D3202D] text-white"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-5 h-5 inline-block mr-1" />
                                Selected
                              </>
                            ) : (
                              "Choose"
                            )}
                          </button>
                          </div>
                      {roomMessages[uniqueKey] && (
                        <div className="md:col-span-6 text-red-400 text-sm mt-2 text-center w-full">
                          {roomMessages[uniqueKey]}
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
console.log("romm",roomsToDisplay)
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