import React, { useState, useEffect } from 'react';
import PopupMsg from '@/components/common/PopupMsg';
import { useScrollToTop } from '@/hooks/use-scroll-top';
import useBookingStore from "@/store/userBookingStore";
import { ChevronLeft } from 'lucide-react';
import { useProductStore } from "@/store/useProductStore";
import { getFullImageUrl } from '@/utils/imageService';
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import { useRouter } from "next/router";
import { useAffiliateStore } from '@/store/useAffiliateStore';

const PayNow = ({ bookingDetails, onBack }) => {
    const router = useRouter();
  useScrollToTop();
  const submitBooking = useBookingStore(state => state.submitBooking);
  const getPaymentOptions = useBookingStore(state => state.getPaymentOptions);
const { refId, refType ,track_agent_id } = useAffiliateStore();

  const [isPopupVisible, setIsPopupVisible] = useState(false);
  const [paymentOptions, setPaymentOptions] = useState([]);
  const [promoAvailable, setPromoAvailable] = useState(false);

  // Form field states
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [promo, setPromo] = useState('');
  const [paymentOption, setPaymentOption] = useState('');
  const [errors, setErrors] = useState({});

  // product info & pricing
  const { bookedProductDetail, tieredPricingData } = useProductStore();
  const product = bookedProductDetail?.data?.basicinfo?.product_description || "Product";
  const img = bookedProductDetail?.data?.basicinfo?.images?.[0]?.image || "img";
  const pricingList = tieredPricingData?.tieredPricing?.data?.product_pricing || [];

  // Get counts 
  const adultCount = bookingDetails?.adults || 0;
  const childCount = bookingDetails?.child || 0;
  const totalPax = adultCount + childCount;

  // Find tier
  const selectedTier = pricingList.find(
    tier => totalPax >= Number(tier.min_pax) && totalPax <= Number(tier.max_pax)
  ) || pricingList[0] || {};

  //promo price/normal price
  const adultPrice = selectedTier.adult_promo_price > 0 ? selectedTier.adult_promo_price : selectedTier.adult_price ||0;
  const childPrice = selectedTier.child_promo_price > 0 ? selectedTier.child_promo_price : selectedTier.child_price || 0;

  const totalAdult = adultCount * adultPrice;
  const totalChild = childCount * childPrice;
  const total = totalAdult + totalChild;
  // Fetch payment options and promo availability
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Extract product ID from the URL if available
        let productId = null;
        if (typeof window !== "undefined") {
          const match = window.location.pathname.match(/product\/(\d+)/);
          if (match) productId = match[1];
        }
        const res = await getPaymentOptions(productId);
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
    const cartItem = {
      adult_count: bookingDetails.adults || "",
      child_count: bookingDetails.child || "",
      dropoff_point: bookingDetails.dropoffPoint,
      flight_number: bookingDetails.flightArrivalNumber || '',
      operator_email: bookingDetails.operatorEmail || 'operator@example.com',
      operator_id: bookingDetails.operatorId || '12345',
      pickup_date: bookingDetails.desiredPickupDate || bookingDetails.date,
      pickup_point: bookingDetails.pickupPoint || bookingDetails.hotel,
      pickup_time: bookingDetails.pickupTime || bookingDetails.time,
       product_id: productId,
      total: total,
      tour_date: bookingDetails.date,
      tourplan_hotel_id: bookingDetails.hotelId || '789',
      vehicle_id: bookingDetails.vehicleId || 'V102',
      transfer_type: bookingDetails.transferType,
      flight_dep_number: bookingDetails.flightDepartureNumber || '',
      flight_estimated_time: bookingDetails.flightArrivalTime || '',
      flight_dep_estimated_time: bookingDetails.flightDepartureTime || '',
      two_way_dropoff_date: bookingDetails.returnDate || '',
      two_way_dropoff_time: bookingDetails.returnTime || '',
    };
    const payload = {
      cart_items: [cartItem],
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
      payment_mode: 3,
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
      useProductStore.getState().setPersonalInfo(finalPayload?.cart_items);
      setIsPopupVisible(true);
    } catch (error) {
      alert("Booking failed: " + error.message);
    }
  };

  const closePopup = () => {
    router.push('/');
   };
  return (
    <div className="flex flex-col lg:flex-row gap-8 max-w-full md:mx-24 mx-2 mt-6 p-2 md:p-12">
      <div className="w-full lg:w-2/3 bg-white rounded-xl p-2 shadow-md">
        <div>
          <button
            onClick={onBack}
            className="mb-4 flex items-center px-5 py-2 border border-gray-400 rounded-full text-gray-600 hover:bg-gray-100"
          >
            <ChevronLeft />
            Back
          </button>
        </div>
        <div className='p-5'>
          <h2 className="text-xl font-semibold mb-4">Personal Information1</h2>
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
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
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
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
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-1"
                  />
                </div>
              )}
            </div>

            {/* <h2 className="text-xl font-semibold mt-8">Payment Information</h2> */}
            <div className='mt-4 '>
              <label className="text-sm font-medium">Payment Options <span className="text-red-500">*</span></label>
              <select
                value={paymentOption}
              onChange={e => {
    setPaymentOption(e.target.value);
    setErrors(prev => ({ ...prev, paymentOption: undefined }));
  }}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 mt-4"
                
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
                className="w-full bg-[#CC9A55] text-white font-medium py-2 rounded-full"
                type="submit"
              >
                Pay Now
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Right Side */}
      <div className="w-full lg:w-1/3 bg-white rounded-xl p-6 shadow-md">
        <img
          src={getFullImageUrl(img)}
          alt="Product"
          className="rounded-lg mb-4 h-40 object-cover w-full"
        />
        <h3 className="text-lg font-semibold line-clamp-2 truncate mb-1">{product?.title}</h3>
        <p className="text-sm text-gray-500 mb-3">{bookingDetails?.date}</p>
        <div className="text-sm text-gray-800">
          <div className="flex justify-between mb-1">
            <span>{adultCount} Adults</span>
            <span>SGD {totalAdult}</span>
          </div>
          <div className="flex justify-between mb-1">
            <span>{childCount} Child{childCount !== 1 ? "ren" : ""}</span>
            <span>SGD {totalChild}</span>
          </div>
        </div>
        <div className="border-t mt-4 pt-4 flex justify-between text-lg font-semibold">
          <span>Total</span>
          <span className="text-[#CC9A55]">SGD {total}</span>
        </div>
        <div className="flex justify-center mt-4">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744797488/External+Links/yrgzbjyvjvyziduap2zr.svg`}
            alt="Tour"
            className="rounded-lg mb-4 h-28 object-cover w-32 opacity-30 my-12"
          />
        </div>
      </div>

      {/* Popup Message */}
      {isPopupVisible && (
        <PopupMsg closePopup={closePopup} />
      )}
    </div>
  );
};

export default PayNow;