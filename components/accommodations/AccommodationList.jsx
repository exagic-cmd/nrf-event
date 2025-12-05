import React, { useState, useEffect } from "react";
import AccommodationCard from "./AccommodationCard";
import SvgLoader2 from "@/components/common/Loader2Svg";

function AccommodationList({ accommodations, isLoading }) {
  const [visibleCount, setVisibleCount] = useState(3);
  const INCREMENT_BY = 3;
  const [showNoResults, setShowNoResults] = useState(false);

  useEffect(() => {
    if (!isLoading && accommodations && accommodations.length === 0) {
      setShowNoResults(true);
      const timer = setTimeout(() => {
        setShowNoResults(false);
      }, 5000); // Hide after 5 seconds
      return () => clearTimeout(timer);
    }
  }, [accommodations, isLoading]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) =>
      Math.min(prevCount + INCREMENT_BY, accommodations.length)
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96">
        <SvgLoader2 />
      </div>
    );
  }

  if (showNoResults) {
    return (
      <div className="text-center py-16 bg-white rounded-xl shadow-md">
        <h3 className="text-xl font-semibold text-gray-800">No accommodations found</h3>
        <p className="text-gray-500 mt-2">Please try different dates, guest configurations, or filters.</p>
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