// components/accommodations/AccommodationList.jsx
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
  } = useAccommodationsStore();

  const accommodationSectionRef = useRef(null);

  // Debug logs
  useEffect(() => {
    console.log("🏨 AccommodationList Mounted");
    console.log("➡️ Zustand Search Params:", searchParams);
    console.log("➡️ Zustand Accommodations:", accommodations);
    console.log("➡️ Loading State:", isLoading);
    console.log("➡️ Error State:", error);
  }, [searchParams, accommodations, isLoading, error]);

  // Prepare the data for UI
  const accommodationData = useMemo(() => {
    if (!accommodations || !Array.isArray(accommodations)) {
      console.log("❌ No accommodations data or not an array");
      return [];
    }

    console.log("✅ Processing accommodations data:", accommodations.length, "items");
    
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

  // Auto-scroll to list when loaded
  useEffect(() => {
    if (accommodationData.length > 0 && accommodationSectionRef.current && !isLoading) {
      console.log("🎯 Auto-scrolling to accommodation list");
      const element = accommodationSectionRef.current;
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [accommodationData, isLoading]);

  // Pagination + Sorting
  const sortedAccommodations = useMemo(() => {
    const sorted = [...accommodationData];
    return sorted.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [accommodationData]);

  const totalPages = Math.ceil(sortedAccommodations.length / ITEMS_PER_PAGE);
  const paginatedAccommodations = sortedAccommodations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Show different states based on the current situation
  const renderContent = () => {
    // No search performed yet
    if (!searchParams && !isLoading && accommodations.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg mb-2">Ready to find your perfect stay?</p>
          <p>Enter your search criteria above to see available accommodations.</p>
        </div>
      );
    }

    // Loading state
    if (isLoading) {
      return (
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
          <span className="ml-3 text-gray-600">Searching for accommodations...</span>
        </div>
      );
    }

    // Error state
    if (error) {
      return (
        <div className="rounded-xl py-3 px-4 bg-red-50 border border-red-200">
          <p className="text-lg font-semibold text-red-700">Error: {error}</p>
        </div>
      );
    }

    // Search performed but no results
    if (searchParams && paginatedAccommodations.length === 0) {
      return (
        <div className="text-center py-10 text-gray-500">
          <p className="text-lg mb-2">No accommodations found</p>
          <p>Try adjusting your search criteria or dates.</p>
        </div>
      );
    }

    // Show results
    return (
      <div className="space-y-6">
        {paginatedAccommodations.map((accommodation) => (
          <AccommodationCard
            key={accommodation.id}
            accommodation={accommodation}
            category="accommodation"
          />
        ))}
      </div>
    );
  };

  return (
    <div ref={accommodationSectionRef} className="space-y-6">
      {/* Summary Header - Only show when we have search params */}
      {searchParams && (
        <div className="rounded-xl py-3 px-4 bg-gray-50">
          <p className="text-lg font-semibold">
            {isLoading ? "Searching..." : `Showing ${sortedAccommodations.length} Accommodations`}
          </p>
          {searchParams.search && (
            <p className="text-sm text-gray-600">
              For: {searchParams.search} • {searchParams.start_date} to {searchParams.end_date}
            </p>
          )}
        </div>
      )}

      {/* Main Content */}
      {renderContent()}

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
