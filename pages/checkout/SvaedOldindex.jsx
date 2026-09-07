import React, { useState, useEffect } from 'react';
import PopupMsg from '@/components/common/PopupMsg';
import { useScrollToTop } from '@/hooks/use-scroll-top';
import useBookingStore from "@/store/userBookingStore";
import { useProductStore } from "@/store/useProductStore";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useAffiliateStore } from '@/store/useAffiliateStore';
import "@/styles/globals.css";
import { useCartStore } from "@/store/useCartStore";
import Layout from "@/components/layout/Layout"
import PayNowFlywire from '@/components/PayNowFlywire';
import Head from 'next/head';

const PayNow = ({  }) => {
     const { localizedPush } = useLocalizedRouter();
  useScrollToTop();
  const { items } = useCartStore();
  const submitBooking = useBookingStore(state => state.submitBooking);
  const getPaymentOptions = useBookingStore(state => state.getPaymentOptions);
const { refId, refType ,track_agent_id } = useAffiliateStore();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [promoAvailable, setPromoAvailable] = useState(false);
const [returnOrderId, setReturnOrderId] = useState(null);
const [showFlywire, setShowFlywire] = useState(false);
const [flywireTotal, setFlywireTotal] = useState(null);  
// Form field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [promo, setPromo] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [errors, setErrors] = useState({});
useEffect(() => {
    if (items.length === 0) {
      router.replace("/"); 
    }
  }, [items]);
  useEffect(() => {
    const fetchOptions = async () => {
      try {
      const firstProductId = items[0]?.tourId;
      if (!firstProductId) return;

      const res = await getPaymentOptions(firstProductId);
        setPaymentOptions(res?.data?.paymentmethods || []);
        setPromoAvailable(!!res?.data?.promo_available); 
      } catch (err) {
        setPaymentOptions([]);
        setPromoAvailable(false);
      }
    };
    fetchOptions();
  }, [getPaymentOptions]);

  // Validation
  const validate = () => {
    const errs = {};
    if (!name.trim()) errs.name = "Name is required";
    else if (!/^[A-Za-z\s]+$/.test(name.trim())) errs.name = "Name must contain only letters and spaces";
    if (!email.trim()) errs.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = "Invalid email";
    if (!phone.trim()) errs.phone = "Phone number is required";
    else if (!/^\+?\d{7,15}$/.test(phone)) errs.phone = "Invalid phone number";
    if (!paymentOption) errs.paymentOption = "Payment option is required";
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const buildFinalPayload = () => {
     let productId = null;
        if (typeof window !== "undefined") {
          const match = window.location.pathname.match(/product\/(\d+)/);
          if (match) productId = match[1];
        }
    const [firstName = '', lastName = ''] = name.split(" ");
 const cart_items = items.map(item => ({
  adult_count: item.adults || 0,
  child_count: item.child || 0,
  dropoff_point: item.hotelName || '', // in trasfer passing
  flight_number: '',  // in trasfer passing
  operator_email: 'operator@example.com',
  operator_id: '12345', 
  pickup_date: item.selectedDate,
  pickup_point: item.hotelName || '',
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
  two_way_dropoff_time: '' // in trasfer passing
}));

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
        currency: 'USD',
        charge_for: 'order',
        token: '',
        xendit_authentication_id: ''
      },
      payment_mode: 2,
      client_id: '',
      agent_id: '',
      source: 'Direct',
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

const handlePayNow = async (e) => {
  e.preventDefault();
  if (!validate()) return;

  const finalPayload = buildFinalPayload();

  try {
    const response = await submitBooking(finalPayload);
    const orderId = response?.order_id; 
const totalPrice = response?.total_price;

   const creditCardOption = paymentOptions.find(opt => opt.name === "Credit Card");
if (paymentOption == creditCardOption?.id) {
    setReturnOrderId(orderId);
setFlywireTotal(totalPrice);
      setShowFlywire(true); 
      useCartStore.getState().clearCart();
  // alert("Order ID: " + orderId);
    } else {

    setIsPopupVisible(true);
   }
  } catch (error) {
    alert("Booking failed: " + error.message);
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
   <Layout>
     <div className="flex flex-col lg:flex-row gap-8 max-w-full md:mx-24 mx-2 mt-24 p-2 md:p-12">
      <div className="w-full lg-w-2/3 bg-surface rounded-xl p-2 shadow-md">
        <div className='p-5'>
          <h2 className="text-xl font-semibold mb-4">Personal Information2</h2>
          <form onSubmit={handlePayNow}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              <div>
                <label className="text-sm font-medium">Name <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  placeholder="David Emmett"
                  value={name}
                  onChange={e => {
    setName(e.target.value);
    setErrors(prev => ({ ...prev, name: undefined })); 
  }}
                  className="w-full border border-border rounded-lg px-3 py-2 mt-1"
                  required
                />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Email <span className="text-red-500">*</span></label>
                <input
                  type="email"
                  placeholder="davidemmett@gmail.com"
                  value={email}
                 onChange={e => {
    setEmail(e.target.value);
    setErrors(prev => ({ ...prev, email: undefined }));
  }}
                  className="w-full border border-border rounded-lg px-3 py-2 mt-1"
                  required
                />
                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
              </div>
              <div>
                <label className="text-sm font-medium">Phone Number <span className="text-red-500">*</span></label>
               <PhoneInput
                  country={'us'}
                   value={phone}
                 onChange={value => {
    setPhone(value);
    setErrors(prev => ({ ...prev, phone: undefined }));
  }}
                  required
                  inputStyle={{
                    width: '100%',
                    borderRadius: '4px',
                    borderColor: '#D1D5DB',
                    padding: "12px 42px"
                  }}
                  containerStyle={{ width: '100%' }}
                  inputProps={{
                    name: 'phone_number',
                    required: true,
                  }}
                />
                {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
              </div>
              {promoAvailable && (
                <div>
                  <label className="text-sm font-medium flex justify-between items-center">
                    Promo Code
                    <a href="#" className="text-sm text-[#FE6F4F] underline">Find Promo Code?</a>
                  </label>
                  <input
                    type="text"
                    placeholder="Promo Code"
                    value={promo}
                    onChange={(e) => setPromo(e.target.value)}
                    className="w-full border border-border rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              )}
            </div>

            <div className='mt-4 '>
              <label className="text-sm font-medium">Payment Options <span className="text-red-500">*</span></label>
              <select
                value={paymentOption}
              onChange={e => {
    setPaymentOption(e.target.value);
    setErrors(prev => ({ ...prev, paymentOption: undefined }));
  }}
                className="w-full border border-border rounded-lg px-3 py-2 mt-4"
                
              >
                <option value="">Select Payment Option</option>
                {paymentOptions.map((option) => (
                  <option key={option.id || option.value} value={option.value || option.id}>
                    {option.label || option.name}
                  </option>
                ))}
              </select>
              {errors.paymentOption && <p className="text-red-500 text-xs mt-1">{errors.paymentOption}</p>}
            </div>
            <div className="mt-6">
              <button
                className="w-full bg-[#FE6F4F] hover:bg-[#FE6F4F] text-white font-medium py-2 rounded-full"
                type="submit"
              >
                Pay Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side */}
    {/* <div className="relative lg:w-1/3 min-h-[500px] flex-shrink-0 bg-surface rounded-xl p-6 shadow-md transition-all duration-300 ease-in-out">

      <BookingPreviewSlider
  items={items}
/>
</div> */}
      {/* Popup Message */}
      {isPopupVisible && (
        <PopupMsg closePopup={closePopup} />
      )}
    </div>
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
      alert(`Payment ${reason}`);
      setShowFlywire(false);
    }}
  />
)}
   </Layout>
   </>
  );
};

export default PayNow;