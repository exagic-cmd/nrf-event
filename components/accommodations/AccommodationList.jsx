import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import AccommodationCard from "@/components/accommodations/AccommodationCard";
import Pagination from "@/components/common/Pagination";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { getFullImageUrl } from "@/utils/imageService"

const ITEMS_PER_PAGE = 8;

function AccommodationList({ searchParams }) {
  const { t } = useTranslation('accommodation');
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, isLoading } = useDaytoursStore();

  const accommodationSectionRef = useRef(null);

  const accommodationData = useMemo(() => {
    if (!searchResults || !Array.isArray(searchResults)) {
      return [];
    }
    
    return searchResults.map(item => {
      const basePrice = parseFloat(item.adult_price || item.starting_price);
      const promoPrice = parseFloat(item.final_promo_price || 0);
      const usePromo = promoPrice > 0 && promoPrice < basePrice;
      const priceToShow = usePromo ? promoPrice : basePrice;

      return {
        ...item,
        id: item.id,
        name: item.product_title,
        description: item.product_content_desc || item.short_desc,
        image: getFullImageUrl(item.image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null,
        rating: 4.5,
        reviews: 0,
        location: item.location,
        features: [
          item.room_type && `Room Type: ${item.room_type}`,
          item.amenities && item.amenities.length > 0 && `Amenities: ${item.amenities.slice(0, 2).join(', ')}`,
          item.physical_aspect && item.physical_aspect.length > 0 && `Accessibility: ${item.physical_aspect.join(', ')}`,
        ].filter(Boolean),
        rawData: item,
      };
    });
  }, [searchResults]);

  useEffect(() => {
    if (searchResults && searchResults.length > 0 && accommodationSectionRef.current) {
      const element = accommodationSectionRef.current;
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [searchResults]);

  const sortedAccommodations = useMemo(() => {
    const sortableAccommodations = [...accommodationData];
    return sortableAccommodations.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [accommodationData]);

  const totalPages = Math.ceil(sortedAccommodations.length / ITEMS_PER_PAGE);
  const paginatedAccommodations = sortedAccommodations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div ref={accommodationSectionRef} className="space-y-6">
      <div className="rounded-xl py-3 px-4 bg-gray-50">
        <p className="text-lg font-semibold">
          Showing {sortedAccommodations.length} Accommodations
        </p>
      </div>

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
        <div className="space-y-6">
          {paginatedAccommodations.map((accommodation) => (
            <AccommodationCard key={accommodation.id} accommodation={accommodation} category="accommodation" />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {searchResults && searchResults.length > 0 
            ? `Found ${searchResults.length} accommodations but none are active or processable` 
            : 'No accommodations found for your search criteria.'
          }
        </div>
      )}

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