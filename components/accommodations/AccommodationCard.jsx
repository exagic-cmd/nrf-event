import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { MapPin, Star, Wifi, Car, Utensils } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function AccommodationCard({ accommodation, category = "accommodation" }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("accommodation");
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasPromo = accommodation.originalPrice && accommodation.price < accommodation.originalPrice;
  
  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      // Check if already in cart
      const alreadyExists = items.some(
        (item) => item.tourId === accommodation.id && item.category === "accommodation"
      );

      if (alreadyExists) {
        setShowModal(true);
      } else {
        // Navigate to accommodation details page
        localizedPush(`/accommodations/${accommodation.id}`);
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
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
      <div
        className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden p-4 flex flex-col md:flex-row gap-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader2 />
          </div>
        )}

        {/* Image */}
        <div className="relative w-full md:w-[180px] flex-shrink-0 flex justify-center items-center">
          <img
            src={accommodation.image}
            alt={accommodation.name}
            className="object-cover h-[120px] w-full md:w-[180px] rounded-lg"
          />

          {/* Feature Badge */}
          {accommodation.feature_name && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-green-600">
              <Star size={10} />
              <span>{accommodation.feature_name}</span>
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg">{accommodation.name}</h2>
            
            {/* Location and Rating */}
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
              {accommodation.location && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{accommodation.location}</span>
                </div>
              )}
              {accommodation.rating && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  <span>{accommodation.rating}</span>
                  {accommodation.reviews && (
                    <span className="text-gray-500">({accommodation.reviews})</span>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mt-2">
              {accommodation.description}
            </p>

            {/* Suitability Tags */}
            {accommodation.suit_clusters && accommodation.suit_clusters.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {accommodation.suit_clusters.slice(0, 3).map((cluster, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                  >
                    {cluster}
                  </span>
                ))}
              </div>
            )}

            {/* Features */}
            {accommodation.features && accommodation.features.length > 0 && (
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                {accommodation.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )}
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-end mt-3">
            <div>
              {/* Price display */}
              <div className="flex items-center gap-2">
                {hasPromo && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(accommodation.originalPrice)} {accommodation.currency}
                  </p>
                )}
                <p className="text-lg font-bold text-[#CC9A55]">
                  {formatPrice(accommodation.price)} {accommodation.currency}
                </p>
              </div>
              
              {/* Per night info */}
              <p className="text-xs text-gray-500 mt-1">
                per night
              </p>
            </div>

            {/* Card is clickable — removed separate View button and is_active check */}
          </div>
        </div>
      </div>
    </>
  );
}

export default AccommodationCard;