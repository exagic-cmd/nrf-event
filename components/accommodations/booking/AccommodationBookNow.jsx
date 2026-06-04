// components/accommodations/booking/AccommodationBookNow.jsx
import { useState, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import useUserStore from "@/store/useAuthStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { useCartStore } from "@/store/useCartStore";
import $helpers from "@/lib/helpers";
import LoaderSvg from "@/components/common/LoaderSvg";
import { toast } from 'react-toastify';
import RecommendedProductsModal from '@/components/accommodations/booking/RecommendedProductsModal';

import {
  Calendar, Home, Bed, Utensils, AlertCircle,
  CheckCircle, XCircle, DollarSign, Info, Loader2, RefreshCw, ChevronUp, ChevronDown
} from "lucide-react";

const TITLE_OPTIONS = [
  { value: "Mr", label: "Mr" },
  { value: "Mrs", label: "Mrs" },
  { value: "Ms", label: "Ms" },
];

const handleKeepExistingAndCheckout = async () => {
  router.push = "/checkout";
};
// === CONFIRMATION MODAL (ONLY FOR STUBA) ===
const ConfirmationModal = ({ isOpen, onClose, onConfirm, bookingResponse, price }) => {
  const [expandedRoomIndex, setExpandedRoomIndex] = useState(0);

  const api = bookingResponse?.apiResponse || bookingResponse;
  if (!isOpen || !api?.data?.length) return null;

  const items = api.data;
  const overallTotalPrice = price;
  const currency = api.currency || "USD";
  const hotelName = items[0]?.HotelName || "Unknown Hotel";

  const formatCancelDate = (dateString, subtractDays = 0) => {
    const d = new Date(dateString);
    if (isNaN(d)) return dateString;
    if (subtractDays) d.setDate(d.getDate() - subtractDays);
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${days[d.getDay()]} ${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  };

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
          </div>

          <div className="space-y-6 mb-8">
            {items.map((item, idx) => {
              const room = item.Room;
              const checkIn = item.ArrivalDate;
              const nights = parseInt(item.Nights) || 1;
              const roomType = room.RoomType?.["@attributes"]?.text || "N/A";
              const mealType = room.MealType?.["@attributes"]?.text || "N/A";
              const cancellationStatus = room.CancellationPolicyStatus || "Unknown";
              const canxFees = Array.isArray(room.CanxFees?.Fee) ? room.CanxFees.Fee : (room.CanxFees?.Fee ? [room.CanxFees.Fee] : []);

              const nightCosts = Array.isArray(room.NightCost) ? room.NightCost : [room.NightCost].filter(Boolean);
              
              const roomTotalPrice = parseFloat(room.TotalSellingPrice?.["@attributes"]?.amt) || 
                                     (parseFloat(overallTotalPrice) / items.length);

              const perNightPrice = nightCosts.length > 0
                ? (parseFloat(nightCosts[0]?.SellingPrice?.["@attributes"]?.amt) || 0).toFixed(2)
                : (roomTotalPrice / nights).toFixed(2);

              const messages = room.Messages?.Message || [];
              const generalMessages = messages.filter(m => m.Type === "General");
              const internalNotes = messages.filter(m => m.Type === "Internal Note");

              const isExpanded = expandedRoomIndex === idx;

              return (
                <div key={idx} className="border border-gray-200 rounded-2xl overflow-hidden shadow-sm">
                  <div 
                    className="bg-gray-50 hover:bg-gray-100 transition p-4 md:px-6 flex justify-between items-center cursor-pointer select-none"
                    onClick={() => setExpandedRoomIndex(isExpanded ? -1 : idx)}
                  >
                    <div className="flex items-center gap-3">
                      <Bed className="h-6 w-6 text-[#D3202D]" />
                      <h4 className="text-lg font-bold text-gray-800">Room {idx + 1}: <span className="font-medium text-gray-600">{roomType}</span></h4>
                    </div>
                    {isExpanded ? <ChevronUp className="h-6 w-6 text-gray-500" /> : <ChevronDown className="h-6 w-6 text-gray-500" />}
                  </div>

                  {isExpanded && (
                    <div className="p-4 md:p-6 border-t border-gray-200 bg-white">
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-gray-500" /><div><p className="opacity-90 text-sm">Check-in</p><p className="font-bold">{checkIn}</p></div></div>
                        <div className="flex items-center gap-3"><Calendar className="h-5 w-5 text-gray-500" /><div><p className="opacity-90 text-sm">Nights</p><p className="font-bold">{nights}</p></div></div>
                        <div className="flex items-center gap-3"><Utensils className="h-5 w-5 text-gray-500" /><div><p className="opacity-90 text-sm">Meal</p><p className="font-bold">{mealType}</p></div></div>
                        <div className="flex items-center gap-3"><AlertCircle className="h-5 w-5 text-gray-500" /><div><p className="opacity-90 text-sm">Cancellation Policy</p><p className="font-bold">{cancellationStatus}</p></div></div>
                      </div>

                      <div className="bg-gradient-to-b from-gray-50 to-white rounded-2xl p-6 mb-8 border border-gray-200">
                        <h4 className="text-xl font-bold text-gray-800 mb-5 flex items-center gap-2">
                          <DollarSign className="h-6 w-6 text-[#D3202D]" />
                          Price Details
                        </h4>
                        <div className="space-y-4">
                          <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-7 gap-3">
                            {(Array.isArray(nightCosts) && nightCosts.length > 0
                              ? nightCosts
                              : Array.from({ length: nights }, (_, i) => ({
                                SellingPrice: { "@attributes": { amt: perNightPrice } },
                                Date: null,
                              }))
                            ).map((nc, cIdx) => {
                              const amt = parseFloat(nc?.SellingPrice?.["@attributes"]?.amt) || parseFloat(perNightPrice);
                              const label = nc?.Date || nc?.["@attributes"]?.date || `Night ${cIdx + 1}`;
                              return (
                                <div key={cIdx} className="bg-white rounded-xl shadow-sm p-2 flex flex-col items-center justify-center text-center border border-gray-200">
                                  <div className="text-sm text-gray-600 mb-1">{label}</div>
                                  <div className="text-md font-semibold text-gray-800">{currency}{amt.toFixed(2)}</div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                        <div className="flex justify-between items-center pt-5 mt-5 border-t border-gray-300">
                          <span className="text-lg font-semibold text-gray-800">Room Total</span>
                          <span className="text-xl font-bold text-[#D3202D]">
                            {currency}{roomTotalPrice.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      <div className="mb-8 border-b pb-8 border-gray-100">
                        <h5 className="text-[17px] font-bold text-[#334155] mb-4">
                          Cancellation Policy
                        </h5>
                        
                        {cancellationStatus === "NonRefundable" ? (
                          <div className="text-[#f26e6e] space-y-4">
                            <div>
                              <p className="font-semibold text-[15px]">Non-Refundable</p>
                              <p className="text-[15px] font-normal opacity-90 mt-1">100% charge will be applied on cancellation.</p>
                            </div>
                          </div>
                        ) : canxFees.length > 0 ? (
                          <div className="space-y-4">
                            {canxFees[0]?.["@attributes"]?.from && (
                              <div className="text-[#f26e6e]">
                                <p className="font-semibold text-[15px]">Cancel up to {formatCancelDate(canxFees[0]["@attributes"].from, 1)}</p>
                                <p className="text-[15px] font-normal opacity-90 mt-1">The full cost of the booking will be refunded to you. No cancellation charge applied.</p>
                              </div>
                            )}
                            {canxFees.map((fee, fIdx) => {
                              const fromDate = fee?.["@attributes"]?.from;
                              const amtStr = fee?.Amount?.["@attributes"]?.amt;
                              const amt = parseFloat(amtStr);
                              if (!fromDate || isNaN(amt)) return null;
                              const formattedAmt = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              
                              return (
                                <div key={fIdx} className="text-[#f26e6e] mt-4">
                                  <p className="font-semibold text-[15px]">Cancel on or after {formatCancelDate(fromDate)}</p>
                                  <p className="text-[15px] font-normal opacity-90 mt-1">A cancellation charge of {currency}{formattedAmt} will be applied</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-green-600 space-y-4">
                            <div>
                              <p className="font-semibold text-[15px]">Refundable</p>
                              <p className="text-[15px] font-normal opacity-90 mt-1">Free cancellation available.</p>
                            </div>
                          </div>
                        )}
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="bg-white/0 p-4 rounded-2xl border border-gray-200">
                          <div className="flex items-center gap-3 mb-4">
                            <Info className="h-5 w-5 text-blue-600" />
                            <h5 className="text-lg font-semibold text-gray-800">General Messages</h5>
                            <span className="ml-auto text-sm text-gray-500">{(generalMessages?.length || 0)}</span>
                          </div>

                          {generalMessages && generalMessages.length > 0 ? (
                            <div className="space-y-3">
                              {generalMessages.map((m, i) => {
                                const rawText =
                                  m?.Text || m?.Message || m?.["@attributes"]?.text || (typeof m === "string" ? m : "");
                                return (
                                  <div
                                    key={i}
                                    className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 max-h-40 overflow-y-auto"
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
                            <span className="ml-auto text-sm text-gray-500">{(internalNotes?.length || 0)}</span>
                          </div>

                          {internalNotes && internalNotes.length > 0 ? (
                            <div className="space-y-3">
                              {internalNotes.map((m, i) => {
                                const text = m?.Text || m?.Message || m?.["@attributes"]?.text || (typeof m === "string" ? m : "");
                                return (
                                  <div key={i} className="p-3 bg-gray-50 rounded-lg border border-gray-100 text-sm text-gray-700 max-h-40 overflow-y-auto">
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

                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex justify-between items-center pt-5 border-t-4 border-double border-gray-300">
            <span className="text-1xl font-bold text-gray-800">Grand Total Amount</span>
            <span className="text-2xl font-extrabold text-[#D3202D]">
              {currency}{overallTotalPrice}
            </span>
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

// === REPLACE ITEM MODAL ===
const ReplaceItemModal = ({ isOpen, onClose, onConfirm, onKeepExisting, hotelName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-8 text-center">
        <div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">Item Already in Cart</h3>
        <p className="text-gray-600 mb-6">
          You already have a booking for <strong>{hotelName}</strong> in your cart. Do you want to replace it with this new selection?
        </p>
        <div className="flex gap-4">
          <button
            onClick={onKeepExisting}
            className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-3 rounded-lg transition"
          >
            No, Keep Existing
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 bg-[#D3202D] hover:bg-red-700 text-white font-semibold py-3 rounded-lg transition"
          >
            Yes, Replace
          </button>
        </div>
      </div>
    </div>
  );
};

// === MAIN COMPONENT ===
const AccommodationBookNow = ({ isStuba = false, isNonStuba = false, bookingData = {}, price }) => {
  const { t } = useTranslation("accommodation");
  const router = useRouter();
  const { setJustAdded } = useDrawerStore();
  const user = useUserStore((state) => state.user);
  const { validateHoldsBeforeCheckout } = useCartStore();

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
  const [itemToReplace, setItemToReplace] = useState(null);
  const [isRebookingFlow, setIsRebookingFlow] = useState(false);
  const [keyToReplaceOnRebook, setKeyToReplaceOnRebook] = useState(null);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const autoSubmitFiredRef = useRef(false);

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
      if (storedData.isRebooking) {
        setIsRebookingFlow(true);
        if (storedData.replaceKey) {
          setKeyToReplaceOnRebook(storedData.replaceKey);
        }
      } else {
        setShowCartOptions(true); // Show "Continue Shopping" / "Checkout" buttons
      }
      // Restore any previously entered special requests so user can see what was saved
      if (storedData?.specialRequests) setSpecialRequests(storedData.specialRequests);
    } else {
      setGuestsByRoom(initialGuests);
    }
  }, [bookingData, user]);

  // Auto-submit validation when in rebooking flow with guest details already filled
  useEffect(() => {
    // Clean up redirect flag when page loads with rebooking flow
    if (isRebookingFlow && sessionStorage.getItem("accommodationRedirecting")) {
      sessionStorage.removeItem("accommodationRedirecting");
    }

    // Only auto-submit once per page load
    if (isRebookingFlow && guestsByRoom.length > 0 && !isSubmitting && !autoSubmitFiredRef.current && !modalOpen) {
      autoSubmitFiredRef.current = true;
      const timer = setTimeout(() => {
        const form = document.querySelector('form');
        if (form) {
          console.log('🤖 Auto-triggering validation for rebooking flow');
          form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
        }
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isRebookingFlow, guestsByRoom.length, modalOpen]);

  // Reset auto-submit flag when modal opens (after validation completes)
  useEffect(() => {
    if (modalOpen) {
      autoSubmitFiredRef.current = false;
    }
  }, [modalOpen]);

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
    const newErrors = [];
    let isValid = true;
    const nameRegex = /^[a-zA-Z\s'-]{2,}$/;

    guestsByRoom.forEach((room, roomIdx) => {
      const roomErrors = { adults: [], children: [] };

      room.adults.forEach((adult, adultIdx) => {
        const adultErrors = {};
        const isLeadGuest = roomIdx === 0 && adultIdx === 0;
        const hasFirstName = adult.firstName?.trim();
        const hasLastName = adult.lastName?.trim();

        // Validate First Name
        if ((isLeadGuest || isStuba) && !hasFirstName) {
          adultErrors.firstName = "First name is required.";
          isValid = false;
        } else if (hasFirstName && !nameRegex.test(adult.firstName)) {
          adultErrors.firstName = "Enter a valid name (min 2 letters).";
          isValid = false;
        } else if (!isLeadGuest && hasLastName && !hasFirstName) {
          adultErrors.firstName = "First name is required with last name.";
          isValid = false;
        }

        // Validate Last Name
         if ((isLeadGuest || isStuba) && !hasLastName) {
          adultErrors.lastName = "Last name is required.";
          isValid = false;
        } else if (hasLastName && !nameRegex.test(adult.lastName)) {
          adultErrors.lastName = "Enter a valid name (min 2 letters).";
          isValid = false;
        } else if (!isLeadGuest && hasFirstName && !hasLastName) {
          adultErrors.lastName = "Last name is required with first name.";
          isValid = false;
        }
        roomErrors.adults[adultIdx] = adultErrors;
      });
      room.children.forEach((child, childIdx) => {
        const childErrors = {};
        const hasChildFirstName = child.firstName?.trim();
        const hasChildLastName = child.lastName?.trim();

        if (isStuba && !hasChildFirstName) {
          childErrors.firstName = "First name is required.";
          isValid = false;
        } else if (hasChildFirstName && !nameRegex.test(child.firstName)) {
          childErrors.firstName = "Enter a valid child's name.";
          isValid = false;
        } else if (hasChildLastName && !hasChildFirstName) {
          childErrors.firstName = "First name is required.";
          isValid = false;
        }

        if (isStuba && !hasChildLastName) {
          childErrors.lastName = "Last name is required.";
          isValid = false;
        } else if (hasChildLastName && !nameRegex.test(child.lastName)) {
          childErrors.lastName = "Enter a valid child's name.";
          isValid = false;
        } else if (hasChildFirstName && !hasChildLastName) {
          childErrors.lastName = "Last name is required.";
          isValid = false;
        }
        roomErrors.children[childIdx] = childErrors;
      });
      newErrors[roomIdx] = roomErrors;
    });

    setErrors(newErrors);
    return isValid;
  };


  // === STUBA: CALL PRE-BOOKING API ===
  const callStubaBookingAPI = async () => {
    const flatAdults = [];
    const flatChildren = [];

    guestsByRoom.forEach((roomGuests) => {
      roomGuests.adults.forEach((a) => {
        flatAdults.push({
          title: a.title,
          firstName: a.firstName,
          lastName: a.lastName,
        });
      });
      roomGuests.children.forEach((c) => {
        flatChildren.push({
          title: c.title,
          firstName: c.firstName,
          lastName: c.lastName,
          age: c.age,
        });
      });
    });

    const payload = {
      region: null,
      hotel_id: bookingData.accommodationId || bookingData.searchParams?.hotel_id,
      start_date: bookingData.searchParams?.start_date,
      nights: bookingData.nights,
      rooms: bookingData.searchParams?.rooms ?? [],
      nationality: "all",
      stars: null,
      quoteId: bookingData.selectedRoom?.id ?? "",
      adult: flatAdults,
      child: flatChildren,
    };

    try {
      const res = await fetch($helpers.getApiAbsoluteURL("customer/stuba/booking"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) throw new Error("Booking validation failed");
      const data = await res.json();
      if (data && data.status === false) {
        const serverMsg = data.msg || "Booking validation failed.";
        toast.error(serverMsg);
        return null;
      }

      return { apiResponse: data, requestPayload: payload };
    } catch (err) {
      console.error("Stuba booking API error:", err);
      toast.error("Booking validation failed. Please try again.");
      return null;
    }
  };

  // === HANDLE SUBMIT ===
  const handleAddToCart = async (e) => {
    e.preventDefault();
    setLoadingButton("addToCart");
    setIsSubmitting(true);
    setErrors({});

    if (!validateGuestInfo()) {
      // Validation failed → find first error and scroll to it
      setTimeout(() => {
        const firstErrorElement = document.querySelector('.text-red-500.text-xs.mt-1');
        if (firstErrorElement) {
          firstErrorElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
          });

        } else {
          // Fallback: scroll to top of guest form
          const guestForm = document.querySelector('form');
          if (guestForm) {
            guestForm.scrollIntoView({ behavior: 'smooth', block: 'start' });
            window.scrollBy(0, -80); // Offset for header
          }
        }
      }, 100); // Small delay to ensure errors are rendered

      setIsSubmitting(false);
      setLoadingButton(null);
      return;
    }
    // === FOR STUBA: Call booking validation API and show modal ===
    if (isStuba) {
      const result = await callStubaBookingAPI();
      setIsSubmitting(false);
      setLoadingButton(null);

      if (result) {
        setBookingResponse(result);
        setModalOpen(true);
      }
      return;
    }
 const success = await proceedWithAddToCart([]);
 if (success) {
      setShowRecommendations(true);
    }
  };

  const proceedWithAddToCart = async (selectedProducts) => {
    // === FOR NON-STUBA: Add directly to cart ===
    // Check if item already exists in cart
    const cartItems = useCartStore.getState().items;
    const hotelId = bookingData.hotelData?.id || null;
    const existingItem = cartItems.find(item => item.type === 'accommodation' && item.product_id === hotelId);

    if (existingItem) {
      setItemToReplace(existingItem);
      setIsSubmitting(false); // Reset submitting state
      setLoadingButton(null); // Reset button loading state
      return false; // This will trigger the useEffect to show the modal
    }
    
     addToCartDirectly(selectedProducts);
     try {
      toast.success("Successfully added to your cart.");
    } catch (toastError) {
      console.error("Toast error:", toastError);
    }
    setShowCartOptions(true);
    setLoadingButton(null);
    setIsSubmitting(false);
    return true;
  }

  // === DIRECT ADD TO CART (NON-STUBA) ===
  const addToCartDirectly = (recommendedProducts = []) => {
    const updatedBookingData = {
      ...bookingData,
      recommendedProducts,
      guestDetailsByRoom: guestsByRoom,
      specialRequests,
      isRebooking: false,
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

    const cartItem = {
      productType: "accommodation",
      product_id: hotelId,
      tourId: hotelId,
      productTitle: bookingData.hotelData?.title || "",
      type: "accommodation",
      adult_count: totalAdults,
      child_count: totalChildren,
      price: price,
      total: Number(price),
      tour_date: bookingData.checkIn,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      nights,
      roomType: bookingData.selectedRoom?.name || "",
      mealType: bookingData.selectedRoom?.mealPlanCode || bookingData.selectedRoom?.mealType || '',
      cancellationPolicy: bookingData.selectedRoom?.cancellationPolicy || null,
      quoteId: bookingData.selectedRoom?.id || null,
      rate_plan_id: bookingData.selectedRoom?.id || null,
      link_type_id: bookingData.link_type_id || null,
      hotel_info: {
        id: hotelId,
        roomsDetails: roomsDetailsArray,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        Guests: guestsByRoom,
        book_hash: bookingData.book_hash || null,
        rate: bookingData.prebooking_rates?.[0] || null,
      },
      guestDetailsByRoom: guestsByRoom,
      special_request: specialRequests || "",
      meal_plan: 0,
      check_in_time: "15:00",
      check_out_time: "11:00",
      bed_type: bookingData.selectedRoom?.rawData?.cat?.id || null,
      room_type: bookingData.selectedRoom?.rawData?.type?.id || null,
      hotel_ref_no: hotelId,
      image: bookingData.hotelData?.images?.[0]?.url || null,
      holdExpiresAt: Date.now() + 7 * 60 * 1000, // 7 minute hold
      bookingData: updatedBookingData,
    };
    useCartStore.getState().addAccommodationItem(cartItem);
    setJustAdded(true);
    setShowCartOptions(true);
  };

  const handleReplaceItem = async () => {
    setLoadingButton("replace");
    try {
      toast.success("Replacing accommodation booking...", {
        autoClose: 4000,
        closeButton: true,
      });
    } catch (error) {
      console.error("Toast error:", error);
    }
    if (itemToReplace) {
      useCartStore.getState().removeItem(itemToReplace.key);
    }
    addToCartDirectly();
    setItemToReplace(null); 
    setLoadingButton(null);
  };

  // === CONFIRM & ADD (STUBA) ===
  const confirmAndAddToCart = () => {
    setIsRebookingFlow(false);
    // If this is a rebook flow with an item to replace, remove the old item first.
    if (keyToReplaceOnRebook) {
      useCartStore.getState().removeItem(keyToReplaceOnRebook);
      // Clean up the key from session storage
      const storedData = JSON.parse(sessionStorage.getItem("accommodationBookingData"));
      if (storedData?.replaceKey) {
        delete storedData.replaceKey;
        sessionStorage.setItem("accommodationBookingData", JSON.stringify(storedData));
      }
      setKeyToReplaceOnRebook(null); // Clean up state
    }

    // Same logic as addToCartDirectly but with bookingResponse
    const updatedBookingData = {
      ...bookingData,
      guestDetailsByRoom: guestsByRoom,
      specialRequests,
      request_response: bookingResponse?.apiResponse ?? null,
      request: bookingResponse?.requestPayload ? { callPreBookingAPI: bookingResponse.requestPayload } : null,
    isRebooking: false,
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

    const cartItem = {
      product_id: hotelId,
      tourId: hotelId,
      productTitle: bookingData.hotelData?.title || "",
      productType: "accommodation",
      type: "accommodation",
      adult_count: totalAdults,
      child_count: totalChildren,
      price: price,
      total: Number(price),
      tour_date: bookingData.checkIn,
      check_in: bookingData.checkIn,
      check_out: bookingData.checkOut,
      nights,
      roomType: bookingData.selectedRoom?.name || bookingData.selectedRoom?.roomType || "",
      mealType: bookingData.selectedRoom?.mealType || "",
      quoteId: bookingData.selectedRoom?.id || null,
      rate_plan_id: bookingData.selectedRoom?.id || null,
      cancellationPolicy: bookingData.selectedRoom?.cancellationPolicy || null,
      link_type_id: bookingData.link_type_id || null,
      hotel_info: {
        id: hotelId,
        roomsDetails: roomsDetailsArray,
        checkInDate: bookingData.checkIn,
        checkOutDate: bookingData.checkOut,
        request_response: bookingResponse?.apiResponse ?? null,
        guestDetailsByRoom: guestsByRoom,
        request: bookingResponse?.requestPayload ? { callPreBookingAPI: bookingResponse.requestPayload } : null,
        stuba_response: bookingResponse?.apiResponse ?? null,
        stuba_payload: bookingResponse?.requestPayload ?? null,
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
      holdExpiresAt: Date.now() + 7 * 60 * 1000, // 7 minute hold
      bookingData: updatedBookingData,
    };
 console.log("cartItem: accomodation Booking", cartItem);
    useCartStore.getState().addAccommodationItem(cartItem);
    setJustAdded(true);
    setModalOpen(false);
    setShowCartOptions(true);
    // Use a more specific toast for rebooking
    if (keyToReplaceOnRebook) {
      toast.success("Reservation successfully re-confirmed and updated.");
    } else {
      toast.success("Successfully added to your cart.");
    }
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
    // window.location.href = "/checkout";
    router.push("/checkout");
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
                    `, ${room.children.length} Child${room.children.length > 1 ? "ren" : ""
                    }`}
                </h3>

                {/* Adults */}
                {roomGuests.adults.map((adult, i) => (
                  <div
                    key={`adult-${i}`}
                    className="bg-gray-100  p-2 grid grid-cols-1 md:grid-cols-3 gap-4 mt-2"
                  >
                    {/* Title */}
                    <div>
                      <label className="block text-black text-sm font-medium mb-2">
                         {(roomIdx === 0 && i === 0) || isStuba ? "Title" : ""} {roomIdx === 0 && i === 0 && <span className="text-sm font-medium text-gray-700">(Lead)</span>} {((roomIdx === 0 && i === 0) || isStuba) && <span className="text-red-500">*</span>}
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
                        {(roomIdx === 0 && i === 0) || isStuba ? "First Name" : ""} {roomIdx === 0 && i === 0 && <span className="text-sm font-medium text-gray-700">(Lead)</span>} {((roomIdx === 0 && i === 0) || isStuba) && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="First Name"
                        value={adult.firstName}
                        onChange={(e) => { //Allow only letters and spaces 
                          const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          updateGuest(roomIdx, "adults", i, "firstName", onlyText);
                        }}
                        className={`w-full px-3 py-2 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D] ${roomIdx === 0 && i === 0 && user?.name
                          ? "bg-gray-300"
                          : "bg-white"
                          }`}
                        readOnly={showCartOptions}
                      />
                      {errors[roomIdx]?.adults[i]?.firstName && (
                        <p className="text-red-500 text-xs mt-1">{errors[roomIdx].adults[i].firstName}</p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div>
                      <label className="block text-black text-sm font-medium mb-2">
                        {(roomIdx === 0 && i === 0) || isStuba ? "Last Name" : ""} {roomIdx === 0 && i === 0 && <span className="text-sm font-medium text-gray-700">(Lead)</span>} {((roomIdx === 0 && i === 0) || isStuba) && <span className="text-red-500">*</span>}
                      </label>
                      <input
                        type="text"
                        placeholder="Last Name"
                        value={adult.lastName}
                        onChange={(e) => {
                          // Allow only letters and spaces
                          const onlyText = e.target.value.replace(/[^a-zA-Z\s]/g, "");
                          updateGuest(roomIdx, "adults", i, "lastName", onlyText);
                        }}
                        className={`w-full px-3 py-2 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D] ${roomIdx === 0 && i === 0 && user?.name ? "bg-gray-300" : "bg-white"
                          }`}
                        readOnly={showCartOptions}
                      />

                      {errors[roomIdx]?.adults[i]?.lastName && (
                        <p className="text-red-500 text-xs mt-1">{errors[roomIdx].adults[i].lastName}</p>
                      )}
                    </div>
                  </div>
                ))}

                {/* Children */}
                {roomGuests.children.map((child, i) => (
                  <div
                    key={`child-${i}`}
                    className="bg-gray-200 rounded-lg p-4 grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 mt-2"
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
                        First Name {isStuba && <span className="text-red-500">*</span>}
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
                        Last Name {isStuba && <span className="text-red-500">*</span>}
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
              readOnly={showCartOptions}
              className={`w-full px-3 py-2 border border-gray-500 rounded-md text-black placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#D3202D] ${showCartOptions ? 'bg-gray-300 cursor-not-allowed' : 'bg-white'}`}
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
                    {isStuba ? "Validating Booking..." : "Adding to Cart..."}
                  </>
                ) : (
                   isStuba ? "Validation" : "Add to Cart"
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
                    "Checkout"
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
          price={price}
        />
      )}

      <ReplaceItemModal
        isOpen={!!itemToReplace}
        onClose={() => setItemToReplace(null)}
        onConfirm={handleReplaceItem}
        onKeepExisting={() => router.push("/checkout")}
        hotelName={itemToReplace?.productTitle || ""}
      />
    {showRecommendations && (
        <RecommendedProductsModal
          isOpen={showRecommendations}
          onClose={() => setShowRecommendations(false)}
          hotelName={bookingData.hotelData?.title}
        />
      )}
    </>
  );
};

export default AccommodationBookNow;