import React, { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { Users, Briefcase, Crown, Star, ChevronDown, ChevronUp } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useTransferStore } from "@/store/useTransferStore";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader from "@/components/common/LoaderSvg";
import { formatPrice } from "@/utils/priceUtils";

function TransfersCard({ car, category = "transfer", tripType, handleTripTypeChange }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("transfer");
  const { setSelectedTransfer, searchParams, selectedTransfer } = useTransferStore();
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [expandedFeatures, setExpandedFeatures] = useState(false);

  const FEATURE_LIMIT = 3;
  
  const displayPrice = car.price;
  const originalPrice = car.originalPrice;
  const hasPromo = !!originalPrice && originalPrice > displayPrice;
  const currentTripType = tripType || car.tripType || "one-way";

   const largeBags = car.baggages?.find((b) => b.name === "Large")?.quantity;
  const cabinBags = car.baggages?.find((b) => b.name === "Cabin")?.quantity;

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (category === "transfer") {
        const alreadyExists = items.some(
          (item) =>
            item.tourId === car.id &&
            item.searchParams?.pickup?.id === searchParams.pickup?.id &&
            item.searchParams?.dropoff?.id === searchParams.dropoff?.id &&
            item.tripType === currentTripType
        );

        if (alreadyExists) {
          setShowModal(true);
        } else {
          const transferData = {
            ...car,
            price: displayPrice,
            originalPrice: originalPrice,
            tripType: currentTripType,
            pickup_point_id: searchParams.pickup?.id || car.pickup_point_id,
            dropoff_point_id: searchParams.dropoff?.id || car.dropoff_point_id,
          };

          setSelectedTransfer(transferData);
          
          setTimeout(() => {
            localizedPush("/listings/booking");
          }, 100);
        }
      } else {
        localizedPush(`/${category}s/${car.id}`);
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
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
              className="bg-[#D3202D] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      <div className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden hover:shadow-lg transition-all">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader />
          </div>
        )}

        {/* DESKTOP LAYOUT */}
        <div className="hidden md:flex relative items-center justify-between p-4 w-full">
          {/* Left Image */}
          <div className="w-[220px] flex-shrink-0 flex justify-center items-center relative">
            <img
              src={car.image}
              alt={car.name}
              className="object-cover h-[140px] w-full rounded-lg"
            />
             {car?.feature_type_id === 1 && (
                <span className="absolute top-1 left-2 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-black">
                  <Crown size={12} />
                  <span>Premium</span>
                </span>
              )}
          </div>

          {/* Middle Info */}
          <div className="flex-1 px-6">
            <h2 className="font-bold text-lg text-[#D3202D]">{car.name}</h2>
            
            <div className="flex items-center gap-4 text-sm text-gray-600 mt-2 mb-2">
              <span className="flex items-center gap-1">
                <Users size={16} /> Max {car.passengers}
              </span>
              <span className="flex items-center gap-1">
                <Briefcase size={16} />
                {largeBags !== undefined || cabinBags !== undefined
                  ? `Luggage (Large: ${largeBags || 0}, Cabin: ${cabinBags || 0})`
                  : car.suitcases}
              </span>
            </div>

            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{car.subtitle || car.desc || car.description}</p>

            {/* Features Chips */}
            <div className="flex gap-2 flex-wrap mt-2 items-center">
              {(expandedFeatures ? car.features : car.features?.slice(0, FEATURE_LIMIT))?.map((feature, idx) => (
                <span key={idx} className="px-2 py-0.5 text-xs bg-red-50 text-red-800 rounded">
                  {typeof feature === 'string' ? feature : feature?.title}
                </span>
              ))}
              {car.features?.length > FEATURE_LIMIT && (
                <button
                  onClick={(e) => { e.stopPropagation(); setExpandedFeatures(!expandedFeatures); }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  {expandedFeatures ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                </button>
              )}
            </div>
          </div>

          {/* Right Price & Action */}
          <div className="flex flex-col items-end justify-between h-full min-h-[140px]">
            <div className="flex gap-2 mb-2">
              {car?.promo_tag && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-[#D3202D] rounded-md shadow-sm">
                  {car?.promo_tag}
                </span>
              )}
            </div>

            <div className="text-right">
              {hasPromo && (
                <p className="text-sm text-gray-400 line-through">
                  SGD {formatPrice(originalPrice)}
                </p>
              )}
              <p className="text-2xl font-bold text-[#D3202D]">
                SGD {formatPrice(displayPrice)}
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {currentTripType === "round-trip" ? t("transferType.roundTrip") : t("transferType.oneWay")}
              </p>
            </div>

            <button
              onClick={handleBookNow}
              disabled={isLoading}
              className="mt-4 bg-[#D3202D] text-white text-sm px-6 py-2.5 rounded-lg hover:bg-[#b71c1c] transition disabled:opacity-70 font-medium"
            >
              {t("card.bookNow", "Book Now")}
            </button>
          </div>
        </div>

        {/* MOBILE LAYOUT */}
        <div className="md:hidden relative p-3 flex gap-3 items-start">
           {car?.feature_type_id === 1 && (
              <span className="absolute top-3 left-3 z-10 flex items-center gap-1 px-1.5 py-0.5 text-[10px] font-semibold text-white rounded bg-black/80">
                <Crown size={10} />
                <span>Premium</span>
              </span>
            )}
            
          {/* Left Image */}
          <div className="flex-shrink-0">
            <img
              src={car.image}
              alt={car.name}
              className="object-cover h-28 w-32 rounded-lg"
            />
          </div>

          {/* Right Section */}
          <div className="flex-1 flex flex-col justify-between min-h-[112px]">
            <div>
              <h2 className="font-bold text-sm text-[#D3202D] line-clamp-1">{car.name}</h2>
              
              <div className="flex items-center gap-2 text-xs text-gray-600 mt-1">
                <span className="flex items-center gap-1">
                  <Users size={12} /> {car.passengers}
                </span>
                <span className="flex items-center gap-1">
                  <Briefcase size={12} />
                  {car.suitcases}
                </span>
              </div>

              <p className="text-xs text-gray-500 mt-1 line-clamp-1">
                {car.subtitle || car.desc || car.description}
              </p>

              {/* Features Chips Mobile */}
              <div className="flex gap-1 flex-wrap mt-1 items-center">
                {(expandedFeatures ? car.features : car.features?.slice(0, FEATURE_LIMIT))?.map((feature, idx) => (
                  <span key={idx} className="px-2 py-0.5 text-[10px] bg-red-50 text-red-800 rounded">
                    {typeof feature === 'string' ? feature : feature?.title}
                  </span>
                ))}
                {car.features?.length > FEATURE_LIMIT && (
                  <button onClick={(e) => { e.stopPropagation(); setExpandedFeatures(!expandedFeatures); }} className="text-gray-500 hover:text-gray-700">
                    {expandedFeatures ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                )}
              </div>
            </div>

            <div className="flex justify-between items-end mt-2">
              <div>
                {hasPromo && (
                  <p className="text-[10px] text-gray-400 line-through">
                    SGD {formatPrice(originalPrice)}
                  </p>
                )}
                <p className="text-sm font-bold text-[#D3202D]">
                  SGD {formatPrice(displayPrice)}
                </p>
                <p className="text-[10px] text-gray-500">
                  {currentTripType === "round-trip" ? t("transferType.roundTrip") : t("transferType.oneWay")}
                </p>
              </div>

              <button
                onClick={handleBookNow}
                disabled={isLoading}
                className="bg-[#D3202D] text-white text-xs py-1.5 px-3 rounded-md shadow-sm"
              >
                {t("card.bookNow", "Book")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default TransfersCard;