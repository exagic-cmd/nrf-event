import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { Users, Briefcase,Crown, BadgeCheck } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useTransferStore } from "@/store/useTransferStore";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function TransfersCard({ car }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("transfer");
  const { setSelectedTransfer, searchParams  } = useTransferStore();
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
// Priority order
const hasPromo = car.final_promo_price && parseFloat(car.final_promo_price) > 0;
const displayPrice = hasPromo ? car.final_promo_price : car.final_price || car.price;
const originalPrice = hasPromo ? (car.final_price || car.price) : null;
const formatPrice = (value) => {
  const num = Number(value);
  // If integer (no decimals), return without ".00"
  if (Number.isInteger(num)) {
    return num.toString();
  }
  // Else keep 2 decimals
  return num.toFixed(2);
};

  const handleBookNow = async () => {
    setIsLoading(true);

    try {
      const alreadyExists = items.some(
        (item) =>
          item.tourId === car.tourId &&
          item.searchParams?.pickup?.id === searchParams.pickup?.id &&
          item.searchParams?.dropoff?.id === searchParams.dropoff?.id
      );

      if (alreadyExists) {
        setShowModal(true);
      } else {
        setSelectedTransfer(car);
        localizedPush("/transfers/booking");
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
    
      setTimeout(() => setIsLoading(false), 500);
    }
  };

  return (
    <>
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4">{t("card.modal.alreadyInCart")}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#CC9A55] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden">
        {/* Loader Overlay */}
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader2 />
          </div>
        )}

    
       
<div className="hidden md:flex relative items-center justify-between border rounded-xl bg-white shadow-sm p-4 w-full max-w-4xl mx-auto">
  {/* Left - Car Image */}
  <div className="w-[180px]  flex justify-center items-center">
  <img
    src={car.image}
    alt={car.name}
    className="object-contain h-[120px] w-[180px] rounded-lg"
  />

  {/* Label */}
  {car.feature_type_id === 1 && (
    <span
      className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-sm font-semibold text-white rounded-md bg-black"
    >
      <Crown size={12} className="text-white" />
      <span>Premium</span>
    </span>
  )}

</div>

  
  {/* Middle - Info */}
  <div className="flex-1 px-6">
    <h2 className="font-semibold text-lg">{car.name}</h2>
    <p className="text-sm text-gray-600 mb-2">{car.subtitle}</p>
    <p className="line-clamp-2 my-2">{car.desc}</p>
  </div>
  <div className="flex flex-col items-end">
    <div className="flex gap-4 text-gray-600 text-sm mb-2">
      <span className="flex items-center gap-1">
        <Users size={14} /> {car.passengers}
      </span>
      <span className="flex items-center gap-1">
        <Briefcase size={14} /> {car.suitcases}
      </span>
    </div>
 

  {hasPromo ? (
    <>
      <p className="text-sm text-gray-400 line-through">
  {formatPrice(originalPrice)} SGD
</p>
<p className="text-xl font-bold text-[#CC9A55]">
  {formatPrice(displayPrice)} SGD
</p>

    </>
  ) : (
    <p className="text-xl font-bold text-gray-900">{formatPrice(displayPrice)} SGD</p>
  )}

  <button
    onClick={handleBookNow}
    disabled={isLoading}
    className="mt-3 bg-[#CC9A55] text-white text-sm px-5 py-2 rounded-md transition disabled:opacity-70"
  >
    {t("card.bookNow")}
  </button>
</div>

</div>

{/* Mobile View */}
<div className="md:hidden relative border rounded-xl bg-white shadow-sm p-3 flex gap-3 items-start">
  {/* Left - Image */}
  <div className=" flex-shrink-0">
    <img
      src={car.image}
      alt={car.name}
      className="object-contain h-28 w-32 rounded-md"
    />
    {car.feature_type_id === 1 && (
      <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white rounded-md bg-[#CC9A55]">
        <Crown size={10} className="text-white" />
        <span>Premium</span>
      </span>
    )}
  </div>

  {/* Right - Info Section */}
  <div className="flex-1 flex flex-col justify-between h-full">
    {/* Top Row: Title + Icons */}
    <div className="flex justify-between items-start">
      <h2 className="font-semibold text-sm leading-tight line-clamp-2 h-10 max-w-[60%]">
        {car.name}
      </h2>
      <div className="flex items-center gap-2 text-gray-600 text-xs flex-shrink-0">
        <span className="flex items-center gap-1">
          <Users size={12} /> {car.passengers}
        </span>
        <span className="flex items-center gap-1">
          <Briefcase size={12} /> {car.suitcases}
        </span>
      </div>
    </div>

    {/* Subtitle or Description */}
    <p className="text-xs text-gray-600 mt-1 line-clamp-2">
      {car.subtitle || car.desc}
    </p>

    {/* Bottom Row: Price + Button */}
    <div className="flex  justify-between items-center mt-2">
      <div className="flex gap-2 absolute left-4  bottom-4 text-start">
        {hasPromo ? (
          <>
            <p className="text-sm text-gray-400 line-through">
              {formatPrice(originalPrice)} SGD
            </p>
            <p className="text-sm font-bold text-[#CC9A55]">
              {formatPrice(displayPrice)} SGD
            </p>
          </>
        ) : (
          <p className="text-sm font-bold text-gray-900">
            {formatPrice(displayPrice)} SGD
          </p>
        )}
      </div>
     <div className="flex justify-end items-end w-full mt-2">
  <button
    onClick={handleBookNow}
    disabled={isLoading}
    className="bg-[#CC9A55] text-white text-sm py-2 px-3 rounded-md transition disabled:opacity-70"
  >
    {t("card.bookNow")}
  </button>
</div>

    </div>
  </div>
</div>



      </div>
    </>
  );
}

export default TransfersCard;