"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { getFullImageUrl } from "@/utils/imageService";
import { Users, Clock, MapPin } from "lucide-react";
import Pagination from "@/components/common/Pagination";

const ITEMS_PER_PAGE = 8;

function DaytoursList({ tours = [] }) {
  const { t } = useTranslation(["daytour"]);
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);

  const isLoading = useDaytoursStore((state) => state.isLoading);
  const tourSectionRef = useRef(null);

  useEffect(() => {
    if (tours.length > 0 && tourSectionRef.current) {
      const yOffset = -100;
      const y =
        tourSectionRef.current.getBoundingClientRect().top +
        window.scrollY +
        yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [tours]);

  const formattedTours = useMemo(() => {
    return tours.map((item, index) => {
      const basePrice = parseFloat(item.final_price || item.price || 0);
      const promoPrice = parseFloat(item.final_promo_price || 0);
      const usePromo = promoPrice > 0;
      const priceToShow = usePromo ? promoPrice : basePrice;

      const uniqueId =
        item.id ||
        item.product_id ||
        `${item.product_name || "tour"}-${index}`;

      return {
        id: uniqueId,
        name: item.product_title,
        desc: item.short_desc,
        image: getFullImageUrl(
          item.thumbnail || item.image || item.image_url || ""
        ),
        duration: item.tour_duration,
        price: item.starting_price
          ? parseFloat(item.starting_price)
          : priceToShow,
        promoPrice: usePromo ? promoPrice : null,
        currency: item.currency || "USD",
        location: item.city_name || item.country_name || "",
      };
    });
  }, [tours]);

  const sortedTours = useMemo(() => {
    const sorted = [...formattedTours];
    if (sortBy === "cheapest") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "expensive") sorted.sort((a, b) => b.price - a.price);
    return sorted;
  }, [formattedTours, sortBy]);

  const totalPages = Math.ceil(sortedTours.length / ITEMS_PER_PAGE);
  const paginatedTours = sortedTours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  return (
    <div ref={tourSectionRef} className="space-y-4">
      {/* 🔽 Sorting Header */}
      <div className="rounded-xl py-3 px-4 bg-gray-50 flex justify-between items-center">
        <p className="text-lg font-semibold">
          {t("results.showingDaytours", "Showing Day Tours")}
        </p>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="border border-gray-300 rounded-md px-2 py-1 text-sm focus:outline-none"
        >
          <option value="cheapest">{t("sort.cheapest", "Cheapest First")}</option>
          <option value="expensive">
            {t("sort.expensive", "Most Expensive First")}
          </option>
        </select>
      </div>

      {/* 🌀 Loading */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-8 w-8 text-[#CC9A55]"
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
      ) : paginatedTours.length > 0 ? (
        <div className="space-y-4">
          {paginatedTours.map((tour, index) => (
            <div
              key={`${tour.id}-${index}`}
              className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden"
            >
              {/* Desktop View */}
              <div className="hidden md:flex relative items-center justify-between border rounded-xl bg-white shadow-sm p-4 w-full">
                {/* Left - Image */}
                <div className="w-[180px] flex justify-center items-center">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="object-cover h-[120px] w-[180px] rounded-lg"
                  />
                </div>

                {/* Middle - Info */}
                <div className="flex-1 px-6">
                  <h2 className="font-semibold text-lg">{tour.name}</h2>
                  {tour.location && (
                    <p className="flex items-center text-sm text-gray-500 gap-1">
                      <MapPin size={14} /> {tour.location}
                    </p>
                  )}
                  <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                    {tour.desc}
                  </p>

                  {tour.duration && (
                    <div className="flex items-center gap-1 text-sm text-gray-500 mt-2">
                      <Clock size={14} /> {tour.duration} hrs
                    </div>
                  )}
                </div>

                {/* Right - Price + Button */}
                <div className="flex flex-col items-end">
                  {tour.promoPrice ? (
                    <>
                      <p className="text-sm text-gray-400 line-through">
                        {tour.currency}
                        {formatPrice(tour.price)}
                      </p>
                      <p className="text-xl font-bold text-[#CC9A55]">
                        {tour.currency}
                        {formatPrice(tour.promoPrice)}
                      </p>
                    </>
                  ) : (
                    <p className="text-xl font-bold text-gray-900">
                      {tour.currency}
                      {formatPrice(tour.price)}
                    </p>
                  )}

                  <button
                    className="mt-3 bg-[#CC9A55] text-white text-sm px-5 py-2 rounded-md transition hover:bg-[#b88849]"
                  >
                    {t("card.bookNow", "Book Now")}
                  </button>
                </div>
              </div>

              {/* Mobile View */}
              <div className="md:hidden border rounded-xl bg-white shadow-sm p-3 flex gap-3 items-start">
                <div className="flex-shrink-0">
                  <img
                    src={tour.image}
                    alt={tour.name}
                    className="object-cover h-28 w-32 rounded-md"
                  />
                </div>

                <div className="flex-1 flex flex-col justify-between">
                  <h2 className="font-semibold text-sm leading-tight line-clamp-2 h-10">
                    {tour.name}
                  </h2>
                  {tour.location && (
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} /> {tour.location}
                    </p>
                  )}
                  <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                    {tour.desc}
                  </p>

                  <div className="flex justify-between items-center mt-2">
                    <div>
                      {tour.promoPrice ? (
                        <>
                          <p className="text-xs text-gray-400 line-through">
                            {tour.currency}
                            {formatPrice(tour.price)}
                          </p>
                          <p className="text-sm font-bold text-[#CC9A55]">
                            {tour.currency}
                            {formatPrice(tour.promoPrice)}
                          </p>
                        </>
                      ) : (
                        <p className="text-sm font-bold text-gray-900">
                          {tour.currency}
                          {formatPrice(tour.price)}
                        </p>
                      )}
                    </div>
                    <button className="bg-[#CC9A55] text-white text-xs py-1.5 px-3 rounded-md">
                      {t("card.bookNow", "Book Now")}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {t("results.noDaytoursFound", "No day tours found")}
        </div>
      )}

      {/* 📚 Pagination */}
      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}

export default DaytoursList;
