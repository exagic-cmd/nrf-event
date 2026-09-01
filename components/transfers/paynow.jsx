import React, { useState, useEffect, useRef } from 'react';
import PopupMsg from '@/components/common/PopupMsg';
import { useScrollToTop } from '@/hooks/use-scroll-top';
import useBookingStore from "@/store/userBookingStore";
import { useProductStore } from "@/store/useProductStore";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from "next/router";
import { useAffiliateStore } from '@/store/useAffiliateStore';
import "@/styles/globals.css";
import { useCartStore } from "@/store/useCartStore";
import PayNowFlywire from '@/components/PayNowFlywire';
import Head from 'next/head';
import { User, Mail, Phone, Tag, CreditCard, ChevronDown,MessageSquare, Wifi } from "lucide-react";
import { useTranslation } from "next-i18next";
import useLanguageStore from "@/store/useLanguageStore";
import { redirectToAirwallexCheckout } from '@/utils/airwallex';
import CheckoutRedirect from "@/components/stripe/CheckoutRedirect";
import BookingPreviewSlider from "@/components/transfers/BookingPreviewSlider";
import useUserStore from '@/store/useAuthStore';
import { useEventStore } from "@/store/useEventStore";
import { toast } from 'react-toastify';
// === CANCELLATION POLICY MODAL FOR STUBA (link_type_id 9) ===
const CancellationPolicyModal = ({ isOpen, onClose, onConfirm, stubaItems }) => {
  const [expandedRoomIndex, setExpandedRoomIndex] = useState(0);

  if (!isOpen || !stubaItems?.length) return null;

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
      <div className="bg-surface rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-3xl">
        <div className="p-6 md:p-8">
          <div className="flex justify-between items-start mb-6">
            <h3 className="text-lg font-bold text-foreground">Cancellation Policy</h3>
            <button onClick={onClose} className="text-muted-foreground hover:text-muted-foreground transition">
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>

          <p className="text-sm text-muted-foreground mb-6">Please review the cancellation policy before confirming your booking.</p>

          <div className="space-y-4 mb-6">
            {stubaItems.map((entry, idx) => {
              const api = entry.hotel_info?.stuba_response;
              if (!api?.data?.length) return null;
              const currency = api.currency || "SGD";

              return api.data.map((item, roomIdx) => {
                const room = item.Room;
                const cancellationStatus = room?.CancellationPolicyStatus || "Unknown";
                const canxFees = Array.isArray(room?.CanxFees?.Fee)
                  ? room.CanxFees.Fee
                  : room?.CanxFees?.Fee ? [room.CanxFees.Fee] : [];
                const roomType = room?.RoomType?.["@attributes"]?.text || entry.productTitle || "Room";
                const key = `${idx}-${roomIdx}`;
                const isExpanded = expandedRoomIndex === key;

                return (
                  <div key={key} className="border border-border rounded-xl overflow-hidden">
                    <div
                      className="bg-muted hover:bg-muted transition p-4 flex justify-between items-center cursor-pointer"
                      onClick={() => setExpandedRoomIndex(isExpanded ? null : key)}
                    >
                      <span className="font-semibold text-foreground">{roomType}</span>
                      <svg className={`h-5 w-5 text-muted-foreground transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>

                    {isExpanded && (
                      <div className="p-4 border-t border-border bg-surface">
                        <h5 className="text-sm font-bold text-muted-foreground mb-3">Cancellation Policy</h5>

                        {cancellationStatus === "NonRefundable" ? (
                          <div className="text-[#f26e6e] space-y-1">
                            <p className="font-semibold text-sm">Non-Refundable</p>
                            <p className="text-sm opacity-90">100% charge will be applied on cancellation.</p>
                          </div>
                        ) : canxFees.length > 0 ? (
                          <div className="space-y-3">
                            {canxFees[0]?.["@attributes"]?.from && (
                              <div className="text-green-600">
                                <p className="font-semibold text-sm">Cancel up to {formatCancelDate(canxFees[0]["@attributes"].from, 1)}</p>
                                <p className="text-sm opacity-90 mt-0.5">Full refund — no cancellation charge.</p>
                              </div>
                            )}
                            {canxFees.map((fee, fIdx) => {
                              const fromDate = fee?.["@attributes"]?.from;
                              const amtStr = fee?.Amount?.["@attributes"]?.amt;
                              const amt = parseFloat(amtStr);
                              if (!fromDate || isNaN(amt)) return null;
                              const formattedAmt = amt.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                              return (
                                <div key={fIdx} className="text-[#f26e6e] mt-2">
                                  <p className="font-semibold text-sm">Cancel on or after {formatCancelDate(fromDate)}</p>
                                  <p className="text-sm opacity-90 mt-0.5">Cancellation charge of {currency}{formattedAmt} will be applied.</p>
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div className="text-green-600">
                            <p className="font-semibold text-sm">Refundable</p>
                            <p className="text-sm opacity-90 mt-0.5">Free cancellation available.</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              });
            })}
          </div>

          <div className="flex gap-4 mt-6">
            <button
              onClick={onClose}
              className="flex-1 bg-secondary hover:bg-secondary text-foreground font-semibold py-3 rounded-xl transition"
            >
              No, Cancel
            </button>
            <button
              onClick={onConfirm}
              className="flex-1 bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-3 rounded-xl transition"
            >
              Yes, Confirm
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const PayNow = ({ totalPrice }) => {
  const { t } = useTranslation("daytour");
  const { languageId, currentLocale } = useLanguageStore.getState();
  const { localizedPush } = useLocalizedRouter();
  const router = useRouter();
  useScrollToTop();

  const { items: storeItems, setItems } = useCartStore();
  const submitBooking = useBookingStore(state => state.submitBooking);
  const getPaymentOptions = useBookingStore(state => state.getPaymentOptions);
  const getPromoExist = useBookingStore(state => state.getPromoExist);
  const { refId, refType, track_agent_id } = useAffiliateStore();
  const user = useUserStore(state => state.user);
  const { event } = useEventStore();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [showPromoField, setShowPromoField] = useState(false);
  const [stripeOrderId, setStripeOrderId] = useState(null);
  const [flywireTotal, setFlywireTotal] = useState(null);
  const [showFlywire, setShowFlywire] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [promo, setPromo] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [userComment, setUserComment] = useState('');
  const [errors, setErrors] = useState({});
 const [communicationMode, setCommunicationMode] = useState(user?.communication_mode || '');
  const [isCommModeOpen, setIsCommModeOpen] = useState(false);
  const [hasRoaming, setHasRoaming] = useState(
    user?.roaming_enabled === 1 || user?.roaming_enabled === true ? 'yes' : 
    (user?.roaming_enabled === 0 || user?.roaming_enabled === false ? 'no' : '')
  ); const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  const [showCancellationModal, setShowCancellationModal] = useState(false);
  const commModeRef = useRef(null);
  const lastPaymentFetchIdRef = useRef(null);

  const communicationOptions = [
    { value: "whatsapp", label: "WhatsApp" },
    { value: "line", label: "Line" },
    { value: "telegram", label: "Telegram" },
    { value: "viber", label: "Viber" },
    { value: "email", label: "Email" },
    { value: "sms", label: "SMS" },
  ];
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name || "");
      setEmail((prev) => prev || user.email || "");
      setPhone((prev) => prev || user.phone || "");
      
      // For hidden fields, strictly use user data if available
      if (user.communication_mode) setCommunicationMode(user.communication_mode);
      if (user.roaming_enabled !== undefined && user.roaming_enabled !== null) {
        setHasRoaming(user.roaming_enabled ? 'yes' : 'no');
      }
    }
  }, [user]);
  // === Load cart from sessionStorage if store is empty ===
  const items = (() => {
    if (storeItems.length > 0) return storeItems;

    if (typeof window === "undefined") return [];

    const saved = sessionStorage.getItem("cartItems");
    if (!saved) return [];

    try {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed)) {
        setItems(parsed); // Sync to Zustand
        return parsed;
      }
    } catch (e) {
      console.error("Failed to parse cart from sessionStorage", e);
    }
    return [];
  })();

  const hasLinkType10 = items.some(item => item.link_type_id === 10);

  useEffect(() => {
    const hasPendingPayment = typeof window !== "undefined" && !!localStorage.getItem("pendingPaymentOrderId");
    if (items.length === 0 && !hasPendingPayment && !isPopupVisible) {
      localizedPush("/");
    }
  }, [items, localizedPush, isPopupVisible]);

  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setEmail(user.email || "");
      setPhone(user.phone || "");
    }
  }, [user]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const firstProductId = items[0]?.tourId || items[0]?.id;
        if (!firstProductId) return;

        // Guard: skip if already fetched for this product ID and languageId combination
        const fetchKey = `${firstProductId}_${languageId}`;
        if (lastPaymentFetchIdRef.current === fetchKey) return;
        lastPaymentFetchIdRef.current = fetchKey;

        const res = await getPaymentOptions(firstProductId, 1);
        setPaymentOptions(res?.data?.paymentmethods || []);
      } catch (err) {
        lastPaymentFetchIdRef.current = null; // allow retry on error
        setPaymentOptions([]);
        setShowPromoField(false);
      }
    };
    fetchOptions();
  }, [getPaymentOptions, languageId, items]);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (commModeRef.current && !commModeRef.current.contains(event.target)) setIsCommModeOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  useEffect(() => {
    if (paymentOptions.length > 0) {
      const firstOption = paymentOptions[0];
      setPaymentOption(firstOption.value || firstOption.id);
    }
  }, [paymentOptions]);

  // Validation
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "validation.nameRequired";
    else if (name.trim().length < 3) errs.name = "validation.nameMinLength";
    else if (!/^[A-Za-z\s]+$/.test(name.trim())) errs.name = "validation.nameLetters";

    if (!email.trim()) errs.email = "validation.emailRequired";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "validation.emailInvalid";

    if (!phone.trim()) errs.phone = "validation.phoneRequired";
    else if (!phone || phone.replace(/\D/g, '').length < 7) errs.phone = "validation.phoneInvalid";

    if (hasLinkType10 && !userComment.trim()) errs.userComment = "Comment is required";

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildPromoPayload = () => {
    const itinerary = items.map(item => ({
      product_id: item.tourId || item.id,
      total_pax: (item.passengers || 0) + (item.children || 0) + (item.pax || 0) + (item.child || 0),
      total_price: typeof item.pricing === "number" ? item.pricing : item.pricing?.total || item.price || 0
    }));

    return { promo_code: promo, itinerary };
  };

  const buildFinalPayload = () => {
  const [firstName = '', lastName = ''] = name.split(" ");
  const transferItem = items.find(item => item.type !== "upsell" && (item.selectedDate || item.pickupDate));
  const allUpsell = items.every(item => item.type === "upsell");
  const currentDate = new Date().toISOString().slice(0, 10);

  const cart_items = items.map(item => {
    const isTransfer = !!item.vehicle || item.transferType || item.tripType;
    const isAccommodation = item.type === "accommodation";

    const addonsPayload = (item.addons || []).map(a => ({
      addon_id: a.addon_id,
      title: a.title,
      qty: a.quantity || 1,
      rate: a.rate || 0,
      total: a.total || 0,
    }));

    const addonsRoundPayload = (item.addons_round || []).map(a => ({
      addon_id: a.addon_id,
      title: a.title,
      qty: a.quantity || 1,
      rate: a.rate || 0,
      total: a.total || 0,
    }));
const exceptionsPayload = item.exceptions || []; 
    console.log("Building cart item for:", item);

    // For accommodation items, use the existing structure from cart
    if (isAccommodation) {
      return {
        product_id: item.product_id || item.tourId || item.id,
        category_id: 4,
        adult_count: item.adult_count || item.guests || 0,
        child_count: item.child_count || 0,
        total: item?.total ?? 0,  // Use item.total which is already rooms × nights
        tour_date: item.tour_date || item.checkIn||"",
        check_in: item.check_in || item.checkIn,
        check_out: item.check_out || item.checkOut,
        nights: item.nights || 1,
        roomType: item.roomType,
        mealType: item.mealType,
        quoteId: item.quoteId,
        rate_plan_id: item.rate_plan_id || item.quoteId,
        cart_id:item.key.split('#').pop() || key,
        cancellationPolicy: item.cancellationPolicy,
        meal_plan:0,
        check_in_time:null,
        check_out_time:null,
        bed_type: item?.hotel_info?.roomsDetails?.[0]?.rawData?.cat?.id || null,
        room_type: item?.hotel_info?.roomsDetails?.[0]?.rawData?.type?.id || null,
        hotel_ref_no:item?.product_id || item.tourId || item.id,
        // Use the existing hotel_info structure from cart
        hotel_info: item.hotel_info || {
          id: item.product_id || item.tourId || item.id,
          checkInDate: item.check_in || item.checkIn,
          checkOutDate: item.check_out || item.checkOut,
          guestDetails: item.guestDetails,
          nationality: item.nationality,
          nights: item.nights || 1,
          region: item.region,
          rate_type_id: item.selectedRoom?.id,
          roomsDetails: item.roomsDetails || [{
            roomTypeId: 1,
            id: item.selectedRoom?.id,
            roomType: item.selectedRoom?.roomType,
            mealType: item.selectedRoom?.mealType,
            price: item.selectedRoom?.price,
            roomCode: item.selectedRoom?.roomCode,
            mealCode: item.selectedRoom?.mealCode,
            cancellationPolicy: item.selectedRoom?.cancellationPolicy,
            guestDetails: item.guestDetails // Include guest details in roomsDetails
          }],
          special_request: item.specialRequests || '',
           // Attach preBookingResponse and preBookingRequest when available (from pre-book step)
           request_response: item.hotel_info?.preBookingResponse || item.preBookingResponse || null,
           request: item.hotel_info?.preBookingRequest?.callPreBookingAPI || item.preBookingRequest?.callPreBookingAPI || item.payload || null,
        },
        
        // Keep empty arrays for transfer-specific fields
        addons: [],
        addons_round: [],
        exceptions: null,
        baggage: null,
        
        // Transfer fields - set to null/empty for accommodation
        pickup_date: null,
        pickup_time: null,
        pickup_point: null,
        dropoff_point: null,
        vehicle_id: null,
        transfer_type: null,
        flight_number: "",
        flight_dep_number: "",
        flight_estimated_time: "",
        flight_dep_estimated_time: "",
        two_way_dropoff_date: "",
        two_way_dropoff_time: "",
        pickup_surcharge: 0,
        return_surcharge: 0,
        return_surcharge_id: 0,
        pickup_surcharge_id: 0
      };
    }

    // === TRANSFER ITEM ===
     if (isTransfer) {
    return {
  product_id: item.tourId,
  adult_count: item.passengers || 1,
  child_count: item.children || 0,
  total: typeof item.pricing === 'number' ? item.pricing : item.pricing?.total ||item.price|| '',
  tour_date: item.selectedDate || item.pickupDate,
  pickup_date: item.selectedDate || item.pickupDate,
  pickup_time: item.pickupTime|| item.selectedTime||item.pickupFlightScheduleTime||"",
   pickup_point:item.pickup ||item.pickup?.name || item.searchParams?.pickup?.name || "",
   pickup_point_id:
      item.vehicle?.pickup_point_id ||
      item.pickup?.id ||
      item.searchParams?.pickup?.id ||
      "",
      dropoff_point_id:
      item.vehicle?.dropoff_point_id ||
      item.dropoff?.id ||
      item.searchParams?.dropoff?.id ||
      "" ,
two_way_pickup_point_id:
      item.returnPickup?.id ||
      item.vehicle?.dropoff_point_id ||
      item.searchParams?.returnPickup?.id ||
      "",
      two_way_dropoff_point_id:
      item.returnDropoff?.id ||
      item.vehicle?.pickup_point_id ||
      item.searchParams?.returnDropoff?.id ||
      "",
         feature_type_id: item.vehicle?.feature_type_id || 1,
         flight_estimated_time: item.pickupFlightScheduleTime  || "",
flight_dep_estimated_time:
      item.returnFlightScheduleTime || item.flightDepEstimatedTime || "",
      dropoff_point:item.dropoff ||item.dropoff?.name ||item.searchParams?.dropoff?.name|| "",
  vehicle_id: item.vehicle?.vehicle_id || item.vehicle?.id || "",
  meetAndGreetName: item.meetAndGreetName || "",
  transfer_type: item.transferType || item.tripType || "",
  flight_number: item.pickupFlightNumber || "",
  flight_dep_number: item.returnFlightNumber || "",
  two_way_dropoff_date: item.returnDate || "",
  two_way_dropoff_time: item.returnTime ||item.flightDepEstimatedTime|| "",
  baggage: item.baggage || 0,
 // cabin_bags: item.cabinBags || 0,
 // large_bags: item.largeBags || 0,
  baggages: item.selectedBaggages || [],
    pickup_surcharge: item.pickupSurcharge || 0,
    return_surcharge: item.returnSurcharge || 0,
     return_surcharge_id: item.returnSurchargeId || 0,
    pickup_surcharge_id: item.pickupSurchargeId || 0,
    addons: addonsPayload,           
      addons_round: addonsRoundPayload ,
        exceptions: exceptionsPayload,
}

  }

  else {
    return {
  adult_count: item.adults || 0,
  child_count: item.child || 0,
  dropoff_point:  item.hotelName ||item.searchParams?.dropoff?.name || '',
      flight_number: item.pickupFlightNumber || '',
  operator_email: 'operator@example.com',
  operator_id: '12345', 
  pickup_date: item.selectedDate,
  pickup_point: item.hotelName||item.pickupPoint || item.searchParams?.pickup?.name || '',
  dropoff_point: item.dropoffPoint ||item.searchParams?.dropoff?.name || '',
  category_id:item.category_name||"",
   pickup_point_id:
      item.vehicle?.pickup_point_id ||item.pickupPointId ||
      item.pickup?.id ||
      item.searchParams?.pickup?.id ||
      "",
      dropoff_point_id:
      item.vehicle?.dropoff_point_id || item.dropoffPointId||
            item.dropoff?.id ||
      item.searchParams?.dropoff?.id ||
      "",
two_way_pickup_point_id:
      item.returnPickup?.id ||
      item.vehicle?.dropoff_point_id ||
      item.searchParams?.returnPickup?.id ||
      "",
      two_way_dropoff_point_id:
      item.returnDropoff?.id ||
      item.vehicle?.pickup_point_id ||
      item.searchParams?.returnDropoff?.id ||
      "",
       feature_type_id: item.vehicle?.feature_type_id || 1,
         flight_estimated_time: item.pickupFlightScheduleTime || item.flightEstimatedTime || "",
flight_dep_estimated_time:
      item.returnFlightScheduleTime || item.flightDepEstimatedTime || "",
  pickup_time: item.selectedTime,
  product_id: item.tourId,
  total: item.pricing?.total || 0,
  tour_date: item.selectedDate,
  tourplan_hotel_id: '789', 
  vehicle_id: 'V102', 
  transfer_type: '', // in trasfer passing
  flight_dep_number: '', // in trasfer passing
  flight_estimated_time: '', // in trasfer passing
  flight_dep_estimated_time: '', // in trasfer passing
  two_way_dropoff_date: '', // in trasfer passing
  two_way_dropoff_time: '', // in trasfer passing,
  baggage: item.baggage || 0,
    pickup_surcharge: item.pickupSurcharge || 0,
    return_surcharge: item.returnSurcharge || 0,
    return_surcharge_id: item.returnSurchargeId || 0,
    pickup_surcharge_id: item.pickupSurchargeId || 0,
     addons: addonsPayload,           
      addons_round: addonsRoundPayload ,
        exceptions: exceptionsPayload,
}
  }
}
);
console.log("cart_items:PAYNOW #####################", cart_items);
  const payload = {
    cart_items,
    paxinfo: {
      email,
      username: email.split('@')[0],
      first_name: firstName,
      last_name: lastName,
      contactNumber: phone,
      communication_mode: communicationMode,
       roaming_enabled: hasRoaming,
    },
    payment_details: {
      charge_to: '',
      currency: 'SGD',
      charge_for: 'order',
      token: '',
      xendit_authentication_id: ''
    },
    payment_mode: 2,
    client_id: '',
    agent_id: '',
    source: 'Direct',
    source_link: "Explore Singapore (NRF)",
    promo_id: promo || '',
    discount: '',
    session_id: 'vutxsweygb',
    customer_type: 'potential_customer',
    visitor_number: 'V68261',
    redemption_voucher_id: 0,
    agent_id: event?.event?.user_id || null,
    event_id:event?.event?.id|| null,
    ref_type: refType || null,
    track_agent_id: track_agent_id || null,
    user_comment: userComment.trim() || null,
  };

  return payload;
};

  // Shared hold-validation + submitBooking logic
  const executePayment = async () => {
    setIsSubmitting(true);
    try {
      const accommodationItems = items.filter(item => item.type === 'accommodation' && item.holdExpiresAt);

      for (const item of accommodationItems) {
        const ratePlanId = item.quoteId || item.rate_plan_id;

        if (!ratePlanId) {
          console.warn('Accommodation item missing rate_plan_id:', item);
          continue;
        }

        // Skip hold check for link_type_id 9 (stuba) or 10 (ratehawk) — client-side hold only.
        if (item.link_type_id === 9 || item.link_type_id === 10) {
          console.log('[paynow] Skipping hold status check for link_type_id', item.link_type_id);
          continue;
        }

        try {
          const cartId = item.key.split('#').pop() || item.key;
          const params = new URLSearchParams({ cart_id: cartId, rate_plan_id: ratePlanId });

          const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/inventory/hold/status?${params.toString()}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          });
          const data = await res.json();

          if (!res.ok || data.success === false || data.data?.is_expired === true || data.data?.status === 'expired') {
            console.warn('Hold expired for accommodation:', item.productTitle, data);
            useCartStore.getState().removeItem(item.key);

            const alertMessage = (data.data?.is_expired === true || data.data?.status === 'expired')
              ? `The allotment for "${item.productTitle}" has been released`
              : `Could not verify hold status for "${item.productTitle}". Please try again.`;

            toast.error(alertMessage);
            setIsSubmitting(false);
            return;
          }

          console.log(`✅ Hold valid for ${item.productTitle}. Extending it now...`);
          const extendResult = await useCartStore.getState().extendHoldForItem(item.key);
          if (!extendResult.success) {
            toast.error(`Could not secure the hold for "${item.productTitle}". Please try again.`);
            console.warn('Hold extension failed:', extendResult.message);
            setIsSubmitting(false);
            return;
          }
        } catch (err) {
          console.warn('Hold validation error:', err);
          toast.error(`Error validating hold for "${item.productTitle}". Please try again.`);
          setIsSubmitting(false);
          return;
        }
      }

      const finalPayload = buildFinalPayload();
      console.log("Final Payload for submitBooking:", finalPayload);
      const response = await submitBooking(finalPayload);
      const orderId = response?.order_id;
      const totalPrice = response?.total_price;

      setReturnOrderId(orderId);
      setFlywireTotal(totalPrice);
      setShowFlywire(true);
      useCartStore.getState().clearCart();
    } catch (error) {
      alert("Booking failed: " + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    // For link_type_id 9 (stuba) items, show cancellation policy modal first
    const stubaItems = items.filter(item => item.link_type_id === 9 && item.hotel_info?.stuba_response);
    if (stubaItems.length > 0) {
      setShowCancellationModal(true);
      return;
    }

    await executePayment();
  };

  const closePopup = () => {
    localizedPush('/');
  };

  return (
    <>
      <Head>
        <script src="https://checkout.flywire.com/flywire-payment.js"></script>
      </Head>

      <>
   <div className="lg:col-span-2 space-y-2 md:space-y-4 md:mt-3 mt-1">
              <h2></h2>
              <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-0 mt-24 p-2">
    <div className="w-full  bg-surface rounded-xl p-2 shadow-md">
      <div className="md:p-4 p-2">
        <h2 className="md:text-lg text-md font-semibold mb-4">{t("personalInfo")}</h2>
        <form onSubmit={handlePayNow}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div>
              <label className="text-sm  text-muted-foreground flex items-center gap-3">
                <User className="w-4 h-4 text-muted-foreground" />
                {t("fullName")} <span className="text-destructive">*</span>
              </label>
              <input
                type="text"
                placeholder={t("placeholders.name")}
                value={name}
                onChange={e => {
                  setName(e.target.value);
                  setErrors(prev => ({ ...prev, name: undefined }));
                }}
                className={`w-full border border-border text-base rounded px-4 py-3 mt-1 focus:outline-none ${user ? 'bg-muted' : ''}`}
              />
              {errors.name && <p className="text-destructive text-xs mt-1">{t(errors.name)}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-sm  text-muted-foreground flex items-center gap-3">
                <Mail className="w-4 h-4 text-muted-foreground" />
                {t("email")} <span className="text-destructive">*</span>
              </label>
              <input
                type="email"
                placeholder={t("placeholders.email")}
                value={email}
                onChange={e => {
                  setEmail(e.target.value);
                  setErrors(prev => ({ ...prev, email: undefined }));
                }}
                readOnly={!!user}
                className={`w-full border border-border text-base rounded px-4 py-3 mt-1 focus:outline-none ${user ? 'bg-muted' : ''}`}
              />
              {errors.email && <p className="text-destructive text-xs mt-1">{t(errors.email)}</p>}
            </div>

            {/* Phone */}
            <div>
              <label className="text-sm  text-muted-foreground flex items-center gap-3">
                <Phone className="w-4 h-4 text-base text-muted-foreground" />
                {t("phoneNumber")} <span className="text-destructive">*</span>
              </label>
              <PhoneInput
                country={'sg'}
                value={phone}
                onChange={value => {
                  setPhone(value);
                  setErrors(prev => ({ ...prev, phone: undefined }));
                }}
                inputStyle={{
                  width: '100%',
                  borderRadius: '6px',
                  borderColor: '#D1D5DB',
                  backgroundColor: phone ? '#F3F4F6' : '',
                  padding: "22px 48px",
                  fontSize: "14px",
                }}
                containerStyle={{ width: '100%' }}
                inputProps={{
                  name: 'phone_number',
                  required: true,
                }}
              />
              {errors.phone && <p className="text-destructive text-xs mt-1">{t(errors.phone)}</p>}
            </div>
             {/* Preferred Communication */}
              {!user?.communication_mode && (
            <div>
              <label className="text-sm text-muted-foreground flex items-center gap-3">
                <MessageSquare className="w-4 h-4 text-muted-foreground" />
                Preferred Communication Mode
              </label>
              <div className="relative" ref={commModeRef}>
                <button
                  type="button"
                  onClick={() => setIsCommModeOpen(!isCommModeOpen)}
                  className="w-full border border-border text-base rounded px-4 py-2.5  focus:outline-none bg-surface flex justify-between items-center text-left"
                >
                  <span className={communicationMode ? 'text-foreground' : 'text-muted-foreground'}>
                    {communicationOptions.find(opt => opt.value === communicationMode)?.label || "Select option"}
                  </span>
                  <ChevronDown
                    className={`w-5 h-5 text-muted-foreground transition-transform ${
                      isCommModeOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {isCommModeOpen && (
                  <div className="absolute z-10 mt-1 w-full bg-surface border border-border rounded-md shadow-lg">
                    <ul>
                      {communicationOptions.map((option) => (
                        <li
                          key={option.value}
                          onClick={() => {
                            setCommunicationMode(option.value);
                            setIsCommModeOpen(false);
                          }}
                          className="px-4 py-2 text-base text-foreground cursor-pointer hover:bg-muted"
                        >
                          {option.label}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
   )}

            {/* Roaming Question */}
            <div className="md:col-span-2 mt-0">
              {(user?.roaming_enabled === undefined || user?.roaming_enabled === null) && (
              <>
              <label className="text-sm text-muted-foreground flex items-center gap-3">
                <Wifi className="w-4 h-4 text-muted-foreground" />
                Will you have roaming enabled during your trip?
              </label>
              <div className="flex gap-6 mt-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="radio"
                    name="roaming"
                    value="yes"
                    checked={hasRoaming === 'yes'}
                    onChange={e => setHasRoaming(e.target.value)}
                    className="form-radio h-4 w-4 text-primary focus:ring-primary border-border"
                  />
                  <span>Yes</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="roaming" value="no" checked={hasRoaming === 'no'} onChange={e => setHasRoaming(e.target.value)} className="form-radio h-4 w-4 text-primary focus:ring-primary border-border" />
                  <span>No</span>
                </label>
              </div>
               </>
              )}
            </div>
              
            {/* User Comment */}
            {hasLinkType10 && (
              <div className="md:col-span-2">
                <label className="text-sm text-muted-foreground flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-muted-foreground" />
                  Comment <span className="text-destructive">*</span>
                </label>
                <textarea
                  placeholder="Enter your comment..."
                  value={userComment}
                  onChange={e => {
                    setUserComment(e.target.value);
                    setErrors(prev => ({ ...prev, userComment: undefined }));
                  }}
                  rows={3}
                  className="w-full border border-border text-base rounded px-4 py-3 mt-1 focus:outline-none resize-none"
                />
                {errors.userComment && <p className="text-destructive text-xs mt-1">{errors.userComment}</p>}
              </div>
            )}

            {/* {!showPromoField && (
             <div>
                <label className="text-sm text-muted-foreground flex justify-between items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-muted-foreground" /> {t("promoCode")}
                  </span>
                  {/* <a href="#" className="text-sm text-primary underline">{t("findPromo")}</a>
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                 
                    type="text"
                    placeholder={t("placeholders.promo")}
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="w-full border border-border text-base rounded px-4 py-3 focus:outline-none"
                  />
                 <button
  type="button"
  className="bg-primary text-primary-foreground px-4 py-3 rounded-md hover:bg-primary-hover"
  onClick={async () => {
    if (!promo) return; 
    try {
      const payload = buildPromoPayload();
      console.log("Promo Payload:", payload);

   
      const res = await useBookingStore.getState().postfetchPromoCode(payload,promo);

      if (res?.success) {
        alert("Promo applied successfully!");
      } else {
        alert("Invalid promo code.");
      }
    } catch (err) {
      alert("Failed to apply promo: " + err.message);
    }
  }}
>
  {t("apply")}
</button>

                </div>
              </div>
            )} */}
         
          </div>

          {/* Payment Options */}
          {/* <div className="mt-6">
            <label className="text-sm font-medium text-muted-foreground flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-muted-foreground" />
              {t("paymentOptions")} <span className="text-destructive">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={paymentOptions.find(opt => (opt.value || opt.id) === paymentOption)?.name || ''}
              className="w-full border border-border text-sm rounded px-4 py-3 mt-2 focus:outline-none bg-muted"
            />
            {errors.paymentOption && <p className="text-destructive text-xs mt-1">{t(errors.paymentOption)}</p>}
          </div> */}

         
        </form>
        {/* {stripeOrderId && <CheckoutRedirect orderId={stripeOrderId} />} */}
      </div>
      
    </div>
    {isPopupVisible && <PopupMsg closePopup={closePopup} />}
  </div>
   {/* Submit */}
<div className="hidden lg:flex mt-8 py-2 p-2 justify-end">
  <button
    type="button"
    className="bg-primary text-primary-foreground text-sm font-semibold rounded-md px-10 py-3 transition hover:bg-primary-hover flex items-center justify-center min-w-[150px]"
    disabled={isSubmitting}
    onClick={handlePayNow}
  >
    {isSubmitting ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span>{t("processing")}</span>
      </>
    ) : (
      t("payNow")
    )}
  </button>
</div>
<div className="hidden lg:flex">
{/* <SecurePayment/> */}
</div>
            </div>          
            {/* Right sidee*/}
            <div className="relative">
              <div className=" space-y-2 md:mx-0 mx-2 md:space-y-6 mt-2 md:mt-8">
                <BookingPreviewSlider items={items} />
              </div>
            </div>
<div className="lg:hidden mt-0 md:mt-4  py-2 p-2 flex justify-end">
  <button
    type="button"
    className="bg-primary text-primary-foreground text-sm font-semibold rounded-md px-10 py-3 transition hover:bg-primary-hover flex items-center justify-center min-w-[150px]"
    disabled={isSubmitting}
    onClick={handlePayNow}
  >
    {isSubmitting ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-primary-foreground"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          ></circle>
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8v8H4z"
          ></path>
        </svg>
        <span>{t("processing")}</span>
      </>
    ) : (
      t("payNow")
    )}
  </button>
</div>
{/* <div className="lg:hidden flex">
<SecurePayment/>
</div> */}
</>
      {isPopupVisible && <PopupMsg closePopup={closePopup} />}
      
        {/* Cancellation Policy Modal for Stuba (link_type_id 9) */}
        <CancellationPolicyModal
          isOpen={showCancellationModal}
          onClose={() => setShowCancellationModal(false)}
          onConfirm={() => {
            setShowCancellationModal(false);
            executePayment();
          }}
          stubaItems={items.filter(item => item.link_type_id === 9 && item.hotel_info?.stuba_response)}
        />

        {/* Flywire Modal */}
        {showFlywire && returnOrderId && (
          <PayNowFlywire
            returnOrderId={returnOrderId}
            name={name}
            email={email}
            totalPrice={flywireTotal}
            branchId={2}
            onSuccess={() => {
              setShowFlywire(false);
              setIsPopupVisible(true);
            }}
            onFailure={(reason) => {
              alert(`${t("paymentFailed")} ${reason}`);
              setShowFlywire(false);
            }}
          />
        )}
    </>
  );
};

export default PayNow;