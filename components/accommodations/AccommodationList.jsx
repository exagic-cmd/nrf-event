import React, { useState, useEffect, useMemo } from "react";
import AccommodationCard from "./AccommodationCard";
import SvgLoader2 from "@/components/common/Loader2Svg";
import Pagination from "@/components/common/Pagination";
import { ChevronDown } from "lucide-react";

const ITEMS_PER_PAGE = 10;

function AccommodationList({ accommodations, isLoading, isSubLoading, sortBy, setSortBy }) {
  const [showNoResults, setShowNoResults] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    if (!isLoading && accommodations && accommodations.length === 0) {
      setShowNoResults(true);
    } else {
      setShowNoResults(false);
    }
  }, [accommodations, isLoading]);

  const sortedAccommodations = useMemo(() => {
    if (!accommodations) return [];
    const accommodationsCopy = [...accommodations];

    const getPrice = (acc) => {
      // Handle Stuba (link_type_id === 9 or has Hotel_Data)
      if (acc.link_type_id == 9 || acc.Hotel_Data) {
        if (acc.Result) {
          const allPrices = [];
          Object.values(acc.Result).forEach(roomType => {
            if (roomType && typeof roomType === 'object') {
              Object.values(roomType).forEach(option => {
                if (option?.TotalPrice) {
                  allPrices.push(parseFloat(option.TotalPrice));
                }
              });
            }
          });
          if (allPrices.length > 0) return Math.min(...allPrices);
        }
        return parseFloat(acc.price || acc.Hotel_Data?.starting_price || 0);
      }

      return (
        acc?.room?.rate_plan?.pricing?.per_room_total_promo ||
        acc?.room?.rate_plan?.pricing?.per_room_total ||
        acc?.room?.base_price || 
        acc?.price || 0
      );
    };

    switch (sortBy) {
      case "price_desc":
        return accommodationsCopy.sort((a, b) => getPrice(b) - getPrice(a));
      case "price_asc":
        return accommodationsCopy.sort((a, b) => getPrice(a) - getPrice(b));
      case "rating_desc":
        return accommodationsCopy.sort((a, b) => (b.star_rating || b.stars || 0) - (a.star_rating || a.stars || 0));
      case "rating_asc":
        return accommodationsCopy.sort((a, b) => (a.star_rating || a.stars || 0) - (b.star_rating || b.stars || 0));
      default:
        return accommodationsCopy;
    }
  }, [accommodations, sortBy]);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <SvgLoader2 />
      </div>
    );
  }

  if (showNoResults) {
    return (
      <div className="text-center py-16 bg-surface rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-foreground">No accommodations found</h3>
        <p className="text-muted-foreground mt-2">Please try different dates, guest configurations, or filters.</p>
      </div>
    );
  }

  const totalPages = Math.ceil((sortedAccommodations?.length || 0) / ITEMS_PER_PAGE);
  const paginatedAccommodations = sortedAccommodations.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      {/* <div className="flex justify-end items-center">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => { setCurrentPage(1); setSortBy(e.target.value); }}
            className="appearance-none bg-surface border border-border rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D3202D] focus:border-transparent"
          >
            <option value="default">Sort by</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="rating_desc">Rating: High to Low</option>
            <option value="rating_asc">Rating: Low to High</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </div> */}
      {paginatedAccommodations.map((accommodation, index) => (
        <AccommodationCard
          key={accommodation.Hotel_Data?.id || accommodation.id || index}
          accommodation={accommodation}
        />
      ))}
      {isSubLoading && (
        <div className="relative border rounded-xl shadow-sm bg-surface w-full mx-auto overflow-hidden flex flex-col md:flex-row gap-3 min-h-[120px] items-center justify-center px-6 py-8">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            <p className="text-sm font-medium text-muted-foreground tracking-wide">Crafting hotels...</p>
          </div>
        </div>
      )}
      {totalPages > 1 && (
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