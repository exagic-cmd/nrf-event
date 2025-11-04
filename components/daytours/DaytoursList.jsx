import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import DaytourCard from "@/components/daytours/DayTourCard";
import Pagination from "@/components/common/Pagination";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { getFullImageUrl } from "@/utils/imageService";

const ITEMS_PER_PAGE = 8;

function DaytoursList({ searchParams, filteredDaytours = null }) {
  const { t } = useTranslation('daytour');
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, filteredResults, isLoading } = useDaytoursStore();

  const daytoursSectionRef = useRef(null);

  // Priority: filteredDaytours (from FilterSidebar) -> filteredResults (from store) -> searchResults
  const activeData = useMemo(() => {
    if (filteredDaytours && Array.isArray(filteredDaytours) && filteredDaytours.length > 0) {
      return filteredDaytours;
    }
    if (filteredResults && Array.isArray(filteredResults) && filteredResults.length > 0) {
      return filteredResults;
    }
    return searchResults;
  }, [filteredDaytours, filteredResults, searchResults]);

  const daytoursData = useMemo(() => {
    if (!activeData || !Array.isArray(activeData)) return [];

    return activeData.map((item) => {
      const basePrice = parseFloat(item.adult_price || item.starting_price);
      const promoPrice = parseFloat(item.final_promo_price || 0);
      const usePromo = promoPrice > 0 && promoPrice < basePrice;
      const priceToShow = usePromo ? promoPrice : basePrice;

      let landmarks = [];
      try {
        landmarks = JSON.parse(item.landmark_ids || "[]");
      } catch {
        landmarks = [];
      }

      return {
        ...item,
        id: item.id,
        name: item.product_title,
        description: item.product_content_desc || item.short_desc,
        image: getFullImageUrl(item.image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null,
        duration: item.tour_duration ? `${item.tour_duration} hours` : null,
        rating: 4.5,
        reviews: 0,
        adultPrice: item.adult_price,
        childPrice: item.child_price,
        landmarks,
        features: [
          item.tour_duration && `Duration: ${item.tour_duration} hours`,
          item.physical_aspect?.length > 0 && `Physical: ${item.physical_aspect.join(", ")}`,
          item.activity_intensity?.length > 0 && `Intensity: ${item.activity_intensity.join(", ")}`,
          item.preference_activities?.length > 0 && `Activities: ${item.preference_activities.slice(0, 2).join(", ")}`,
        ].filter(Boolean),
        rawData: item,
      };
    });
  }, [activeData]);

  useEffect(() => {
    if (activeData && activeData.length > 0 && daytoursSectionRef.current) {
      const y = daytoursSectionRef.current.getBoundingClientRect().top + window.scrollY - 100;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [activeData]);

  // Reset to first page when filtered data changes
  useEffect(() => {
    setCurrentPage(1);
  }, [filteredDaytours, filteredResults, searchResults]);

  const sortedDaytours = useMemo(() => {
    const sortableDaytours = [...daytoursData];
    return sortableDaytours.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [daytoursData]);

  const totalPages = Math.ceil(sortedDaytours.length / ITEMS_PER_PAGE);
  const paginatedDaytours = sortedDaytours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  // Show loading state only if we're loading from the store AND no filtered data is provided
  const showLoading = isLoading && !filteredDaytours;

  return (
    <div ref={daytoursSectionRef} className="space-y-6">
      <div className="rounded-xl py-3 px-4 bg-gray-50">
        <p className="text-lg font-semibold">
          Showing {sortedDaytours.length} Day Tours
          {filteredDaytours && filteredDaytours.length > 0 && (
            <span className="text-sm text-gray-600 ml-2">
              (Filtered from {searchResults?.length || 0} total)
            </span>
          )}
        </p>
      </div>

      {showLoading ? (
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
      ) : paginatedDaytours.length > 0 ? (
        <div className="space-y-6">
          {paginatedDaytours.map((tour) => (
            <DaytourCard key={tour.id} tour={tour} category="daytour" />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {activeData && activeData.length > 0
            ? `Found ${activeData.length} tours but none are active or processable`
            : "No day tours found for your search criteria."}
        </div>
      )}

      {!showLoading && totalPages > 1 && (
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