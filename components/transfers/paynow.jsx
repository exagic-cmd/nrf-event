// components/transfers/paynow.jsx
import React, { useState, useEffect } from 'react';
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
import { User, Mail, Phone, Tag, CreditCard } from "lucide-react";
import { useTranslation } from "next-i18next";
import useLanguageStore from "@/store/useLanguageStore";
import { redirectToAirwallexCheckout } from '@/utils/airwallex';
import CheckoutRedirect from "@/components/stripe/CheckoutRedirect";
import BookingPreviewSlider from "@/components/transfers/BookingPreviewSlider";
import useUserStore from '@/store/useAuthStore';
import { useEventStore } from "@/store/useEventStore";
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
  const { user } = useUserStore.getState();
  const { event } = useEventStore();
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [showPromoField, setShowPromoField] = useState(false);
  const [stripeOrderId, setStripeOrderId] = useState(null);
  const [flywireTotal, setFlywireTotal] = useState(null);
  const [showFlywire, setShowFlywire] = useState(false);
  const [returnOrderId, setReturnOrderId] = useState(null);
  // Form fields
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState(user?.phone || "");
  const [promo, setPromo] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });

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

  useEffect(() => {
    const hasPendingPayment = typeof window !== "undefined" && !!localStorage.getItem("pendingPaymentOrderId");
    if (items.length === 0 && !hasPendingPayment) {
      localizedPush("/");
    }
  }, [items, localizedPush]);

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const firstProductId = items[0]?.tourId || items[0]?.id;
        if (!firstProductId) return;

        const res = await getPaymentOptions(firstProductId, 1);
        setPaymentOptions(res?.data?.paymentmethods || []);
      } catch (err) {
        setPaymentOptions([]);
        setShowPromoField(false);
      }
    };
    fetchOptions();
  }, [getPaymentOptions, languageId, items]);

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
    else if (!/^\+?\d{7,15}$/.test(phone)) errs.phone = "validation.phoneInvalid";

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

    console.log("Building cart item for:", item);

    // For accommodation items, use the existing structure from cart
    if (isAccommodation) {
      return {
        product_id: item.product_id || item.tourId || item.id,
        category_id: 4,
        adult_count: item.adult_count || item.guests || 0,
        child_count: item.child_count || 0,
        total: item?.price ?? 0,
        tour_date: item.tour_date || item.checkIn||"20-11-2025",
        check_in: item.check_in || item.checkIn,
        check_out: item.check_out || item.checkOut,
        nights: item.nights || 1,
        roomType: item.roomType,
        mealType: item.mealType,
        quoteId: item.quoteId,
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
    else if (isTransfer) {
      // ... keep your existing transfer logic unchanged ...
      return {
        product_id: item.tourId,
        adult_count: item.passengers || 0,
        child_count: item.children || 0,
        total: typeof item.pricing === 'number' ? item.pricing : item.pricing?.total || 0,
        tour_date: item.selectedDate || item.pickupDate || currentDate,
        pickup_date: item.selectedDate || item.pickupDate || currentDate,
        pickup_time: item.pickupTime || item.selectedTime || item.pickupFlightScheduleTime || "",
        pickup_point: item.pickup || item.pickup?.name || item.searchParams?.pickup?.name || "",
        pickup_point_id: item.vehicle?.pickup_point_id || item.pickup?.id || item.searchParams?.pickup?.id || "",
        dropoff_point_id: item.vehicle?.dropoff_point_id || item.dropoff?.id || item.searchParams?.dropoff?.id || "",
        two_way_pickup_point_id: item.returnPickup?.id || item.vehicle?.dropoff_point_id || item.searchParams?.returnPickup?.id || "",
        two_way_dropoff_point_id: item.returnDropoff?.id || item.vehicle?.pickup_point_id || item.searchParams?.returnDropoff?.id || "",
        feature_type_id: item.vehicle?.feature_type_id || 1,
        flight_estimated_time: item.pickupFlightScheduleTime || "",
        flight_dep_estimated_time: item.returnFlightScheduleTime || item.flightDepEstimatedTime || "",
        dropoff_point: item.dropoff || item.dropoff?.name || item.searchParams?.dropoff?.name || "",
        vehicle_id: item.vehicle?.vehicle_id || item.vehicle?.id || "",
        transfer_type: item.transferType || item.tripType || "",
        flight_number: item.pickupFlightNumber || "",
        flight_dep_number: item.returnFlightNumber || "",
        two_way_dropoff_date: item.returnDate || "",
        two_way_dropoff_time: item.returnTime || item.flightDepEstimatedTime || "",
        baggage: item.baggage || 0,
        pickup_surcharge: item.pickupSurcharge || 0,
        return_surcharge: item.returnSurcharge || 0,
        return_surcharge_id: item.returnSurchargeId || 0,
        pickup_surcharge_id: item.pickupSurchargeId || 0,
        addons: item.addons || [],
        addons_round: item.addons_round || [],
        exceptions: item.exceptions || []
      };
    }

    // === DAY TOUR / UPSELL ===
    // ... keep your existing day tour/upsell logic unchanged ...
    else if(!isTransfer && !isAccommodation) {
    return {
      adult_count: item.adults || 0,
      child_count: item.child || 0,
      dropoff_point: item.hotelName || item.searchParams?.dropoff?.name || '',
      flight_number: item.pickupFlightNumber || '',
      operator_email: 'operator@example.com',
      operator_id: '12345',
      pickup_date: allUpsell ? currentDate : (transferItem?.selectedDate || transferItem?.pickupDate || currentDate),
      pickup_point: item.hotelName || item.searchParams?.pickup?.name || '',
      pickup_point_id: item.vehicle?.pickup_point_id || item.pickup?.id || item.searchParams?.pickup?.id || "",
      dropoff_point_id: item.vehicle?.dropoff_point_id || item.dropoff?.id || item.searchParams?.dropoff?.id || "",
      two_way_pickup_point_id: item.returnPickup?.id || item.vehicle?.dropoff_point_id || item.searchParams?.returnPickup?.id || "",
      two_way_dropoff_point_id: item.returnDropoff?.id || item.vehicle?.pickup_point_id || item.searchParams?.returnDropoff?.id || "",
      feature_type_id: item.vehicle?.feature_type_id || 1,
      flight_estimated_time: item.pickupFlightScheduleTime || item.flightEstimatedTime || "",
      flight_dep_estimated_time: item.returnFlightScheduleTime || item.flightDepEstimatedTime || "",
      pickup_time: item.selectedTime,
      product_id: item.tourId,
      total: item.pricing?.total || 0,
      tour_date: allUpsell ? currentDate : (transferItem?.selectedDate || transferItem?.pickupDate || currentDate),
      tourplan_hotel_id: '789',
      vehicle_id: 'V102',
      transfer_type: '',
      flight_dep_number: '',
      flight_estimated_time: '',
      flight_dep_estimated_time: '',
      two_way_dropoff_date: '',
      two_way_dropoff_time: '',
      baggage: item.baggage || 0,
      pickup_surcharge: item.pickupSurcharge || 0,
      return_surcharge: item.returnSurcharge || 0,
      return_surcharge_id: item.returnSurchargeId || 0,
      pickup_surcharge_id: item.pickupSurchargeId || 0,
      addons: item.addons || [],
      addons_round: item.addons_round || [],
      exceptions: item.exceptions || [],
    };
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
      contactNumber: phone
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
    track_agent_id: track_agent_id || null
  };

  return payload;
};

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalPayload = buildFinalPayload();
      console.log("Final Payload for submitBooking:", finalPayload);
      const response = await submitBooking(finalPayload);
      const orderId = response?.order_id;
      const totalPrice = response?.total_price;
      console.log('submitBooking response:', response, 'orderId:', orderId, 'selected paymentOption:', paymentOption);

      const creditCardOption = paymentOptions.find(opt => opt.name === "Credit Card" || opt.id === 2);

    if (paymentOption == creditCardOption?.id) {
         setReturnOrderId(orderId);
         setFlywireTotal(totalPrice);
         setShowFlywire(true); 
         useCartStore.getState().clearCart();
        } else {
    
        setIsPopupVisible(true);
       }
      } catch (error) {
        alert("Booking failed: " + error.message);
      } finally {
        setIsSubmitting(false);
      }
    };

  const closePopup = () => {
    localizedPush('/');
  };

  return (
    <>
      <Head>
        <script src="https://checkout.flywire.com/flywire-payment.js"></script>
      </Head>

      <div className="lg:col-span-12 space-y-2 md:space-y-4 md:mt-3 mt-1">
        <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-0 mt-24 p-2">
          {/* Left: Form */}
          <div className="w-full lg:w-2/3 bg-white rounded-xl p-2 shadow-md">
            <div className="md:p-4 p-2">
              <h2 className="md:text-lg text-md text-[#D3202D] font-semibold mb-4">{t("personalInfo")}</h2>
              <form onSubmit={handlePayNow}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Name */}
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-3">
                      <User className="w-4 h-4 text-[#D3202D]" />
                      {t("fullName")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      placeholder={t("placeholders.name")}
                      value={name}
                      onChange={e => {
                        setName(e.target.value);
                        setErrors(prev => ({ ...prev, name: undefined }));
                      }}
                      className="w-full border border-gray-300 text-base rounded px-4 py-3 mt-1 focus:outline-none"
                    />
                    {errors.name && <p className="text-red-500 text-xs mt-1">{t(errors.name)}</p>}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#D3202D]" />
                      {t("email")} <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="email"
                      placeholder={t("placeholders.email")}
                      value={email}
                      onChange={e => {
                        setEmail(e.target.value);
                        setErrors(prev => ({ ...prev, email: undefined }));
                      }}
                      className="w-full border border-gray-300 text-base rounded px-4 py-3 mt-1 focus:outline-none"
                    />
                    {errors.email && <p className="text-red-500 text-xs mt-1">{t(errors.email)}</p>}
                  </div>

                  {/* Phone */}
                  <div>
                    <label className="text-sm text-gray-500 flex items-center gap-3">
                      <Phone className="w-4 h-4 text-[#D3202D]" />
                      {t("phoneNumber")} <span className="text-red-500">*</span>
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
                        padding: "22px 48px",
                        fontSize: "14px",
                      }}
                      containerStyle={{ width: '100%' }}
                      inputProps={{ name: 'phone_number', required: true }}
                    />
                    {errors.phone && <p className="text-red-500 text-xs mt-1">{t(errors.phone)}</p>}
                  </div>
                </div>
              </form>

              {stripeOrderId && <CheckoutRedirect orderId={stripeOrderId} />}
            </div>
          </div>

          {/* Right: Preview */}
          <div className="relative">
            <div className="space-y-2 md:mx-0 mx-2 md:space-y-6 mt-2 md:mt-8">
              <BookingPreviewSlider items={items} />
            </div>
          </div>
        </div>

        {/* Pay Now Button - Desktop */}
        <div className="hidden lg:flex mt-8 bg-[#D0E9FF] py-2 p-2 justify-end">
          <button
            type="button"
            className="bg-[#D3202D] text-white text-sm font-semibold rounded-md px-10 py-3 transition flex items-center justify-center min-w-[150px]"
            disabled={isSubmitting}
            onClick={handlePayNow}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{t("processing")}</span>
              </>
            ) : (
              t("payNow")
            )}
          </button>
        </div>

        {/* Pay Now Button - Mobile */}
        <div className="lg:hidden mt-0 md:mt-4 bg-[#D0E9FF] py-2 p-2 flex justify-end">
          <button
            type="button"
            className="bg-[#D3202D] text-white text-sm font-semibold rounded-md px-10 py-3 transition flex items-center justify-center min-w-[150px]"
            disabled={isSubmitting}
            onClick={handlePayNow}
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
                </svg>
                <span>{t("processing")}</span>
              </>
            ) : (
              t("payNow")
            )}
          </button>
        </div>
      </div>

      {isPopupVisible && <PopupMsg closePopup={closePopup} />}
      
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