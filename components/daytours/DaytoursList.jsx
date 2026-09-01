import React, { useState, useMemo, useEffect } from 'react';
import { useTranslation } from 'next-i18next';
import DaytourCard from "@/components/daytours/DayTourCard";
import Pagination from "@/components/common/Pagination";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { getFullImageUrl } from "@/utils/imageService";

const ITEMS_PER_PAGE = 8;

function DaytoursList({ searchTerm, sortBy }) {
  const { t } = useTranslation('daytour');
  const [currentPage, setCurrentPage] = useState(1);
  const { 
    searchResults, 
    filteredResults, 
    isLoading,
  } = useDaytoursStore();
   const activeData = useMemo(() => {
    if (filteredResults && Array.isArray(filteredResults) && filteredResults.length > 0) {
      return filteredResults;
    }
    return searchResults;
  }, [filteredResults, searchResults]);

  const daytoursData = useMemo(() => {
    if (!activeData || !Array.isArray(activeData)) return [];

    return activeData
      
      .map((item) => {
      console.log("Processing Daytour Item:", item);
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
        tourtype: item.tour_type,
        shareTour: item.share_tour,
        guidelanguage: item.guide_language,
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
    if (currentPage !== 1) {
      setCurrentPage(1);
    }
  }, [filteredResults, searchResults, searchTerm, sortBy]);

  const processedDaytours = useMemo(() => {
    let filtered = [...daytoursData];

    // Apply search term
    if (searchTerm) {
      filtered = filtered.filter(tour =>
        tour.name.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
switch (sortBy) {
      case 'price_asc':
        filtered.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        filtered.sort((a, b) => b.price - a.price);
        break;
      case 'name_asc':
        filtered.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'name_desc':
        filtered.sort((a, b) => b.name.localeCompare(a.name));
        break;
      default:
        break;
    }

    return filtered;
  }, [daytoursData, searchTerm, sortBy]);

  const totalPages = Math.ceil(processedDaytours.length / ITEMS_PER_PAGE);
  const paginatedDaytours = processedDaytours.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const showLoading = isLoading;

  return (
    <div className="space-y-6">
      <div className="rounded-xl py-3 px-4 bg-surface">
        <p className="text-lg font-semibold">
          Showing {processedDaytours.length} Day Tours
        </p>
      </div>

      {showLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-8 w-8 text-primary"
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
        <div className="text-center py-16 bg-surface rounded-xl shadow-md">
          <h3 className="text-xl font-semibold text-foreground">No Day Tours Found</h3>
          <p className="text-muted-foreground mt-2">
            Please try adjusting your search criteria or filters.
          </p>
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