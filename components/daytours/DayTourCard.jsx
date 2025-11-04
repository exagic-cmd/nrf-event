import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { Clock, MapPin, Users, Star, Calendar } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function DaytourCard({ tour, category = "daytour" }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("daytour");
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasPromo = tour.originalPrice && tour.price < tour.originalPrice;
  
  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      // Check if already in cart (for transfers logic)
      const alreadyExists = items.some(
        (item) => item.tourId === tour.id && item.category === "daytour"
      );

      if (alreadyExists) {
        setShowModal(true);
      } else {
        // Navigate to day tour details page
        localizedPush(`/day-tours/detail/${tour.id}`);
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  // Get first landmark name for display
  const mainLandmark = tour.landmarks && tour.landmarks.length > 0 
    ? tour.landmarks[0].title 
    : null;

  console.log("🎫 DaytourCard rendering:", tour.id, tour.name);

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4">This tour is already in your cart</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#CC9A55] text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div className="relative border rounded-xl mb-3 shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden p-4 flex flex-col md:flex-row gap-4">
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader2 />
          </div>
        )}

        {/* Image */}
        <div className="relative w-full md:w-[180px] flex-shrink-0 flex justify-center items-center">
          <img
            src={tour.image}
            alt={tour.name}
            className="object-cover h-[120px] w-full md:w-[180px] rounded-lg"
            onError={(e) => {
              e.target.src = "/placeholder-tour.jpg";
            }}
          />

          {/* Feature Badge */}
          {tour.feature_name && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-blue-600">
              <Star size={10} />
              <span>{tour.feature_name}</span>
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg">{tour.name}</h2>
            
            {/* Landmark and Duration */}
            {/* <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
              {mainLandmark && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{mainLandmark}</span>
                </div>
              )}
              {tour.duration && (
                <div className="flex items-center gap-1">
                  <Clock size={14} />
                  <span>{tour.duration}</span>
                </div>
              )}
            </div> */}

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mt-2">
              {tour.description}
            </p>
               {mainLandmark && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{mainLandmark}</span>
                </div>
              )}
            {/* Activities Tags */}
            {tour.preference_activities && tour.preference_activities.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {tour.preference_activities.slice(0, 3).map((activity, idx) => (
                  <span 
                    key={idx}
                    className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                  >
                    {activity}
                  </span>
                ))}
              </div>
            )}

            {/* Features */}
            {/* {tour.features && tour.features.length > 0 && (
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                {tour.features.slice(0, 2).map((feature, idx) => (
                  <li key={idx}>{feature}</li>
                ))}
              </ul>
            )} */}
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-end mt-3">
            <div>
              {/* Price display */}
              <div className="flex items-center gap-2">
                {hasPromo && (
                  <p className="text-sm text-gray-400 line-through">
                    {formatPrice(tour.originalPrice)} {tour.currency || 'SGD'}
                  </p>
                )}
                <p className="text-lg font-bold text-[#CC9A55]">
                  {formatPrice(tour.price)} {tour.currency || 'SGD'}
                </p>
              </div>
              
              {/* Per person info */}
              {/* {tour.adultPrice && (
                <p className="text-xs text-gray-500 mt-1">
                  Adult: {formatPrice(tour.adultPrice)} {tour.currency || 'SGD'}
                  {tour.childPrice && ` • Child: ${formatPrice(tour.childPrice)} ${tour.currency || 'SGD'}`}
                </p>
              )} */}
            </div>

            <button
              onClick={handleBookNow}
              disabled={isLoading || !tour.is_active}
              className="bg-[#CC9A55] text-white text-sm px-4 py-2 rounded-md transition disabled:opacity-70 hover:bg-[#b88a4a]"
            >
              {!tour.is_active ? "Coming Soon" : "View"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

export default DaytourCard;