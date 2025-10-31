"use client";

import React, { useState } from "react";
import { Clock, MapPin, Crown } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function DaytoursCard({ tour }) {
  const { t } = useTranslation("daytour");
  const { localizedPush } = useLocalizedRouter();
  const { setSelectedTour } = useDaytoursStore();
  const [isLoading, setIsLoading] = useState(false);

  // --- ✅ Price handling
  const hasPromo =
    tour.final_promo_price && parseFloat(tour.final_promo_price) > 0;

  const displayPrice =
    hasPromo ? tour.final_promo_price : tour.final_price || tour.price;

  const originalPrice = hasPromo ? tour.final_price || tour.price : null;

  const formatPrice = (value) => {
    const num = Number(value);
    if (isNaN(num)) return "N/A";
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  // --- ✅ Book Now button handler
  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      setSelectedTour(tour);
      localizedPush("/daytours/booking");
    } catch (err) {
      console.error("❌ Booking failed:", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  return (
    <div className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden">
      {/* 🔄 Loader Overlay */}
      {isLoading && (
        <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
          <SvgLoader2 />
        </div>
      )}

      {/* 🖥️ Desktop Layout */}
      <div className="hidden md:flex items-center justify-between p-4 border rounded-xl bg-white shadow-sm">
        {/* Image */}
        <div className="relative w-[180px] flex justify-center items-center">
          <img
            src={tour.image}
            alt={tour.name}
            className="object-cover h-[120px] w-[180px] rounded-lg"
          />

          {tour.feature_type_id === 1 && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-sm font-semibold text-white bg-[#CC9A55] rounded-md">
              <Crown size={12} />
              <span>{t("card.premium", "Premium")}</span>
            </span>
          )}
        </div>

        {/* Info */}
        <div className="flex-1 px-6">
          <h2 className="font-semibold text-lg">{tour.name}</h2>
          <p className="text-sm text-gray-600 mb-2">
            {tour.city}, {tour.country}
          </p>
          <p className="line-clamp-2 my-2 text-sm text-gray-700">{tour.desc}</p>

          <div className="flex items-center gap-3 text-gray-500 text-sm mt-2">
            <span className="flex items-center gap-1">
              <Clock size={14} /> {tour.duration || t("card.noDuration", "N/A")}
            </span>
            <span className="flex items-center gap-1">
              <MapPin size={14} /> {tour.city || "N/A"}
            </span>
          </div>
        </div>

        {/* Price & Button */}
        <div className="flex flex-col items-end justify-center">
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
            <p className="text-xl font-bold text-gray-900">
              {formatPrice(displayPrice)} SGD
            </p>
          )}

          <button
            onClick={handleBookNow}
            disabled={isLoading}
            className="mt-3 bg-[#CC9A55] text-white text-sm px-5 py-2 rounded-md transition disabled:opacity-70"
          >
            {t("card.bookNow", "Book Now")}
          </button>
        </div>
      </div>

      {/* 📱 Mobile Layout */}
      <div className="md:hidden flex gap-3 items-start p-3 border rounded-xl bg-white shadow-sm">
        <div className="relative flex-shrink-0">
          <img
            src={tour.image}
            alt={tour.name}
            className="object-cover h-28 w-32 rounded-md"
          />
          {tour.feature_type_id === 1 && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-0.5 text-[10px] font-semibold text-white bg-[#CC9A55] rounded-md">
              <Crown size={10} />
              <span>{t("card.premium", "Premium")}</span>
            </span>
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-sm leading-tight line-clamp-2">
              {tour.name}
            </h2>
            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{tour.desc}</p>

            <div className="flex gap-3 text-gray-500 text-xs mt-2">
              <span className="flex items-center gap-1">
                <Clock size={12} /> {tour.duration || "N/A"}
              </span>
              <span className="flex items-center gap-1">
                <MapPin size={12} /> {tour.city || "N/A"}
              </span>
            </div>
          </div>

          <div className="flex justify-between items-center mt-3">
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

            <button
              onClick={handleBookNow}
              disabled={isLoading}
              className="bg-[#CC9A55] text-white text-xs py-2 px-3 rounded-md transition disabled:opacity-70"
            >
              {t("card.bookNow", "Book Now")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default DaytoursCard;
