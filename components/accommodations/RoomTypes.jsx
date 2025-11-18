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
    setInternalSelectedRoom(room.id);
    onRoomSelect?.(room);
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

const NonStubaRoomList = ({
  allRooms = [],
  currency = "SGD",
  onRoomSelect,
  nights = 1,
  selectedRoom = null,
}) => {
  const [internalSelected, setInternalSelected] = useState(null);

  useEffect(() => {
    setInternalSelected(selectedRoom?.id || null);
  }, [selectedRoom]);

  const handleSelect = (room) => {
    setInternalSelected(room.id);
    onRoomSelect(room);
  };

  const formatPrice = (price) => Number(price).toLocaleString("en-US", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
console.log("################",allRooms);
  // SHOW ALL ROOMS — NO FILTERING
  if (!allRooms || allRooms.length === 0) {
    return (
      <div className="text-center py-16 text-gray-400">
        <p className="text-xl">No rooms available</p>
      </div>
    );
  }

  return (
    <div id="room-types-section" className="px-4 sm:px-6 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Available Rooms</h2>
            <p className="text-gray-400">
              {allRooms.length} room option{allRooms.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-400 bg-gray-800 px-4 py-2 rounded-full">
            <Calendar className="w-4 h-4" />
            <span>{nights} night{nights > 1 ? "s" : ""}</span>
          </div>
        </div>

        <div className="space-y-6">
          {allRooms.map((room) => {
            const isSelected = internalSelected === room.id;

            return (
              <div
                key={room.id}
                className={`bg-gray-800 rounded-2xl p-6 border-2 transition-all duration-200 ${
                  isSelected
                    ? "border-[#CC9A55] bg-[#CC9A55]/5 shadow-xl"
                    : "border-gray-700 hover:border-gray-600"
                }`}
              >
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="space-y-3">
                    <h3 className="text-xl font-bold text-white">{room.roomType}</h3>
                    <p className="text-sm text-gray-400">{room.mealType}</p>
                    <div className="flex items-center gap-2 text-red-400 text-sm">
                      <X className="w-4 h-4" />
                      <span>Non-Refundable</span>
                    </div>
                  </div>

                  <div className="flex flex-col justify-center text-center lg:text-left">
                    <div className="text-3xl font-bold text-[#CC9A55]">
                      {currency} {formatPrice(room.price)}
                    </div>
                    <div className="text-sm text-gray-400 mt-1">
                      Total for {nights} night{nights > 1 ? "s" : ""}
                    </div>
                  </div>

                  <div className="flex items-center justify-center lg:justify-end">
                    <button
                      onClick={() => handleSelect(room)}
                      className={`px-8 py-3 rounded-xl font-bold text-lg transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-[#CC9A55] hover:bg-[#b88a45]"
                      } text-white`}
                    >
                      {isSelected ? (
                        <>✓ Selected</>
                      ) : (
                        "Select Room"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// MAIN COMPONENT – now super simple
const RoomTypes = ({
  isNonStuba,
  allRooms = [],              // ← Stuba uses this
  normalizedRoomData = [],     // ← Non-Stuba uses this
  currency = "SGD",
  nights = 1,
  onRoomSelect,
  selectedRoom,
}) => {
  // Decide which array to show
  const roomsToDisplay = isNonStuba ? normalizedRoomData : allRooms;

  // If no rooms at all
  if (!roomsToDisplay || roomsToDisplay.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-16 text-center">
        <p className="text-xl text-gray-400">No rooms available for selected dates</p>
      </div>
    );
  }

  // Re-use StubaRoomList style for both (clean & consistent)
  return <StubaRoomList 
    allRooms={roomsToDisplay}
    currency={currency}
    nights={nights}
    onRoomSelect={onRoomSelect}
    selectedRoom={selectedRoom}
  />;
};

export default RoomTypes;