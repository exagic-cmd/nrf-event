import React, { useState, useEffect ,useCallback } from "react";
import Layout from "@/components/layout/Layout";
import { useTransferStore } from "@/store/useTransferStore";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import { format } from "date-fns";
import BookingTransferInfo from "@/components/transfers/detail/BookingTransferInfo";
import BaggagePassengerSelector from "@/components/transfers/detail/BaggageSelector";
import VehicleSummary from "@/components/transfers/detail/VehicleSummary";
import CartDrawerContent from "@/components/common/CartDrawerContent";
import { Check } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import Loading2Svg from "@/components/common/Loader2Svg";
import AlreadyModal from "@/components/transfers/detail/AlreadyCartModal" 
import RouteSummary from "@/components/transfers/detail/RouteSummary";
import { useLocalizedRouter } from "@/components/localizedRouter";
import TransferAddonsSection from "@/components/transfers/detail/TransferAddonsSection";
import UpsellProducts from "@/components/transfers/detail/UpsellBooking";
import BookingPolicySection from "@/components/transfers/detail/BookingPolicySection";
import ReturnTransferModal from "@/components/transfers/detail/ReturnTransferModal";
import formatPrice from "@/lib/formatPrice";
import { toast } from 'react-toastify';
const TransferBookingPage = () => {
  const { t } = useTranslation("transfer","common");
  const { localizedPush, back } = useLocalizedRouter();
  const {
    selectedTransfer,
    tripType,
    userBookingDetails,
    setUserBookingDetails,
    resetFormData,
    searchParams,
    fetchProductFeature, productFeature
  } = useTransferStore();
const { setDrawerContent, openDrawer } = useDrawerStore();
const { surchargePickup, surchargeReturn,resetTransferStore  } = useTransferStore.getState();
  const [phone, setPhone] = useState(userBookingDetails?.phone || "");
  const [errors, setErrors] = useState({});
  const [isAddedToCart, setIsAddedToCart] = useState(false);
  const [finalTotalPrice, setFinalTotalPrice] = useState(0);
  const [basePrice, setBasePrice] = useState(0);

  useEffect(() => {
    if (selectedTransfer) {
      if (tripType === "round-trip") {
        setBasePrice(selectedTransfer.two_way_promo_price || selectedTransfer.two_way_price);
      } else {
        setBasePrice(selectedTransfer.price);
      }
    }
  }, [selectedTransfer, tripType]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [alreadyModalOpen, setAlreadyModalOpen] = useState(false);
  const [itemToUpdate, setItemToUpdate] = useState(null);
  const [isPickupFlightActive, setIsPickupFlightActive] = useState(false);
  const [isReturnFlightActive, setIsReturnFlightActive] = useState(false);
const [isLocked, setIsLocked] = useState(false);
const [selectedAddons, setSelectedAddons] = useState({ pickup: [], return: [] });
const [selectedPolicies, setSelectedPolicies] = useState([]);
const [policyErrors, setPolicyErrors] = useState(null); 
const [availablePolicyIds, setAvailablePolicyIds] = useState([]); 
const [priceDifference, setPriceDifference] = useState(0);
const [showReturnOffer, setShowReturnOffer] = useState(false);
const [isReturnModalOpen, setIsReturnModalOpen] = useState(false);

  const showMeetAndGreet =
    selectedTransfer?.feature_type_id === 1 &&
    searchParams?.pickup?.name?.toLowerCase().includes("terminal") &&
    (searchParams?.pickup?.name?.toLowerCase().includes("airport") ||
      searchParams?.pickup?.name?.toLowerCase().includes("changi"));

  useEffect(() => {
  async function loadFeature() {
    const payload = {
      pickup_point_id: searchParams.pickup?.id,
      dropoff_point_id: searchParams.dropoff?.id,
      product_id: selectedTransfer?.product_id,
      vehicle_id: selectedTransfer?.vehicle_id,
      feature_type_id:selectedTransfer?.feature_type_id || null,
      round_trip: searchParams.tripType === "one-way" ? false : true,
    };

    try {
      const result = await fetchProductFeature(payload);
      console.log("Fetched Product Feature:", result);
    } catch (error) {
      console.error("Error fetching product feature:", error);
    }
  }
  loadFeature();
}, [searchParams, selectedTransfer]);
useEffect(() => setIsLoading(false), []);
  const handleInputChange = (field, value) => {
    setUserBookingDetails({ [field]: value });
    if (errors[field]) {
      const newErrors = { ...errors };
      delete newErrors[field];
      setErrors(newErrors);
    }
  };
const handlePickupAddonsChange = useCallback((addons) => {
  setSelectedAddons(prev => ({ ...prev, pickup: addons }));
}, []);

const handleReturnAddonsChange = useCallback((addons) => {
  setSelectedAddons(prev => ({ ...prev, return: addons }));
}, []);

  const handleProceedToCheckout = () => {
setIsLoading(true)
    sessionStorage.setItem("fromBooking", "true");
    resetFormData();
    localizedPush("/checkout");
    resetTransferStore();
  };

  const handleContinueShopping = () => {
    setIsLoading(true)
    resetFormData();
    localizedPush("/");
    resetTransferStore();
  };
const handleGoToCart = async () => {
    setAlreadyModalOpen(false)
    const LoadedCartDrawerContent = (await import("@/components/common/CartDrawerContent")).default
    setDrawerContent(<LoadedCartDrawerContent />)
    openDrawer()
  }
// Handle booking
const executeBookTransfer = () => {
    setIsAddingToCart(true); 
    setTimeout(() => {
  const newErrors = {};
  const pickupOption = userBookingDetails.pickupOption || "time";
  const returnOption = userBookingDetails.returnOption || "time";


     if (!userBookingDetails.pickupDate) {
       newErrors.pickupDate = "booking.pickupDateRequired";
     }
     if (pickupOption === "time") {
       if (!userBookingDetails.pickupTime) newErrors.pickupTime = "booking.pickupTimeRequired";
     } else if (pickupOption === "flight") {
       if (!userBookingDetails.pickupFlightNumber) {
        newErrors.pickupFlightNumber = "booking.pickupFlightRequired";
       //} else if (!userBookingDetails.pickupFlightScheduleTime) {
       // newErrors.pickupFlightNumber = "Please track and verify your pickup flight before checkout.";
       }
     }
    //  if (showMeetAndGreet && !userBookingDetails.meetAndGreetName) {
    //    newErrors.meetAndGreetName = "booking.meetAndGreetNameRequired";
    //  }

    // Return validation
    if (tripType === "round-trip") {
      const returnOption = userBookingDetails.returnOption || "time";
      if (!userBookingDetails.returnDate) {
        newErrors.returnDate = "booking.returnDateRequired";
      }
      if (returnOption === "time") {
        if (!userBookingDetails.returnTime) newErrors.returnTime = "booking.returnTimeRequired";
      } else if (returnOption === "flight") {
        if (!userBookingDetails.returnFlightNumber) {
          newErrors.returnFlightNumber = "booking.returnFlightRequired";
       // } else if (!userBookingDetails.returnFlightScheduleTime) {
       //   newErrors.returnFlightNumber = "Please track and verify your return flight before checkout.";
        }
      }
    }

// Policy validation
    if (!selectedPolicies.includes("terms_conditions")) {
      newErrors.policy = "booking_section.error_required";
    }
  setErrors(newErrors);
  if (Object.keys(newErrors).length) {
    const firstErrorKey = Object.keys(newErrors)[0];
    const errorElements = document.querySelectorAll(`#${firstErrorKey}`);
    const visibleErrorElement = Array.from(errorElements).find(
      (el) => el.offsetParent !== null
    );
    if (visibleErrorElement) {
      visibleErrorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    setIsAddingToCart(false);
    return;
  }
  const cart = useCartStore.getState();
  const cabinBagInfo = selectedTransfer.baggages?.find(b => b.name === "Cabin");
  const largeBagInfo = selectedTransfer.baggages?.find(b => b.name === "Large");
  
  const selectedBaggages = [];
  if (userBookingDetails.cabinBags > 0 && cabinBagInfo) {
    selectedBaggages.push({
      baggage_id: cabinBagInfo.id,
      quantity: userBookingDetails.cabinBags
    });
  }
  if (userBookingDetails.largeBags > 0 && largeBagInfo) {
    selectedBaggages.push({
      baggage_id: largeBagInfo.id,
      quantity: userBookingDetails.largeBags
    });
  }

  const result = cart.addItem({
    tourId: selectedTransfer.product_id,
    selectedDate: userBookingDetails.pickupDate ? format(new Date(userBookingDetails.pickupDate), "yyyy-MM-dd") : undefined,
    selectedTime: pickupOption === "time" && userBookingDetails.pickupTime ? format(new Date(userBookingDetails.pickupTime), "hh:mm a") : undefined,
    transferType: tripType,
    pricing: formatPrice(finalTotalPrice || basePrice),
    price: finalTotalPrice || formatPrice(basePrice),
     pickupSurcharge: formatPrice(surchargePickup?.data?.amount || 0),
  pickupSurchargeId: surchargePickup?.data?.surcharge_id || null,
  returnSurcharge: formatPrice(surchargeReturn?.data?.amount || 0),
  returnSurchargeId: surchargeReturn?.data?.surcharge_id || null,
  currency: selectedTransfer?.currency || "",

    vehicle: selectedTransfer,
    baggage: userBookingDetails.baggage||0,
    cabinBags: userBookingDetails.cabinBags || 0,
    largeBags: userBookingDetails.largeBags || 0,
    selectedBaggages,
   passengers: userBookingDetails.passengers||1,
    phone: userBookingDetails.phone,
    meetAndGreetName: userBookingDetails.meetAndGreetName,
    pickupFlightNumber: userBookingDetails?.pickupFlightNumber,
    pickupFlightScheduleTime: userBookingDetails?.pickupFlightScheduleTime,
    exceptions: userBookingDetails.exceptions || [],
    addons: (selectedAddons.pickup || []).map((a) => ({
      addon_id: a.addon_id,
      rate: a.rate,
      qty: a.quantity,
      total: a.total,
      title: a.title,   // pass title
      image: a.image,   // pass image
})),
...(tripType === "round-trip" && {
  addons_round: (selectedAddons.return || []).map((a) => ({
    addon_id: a.addon_id,
    rate: a.rate,
    qty: a.quantity,
    total: a.total,
    title: a.title,   // pass title
    image: a.image,   // pass image
})),
  returnDate: userBookingDetails.returnDate ? format(new Date(userBookingDetails.returnDate), "yyyy-MM-dd") : undefined,
  returnTime: returnOption === "time" && userBookingDetails.returnTime ? format(new Date(userBookingDetails.returnTime), "hh:mm a") : undefined,
  returnFlightNumber: userBookingDetails?.returnFlightNumber,
  returnFlightScheduleTime: userBookingDetails?.returnFlightScheduleTime,
}),

    searchParams,
  });
  if (result.status === "exists") {
    setItemToUpdate(result.item);
    setAlreadyModalOpen(true);
    setIsAddingToCart(false); 
  } else {
    useDrawerStore.getState().setDrawerContent(<CartDrawerContent />);
    useDrawerStore.getState().setJustAdded(true);
    setIsAddedToCart(true);
    setIsAddingToCart(false); 
setIsLocked(true);
    toast.success("Added to cart");

  }
}, 1000);
};
const validateBooking = () => {
  const newErrors = {};
  const pickupOption = userBookingDetails.pickupOption || "time";
  if (!userBookingDetails.pickupDate) {
    newErrors.pickupDate = "booking.pickupDateRequired";
  }
  if (pickupOption === "time") {
    if (!userBookingDetails.pickupTime) newErrors.pickupTime = "booking.pickupTimeRequired";
  } else if (pickupOption === "flight") {
    if (!userBookingDetails.pickupFlightNumber) {
      newErrors.pickupFlightNumber = "booking.pickupFlightRequired";
    }
  }
  // if (showMeetAndGreet && !userBookingDetails.meetAndGreetName) {
  //   newErrors.meetAndGreetName = "booking.meetAndGreetNameRequired";
  // }

  if (!selectedPolicies.includes("terms_conditions")) {
    newErrors.policy = "booking_section.error_required";
  }

  setErrors(newErrors);

  if (Object.keys(newErrors).length) {
    const firstErrorKey = Object.keys(newErrors)[0];
    const errorElements = document.querySelectorAll(`#${firstErrorKey}`);
    const visibleErrorElement = Array.from(errorElements).find(
      (el) => el.offsetParent !== null
    );
    if (visibleErrorElement) {
      visibleErrorElement.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });
    }
    return false;
  }

  return true;
};
const handleBookTransfer = () => {
  // validate first
  const isValid = validateBooking();
  if (!isValid) return;

  // only if validation passed, proceed to show modal or execute booking
  if (tripType === "one-way" && selectedTransfer) {
    setIsReturnModalOpen(true);
  } else {
    executeBookTransfer();
  }
};

const handleUpdate = () => {
  if (!itemToUpdate) return;

  const cart = useCartStore.getState();
  cart.removeItem(itemToUpdate.key); 

  const pickupOption = userBookingDetails.pickupOption || "time";
  const returnOption = userBookingDetails.returnOption || "time";

  const cabinBagInfo = selectedTransfer.baggages?.find(b => b.name === "Cabin");
  const largeBagInfo = selectedTransfer.baggages?.find(b => b.name === "Large");
  
  const selectedBaggages = [];
  if (userBookingDetails.cabinBags > 0 && cabinBagInfo) {
    selectedBaggages.push({
      baggage_id: cabinBagInfo.id,
      quantity: userBookingDetails.cabinBags
    });
  }
  if (userBookingDetails.largeBags > 0 && largeBagInfo) {
    selectedBaggages.push({
      baggage_id: largeBagInfo.id,
      quantity: userBookingDetails.largeBags
    });
  }

  const result = cart.addItem({
    tourId: selectedTransfer.product_id,
    selectedDate: userBookingDetails.pickupDate ? format(new Date(userBookingDetails.pickupDate), "yyyy-MM-dd") : undefined,
    selectedTime: pickupOption === "time" && userBookingDetails.pickupTime ? format(new Date(userBookingDetails.pickupTime), "hh:mm a") : undefined,
    transferType: tripType,
    pricing: formatPrice(finalTotalPrice || basePrice),
    price: finalTotalPrice || parseFloat(basePrice),
     pickupSurcharge: parseFloat(surchargePickup?.data?.amount || 0),
  pickupSurchargeId: surchargePickup?.data?.surcharge_id || null,
  returnSurcharge: parseFloat(surchargeReturn?.data?.amount || 0),
  returnSurchargeId: surchargeReturn?.data?.surcharge_id || null,

    vehicle: selectedTransfer,
    currency: selectedTransfer?.currency || "",
    baggage: userBookingDetails.baggage||0,
    cabinBags: userBookingDetails.cabinBags || 0,
    largeBags: userBookingDetails.largeBags || 0,
    selectedBaggages,
   passengers: userBookingDetails.passengers||1,
    phone: userBookingDetails.phone,
    meetAndGreetName: userBookingDetails.meetAndGreetName,
    pickupFlightNumber: userBookingDetails?.pickupFlightNumber,
    pickupFlightScheduleTime: userBookingDetails?.pickupFlightScheduleTime,
    exceptions: userBookingDetails.exceptions || [],
    addons: (selectedAddons.pickup || []).map((a) => ({
      addon_id: a.addon_id,
      rate: a.rate,
      quantity: a.quantity,
      total: a.total,
      title: a.title,   
      image: a.image,   
})),
...(tripType === "round-trip" && {
  addons_round: (selectedAddons.return || []).map((a) => ({
    addon_id: a.addon_id,
    rate: a.rate,
    quantity: a.quantity,
    total: a.total,
    title: a.title,   
    image: a.image,   
})),
  returnDate: userBookingDetails.returnDate ? format(new Date(userBookingDetails.returnDate), "yyyy-MM-dd") : undefined,
  returnTime: returnOption === "time" && userBookingDetails.returnTime ? format(new Date(userBookingDetails.returnTime), "hh:mm a") : undefined,
  returnFlightNumber: userBookingDetails?.returnFlightNumber,
  returnFlightScheduleTime: userBookingDetails?.returnFlightScheduleTime,
}),

    searchParams,
  });

  setAlreadyModalOpen(false);
  setIsAddedToCart(true);
  setIsLocked(true);
  useDrawerStore.getState().setDrawerContent(<CartDrawerContent />);
  useDrawerStore.getState().setJustAdded(true);
  toast.success("Added to cart");
};

const handleReturnModalClose = () => {
  setIsReturnModalOpen(false);
  executeBookTransfer();
};

const handleReturnModalConfirm = () => {

  setIsReturnModalOpen(false);
  const setTripType = useTransferStore.getState().setTripType;
  setTripType("round-trip");
  if (selectedTransfer?.two_way_promo_price || selectedTransfer?.two_way_price) {
    const twoWayPrice = parseFloat(selectedTransfer.two_way_promo_price || selectedTransfer.two_way_price);
    setBasePrice(twoWayPrice);
  }
  setTimeout(() => {
    const returnSections = document.querySelectorAll('#return-section');
    const visibleReturnSection = Array.from(returnSections).find(el => el.offsetParent !== null);
    if (visibleReturnSection) {
      visibleReturnSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, 100);
};
const isAttractionTrip = [searchParams?.pickup?.type, searchParams?.dropoff?.type]
  .some(t => ["attraction", "landmark"].includes(t?.toLowerCase()));

const baggageSelectorProps = {
  cabinBags: userBookingDetails.cabinBags || 0,
  setCabinBags: isLocked ? () => {} : (val) => {
    const large = userBookingDetails.largeBags || 0;
    setUserBookingDetails({ cabinBags: val, baggage: val + large });
    if (errors.baggage) { const newErrors = { ...errors }; delete newErrors.baggage; setErrors(newErrors); }
  },
  largeBags: userBookingDetails.largeBags || 0,
  setLargeBags: isLocked ? () => {} : (val) => {
    const cabin = userBookingDetails.cabinBags || 0;
    setUserBookingDetails({ largeBags: val, baggage: val + cabin });
    if (errors.baggage) { const newErrors = { ...errors }; delete newErrors.baggage; setErrors(newErrors); }
  },
  passengers: userBookingDetails.passengers || 1,
  setPassengers: isLocked ? () => {} : (val) => handleInputChange("passengers", val),
  baggageDetail: selectedTransfer,
  errors: errors,
  disabled: isLocked,
   hideBaggage: isAttractionTrip,
};

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex justify-center items-center bg-[#f4f4f4]">
         <Loading2Svg/>
        </div>
      </Layout>
    );
  }

  if (!selectedTransfer) {
    return (
      <Layout>
         <div className="min-h-screen bg-[#f4f4f4] flex items-center justify-center">
        <div className="text-center">
          <div className="text-[#D3202D] text-xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-white mb-2">
            {t("booking.noTransferSelected")}
          </h2>
          <button
            onClick={() => {
              resetTransferStore();
              back();
            }}
            className="bg-[#D3202D] text-white px-4 py-2 rounded-lg"
          >
            {t("goBack")}
          </button>
        </div>
      </div>
    </Layout>
  );
}


  return (
    <Layout>
     <div className="bg-[#f4f4f4] pb-6 md:pb-14">
       <div className="min-h-screen bg-[#f4f4f4] mt-16 p-4 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mt-4">
          <div className="lg:hidden space-y-4">
            <div className="order-1">
              <RouteSummary
                pickup={searchParams?.pickup}
                dropoff={searchParams?.dropoff}
                t={t}
                title={tripType === "round-trip" ? t("booking.pickup") : null}
              />
              {tripType === "round-trip" && (
                <div  className="md:mt-0 mt-2"><RouteSummary
                  pickup={searchParams?.dropoff}   
                  dropoff={searchParams?.pickup}
                  t={t}
                  title={t("booking.return")}
                /></div>
              )}
            </div>
            <div className="order-2">
              <BookingTransferInfo
                TransferInfo={selectedTransfer}
                passengerInfo={userBookingDetails.passengerInfo}
                phone={phone}
                setPhone={isLocked ? () => {} : (val) => {
                  setPhone(val);
                  handleInputChange("phone", val);
                }}
                errors={errors}
                onFieldChange={isLocked ? () => {} : handleInputChange}
                onPickupFlightCheckboxChange={isLocked ? () => {} : setIsPickupFlightActive}
                onReturnFlightCheckboxChange={isLocked ? () => {} : setIsReturnFlightActive}
                disabled={isLocked}
              />
            </div>
            <div className="order-3">
              <BaggagePassengerSelector {...baggageSelectorProps} />
              {showMeetAndGreet && (
                <div id="meetAndGreetName" className="mb-6 mt-6 bg-white rounded-md p-2 pl-6">
                  <label className="block text-lg font-medium text-[#D3202D] mb-2">
                    {t("booking.meetAndGreetName","Name for meet and greet sign")}
                  </label>
                  <input
                    type="text"
                    value={userBookingDetails.meetAndGreetName || ""}
                    onChange={(e) => handleInputChange("meetAndGreetName", e.target.value)}
                    className={`w-full text-base mb-2 px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3202D] ${isLocked ? "bg-gray-100 cursor-not-allowed" : ""}`}
                    disabled={isLocked}
                    placeholder={t("booking.meetAndGreetPlaceholder","Enter name") || "Enter name"}
                  />
                  
                </div>
              )}
   <div className="mb-6 mt-6 bg-white rounded-md p-2 pl-6 ">
  <label className="block text-lg font-medium text-[#D3202D] mb-2">
    {t("specialRequests.title")}
  </label>
  <p className="text-sm text-gray-700 my-4 pl-2">
    {t("specialRequests.description")}
  </p>

  {/* Predefined options */}
  <div className="flex flex-wrap gap-2 mb-3">
    {[t("specialRequests.wheelchair"), t("specialRequests.childSeat")].map((option) => (
      <label
        key={option}
        className="flex items-center gap-2 border border-gray-300 px-3 py-1 rounded-lg cursor-pointer"
      >
        <input
          type="checkbox"
          value={option}
          checked={userBookingDetails.exceptions?.includes(option)}
          onChange={(e) => {
            const selected = userBookingDetails.exceptions || [];
            if (e.target.checked) {
              handleInputChange("exceptions", [...selected, option]);
            } else {
              handleInputChange(
                "exceptions",
                selected.filter((o) => o !== option)
              );
            }
          }}
          disabled={isLocked}
        />
        <span className="text-sm">{option}</span>
      </label>
    ))}
  </div>

  
</div>


            </div>
             <TransferAddonsSection
  paxtotL={userBookingDetails.passengers}
  onAddonsChange={handlePickupAddonsChange}
  tripPart="pickup"
   disabled={isLocked}
/>

{tripType === "round-trip" && (
  // <div id="return-section">
  <TransferAddonsSection
    paxtotL={userBookingDetails.passengers}
    onAddonsChange={handleReturnAddonsChange}
    tripPart="return"
     disabled={isLocked}
  />

)}
                         <div className="order-4">
                           <VehicleSummary
                             onPriceChange={setFinalTotalPrice}
                             vehicleInfo={selectedTransfer}
                             pricing={{ total: basePrice }}
                             pickupLocation={searchParams?.pickup}
                           />
                         </div>

            <div className="bg-white rounded-lg p-2 md:p-6 shadow-sm order-5">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-2 md:mb-4 gap-4">
  {/* Left Side */}
  <div className="flex-col items-center text-black-500">
  
    {isLoading ? (
      <Loading2Svg className="w-6 h-6 mr-2" />
    ) : (
      <span> </span>
    )}
  </div>
<div className="py-1 mb-0">
<BookingPolicySection
  selectedOptions={selectedPolicies}
  setSelectedOptions={setSelectedPolicies}
  productId={selectedTransfer?.product_id}
  errors={errors.policy}
  setErrors={setPolicyErrors}
/>

</div>
  {/* Right Side */}
  {isAddingToCart ? (
  // Spinner replaces button
  <div className="flex justify-center items-center w-full sm:w-auto min-h-[48px]">
    <svg
      className="animate-spin h-8 w-8 text-[#D3202D]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  </div>
) : isAddedToCart ? (
  <>
     <div className="flex">
      <Check className="w-6 h-6 mr-2" />
      <span className="font-medium text-[#D3202D]">{t("booking.cartUpdated") || "Added to cart"}</span>
     
     </div>

    <div className="flex-col gap-3 w-full  mt-0">
      <button
        onClick={handleContinueShopping}
        className="bg-gray-200 mb-2 text-gray-800 font-medium px-6 py-3 rounded-md w-full sm:w-auto"
      >
        {t("continueShopping")}
      </button>
      <button
        onClick={handleProceedToCheckout}
        className="bg-[#D3202D] text-white font-medium px-6 py-3 rounded-md w-full sm:w-auto"
      >
        {t("proceedToCheckout")}
      </button>
    </div>
  </>
) : (

  <button
    onClick={handleBookTransfer}
    className="bg-[#D3202D] text-white font-medium px-6 py-3 rounded-md w-full sm:w-auto"
  >
    {t("booking.addToCart")}
  </button>
)}


</div>

            </div>
          </div>

          <div className="hidden lg:block lg:col-span-2 space-y-4">
           <BookingTransferInfo
  TransferInfo={selectedTransfer}
  passengerInfo={userBookingDetails.passengerInfo}
  phone={phone}
  setPhone={isLocked ? () => {} : (val) => {
    setPhone(val);
    handleInputChange("phone", val);
  }}
  errors={errors}
  onFieldChange={isLocked ? () => {} : handleInputChange}
  onPickupFlightCheckboxChange={isLocked ? () => {} : setIsPickupFlightActive}
  onReturnFlightCheckboxChange={isLocked ? () => {} : setIsReturnFlightActive}
  disabled={isLocked}
/>

<BaggagePassengerSelector {...baggageSelectorProps} />
 {showMeetAndGreet && (
    <div id="meetAndGreetName" className="mb-6 mt-6 bg-white rounded-md p-2 pl-6">
      <label className="block text-lg font-medium font-semibold text-[#D3202D] mb-2">
        {t("booking.meetAndGreetName","Name for meet and greet sign") || "Name for meet and greet sign"}
      </label>
      <input
        type="text"
        value={userBookingDetails.meetAndGreetName || ""}
        onChange={(e) => handleInputChange("meetAndGreetName", e.target.value)}
        className={` w-full lg:w-1/2 text-base mb-2 px-4 py-2 md:py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3202D] ${isLocked ? "bg-gray-100 cursor-not-allowed" : ""}`}
        disabled={isLocked}
        placeholder={t("booking.meetAndGreetPlaceholder","Enter name") || "Enter name"}
      />
      
    </div>
  )}
 <div className="mb-6 mt-6 bg-white rounded-md p-2 pl-6 ">
  <label className="block text-lg font-medium font-semibold text-[#D3202D] mb-2">
    {t("specialRequests.title")}
  </label>
  <p className="text-sm text-gray-700 my-4 pl-2">
    {t("specialRequests.description")}
  </p>

  {/* Predefined options */}
  <div className="flex flex-wrap gap-2 mb-3">
    {[t("specialRequests.wheelchair"), t("specialRequests.childSeat")].map((option) => (
      <label
        key={option}
        className="flex items-center gap-2 border text-sm md:text-base font-medium border-gray-300 px-3 py-1 rounded-lg cursor-pointer"
      >
        <input
          type="checkbox"
          value={option}
          checked={userBookingDetails.exceptions?.includes(option)}
          onChange={(e) => {
            const selected = userBookingDetails.exceptions || [];
            if (e.target.checked) {
              handleInputChange("exceptions", [...selected, option]);
            } else {
              handleInputChange(
                "exceptions",
                selected.filter((o) => o !== option)
              );
            }
          }}
          disabled={isLocked}
        />
        <span className="text-md">{option}</span>
      </label>
    ))}
  </div>

  
</div>

 <TransferAddonsSection
  paxtotL={userBookingDetails.passengers}
  onAddonsChange={handlePickupAddonsChange}
  tripPart="pickup"
   disabled={isLocked}
/>

{tripType === "round-trip" && (
  <div id="return-section">
  <TransferAddonsSection
    paxtotL={userBookingDetails.passengers}
    onAddonsChange={handleReturnAddonsChange}
    tripPart="return"
     disabled={isLocked}
  />
  </div>
)}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              {/* <h2 className="text-xl font-bold mb-4">{t("booking.bookTransferTitle")}</h2> */}
              <div className="flex-col items-center justify-between mb-0 bg-white  rounded-md">
  <div className="flex items-center text-black-500">
    {isLoading ? (
      <Loading2Svg className="w-6 h-6 mr-2" />
    ) : (
      <span ></span>
    )}
  </div>

{isAddingToCart ? (
  // Spinner replaces button
  <div className="flex justify-center items-center w-full sm:w-auto min-h-[48px]">
    <svg
      className="animate-spin h-8 w-8 text-[#D3202D]"
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8H4z"
      />
    </svg>
  </div>
) : isAddedToCart ? (
  <>
   

    <div className="flex justify-between gap-3 w-full mt-2">
       <div className="flex items-center mt-0">
          <Check className="w-6 h-6 mr-2 text-[#D3202D]" />
          <span className="font-medium text-[#D3202D]">{t("booking.cartUpdated") || "Added to cart"}</span>
        </div>
    <div>
        <button
        onClick={handleContinueShopping}
        className="bg-gray-200 mb-2 mr-2 text-gray-800 font-medium px-6 py-3 rounded-md w-full sm:w-auto"
      >
        {t("continueShopping")}
      </button>
      <button
        onClick={handleProceedToCheckout}
        className="bg-[#D3202D] text-white font-medium px-6 py-3 rounded-md w-full sm:w-auto"
      >
        {t("proceedToCheckout")}
      </button>
    </div>
    </div>
  </>
) : (
 <div className="flex justify-between bg-white">
  <div className="py-2 mb-2 ">
 <BookingPolicySection
  selectedOptions={selectedPolicies}
  setSelectedOptions={setSelectedPolicies}
  productId={selectedTransfer?.product_id}
  errors={errors.policy}
  setErrors={setPolicyErrors}
/>

</div>
 <div>
   <button
    onClick={handleBookTransfer}
    className="bg-[#D3202D] text-white font-medium px-6 py-3 rounded-md w-full sm:w-auto"
  >
    {t("booking.addToCart")}
  </button>
 </div>
  </div>
)}



              </div>
            </div>
          </div>

          <div className="hidden lg:block space-y-4">
            <div className="relative w-full lg:sticky top-1 space-y-4">
              <RouteSummary
                pickup={searchParams?.pickup}
                dropoff={searchParams?.dropoff}
                t={t}
                title={tripType === "round-trip" ? t("booking.pickup") : null}
              />

              {tripType === "round-trip" && (
                <RouteSummary
                  pickup={searchParams?.dropoff}   
                  dropoff={searchParams?.pickup}
                  t={t}
                  title={t("booking.return")}
                />
              )}
              <VehicleSummary
                onPriceChange={setFinalTotalPrice}
                vehicleInfo={selectedTransfer}
                pricing={{ total: basePrice }}
                pickupLocation={searchParams?.pickup}
              />
            </div>
          </div>
        </div>
      </div>
     </div>
      {alreadyModalOpen && (
  <AlreadyModal
    isOpen={alreadyModalOpen}
    onClose={() => setAlreadyModalOpen(false)}
    onUpdate={handleUpdate}
    onGoToCart={handleGoToCart}
  />
)}
{isReturnModalOpen && (
        <ReturnTransferModal
          isOpen={isReturnModalOpen}
          onClose={handleReturnModalClose}
          onConfirm={handleReturnModalConfirm}
          selectedTransfer={selectedTransfer}
          userBookingDetails={userBookingDetails}
          setUserBookingDetails={setUserBookingDetails}
          handleConfirmReturnAndBook={executeBookTransfer}
        />
      )}
    </Layout>
  );
};
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common','transfer','daytour'])),
    },
  };
}
export default TransferBookingPage;