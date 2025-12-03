// components/accommodations/RoomTypes.jsx
import { useState, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import {
  Check, X,BedDouble,Building2,Calendar, Shield, Bed,BathIcon ,Loader2,CameraIcon,Wifi,Tv,
  Star, MapPin, Clock
} from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import { formatPrice } from "@/utils/priceUtils";
import { useMediaQuery } from "@/hooks/use-media-query";


// === STUBA VERSION: List of Rooms ===
// === REVISED STUBA VERSION: List of Rooms ===
const StubaRoomList = ({
  allRooms = [],
  currency = "SGD",
  onRoomSelect,
  onProceedBooking,
  nights = 1,
  totalRoomsRequested = 1,
  selectedRoom = null,
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
      //setRoomMessages(prev => ({ ...prev, [uniqueKey]: normalized.message || 'This room is not available on your selected dates' }));
      //setTimeout(() => setRoomMessages(prev => { const c = { ...prev }; delete c[uniqueKey]; return c; }), 5000);
      //setInternalSelectedRoomKey(uniqueKey);

      try {
        if (typeof onProceedBooking === 'function') {
          onProceedBooking(ratePlan);
        }
      } catch (err) {
        console.error('onProceedBooking threw:', err);
      }
      return;
    }
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
      return { text: "Non-Refundable", color: "text-red-400", icon: <X className="lg:w-5 lg:h-5 h-3 w-3" />, desc: "No refund if cancelled", staticDate: "Non-Refundable" };
    }
    if (p.includes("refundable") || p.includes("free")) {
      return { text: "Free Cancellation", color: "text-green-400", icon: <Check className="lg:w-5 lg:h-5 h-3 w-3" />, desc: "Cancel for free", staticDate: "Free Cancellation" }; 
    }
    // Default to showing the policy name directly from the API
    return { text: policy, color: "text-yellow-400", icon: <Shield className="lg:w-5 lg:h-5 h-3 w-3" />, desc: "See terms", staticDate: policy };
  };

  const getMealDisplay = (mealType) => {
    const m = (mealType || "").toLowerCase();
    if (m.includes("breakfast")) return "Breakfast included";
    // Check for meal plan codes as well
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
            <p className="text-black ">
              {allRooms.length} room option{allRooms.length !== 1 ? "s" : ""} for your stay
            </p>
          </div>
         
        </div>

        <div className="space-y-5">
          {allRooms.map((roomType) => ( // Iterate over room types
            <div key={roomType.id} className="bg-white rounded-2xl p-0 overflow-hidden border border-gray-200">
              
              <div className="bg-white relative  lg:border-b border-gray-200 p-0">
                <div className="flex gap-4 ">
                    <div className="flex-shrink-0 w-32 h-24">
                        {roomType.images?.[0] && <img src={getFullImageUrl(roomType.images[0])} alt="Room thumbnail" className="w-full h-full object-cover" />}
                    </div>
                    <div>
                        <h3 className="font-bold text-md lg:text-md line-clamp-1 text-black pt-3">{totalRoomsRequested} &times; {roomType.name} <span className="bg-gray-100 text-black p-1 font-semi-bold text-sm rounded-full ml-2">{nights} night{nights > 1 ? "s" : ""}</span></h3> 
                     {roomType.view && <span className="text-sm font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                           {typeof roomType.view === 'string' ? roomType.view.replace('_', ' ') : roomType.view}
                        </span>}
                    </div>
                </div>
            
                <div className="md:relative mt-4">
                    <div className="flex md:absolute bottom-0 left-[145px] items-center gap-2 overflow-x-auto no-scrollbar pb-2 ">
                         <span className=" text-xs bg-gray-100 text-gray-800 font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-rap">
                            <Bed className="w-4 h-4 md:w-6 md:h-6 text-gray-900"/> {roomType.name}
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                            <Wifi className="w-4 h-4 md:w-6 md:h-6 text-gray-900"/> Wifi
                        </span>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                            <CameraIcon className="w-4 h-4 md:w-6 md:h-6 text-gray-900"/> Safe
                        </span>
                         <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                            <Tv className="w-4 h-4 md:w-6 md:h-6 text-gray-900"/> TV
                        </span>
                         <span className="bg-gray-100 text-gray-800 text-xs font-medium me-2 px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap">
                            <BathIcon className="w-4 h-4 md:w-6 md:h-6 text-gray-900"/> Private Bathroom
                        </span>
                    </div>
                    <div className="absolute top-0 right-0 bottom-2 w-16 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden"></div>
                </div>
                <style jsx>{`
                    .no-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .no-scrollbar {
                        -ms-overflow-style: none;
                        scrollbar-width: none;
                    }
                `}</style>
              </div>

              {/* Rate Table Header */}
              <div className="hidden lg:grid grid-cols-5 text-xs uppercase text-black font-bold bg-[#dcdcdc] border-y border-gray-200">
                  <div className="col-span-1 py-3 px-4 border-r border-gray-500">Rate Plan</div>
                  <div className="py-3 px-4 border-r border-gray-500">Meals</div>
                  <div className="py-3 px-4 border-r border-gray-500">Cancellation</div>
                  <div className="py-3 px-4 border-r border-gray-500">NET Price</div>
                  <div className="col-span-1 py-3 px-4 border-r border-gray-500"> </div>
              </div> 

              {roomType.ratePlans.length > 0 ? ( // Check if there are rate plans for this room type
                isMediumOrUp ? (
                <div className="divide-y divide-gray-200">
                  {roomType.ratePlans.map((ratePlan, index) => {
                    const uniqueKey = `${ratePlan.id}-${index}`;
                    const isSelected = internalSelectedRoomKey === uniqueKey;
                    const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                    const mealText = getMealDisplay(ratePlan.mealType);
                    const netPriceStatic = `${currency} ${formatPrice(ratePlan.price)}`;
                    const surchargeStatic = ""; // Sta

                    return (
                      <div
                        key={uniqueKey}
                        className={`grid grid-cols-5 items-center transition-all duration-200 ${
                          isSelected ? "bg-red-50 border-l-4 border-red-500" : "bg-white hover:bg-gray-50"
                        }`}
                      >
                        <div className="flex flex-col space-y-1 p-4 border-r border-gray-200">
                            <div className="font-medium text-black">{ratePlan.mealType}</div> {/* Display rate plan name/description */}
                            <div className="text-sm text-gray-600 capitalize">{ratePlan.smokingType || "Non-Smoking"}</div>
                        </div>
                        <div className="text-sm text-gray-800 p-4 border-r border-gray-200">
                            {mealText}
                        </div> 
                        <div className="text-sm text-gray-800 flex flex-col p-4 border-r border-gray-200">
                            <div>{cancellation.staticDate}</div>
                        </div>
                        <div className="text-sm text-black font-semibold text-end flex flex-col p-4 border-r border-gray-200">
                            <div>{netPriceStatic}</div>
                            <div className="text-[12px] text-gray-600">{surchargeStatic}</div>
                        </div>
                        <div className="flex justify-end p-4"> 
                            <button // Changed room to ratePlan
                              onClick={() => handleRoomSelect(ratePlan, uniqueKey)}
                              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all w-full md:w-auto flex items-center justify-center whitespace-nowrap ${
                                isSelected ? "bg-red-500 text-white shadow-md" : "bg-[#D3202D] text-white"
                              }`}
                            >
                              {isSelected ? ( <><Check className="w-5 h-5 inline-block mr-1" /> Selected</> ) : ( "Choose" )}
                            </button>
                        </div>
                        {roomMessages[uniqueKey] && ( <div className="col-span-5 text-red-400 text-sm mt-2 text-center w-full px-4 pb-2">{roomMessages[uniqueKey]}</div> )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex overflow-x-auto space-x-4 p-4 no-scrollbar">
                  {roomType.ratePlans.map((ratePlan, index) => {
                    const uniqueKey = `${ratePlan.id}-${index}`;
                    const isSelected = internalSelectedRoomKey === uniqueKey;
                    const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                    const mealText = getMealDisplay(ratePlan.mealType);
                    const netPriceStatic = `${currency} ${formatPrice(ratePlan.price)}`;
                    const surchargeStatic = "No surcharge";
                    return(
                      <div key={uniqueKey} className={`flex-shrink-0 w-[280px] border rounded-xl transition-all ${isSelected ? "bg-red-50 border-red-300" : "bg-white border-gray-200"}`}>
                        <div className="p-4 flex flex-col h-full">
                          <div className="flex-grow space-y-3">
                            <div className="pb-3 border-b border-gray-200">
                              <div className="font-medium text-black">{ratePlan.mealType}</div> {/* Display rate plan name here */}
                            </div>

                            <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-200">
                              <span className="font-medium text-gray-800">Meal</span>
                              <span className="text-right">{mealText}</span>
                            </div>
            
                            <div className="flex justify-between items-center text-sm pb-3 border-b border-gray-200">
                              <span className="font-medium text-gray-800">Cancellation</span>
                              <span className="text-right">{cancellation.staticDate}</span>
                            </div>
            
                            <div className="flex justify-between items-baseline pt-2">
                                <span className="font-medium text-gray-800">Price</span>
                                <div className="text-right"><div className="text-xl text-black font-bold">{netPriceStatic}</div><div className="text-xs text-gray-500">{surchargeStatic}</div></div>
                            </div>
                            {roomMessages[uniqueKey] && ( <div className="text-red-400 text-sm text-center w-full pt-2">{roomMessages[uniqueKey]}</div> )}
                          </div>
            
                          <div className="pt-4 mt-auto">
                              <button
                                  onClick={() => handleRoomSelect(ratePlan, uniqueKey)}
                                  className={`px-6 py-3 rounded-lg font-bold text-sm transition-all w-full flex items-center justify-center whitespace-nowrap ${
                                      isSelected ? "bg-red-500 text-white shadow-md" : "bg-[#D3202D] text-white"
                                  }`}
                              >
                                  {isSelected ? ( <><Check className="w-5 h-5 inline-block mr-1" /> Selected</> ) : ( "Choose" )}
                              </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )
              ) : (
                <div className="p-4 text-gray-500 text-center">No rate plans available for this room type.</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};


const RoomTypes = ({
  isNonStuba,
  allRooms = [], // This will now be an array of room types, each with ratePlans
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

  const validateAndSelect = (room) => { // This 'room' is actually a ratePlan
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
      currency={currency} // Pass currency
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