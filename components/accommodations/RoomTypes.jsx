// components/accommodations/RoomTypes.jsx
import { useState, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import {
  Check, X, Shield, Bed, BathIcon, CameraIcon, Wifi, Tv
} from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import { formatPrice } from "@/utils/priceUtils";
import { useMediaQuery } from "@/hooks/use-media-query";

// === STUBA VERSION: List of Rooms (FINAL WORKING VERSION) ===
const StubaRoomList = ({
  allRooms = [],
  currency = "SGD",
  onRoomSelect,
  onProceedBooking,
  nights = 1,
  totalRoomsRequested = 1,
  selectedRoom = null,
  amenities
}) => {
  const [internalSelectedRoomKey, setInternalSelectedRoomKey] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});
  const isMediumOrUp = useMediaQuery("(min-width: 768px)");

  useEffect(() => {
    setInternalSelectedRoomKey(null);
  }, [allRooms]);

  if (!allRooms || allRooms.length === 0) {
    return (
      <div className="px-4 sm:px-6 lg:px-12 py-8">
        <h2 className="text-lg font-semibold text-black mb-6">Available Rooms</h2>
        <div className="text-gray-400 text-center py-12 bg-gray-800 rounded-xl border border-gray-700">
          <div className="text-lg mb-2">No rooms available</div>
          <div className="text-sm">Try different dates or check back later</div>
        </div>
      </div>
    );
  }

  const handleRoomSelect = (ratePlan, uniqueKey) => {
    const result = onRoomSelect ? onRoomSelect(ratePlan) : { ok: true };
    const normalized = (result === true || result === undefined)
      ? { ok: true }
      : (typeof result === 'boolean' ? { ok: result } : result);

    if (!normalized.ok) {
      try {
        if (typeof onProceedBooking === 'function') {
          onProceedBooking(ratePlan);
        }
      } catch (err) {
        console.error('onProceedBooking threw:', err);
      }
      return;
    }
    setInternalSelectedRoomKey(uniqueKey);
  };

  const getCancellationDisplay = (policy) => {
    const p = (policy || "").toString().toLowerCase();
    if (p.includes("nonrefundable") || p.includes("non-refundable")) {
      return { text: "Non-Refundable", color: "text-red-400", icon: <X className="lg:w-5 lg:h-5 h-3 w-3" />, staticDate: "Non-Refundable" };
    }
    if (p.includes("refundable") || p.includes("free")) {
      return { text: "Free Cancellation", color: "text-green-400", icon: <Check className="lg:w-5 lg:h-5 h-3 w-3" />, staticDate: "Free Cancellation" };
    }
    return { text: policy || "See terms", color: "text-yellow-400", icon: <Shield className="lg:w-5 lg:h-5 h-3 w-3" />, staticDate: policy || "See terms" };
  };

  const getMealDisplay = (mealType) => {
    const m = (mealType || "").toString().toLowerCase();
    if (m.includes("breakfast")) return "Breakfast included";
    if (m.includes("half board") || m.includes("hb")) return "Half Board";
    if (m.includes("full board") || m.includes("fb")) return "Full Board";
    return "Room Only";
  };

  return (
    <div id="room-types-section" className="py-2">
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4">
          <div>
            <h2 className="text-lg font-semibold text-[#233BA0] mb-1">Available Rooms</h2>
            <p className="text-black">
              {allRooms.length} room option{allRooms.length !== 1 ? "s" : ""} for your stay
            </p>
          </div>
        </div>

        <div className="space-y-5">
          {allRooms.map((roomType) => (
            <div key={roomType.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
              {/* Room Header */}
              <div className="bg-white lg:border-b border-gray-200 p-4">
                <div className="flex gap-4">
                  <div className="flex-shrink-0 w-32 h-24">
                    {roomType.images?.[0] && (
                      <img
                        src={getFullImageUrl(roomType.images[0])}
                        alt="Room thumbnail"
                        className="w-full h-full object-cover rounded-lg"
                      />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-black">
                      {totalRoomsRequested} × {roomType.name}
                      <span className="bg-gray-100 text-black px-2 py-1 text-sm rounded-full ml-2">
                        {nights} night{nights > 1 ? "s" : ""}
                      </span>
                    </h3>
                    {roomType.view && (
                      <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 mt-2 inline-block">
                        {typeof roomType.view === 'string' ? roomType.view.replace('_', ' ') : roomType.view}
                      </span>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <div className="mt-4">
                  <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-2">
                    {amenities?.map((amenity) => (
                      <div
                        key={amenity.id || amenity.name}
                        title={amenity.name}
                        className="flex-shrink-0 bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
                      >
                        {amenity.icon ? (
                          <img
                            src={getFullImageUrl((amenity.icon || "").replace(/\\/g, "/"))}
                            alt={amenity.name}
                            className="w-4 h-4 object-contain"
                          />
                        ) : (
                          <span className="w-4 h-4 rounded bg-gray-300/40" />
                        )}
                        <span className="truncate">{amenity.name}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-5 text-xs uppercase text-black font-bold bg-[#dcdcdc] border-y border-gray-200">
                <div className="py-3 px-4 border-r border-gray-500">Rate Plan</div>
                <div className="py-3 px-4 border-r border-gray-500">Meals</div>
                <div className="py-3 px-4 border-r border-gray-500">Cancellation</div>
                <div className="py-3 px-4 border-r border-gray-500">NET Price</div>
                <div className="py-3 px-4"> </div>
              </div>

              {roomType.ratePlans.length > 0 ? (
                isMediumOrUp ? (
                  /* Desktop View */
                  <div className="divide-y divide-gray-200">
                    {roomType.ratePlans.map((ratePlan, index) => {
                      const uniqueKey = `${ratePlan.id}-${index}`;
                      const isSelected = internalSelectedRoomKey === uniqueKey;
                      const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                      const mealText = getMealDisplay(ratePlan.mealType || ratePlan.meal?.title);

                      // Use pre-calculated values from parent
                      const totalPayable = Number(ratePlan.price || 0);
                      const totalOriginal = Number(ratePlan.originalPrice || totalPayable);
                      const hasDiscount = ratePlan.hasDiscount === true;

                      const finalPayable = totalPayable * totalRoomsRequested;
                      const finalOriginal = totalOriginal * totalRoomsRequested;
                      const savings = finalOriginal - finalPayable;

                      const displayPayable = `${currency} ${formatPrice(finalPayable)}`;
                      const displayOriginal = hasDiscount ? `${currency} ${formatPrice(finalOriginal)}` : null;

                      return (
                        <div
                          key={uniqueKey}
                          className={`grid grid-cols-5 items-center transition-all ${
                            isSelected ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"
                          }`}
                        >
                          <div className="p-4 border-r border-gray-200">
                            <div className="font-medium text-black">{ratePlan.name || ratePlan.mealType}</div>
                            <div className="text-sm text-gray-600 capitalize">{ratePlan.smokingType || "Non-Smoking"}</div>
                          </div>
                          <div className="p-4 border-r border-gray-200 text-sm text-gray-800">{mealText}</div>
                          <div className="p-4 border-r border-gray-200 text-sm text-gray-800">{cancellation.staticDate}</div>
                          <div className="p-4 border-r border-gray-200 text-right">
                            <div className="flex items-center justify-end gap-2 flex-wrap">
                              {hasDiscount && (
                                <span className="text-sm text-gray-500 line-through">
                                  {displayOriginal}
                                </span>
                              )}
                              <span className={`text-xl font-bold ${hasDiscount ? "text-black-600" : "text-black"}`}>
                                {displayPayable}
                              </span>
                            </div>
                            {/* {hasDiscount && savings > 0 && (
                              <div className="text-sm text-green-600 font-medium mt-1">
                                Save {currency} {formatPrice(savings)}
                              </div>
                            )} */}
                          </div>
                          <div className="p-4 text-right">
                            <button
                              onClick={() => handleRoomSelect(ratePlan, uniqueKey)}
                              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all ${
                                isSelected
                                  ? "bg-red-500 text-white shadow-md"
                                  : "bg-[#D3202D] text-white hover:bg-red-700"
                              }`}
                            >
                              {isSelected ? (
                                <>Selected</>
                              ) : (
                                "Choose"
                              )}
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  /* Mobile View */
                  <div className="flex overflow-x-auto space-x-4 p-4 no-scrollbar">
                    {roomType.ratePlans.map((ratePlan, index) => {
                      const uniqueKey = `${ratePlan.id}-${index}`;
                      const isSelected = internalSelectedRoomKey === uniqueKey;
                      const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                      const mealText = getMealDisplay(ratePlan.mealType || ratePlan.meal?.title);

                      const totalPayable = Number(ratePlan.price || 0);
                      const totalOriginal = Number(ratePlan.originalPrice || totalPayable);
                      const hasDiscount = ratePlan.hasDiscount === true;

                      const finalPayable = totalPayable * totalRoomsRequested;
                      const finalOriginal = totalOriginal * totalRoomsRequested;
                      const savings = finalOriginal - finalPayable;

                      const displayPayable = `${currency} ${formatPrice(finalPayable)}`;
                      const displayOriginal = hasDiscount ? `${currency} ${formatPrice(finalOriginal)}` : null;

                      return (
                        <div
                          key={uniqueKey}
                          className={`flex-shrink-0 w-[280px] border rounded-xl transition-all ${
                            isSelected ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
                          }`}
                        >
                          <div className="p-4 flex flex-col h-full">
                            <div className="flex-grow space-y-3">
                              <div className="pb-3 border-b border-gray-200">
                                <div className="font-medium text-black">{ratePlan.name || ratePlan.mealType}</div>
                              </div>
                              <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                                <span className="font-medium text-gray-800">Meal</span>
                                <span>{mealText}</span>
                              </div>
                              <div className="flex justify-between text-sm pb-3 border-b border-gray-200">
                                <span className="font-medium text-gray-800">Cancellation</span>
                                <span>{cancellation.staticDate}</span>
                              </div>
                              <div className="pt-2">
                                <div className="text-right">
                                  <div className="flex items-center justify-end gap-2 flex-wrap">
                                    {hasDiscount && (
                                      <span className="text-sm text-gray-500 line-through">
                                        {displayOriginal}
                                      </span>
                                    )}
                                    <span className={`text-2xl font-bold ${hasDiscount ? "text-black-600" : "text-black"}`}>
                                      {displayPayable}
                                    </span>
                                  </div>
                                  {/* {hasDiscount && savings > 0 && (
                                    <div className="text-sm text-green-600 font-medium mt-1">
                                      Save {currency} {formatPrice(savings)}
                                    </div>
                                  )} */}
                                </div>
                              </div>
                            </div>
                            <div className="pt-4 mt-auto">
                              <button
                                onClick={() => handleRoomSelect(ratePlan, uniqueKey)}
                                className={`w-full px-6 py-3 rounded-lg font-bold text-sm transition-all ${
                                  isSelected
                                    ? "bg-red-500 text-white shadow-md"
                                    : "bg-[#D3202D] text-white hover:bg-red-700"
                                }`}
                              >
                                {isSelected ? (
                                  <>Selected</>
                                ) : (
                                  "Choose"
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="p-8 text-center text-gray-500">No rate plans available for this room type.</div>
              )}
            </div>
          ))}
        </div>
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
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
  selectedRoom,
  amenities,
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

    if (!room.isHotelAvailable) return false;

    for (const date of stayDates) {
      const entry = allotments.find(a => String(a.date) === String(date));
      if (!entry || entry.available === false) {
        return { ok: false, message: `Room unavailable on ${date}.` };
      }
      const availQty = Number(entry.value ?? entry.available_qty ?? 0);
      if (availQty < totalRoomsRequested) {
        return { ok: false, message: `Only ${availQty} room(s) available on ${date}.` };
      }
    }

    if (!room.canAccommodate) {
      return { ok: false, message: room.paxMessage || "This room is too small for your group." };
    }

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
      totalRoomsRequested={totalRoomsRequested}
      selectedRoom={selectedRoom}
      amenities={amenities}
    />
  );
};

export default RoomTypes;