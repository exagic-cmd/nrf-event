"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import AccommodationCard from "@/components/accommodations/AccommodationCard";
import Pagination from "@/components/common/Pagination";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { getFullImageUrl } from "@/utils/imageService";

const ITEMS_PER_PAGE = 8;

function AccommodationList() {
  const { t } = useTranslation("accommodation");
  const [currentPage, setCurrentPage] = useState(1);

  const {
    searchParams,
    accommodations,
    isLoading,
    error,
    fetchAccommodations,
  } = useAccommodationsStore();

  const accommodationSectionRef = useRef(null);

  // 🔍 Log current Zustand data
  useEffect(() => {
    console.log("🏨 AccommodationList Mounted");
    console.log("➡️ Zustand Search Params:", searchParams);
    console.log("➡️ Zustand Accommodations:", accommodations);
  }, [searchParams, accommodations]);

  // ✅ Fetch accommodations automatically if payload exists
  useEffect(() => {
    if (searchParams && Object.keys(searchParams).length > 0) {
      console.log("📦 Fetching accommodations with payload:", searchParams);
      fetchAccommodations(searchParams);
    }
  }, [searchParams, fetchAccommodations]);

  // 🧮 Prepare the data for UI
  const accommodationData = useMemo(() => {
    if (!accommodations || !Array.isArray(accommodations)) return [];

    return accommodations.map((item) => {
      const basePrice = parseFloat(item.price || item.rate || item.starting_price || 0);
      const promoPrice = parseFloat(item.promo_price || item.discounted_price || 0);
      const usePromo = promoPrice > 0 && promoPrice < basePrice;
      const priceToShow = usePromo ? promoPrice : basePrice;

      return {
        ...item,
        id: item.id || item.hotel_id || Math.random().toString(36).substring(2, 9),
        name: item.name || item.hotel_name || item.title || "Unnamed Accommodation",
        description: item.description || item.short_desc || "",
        image: getFullImageUrl(item.image || item.images?.[0] || item.photo),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null,
        rating: item.rating || item.star_rating || 4.0,
        reviews: item.review_count || item.reviews || 0,
        location: item.location || item.city || item.region || "",
        features: [
          item.room_type && `Room Type: ${item.room_type}`,
          item.amenities?.length > 0 && `Amenities: ${item.amenities.slice(0, 2).join(", ")}`,
          item.room_features?.length > 0 && `Features: ${item.room_features.slice(0, 2).join(", ")}`,
        ].filter(Boolean),
      };
    });
  }, [accommodations]);

  // 🧭 Auto-scroll to list when loaded
  useEffect(() => {
    if (accommodationData.length > 0 && accommodationSectionRef.current) {
      const element = accommodationSectionRef.current;
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [accommodationData]);

  // 📊 Pagination + Sorting
  const sortedAccommodations = useMemo(() => {
    const sorted = [...accommodationData];
    return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [accommodationData]);

  const totalPages = Math.ceil(sortedAccommodations.length / ITEMS_PER_PAGE);
  const paginatedAccommodations = sortedAccommodations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // 🧱 Render UI
  return (
    <div ref={accommodationSectionRef} className="space-y-6">
      {/* Error Message */}
      {error && (
        <div className="rounded-xl py-3 px-4 bg-red-50 border border-red-200">
          <p className="text-lg font-semibold text-red-700">Error: {error}</p>
        </div>
      )}

      {/* Summary Header */}
      <div className="rounded-xl py-3 px-4 bg-gray-50">
        <p className="text-lg font-semibold">
          Showing {sortedAccommodations.length} Accommodations
        </p>
      </div>

      {/* Loading */}
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
      ) : paginatedAccommodations.length > 0 ? (
        // ✅ Render accommodation cards
        <div className="space-y-6">
          {paginatedAccommodations.map((accommodation) => (
            <AccommodationCard
              key={accommodation.id}
              accommodation={accommodation}
              category="accommodation"
            />
          ))}
        </div>
      ) : (
        // No results
        <div className="text-center py-10 text-gray-500">
          No accommodations found for your search criteria.
        </div>
      )}

      {/* Pagination */}
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

export default AccommodationList;
