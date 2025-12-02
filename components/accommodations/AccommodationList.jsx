import React, { useState } from "react";
import AccommodationCard from "./AccommodationCard";
import SvgLoader2 from "@/components/common/Loader2Svg";

function AccommodationList({ accommodations, isLoading }) {
  const [visibleCount, setVisibleCount] = useState(3);

  const handleLoadMore = () => {
    setVisibleCount(accommodations.length);
    
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <SvgLoader2 />
      </div>
    );
  }

  if (!accommodations || accommodations.length === 0) {
    return (
      <div className="text-center py-12 bg-white rounded-lg shadow-md">
        <h3 className="text-xl font-semibold">No Accommodations Found</h3>
        <p className="text-gray-500 mt-2">Try adjusting your search or filters.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {accommodations.slice(0, visibleCount).map((accommodation) => (
        <AccommodationCard key={accommodation.id} accommodation={accommodation} />
      ))}
      {visibleCount < accommodations.length && (
        <div className="text-center mt-6">
          <button
            onClick={handleLoadMore}
            className="w-full bg-[#D3202D] text-white font-semibold text-base sm:text-lg px-6 py-3 rounded-lg shadow-md hover:bg-[#b71c1c] active:bg-[#a31919] transition-colors duration-300"
          >
            Load More
          </button>
        </div>
      )}
    </div>
  );
}

export default AccommodationList;