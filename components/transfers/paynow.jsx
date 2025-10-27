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
import { init } from '@airwallex/components-sdk';
import { redirectToAirwallexCheckout } from '@/utils/airwallex';
import CheckoutRedirect from "@/components/stripe/CheckoutRedirect";
import BookingPreviewSlider from "@/components/transfers/BookingPreviewSlider";
import useUserStore from '@/store/useAuthStore';
const PayNow = ({ totalPrice }) => {
  const { t } = useTranslation("daytour");
   const { languageId, currentLocale } = useLanguageStore.getState();
  const { localizedPush } = useLocalizedRouter();

      const router = useRouter();
  useScrollToTop();
  const { items } = useCartStore();
  const submitBooking = useBookingStore(state => state.submitBooking);
  const getPaymentOptions = useBookingStore(state => state.getPaymentOptions);
  const getPromoExist = useBookingStore(state => state.getPromoExist);
const { refId, refType ,track_agent_id } = useAffiliateStore();
const { user } = useUserStore.getState(); 
  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [showPromoField, setShowPromoField] = useState(false); 
  const [stripeOrderId, setStripeOrderId] = useState(null);
// Form field states
 const [name, setName] = useState(user?.name || "");
const [email, setEmail] = useState(user?.email || "");
const [phone, setPhone] = useState(user?.phone || "");
  const [promo, setPromo] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [promoMessage, setPromoMessage] = useState({ text: '', type: '' });
  useEffect(() => {
    const hasPendingPayment =
      typeof window !== "undefined" &&
      !!localStorage.getItem("pendingPaymentOrderId");
    if (items.length === 0 && !hasPendingPayment) {
      localizedPush("/");
    }
  }, [items, localizedPush]);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
      const firstProductId = items[0]?.tourId||items[0]?.id ;
      if (!firstProductId) return;

      const res = await getPaymentOptions(firstProductId,1);
        setPaymentOptions(res?.data?.paymentmethods || []);
        // if (getPromoExist) {
        //   const shouldShow = await getPromoExist();
        //   setShowPromoField(shouldShow);
        // }
      } catch (err) {
        setPaymentOptions([]);
        setShowPromoField(false);
      }
    };
    fetchOptions();
  }, [getPaymentOptions,languageId]);
 // }, [getPaymentOptions,languageId,getPromoExist]);

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

  // if (!paymentOption) errs.paymentOption = "validation.paymentOption";

  setErrors(errs);
  return Object.keys(errs).length === 0;
};

const buildPromoPayload = () => {
  const itinerary = items.map(item => {
    return {
      product_id: item.tourId || item.id, 
      total_pax: (item.passengers || 0) + (item.children || 0) + (item.pax || 0) + (item.child || 0),
      total_price: typeof item.pricing === "number" ? item.pricing : item.pricing?.total || item.price || 0
    };
  });

  return {
    promo_code: promo,
    itinerary
  };
};


  const buildFinalPayload = () => {
     let productId = null;
        if (typeof window !== "undefined") {
          const match = window.location.pathname.match(/product\/(\d+)/);
          if (match) productId = match[1];
        }
    const [firstName = '', lastName = ''] = name.split(" ");
const transferItem = items.find(item => item.type !== "upsell" && (item.selectedDate || item.pickupDate));
  const allUpsell = items.every(item => item.type === "upsell");
  const currentDate = new Date().toISOString().slice(0, 10);

  const cart_items = items.map(item => {
    const isTransfer = item.vehicle !== undefined || item.transferType || item.tripType;
    const transferDate = transferItem?.selectedDate || transferItem?.pickupDate || currentDate;

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
//     if (item.type === "upsell") {
//       return {
       
//         pickup_date: allUpsell
//           ? currentDate
//           : transferDate, 
//            tour_date: allUpsell
//           ? currentDate
//           : transferDate, 
//   adult_count: item.pax || 0,
//   child_count: item.child || 0,
//   dropoff_point:  item.hotelName ||item.searchParams?.dropoff?.name || '',
//       flight_number: item.pickupFlightNumber || '',
//   operator_email: 'operator@example.com',
//   operator_id: '12345', 
//   //pickup_date: item.selectedDate,
//   pickup_point: item.hotelName || item.searchParams?.pickup?.name || '',
//   pickup_time: item.selectedTime,
//   product_id: item.id,
//   total: item.price || 0,
//   tourplan_hotel_id: '789', 
//   vehicle_id: 'V102', 
//   transfer_type: '', // in trasfer passing
//   flight_dep_number: '', // in trasfer passing
//   flight_estimated_time: '', // in trasfer passing
//   flight_dep_estimated_time: '', // in trasfer passing
//   two_way_dropoff_date: '', // in trasfer passing
//   two_way_dropoff_time: '', // in trasfer passing,
//   baggage: item.baggage || 0,
//     pickup_surcharge: item.pickupSurcharge || 0,
//     return_surcharge: item.returnSurcharge || 0,
//     return_surcharge_id: item.returnSurchargeId || 0,
//     pickup_surcharge_id: item.pickupSurchargeId || 0,
//     addons: addonsPayload,           
//     addons_round: addonsRoundPayload ,
//     exceptions: exceptionsPayload,
//     };
//     }
  if (isTransfer) {
    return {
  product_id: item.tourId,
  adult_count: item.passengers || 0,
  child_count: item.children || 0,
  total: typeof item.pricing === 'number' ? item.pricing : item.pricing?.total || 0,
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
  transfer_type: item.transferType || item.tripType || "",
  flight_number: item.pickupFlightNumber || "",
  flight_dep_number: item.returnFlightNumber || "",
  two_way_dropoff_date: item.returnDate || "",
  two_way_dropoff_time: item.returnTime ||item.flightDepEstimatedTime|| "",
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
  else {
    return {
  adult_count: item.adults || 0,
  child_count: item.child || 0,
  dropoff_point:  item.hotelName ||item.searchParams?.dropoff?.name || '',
      flight_number: item.pickupFlightNumber || '',
  operator_email: 'operator@example.com',
  operator_id: '12345', 
  pickup_date: item.selectedDate,
  pickup_point: item.hotelName || item.searchParams?.pickup?.name || '',
   pickup_point_id:
      item.vehicle?.pickup_point_id ||
      item.pickup?.id ||
      item.searchParams?.pickup?.id ||
      "",
      dropoff_point_id:
      item.vehicle?.dropoff_point_id ||
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
});

    const payload = {
      cart_items: cart_items,
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
       source_link:"Airport Transfers",
      promo_id: promo || '',
      discount: '',
      session_id: 'vutxsweygb',
      customer_type: 'potential_customer',
      visitor_number: 'V68261',
      redemption_voucher_id: 0,
       agent_id: refId || null,
        ref_type: refType || null,
        track_agent_id:track_agent_id || null
    };
    return payload;
  };

  const handleAirwallexCheckout = async (orderId) => {
    await redirectToAirwallexCheckout(orderId);
  };

  const handlePayNow = async (e) => {
    e.preventDefault();
    if (!validate() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const finalPayload = buildFinalPayload();

      const response = await submitBooking(finalPayload);
      const orderId = response?.order_id;

      const creditCardOption = paymentOptions.find(
        opt => opt.name === "Credit Card" || opt.id === 2
      );

      if (paymentOption == creditCardOption?.id) {
        localStorage.setItem("pendingPaymentOrderId", orderId);
        setStripeOrderId(orderId);
       // useCartStore.getState().clearCart();

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
  <>
   <div className="lg:col-span-2 space-y-2 md:space-y-4 md:mt-3 mt-1">
              <h2></h2>
              <div className="flex flex-col lg:flex-row gap-8 max-w-full mx-0 mt-24 p-2">
    <div className="w-full lg-w-2/3 bg-white rounded-xl p-2 shadow-md">
      <div className="md:p-4 p-2">
        <h2 className="md:text-lg text-md font-semibold mb-4">{t("personalInfo")}</h2>
        <form onSubmit={handlePayNow}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Name */}
            <div>
              <label className="text-sm  text-gray-500 flex items-center gap-3">
                <User className="w-4 h-4 text-gray-400" />
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
              <label className="text-sm  text-gray-500 flex items-center gap-3">
                <Mail className="w-4 h-4 text-gray-400" />
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
              <label className="text-sm  text-gray-500 flex items-center gap-3">
                <Phone className="w-4 h-4 text-base text-gray-400" />
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
                inputProps={{
                  name: 'phone_number',
                  required: true,
                }}
              />
              {errors.phone && <p className="text-red-500 text-xs mt-1">{t(errors.phone)}</p>}
            </div>
            {/* {!showPromoField && (
             <div>
                <label className="text-sm text-gray-500 flex justify-between items-center gap-3">
                  <span className="flex items-center gap-1">
                    <Tag className="w-4 h-4 text-gray-400" /> {t("promoCode")}
                  </span>
                  {/* <a href="#" className="text-sm text-[#CC9A55] underline">{t("findPromo")}</a> 
                </label>
                <div className="flex items-center gap-2 mt-1">
                  <input
                 
                    type="text"
                    placeholder={t("placeholders.promo")}
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="w-full border border-gray-300 text-base rounded px-4 py-3 focus:outline-none"
                  />
                 <button
  type="button"
  className="bg-[#CC9A55] text-white px-4 py-3 rounded-md"
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
            <label className="text-sm font-medium text-gray-500 flex items-center gap-3">
              <CreditCard className="w-4 h-4 text-gray-400" />
              {t("paymentOptions")} <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              readOnly
              value={paymentOptions.find(opt => (opt.value || opt.id) === paymentOption)?.name || ''}
              className="w-full border border-gray-300 text-sm rounded px-4 py-3 mt-2 focus:outline-none bg-gray-100"
            />
            {errors.paymentOption && <p className="text-red-500 text-xs mt-1">{t(errors.paymentOption)}</p>}
          </div> */}

         
        </form>
        {stripeOrderId && <CheckoutRedirect orderId={stripeOrderId} />}
      </div>
      
    </div>
    {isPopupVisible && <PopupMsg closePopup={closePopup} />}
  </div>
   {/* Submit */}
<div className="hidden lg:flex mt-8 bg-black py-2 p-2 justify-end">
  <button
    type="button"
    className="bg-[#CC9A55] text-white text-sm font-semibold rounded-md px-10 py-3 transition flex items-center justify-center min-w-[150px]"
    disabled={isSubmitting}
    onClick={handlePayNow}
  >
    {isSubmitting ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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
            </div>          
            {/* Right sidee*/}
            <div className="relative">
              <div className=" space-y-2 md:mx-0 mx-2 md:space-y-6 mt-2 md:mt-8">
                <BookingPreviewSlider items={items} />
              </div>
            </div>
<div className="lg:hidden mt-0 md:mt-4 bg-black py-2 p-2 flex justify-end">
  <button
    type="button"
    className="bg-[#CC9A55] text-white text-sm font-semibold rounded-md px-10 py-3 transition flex items-center justify-center min-w-[150px]"
    disabled={isSubmitting}
    onClick={handlePayNow}
  >
    {isSubmitting ? (
      <>
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
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

</>
   </>
  );
};

export default PayNow;