import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { Clock, MapPin, Users, Star, Calendar } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import { formatPrice } from "@/utils/priceUtils";
import SvgLoader from "@/components/common/LoaderSvg";

function DaytourCard({ tour, category = "daytour" }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("daytour");
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasPromo = tour.originalPrice && tour.price < tour.originalPrice;

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
              className="bg-[#D3202D] text-white px-4 py-2 rounded"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Card */}
<div
  className="relative border rounded-xl mb-3 shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden flex flex-col md:flex-row gap-4 hover:shadow-lg hover:-translate-y-0.5 transform transition-all"
>
  {isLoading && (
    <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
      <SvgLoader />
    </div>
  )}

  {/* Image */}
  <div className="relative w-full md:w-[300px] flex-shrink-0 flex justify-center items-center">
    <img
      src={tour.image}
      alt={tour.name}
      className="object-cover h-[235px] w-full md:w-[300px]"
      onError={(e) => {
        e.target.src = "/placeholder-tour.jpg";
      }}
    />

    {/* Feature Badge */}
    {tour.feature_name && (
      <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-[#D3202D]">
        <Star size={10} />
        <span>{tour.feature_name}</span>
      </span>
    )}
  </div>

  {/* Info Section */}
  <div className="flex-1 flex flex-col justify-between pr-2.5 pl-2.5 py-2">
  <div>
    <h2 className="font-bold text-md lg:text-md line-clamp-1 text-[#D3202D]">
      {tour.name}
    </h2>

    <p className="text-sm text-gray-700 line-clamp-2 mt-2">
      {tour.description}
    </p>

    {/* Activities */}
    <div className="flex flex-wrap items-center gap-2 mt-2">
      {mainLandmark && (
        <div className="flex items-center gap-1">
          <MapPin size={14} />
          <span className="text-gray-600 text-sm">{mainLandmark}</span>
        </div>
      )}
      {tour.preference_activities &&
        tour.preference_activities.length > 0 &&
        (() => {
          const activities = tour.preference_activities;
          const visible = activities.slice(0, 4);
          const remaining = activities.slice(4);

          return (
            <>
              {visible.map((activity, idx) => (
                <span
                  key={idx}
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full"
                >
                  {activity}
                </span>
              ))}

              {remaining.length > 0 && (
                <span
                  className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full cursor-default"
                  title={remaining.join(", ")}
                  aria-label={`More activities: ${remaining.join(", ")}`}
                >
                  ...
                </span>
              )}
            </>
          );
        })()}
    </div>
  </div>

  {/* New Info Section */}
  <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-600">
    {tour.duration && (
      <div className="flex items-center gap-1">
        <Clock size={14} className="text-gray-500" />
        <span>{tour.duration}</span>
      </div>
    )}

    {tour.tourtype && (
      <div className="flex items-center gap-1">
        <Calendar size={14} className="text-gray-500" />
        <span>{tour.tourtype}</span>
      </div>
    )}

    {tour.shareTour && (
      <div className="flex items-center gap-1">
        <Users size={14} className="text-gray-500" />
        <span>{tour.shareTour ? "Guided" : "Self-guided"}</span>
      </div>
    )}

    {tour.guidelanguage && (
      <div className="flex items-center gap-1">
        <Star size={14} className="text-gray-500" />
        <span>{tour.guidelanguage}</span>
      </div>
    )}
  </div>

  {/* Bottom Section */}
  <div className="flex justify-between items-end mt-3">
    <div>
      {/* Price display */}
      <div className="flex items-center gap-2">
        {hasPromo && (
          <p className="text-sm text-gray-400 line-through">
           {tour.currency || "SGD"} {formatPrice(tour.originalPrice)} 
          </p>
        )}
        <p className="text-lg font-bold text-[#D3202D]">
          {tour.currency || "SGD"} {formatPrice(tour.price)} 
        </p>
      </div>
    </div>

    {/* Book Now Button */}
    <button
      type="button"
      onClick={handleBookNow}
      className="rounded-lg bg-[#D3202D] text-white px-4 py-2 active:bg-[#b71c1c] transition cursor-pointer"
    >
      {isLoading ? (
        <span className="flex items-center gap-2">
          <SvgLoader className="w-4 h-4" />
          {t("common.loading")}
        </span>
      ) : (
        "Book Now"
      )}
    </button>
  </div>
</div>

</div>

    </>
  );
}

export default DaytourCard;