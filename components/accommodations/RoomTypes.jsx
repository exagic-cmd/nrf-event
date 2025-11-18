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
  nights = 1,
  selectedRoom = null,
}) => {
  const [internalSelectedRoom, setInternalSelectedRoom] = useState(null);

  useEffect(() => {
    setInternalSelectedRoom(selectedRoom?.id || null);
  }, [selectedRoom?.id]);

  if (!allRooms.length) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <h2 className="text-2xl font-bold text-white mb-6">Available Rooms</h2>
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
    // Call external handler first. It should return true to confirm selection is allowed.
    try {
      const allowed = onRoomSelect ? onRoomSelect(room) : true;
      // If the handler returns false explicitly, do not mark as selected.
      if (allowed === false) return;
    } catch (e) {
      // If handler throws, avoid selecting and re-throw
      console.error('onRoomSelect handler threw:', e);
      return;
    }

    setInternalSelectedRoom(room.id);
  };

  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const getPricePerNight = (price) => (price / nights).toFixed(2);

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
    <div id="room-types-section" className="px-4 sm:px-6 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Available Rooms</h2>
            <p className="text-gray-400">
              {allRooms.length} room option{allRooms.length !== 1 ? "s" : ""} for your stay
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            <span>{nights} night{nights > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="space-y-8">
          {Object.entries(groupedRooms).map(([roomType, rooms]) => (
            <div key={roomType} className="bg-gray-800 rounded-2xl p-6 border border-gray-700 hover:border-gray-600 transition-all">
              <div className="mb-6">
                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                  <Bed className="w-5 h-5 text-[#CC9A55]" />
                  {roomType}
                </h3>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-2"><Calendar className="w-4 h-4" /> Flexible check-in</div>
                  <div className="flex items-center gap-2"><Utensils className="w-4 h-4" /> Meal options available</div>
                </div>
              </div>

              <div className="space-y-5">
                {rooms.map((room) => {
                  const isSelected = internalSelectedRoom === room.id;
                  const cancellation = getCancellationDisplay(room.cancellationPolicy);
                  const meal = getMealDisplay(room.mealType);

                  return (
                    <div
                      key={room.id}
                      className={`bg-gray-900/50 backdrop-blur-sm p-6 rounded-xl border-2 transition-all duration-200 ${
                        isSelected
                          ? "border-[#CC9A55] bg-[#CC9A55]/5 shadow-lg shadow-[#CC9A55]/10"
                          : "border-gray-700 hover:border-gray-600"
                      }`}
                    >
                      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        <div className="space-y-4">
                          <div className="flex items-center gap-3">
                            <div className="text-2xl">{meal.icon}</div>
                            <div>
                              <div className="font-medium text-white">{meal.text}</div>
                              <div className="text-xs text-gray-400">Meal Plan</div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className={cancellation.color}>{cancellation.icon}</div>
                            <div>
                              <div className={`font-medium ${cancellation.color}`}>{cancellation.text}</div>
                              <div className="text-xs text-gray-400">{cancellation.desc}</div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col justify-center text-center lg:text-left">
                          <div className="text-3xl font-bold text-[#CC9A55]">
                            {currency} {formatPrice(room.price)}
                          </div>
                          <div className="text-sm text-gray-400 mt-1">
                            Total for {nights} night{nights > 1 ? "s" : ""}
                          </div>
                          {nights > 1 && (
                            <div className="text-xs text-gray-500 mt-1">
                              {currency} {getPricePerNight(room.price)} per night
                            </div>
                          )}
                        </div>

                        <div className="flex items-center justify-center lg:justify-end">
                          <button
                            onClick={() => handleRoomSelect(room)}
                            className={`px-8 py-3 rounded-xl font-bold text-lg transition-all min-w-[160px] flex items-center justify-center gap-2 ${
                              isSelected
                                ? "bg-green-600 hover:bg-green-700 text-white"
                                : "bg-[#CC9A55] hover:bg-[#b88a45] text-white"
                            }`}
                          >
                            {isSelected ? (
                              <>
                                <Check className="w-5 h-5" />
                                Selected
                              </>
                            ) : (
                              "Select Room"
                            )}
                          </button>
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
      alert("This hotel is sold out for one or more nights in your stay.");
      return false;
    }

    // 2. Detailed allotment check per date
    for (const date of stayDates) {
      const entry = allotments.find(a => String(a.date) === String(date));
      if (!entry) {
        alert(`No availability info for ${date}. Please change dates.`);
        return false;
      }
      if (entry.available === false) {
        alert(`Room unavailable on ${date}.`);
        return false;
      }
      const availQty = Number(entry.value ?? entry.available_qty ?? 0);
      if (availQty < totalRoomsRequested) {
        alert(`Not enough rooms available on ${date}. Only ${availQty} left for that date.`);
        return false;
      }
    }

    // 3. Pax check
    if (!room.canAccommodate) {
      alert(room.paxMessage || `This room is too small for ${totalGuests} guests.`);
      return false;
    }

    // All checks passed — call parent's handler and signal allowed
    onRoomSelect?.(room);
    return true;
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
      selectedRoom={selectedRoom}
    />
  );
};

export default RoomTypes;