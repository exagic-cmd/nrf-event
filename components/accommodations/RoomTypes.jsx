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
    if (m.includes("breakfast")) return { text: "Breakfast", icon: "Egg Fried" };
    if (m.includes("all inclusive")) return { text: "All Inclusive", icon: "Utensils" };
    if (m.includes("half board")) return { text: "Half Board", icon: "Utensils" };
    if (m.includes("full board")) return { text: "Full Board", icon: "Utensils" };
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

const NonStubaRoomSelector = ({
  room_categories = [],
  room_types = [],
  productId,
  currency = "USD",
  onRoomSelect,
  nights = 1,
  selectedRoom = null,
  allotments = [],
}) => {
  const [selectedCat, setSelectedCat] = useState("");
  const [selectedType, setSelectedType] = useState("");
  const [priceData, setPriceData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const { fetchNonStubaPricing, searchParams } = useAccommodationsStore();

  const fromDate = searchParams?.start_date;
  const toDate = searchParams?.end_date;

  // TOTAL GUESTS – BULLETPROOF CALCULATION (this was the real bug!)
  const totalGuests = useMemo(() => {
    if (!searchParams?.rooms || !Array.isArray(searchParams.rooms) || searchParams.rooms.length === 0) {
      return 1; // fallback: assume at least 1 adult
    }

    const sum = searchParams.rooms.reduce((acc, room) => {
      const adults = Number(room.adult) || 0;
      const children = Array.isArray(room.children) ? room.children.length : 0;
      return acc + adults + children;
    }, 0);

    return sum > 0 ? sum : 1; // never return 0
  }, [searchParams?.rooms]);

  // Stay dates
  const stayDates = useMemo(() => {
    if (!fromDate || !toDate) return [];
    const dates = [];
    let cur = new Date(fromDate);
    const end = new Date(toDate);
    while (cur < end) {
      dates.push(cur.toISOString().split("T")[0]);
      cur.setDate(cur.getDate() + 1);
    }
    return dates;
  }, [fromDate, toDate]);

  // Allotment check: available ≥ total guests
  const hasSufficientAllotment = useMemo(() => {
    if (!allotments?.length || !stayDates.length) return false;
    return stayDates.every(date => {
      const entry = allotments.find(a => a.date === date);
      return entry && entry.value >= totalGuests;
    });
  }, [allotments, stayDates, totalGuests]);

  // Max pax check
  const selectedRoomType = room_types.find(t => t.id === Number(selectedType));
  console.log("Selected Room Type for max pax check:", selectedRoomType);
  const supportsMaxPax = selectedRoomType ? totalGuests <= selectedRoomType.max_pax : false;
  // Final availability
  const canSelectRoom = priceData && hasSufficientAllotment && supportsMaxPax;
  const currentRoomId = selectedCat && selectedType ? `nonstuba-${selectedCat}-${selectedType}` : null;
  const isCurrentlySelected = selectedRoom?.id === currentRoomId;

  // Reset on hotel change
  useEffect(() => {
    setSelectedCat("");
    setSelectedType("");
    setPriceData(null);
    setError("");
    onRoomSelect(null);
  }, [productId, onRoomSelect]);

  // Fetch pricing
  useEffect(() => {
    if (!selectedCat || !selectedType || !productId) {
      setPriceData(null);
      setError("");
      return;
    }

    const fetchPrice = async () => {
      setLoading(true);
      setError("");
      try {
        const data = await fetchNonStubaPricing(productId, fromDate, toDate, Number(selectedCat), Number(selectedType));

        let pricing = null;
        if (data?.tiered_pricing?.[0]) pricing = data.tiered_pricing[0];
        else if (data?.adult_price || data?.adult_promo_price) pricing = data;

        if (pricing) setPriceData(pricing);
        else setError("No pricing available");
      } catch (err) {
        setError("Failed to load price");
      } finally {
        setLoading(false);
      }
    };

    fetchPrice();
  }, [selectedCat, selectedType, productId, fromDate, toDate, fetchNonStubaPricing]);

  const handleSelect = () => {
    if (!canSelectRoom || !priceData) return;

    const cat = room_categories.find(c => c.id === Number(selectedCat));
    const type = room_types.find(t => t.id === Number(selectedType));
    if (!cat || !type) return;

    const basePrice = priceData.adult_promo_price && parseFloat(priceData.adult_promo_price) > 0
      ? parseFloat(priceData.adult_promo_price)
      : parseFloat(priceData.adult_price || 0);

    if (basePrice <= 0) return;

    const room = {
      id: currentRoomId,
      roomType: `${cat.name} - ${type.name}`,
      mealType: cat.name.toLowerCase().includes("breakfast") ? "Breakfast Included" : "Room Only",
      price: basePrice * nights,
      cancellationPolicy: "NonRefundable",
      roomCode: `CAT${selectedCat}`,
      mealCode: cat.name.includes("Breakfast") ? "BB" : "RO",
      maxPax: type.max_pax,
      requiredGuests: totalGuests,
      available: hasSufficientAllotment,
      rawData: { priceData, cat, type },
    };

    onRoomSelect(room);
  };

  const getDisplayPrice = () => {
    if (!priceData) return 0;
    const base = priceData.adult_promo_price && parseFloat(priceData.adult_promo_price) > 0
      ? parseFloat(priceData.adult_promo_price)
      : parseFloat(priceData.adult_price || 0);
    return base * nights;
  };

  const formatPrice = (p) => `${currency} ${Number(p).toLocaleString(undefined, { minimumFractionDigits: 2 })}`;

  return (
    <div className="px-4 sm:px-6 lg:px-12 py-8">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-white mb-1">Select Room</h2>
          <p className="text-gray-400">Choose your room category and type</p>
        </div>

        <div className="bg-gray-800 rounded-2xl p-6 border border-gray-700">
          {/* Dropdowns */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Category</label>
              <select
                value={selectedCat}
                onChange={(e) => {
                  setSelectedCat(e.target.value);
                  setSelectedType("");
                  setPriceData(null);
                  setError("");
                  onRoomSelect(null);
                }}
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-[#CC9A55] focus:outline-none"
              >
                <option value="">Select Category</option>
                {room_categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Room Type</label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(e.target.value);
                  setPriceData(null);
                  setError("");
                  onRoomSelect(null);
                }}
                disabled={!selectedCat}
                className="w-full p-3 rounded-lg bg-gray-900 text-white border border-gray-700 focus:border-[#CC9A55] focus:outline-none disabled:opacity-50"
              >
                <option value="">Select Type</option>
                {room_types.map(type => (
                  <option key={type.id} value={type.id}>
                    {type.name} (Max {type.max_pax} guest{type.max_pax !== 1 ? "s" : ""})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-[#CC9A55] mx-auto" />
              <p className="text-gray-400 mt-4">Checking availability for {totalGuests} guest{totalGuests > 1 ? "s" : ""}...</p>
            </div>
          )}

          {/* Error */}
          {error && !loading && (
            <div className="text-red-400 text-center py-6 bg-red-900/20 rounded-xl border border-red-500/30">
              {error}
            </div>
          )}

          {/* Result Card */}
          {priceData && !loading && (
            <div className={`p-8 rounded-2xl border-2 transition-all ${
              canSelectRoom
                ? "bg-gradient-to-r from-[#CC9A55]/10 to-transparent border-[#CC9A55]/40 shadow-xl"
                : "bg-red-900/30 border-red-500/50"
            }`}>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
                <div>
                  <div className="text-xl font-bold text-white">
                    {room_categories.find(c => c.id === Number(selectedCat))?.name}
                  </div>
                  <div className="text-lg text-gray-300 mt-1">
                    {selectedRoomType?.name}
                  </div>
                  <div className="text-sm text-gray-400 mt-3 space-y-1">
                    <div>• Booking for: <strong>{totalGuests} guest{totalGuests > 1 ? "s" : ""}</strong></div>
                    <div>• Room capacity: <strong>{selectedRoomType?.max_pax} guest{selectedRoomType?.max_pax > 1 ? "s" : ""}</strong></div>
                  </div>
                </div>

                <div className="text-center">
                  <div className="text-4xl font-extrabold text-[#CC9A55]">
                    {formatPrice(getDisplayPrice())}
                  </div>
                  <div className="text-sm text-gray-400 mt-2">
                    Total for {nights} night{nights > 1 ? "s" : ""}
                  </div>
                </div>

                <div className="flex flex-col items-center md:items-end gap-4">
                  <button
                    onClick={handleSelect}
                    disabled={!canSelectRoom || isCurrentlySelected}
                    className={`px-10 py-4 rounded-xl font-bold text-lg min-w-[200px] transition-all flex items-center justify-center gap-3 ${
                      isCurrentlySelected
                        ? "bg-green-600 text-white"
                        : canSelectRoom
                        ? "bg-[#CC9A55] hover:bg-[#b88a45] text-white shadow-lg"
                        : "bg-gray-700 text-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {isCurrentlySelected ? "Selected" : canSelectRoom ? "Select Room" : "Unavailable"}
                  </button>

                  {!hasSufficientAllotment && (
                    <div className="text-red-400 text-sm">Not enough rooms available</div>
                  )}
                  {!supportsMaxPax && (
                    <div className="text-orange-400 text-sm">
                      Room too small for {totalGuests} guest{totalGuests > 1 ? "s" : ""}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// === MAIN COMPONENT: SWITCHES BASED ON isNonStuba ===
const RoomTypes = (props) => {
  const { isNonStuba } = props;

  if (isNonStuba) {
    return <NonStubaRoomSelector {...props} />;
  }

  return <StubaRoomList {...props} />;
};

export default RoomTypes;