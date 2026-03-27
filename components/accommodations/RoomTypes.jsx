// components/accommodations/RoomTypes.jsx
import { useState, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore"; // Import Info icon
import {
  Check, X, Shield, Bed, BathIcon, CameraIcon, Wifi, Tv, Info, Square,
  BadgeInfo, UtensilsCrossed, Ban
} from "lucide-react";
import helpers from "@/lib/helpers";

// Modal shown after ratehawk/prebooking API call (link_type_id === 10)
const PrebookingConfirmModal = ({ open, onClose, onProceed, data, loading }) => {
  if (!open) return null;

  const rate = data?.rates?.[0];
  const paymentType = rate?.payment_options?.payment_types?.[0];
  const freeBefore = paymentType?.cancellation_penalties?.free_cancellation_before;
  const freeCancelDate = freeBefore
    ? new Date(freeBefore).toLocaleDateString("en-US", { month: "numeric", day: "numeric", year: "numeric" })
    : null;
  const amenities = rate?.amenities_data || [];
  const rg = rate?.rg_ext || {};

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div className="flex items-center gap-2">
            <Check size={20} className="text-[#233BA0]" />
            <h2 className="text-lg font-bold text-gray-900">Confirm Your Booking</h2>
          </div>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors">
            <X size={20} />
          </button>
        </div>

        {loading ? (
          <div className="p-10 flex items-center justify-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#233BA0]" />
          </div>
        ) : rate ? (
          <div className="p-5 space-y-5">
            {/* Room name + meal badge */}
            <div className="flex items-center justify-between bg-blue-50 rounded-xl px-4 py-3 border border-blue-100">
              <div className="flex items-center gap-2">
                <Bed size={18} className="text-[#233BA0]" />
                <span className="font-semibold text-gray-900">{rate.room_name}</span>
              </div>
              <span className="text-xs bg-gray-800 text-white px-2 py-1 rounded-full">{rate.meal || "nomeal"}</span>
            </div>

            {/* Daily Prices */}
            {rate.daily_prices?.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Daily Prices</p>
                <div className="flex flex-wrap gap-2">
                  {rate.daily_prices.map((p, i) => (
                    <span key={i} className="text-sm bg-gray-100 text-gray-800 px-3 py-1 rounded-full font-medium">
                      Day {i + 1}: {parseFloat(p).toFixed(2)} {paymentType?.currency_code || "USD"}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Total / Payment Type / Availability */}
            <div className="grid grid-cols-3 gap-3">
              <div className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Total Price</p>
                <p className="text-base font-bold text-[#233BA0]">
                  {paymentType?.show_currency_code || paymentType?.currency_code || "USD"}{" "}
                  {parseFloat(paymentType?.show_amount || paymentType?.amount || 0).toFixed(2)}
                </p>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Payment Type</p>
                <p className="text-base font-bold text-gray-900 capitalize">{paymentType?.type || "—"}</p>
              </div>
              <div className="border border-gray-200 rounded-xl p-3 text-center">
                <p className="text-xs text-gray-500 mb-1">Availability</p>
                <p className="text-base font-bold text-gray-900">{rate.allotment ?? "—"} room(s) left</p>
              </div>
            </div>

            {/* Cancellation Policy */}
            {freeCancelDate && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Cancellation Policy</p>
                <span className="inline-flex items-center gap-2 bg-green-600 text-white text-sm font-medium px-3 py-1.5 rounded-full">
                  <Check size={14} />
                  Free cancellation before {freeCancelDate}
                </span>
              </div>
            )}

            {/* Room Features */}
            {amenities.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-gray-700 mb-2">Room Features</p>
                <div className="flex flex-wrap gap-2">
                  {amenities.map((a, i) => (
                    <span key={i} className="text-xs border border-gray-300 text-gray-700 px-2.5 py-1 rounded-full">
                      {a.replace(/-/g, " ")}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Room meta icons */}
            <div className="flex items-center gap-4 text-sm text-gray-600 border-t border-gray-100 pt-3 flex-wrap">
              {rg.capacity > 0 && (
                <span className="flex items-center gap-1">
                  <BathIcon size={14} className="text-gray-400" />
                  Capacity: {rg.capacity}
                </span>
              )}
              {rg.class > 0 && (
                <span className="flex items-center gap-1">
                  <span className="text-yellow-400">★</span>
                  Class {rg.class}
                </span>
              )}
              {rg.bathroom === 1 && (
                <span className="flex items-center gap-1">
                  <BathIcon size={14} className="text-gray-400" />
                  Bathroom
                </span>
              )}
              {rg.bedding === 1 && (
                <span className="flex items-center gap-1">
                  <Bed size={14} className="text-gray-400" />
                  Bed Included
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="p-10 text-center text-gray-500">No prebooking data available.</div>
        )}

        {/* Footer buttons */}
        <div className="flex gap-3 px-5 pb-5 justify-end">
          <button
            onClick={onClose}
            className="flex items-center gap-1.5 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors"
          >
            <X size={16} />
            Cancel
          </button>
          <button
            onClick={onProceed}
            disabled={loading || !rate}
            className="flex items-center gap-1.5 px-6 py-2.5 rounded-lg bg-[#D3202D] text-white font-semibold text-sm hover:bg-[#B81E29] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Check size={16} />
            Proceed Booking
          </button>
        </div>
      </div>
    </div>
  );
};

// Modal to show per-room breakdown
const RoomsBreakdownModal = ({ open, onClose, ratePlan }) => {
  if (!open || !ratePlan) return null;

  const rooms = ratePlan.rawPricing?.Rooms || [];
  const totalPrice = ratePlan.rawPricing?.TotalPrice;
  const currency = ratePlan.pricing?.currency || "";

  const getCancellationStyle = (status) => {
    const s = (status || "").toLowerCase();
    if (s.includes("nonrefundable") || s.includes("non-refundable"))
      return { label: "Non-Refundable", cls: "bg-red-100 text-red-700" };
    if (s.includes("refundable") || s.includes("free"))
      return { label: "Free Cancellation", cls: "bg-green-100 text-green-700" };
    return { label: status || "See terms", cls: "bg-yellow-100 text-yellow-700" };
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      style={{ background: "rgba(0,0,0,0.5)" }}
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-200 sticky top-0 bg-white rounded-t-2xl">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{ratePlan.name}</h2>
            <p className="text-sm text-gray-500 mt-0.5">{rooms.length} room{rooms.length !== 1 ? "s" : ""} included</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-100 text-gray-500 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Rooms list */}
        <div className="p-5 space-y-4">
          {rooms.map((room, idx) => {
            const cancellation = getCancellationStyle(room.CancellationPolicyStatus);
            const roomName = room.RoomType?.["@attributes"]?.text || "Room";
            const mealName = room.MealType?.["@attributes"]?.text || "Room Only";
            const price = parseFloat(room.Price?.["@attributes"]?.amt || 0);

            return (
              <div key={idx} className="border border-gray-200 rounded-xl overflow-hidden">
                {/* Room title bar */}
                <div className="flex items-center gap-2 bg-[#D3202D] px-4 py-2.5">
                  <Bed size={16} className="text-white flex-shrink-0" />
                  <span className="text-white font-semibold text-sm">Room {idx + 1} — {roomName}</span>
                </div>

                {/* Room details */}
                <div className="p-4 space-y-3">
                  {/* Meal */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <UtensilsCrossed size={14} className="text-gray-400" />
                      <span>Meal Plan</span>
                    </div>
                    <span className="text-sm font-medium text-gray-800">{mealName}</span>
                  </div>

                  {/* Cancellation */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-gray-600 text-sm">
                      <Ban size={14} className="text-gray-400" />
                      <span>Cancellation</span>
                    </div>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${cancellation.cls}`}>
                      {cancellation.label}
                    </span>
                  </div>

                  {/* Price */}
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <span className="text-sm text-gray-600">Room Price</span>
                    <span className="text-base font-bold text-gray-900">
                      {currency} {price.toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer — total */}
        <div className="px-5 pb-5">
          <div className="bg-gray-50 rounded-xl p-4 flex items-center justify-between border border-gray-200">
            <span className="text-sm font-semibold text-gray-700">Total Price</span>
            <span className="text-xl font-bold text-[#233BA0]">
              {currency} {parseFloat(totalPrice || 0).toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
import { getFullImageUrl } from "@/utils/imageService";
import { formatPrice } from "@/utils/priceUtils";
import LoaderSvg from "@/components/common/LoaderSvg";
import { useMediaQuery } from "@/hooks/use-media-query";
import AmenitiesCarousel from "@/components/accommodations/AmenitiesCarousel";

// === STUBA VERSION: List of Rooms (FINAL WORKING VERSION) ===
const StubaRoomList = ({
  allRooms = [],
  currency = "",
  onRoomSelect,
  onProceedBooking,
  nights = 1,
  totalRoomsRequested = 1,
  selectedRoom = null,
  link_type_id = null,
}) => {
  const [internalSelectedRoomKey, setInternalSelectedRoomKey] = useState(null);
  const [loadingKey, setLoadingKey] = useState(null);
  const [roomMessages, setRoomMessages] = useState({});
  const [breakdownModal, setBreakdownModal] = useState({ open: false, ratePlan: null });
  const [prebookingModal, setPrebookingModal] = useState({ open: false, data: null, ratePlan: null, loading: false });
  const [expandedRooms, setExpandedRooms] = useState(new Set());
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

  const handleRoomSelect = async (ratePlan, uniqueKey) => {
    // RateHawk (link_type_id === 10): call prebooking API first, show confirmation modal
    if (link_type_id === 10) {
      const bookHash = ratePlan.book_hash || ratePlan.id;
      setLoadingKey(uniqueKey);
      setPrebookingModal({ open: false, data: null, ratePlan, loading: true });
      try {
        const res = await fetch(helpers.getApiAbsoluteURL("ratehawk/prebooking"), {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ hash: bookHash }),
        });
        const responseData = await res.json();
        const prebookItem = responseData?.data?.[0];
        setPrebookingModal({ open: true, data: prebookItem, ratePlan, loading: false });
      } catch (err) {
        console.error("Prebooking API error:", err);
        setPrebookingModal({ open: false, data: null, ratePlan: null, loading: false });
      } finally {
        setLoadingKey(null);
      }
      return;
    }

    setLoadingKey(uniqueKey);
    setTimeout(() => {
      const result = onRoomSelect ? onRoomSelect(ratePlan) : { ok: true };
      const normalized = (result === true || result === undefined)
        ? { ok: true }
        : (typeof result === 'boolean' ? { ok: result } : result);

      if (normalized.ok) {
        // Validation passed - proceed with selection and booking
        try {
          setInternalSelectedRoomKey(uniqueKey);
          if (typeof onProceedBooking === 'function') {
            onProceedBooking(ratePlan);
          }
          setLoadingKey(null);
        } catch (err) {
          console.error('onProceedBooking threw:', err);
          setLoadingKey(null);
        }
      } else {
        // Validation failed - show error message
        setRoomMessages({
          ...roomMessages,
          [uniqueKey]: normalized.message || "Unable to select this room"
        });
        setLoadingKey(null);
      }
    }, 200);
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

  const getPrice = (rp) => Number(rp?.pricing?.total_promo || rp?.pricing?.total || Infinity);

  const isFreeCancellation = (rp) => {
    const p = (rp.cancellationPolicy || "").toString().toLowerCase();
    if (p.includes("nonrefundable") || p.includes("non-refundable") || p.includes("non_refundable")) return false;
    return p.includes("refundable") || p.includes("free");
  };

  const getSortedRatePlans = (ratePlans) => {
    if (!ratePlans || ratePlans.length === 0) return ratePlans;
    const free = ratePlans.filter(isFreeCancellation).sort((a, b) => getPrice(a) - getPrice(b));
    const rest = ratePlans.filter(rp => !isFreeCancellation(rp)).sort((a, b) => getPrice(a) - getPrice(b));
    return [...free, ...rest];
  };

  const toggleExpandedRoom = (roomId) => {
    setExpandedRooms(prev => {
      const next = new Set(prev);
      if (next.has(roomId)) next.delete(roomId);
      else next.add(roomId);
      return next;
    });
  };

  return (
    <div id="room-types-section" className="py-2">
      <div className="">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 gap-4">
          <div>
            <h2 className="text-xl font-bold text-[#233BA0]">Available Rooms</h2>
            {/* <p className="text-black">
              {allRooms.length} room option{allRooms.length !== 1 ? "s" : ""} for your stay
            </p> */}
          </div>
        </div>

        <div className="space-y-5">
          {allRooms.map((roomType) => {
            const isExpanded = expandedRooms.has(roomType.id);
            const sortedRatePlans = link_type_id === 9 ? getSortedRatePlans(roomType.ratePlans) : roomType.ratePlans;
            const visibleRatePlans = (link_type_id === 9 && !isExpanded && sortedRatePlans.length > 1)
              ? [sortedRatePlans[0]]
              : sortedRatePlans;
            const hiddenCount = sortedRatePlans.length - visibleRatePlans.length;

            return (
            <div key={roomType.id} className="bg-white rounded-2xl overflow-hidden border border-gray-200">
              {/* Room Header */}
              <div className="bg-white lg:border-b border-gray-200 p-4">
                <div className="flex gap-4 mb-2">
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
                    {roomType.view && roomType.view !== "no_view" && (
                      <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 mt-2 inline-block">
                        {typeof roomType.view === 'string' ? roomType.view.replace('_', ' ') : roomType.view}
                      </span>
                    )}
                    {roomType.size && (
                      <span className="text-sm font-medium px-2.5 py-1 rounded-lg bg-gray-100 text-gray-800 mt-2 inline-block ml-2">

                        Size: {roomType.size} m²
                      </span>
                    )}
                  </div>
                </div>

                {/* Amenities */}
                <AmenitiesCarousel items={roomType.amenities || []} />
              </div>

              {/* Desktop Table Header */}
              <div className="hidden lg:grid grid-cols-5 text-xs uppercase text-black font-bold bg-[#dcdcdc] border-y border-gray-200">
                <div className="py-3 px-4 border-r border-gray-500">Room</div>
                <div className="py-3 px-4 border-r border-gray-500">Meals</div>
                <div className="py-3 px-4 border-r border-gray-500">Cancellation</div>
                <div className="py-3 px-4 border-r border-gray-500">NET Price</div>
                <div className="py-3 px-4"> </div>
              </div>

              {roomType.ratePlans.length > 0 ? (
                isMediumOrUp ? (
                  /* Desktop View */
                  <div className="divide-y divide-gray-200">
                    {visibleRatePlans.map((ratePlan, index) => {
                      const uniqueKey = `${ratePlan.id}-${index}`;
                      const isSelected = internalSelectedRoomKey === uniqueKey;
                      const isLoading = loadingKey === uniqueKey;
                      const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                      const mealText = getMealDisplay(ratePlan.mealType || ratePlan.meal?.title);

                      // Use pre-calculated values from parent
                      // ratePlan.price is already the TOTAL for ALL nights for 1 room (from normalizeAccommodationData)
                      // We only need to multiply by totalRoomsRequested
                      const totalPriceFor1Room = Number(ratePlan.price || 0);
                      const originalPriceFor1Room = Number(ratePlan.originalPrice || totalPriceFor1Room);
                      const hasDiscount = ratePlan.hasDiscount === true;
                      const finalPayable = Number(ratePlan?.pricing?.total_promo || ratePlan?.pricing?.total);
                      const finalOriginal = Number(ratePlan?.pricing?.total);
                      const savings = finalOriginal - finalPayable;

                      const displayPayable = `${ratePlan?.pricing?.currency} ${formatPrice(finalPayable)}`;
                      const displayOriginal = hasDiscount ? `${ratePlan?.pricing?.currency} ${formatPrice(finalOriginal)}` : null;

                      return (
                        <div
                          key={uniqueKey}
                          className={`grid grid-cols-5 items-center transition-all ${isSelected ? "bg-red-50 border-l-4 border-red-500" : "hover:bg-gray-50"
                            }`}
                        >
                          <div className="p-4 border-r border-gray-200">
                            <div className="font-medium text-black">{ratePlan.name || ratePlan.mealType}</div>
                            <div className="text-sm text-gray-600 capitalize">{ratePlan.smokingType || "Non-Smoking"}</div>
                          </div>
                          <div className="p-4 border-r border-gray-200 text-sm text-gray-800">
                            {mealText}
                          </div>
                          <div className="p-4 border-r justify-between border-gray-200 text-sm text-gray-800 relative group flex items-center gap-1">
                            <span className="cursor-pointer">
                              {cancellation.staticDate}
                            </span>
                            <Info size={14} className="text-gray-400 cursor-pointer" />
                            {ratePlan.rawPricing?.cancellation_policy?.description && (
                              <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                {ratePlan.rawPricing.cancellation_policy.description}
                                <div className="absolute top-full left-1/2 -translate-x-1/2 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                              </div>
                            )}
                          </div>
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
                              {link_type_id === 9 && (
                                <BadgeInfo
                                  size={14}
                                  className="text-gray-400 cursor-pointer hover:text-[#233BA0] transition-colors"
                                  onClick={() => setBreakdownModal({ open: true, ratePlan })}
                                />
                              )}
                            </div>

                            {/* {hasDiscount && savings > 0 && (
                              <div className="text-sm text-green-600 font-medium mt-1">
                                Save {currency} {formatPrice(savings)}
                              </div>
                            )} */}
                          </div>
                          <div className="p-4 text-right justify-items-end">
                            <button
                              onClick={() => handleRoomSelect(ratePlan, uniqueKey)}
                              disabled={isLoading}
                              className={`px-6 py-2 rounded-lg font-bold text-sm transition-all flex items-center justify-center min-w-[110px] h-[40px] ${isSelected
                                ? "bg-red-500 text-white shadow-md"
                                : "bg-[#D3202D] text-white hover:bg-red-700"
                                } disabled:bg-gray-400 disabled:cursor-wait`}
                            >
                              {isLoading ? (
                                <LoaderSvg className="h-5 w-5" />
                              ) : isSelected ? (
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
                    {visibleRatePlans.map((ratePlan, index) => {
                      const uniqueKey = `${ratePlan.id}-${index}`;
                      const isSelected = internalSelectedRoomKey === uniqueKey;
                      const isLoading = loadingKey === uniqueKey;
                      const cancellation = getCancellationDisplay(ratePlan.cancellationPolicy);
                      const mealText = getMealDisplay(ratePlan.mealType || ratePlan.meal?.title);

                      // ratePlan.price is already the TOTAL for ALL nights for 1 room (from normalizeAccommodationData)
                      // We only need to multiply by totalRoomsRequested
                      const totalPriceFor1Room = Number(ratePlan.price || 0);
                      const originalPriceFor1Room = Number(ratePlan.originalPrice || totalPriceFor1Room);
                      const hasDiscount = ratePlan.hasDiscount === true;
                      const finalPayable = Number(ratePlan?.pricing?.total_promo || ratePlan?.pricing?.total);
                      const finalOriginal = Number(ratePlan?.pricing?.total);

                      const savings = finalOriginal - finalPayable;

                      const displayPayable = `${currency} ${formatPrice(finalPayable)}`;
                      const displayOriginal = hasDiscount ? `${currency} ${formatPrice(finalOriginal)}` : null;

                      return (
                        <div
                          key={uniqueKey}
                          className={`flex-shrink-0 w-[280px] border rounded-xl transition-all ${isSelected ? "bg-red-50 border-red-300" : "bg-white border-gray-200"
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
                                <span className="relative group flex items-center gap-1">
                                  <span className="cursor-pointer">{cancellation.staticDate}</span>
                                  <Info size={14} className="text-gray-400 cursor-pointer" />
                                  {ratePlan.rawPricing?.cancellation_policy?.description && (
                                    <div className="absolute bottom-full right-0 mb-2 w-64 p-3 bg-gray-800 text-white text-xs rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none z-10">
                                      {ratePlan.rawPricing.cancellation_policy.description}
                                      <div className="absolute top-full right-3 w-0 h-0 border-x-8 border-x-transparent border-t-8 border-t-gray-800"></div>
                                    </div>
                                  )}
                                </span>
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
                                    {link_type_id === 9 && (
                                      <BadgeInfo
                                        size={14}
                                        className="text-gray-400 cursor-pointer hover:text-[#233BA0] transition-colors"
                                        onClick={() => setBreakdownModal({ open: true, ratePlan })}
                                      />
                                    )}
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
                                disabled={isLoading}
                                className={`w-full px-6 py-3 rounded-lg font-bold text-sm transition-all flex items-center justify-center h-[48px] ${isSelected
                                  ? "bg-red-500 text-white shadow-md"
                                  : "bg-[#D3202D] text-white hover:bg-red-700"
                                  } disabled:bg-gray-400 disabled:cursor-wait`}
                              >
                                {isLoading ? (
                                  <LoaderSvg className="h-6 w-6" />
                                ) : isSelected ? (
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

              {link_type_id === 9 && roomType.ratePlans.length > 1 && (
                <div className="p-4 border-t border-gray-200 text-center">
                  <button
                    onClick={() => toggleExpandedRoom(roomType.id)}
                    className="text-sm text-[#233BA0] font-semibold hover:underline"
                  >
                    {isExpanded
                      ? "Show less"
                      : `Show ${hiddenCount} more option${hiddenCount !== 1 ? "s" : ""}`}
                  </button>
                </div>
              )}
            </div>
            );
          })}
        </div>
      </div>
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <RoomsBreakdownModal
        open={breakdownModal.open}
        ratePlan={breakdownModal.ratePlan}
        onClose={() => setBreakdownModal({ open: false, ratePlan: null })}
      />

      <PrebookingConfirmModal
        open={prebookingModal.open}
        loading={prebookingModal.loading}
        data={prebookingModal.data}
        onClose={() => setPrebookingModal({ open: false, data: null, ratePlan: null, loading: false })}
        onProceed={() => {
          const prebookData = prebookingModal.data;
          const prebookBookHash =
            prebookData?.rates?.[0]?.book_hash ||
            prebookData?.book_hash ||
            null;
          const prebookRates = prebookData?.rates || null;
          setPrebookingModal({ open: false, data: null, ratePlan: null, loading: false });
          if (typeof onProceedBooking === 'function') {
            onProceedBooking(prebookingModal.ratePlan, prebookBookHash, prebookRates);
          }
        }}
      />
    </div>
  );
};

const RoomTypes = ({
  isNonStuba,
  allRooms = [],
  normalizedRoomData = [],
  allotments = [],
  currency = "",
  nights = 1,
  onRoomSelect,
  onProceedBooking,
  selectedRoom,
  amenities,
  link_type_id = null,
}) => {
  console.log("StubaRoomList link_type_id:", link_type_id);
  const roomsToDisplay = (isNonStuba ? normalizedRoomData : allRooms).map(room => ({
    ...room,
    amenities: room.amenities?.length > 0 ? room.amenities : (amenities || []), // ✅ fallback to hotel amenities
  }));
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
    // Validation already done during search, just return success
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
      link_type_id={link_type_id}
    />
  );
};

export default RoomTypes;