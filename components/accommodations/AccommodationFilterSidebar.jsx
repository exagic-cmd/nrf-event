"use client";

import React, { useState, Children, useEffect, useMemo } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
const FilterSection = ({ title, children, defaultOpen = true, scrollable = false, hasLoadMore = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  const childArray = Children.toArray(children);
  const initialItemCount = 5;
  // Use the explicit prop to decide if "Load More" is needed
  const hasMore = hasLoadMore && childArray.length > initialItemCount;

  const itemsToShow = hasMore && !showAll ? childArray.slice(0, initialItemCount) : childArray;
  const containerClasses = scrollable ? "max-h-48 overflow-y-auto pr-2 scrollbar-thin" : "space-y-3";
  return (
    <div className="border-b border-gray-200 py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className={`mt-4 ${containerClasses}`}>
          {itemsToShow}
          {hasMore && !showAll && !scrollable && (
            <button onClick={() => setShowAll(true)} className="text-sm font-medium text-[#D3202D] hover:underline pt-2">
              Load More
            </button>
          )}
          {hasMore && showAll && !scrollable && (
            <button onClick={() => setShowAll(false)} className="text-sm font-medium text-[#D3202D] hover:underline pt-2">
              Show Less
            </button>
          )}
        </div>
      )}
    </div>
  );
};

const Checkbox = ({ label, count, checked, onChange }) => (
  <label className="flex items-center space-x-3 cursor-pointer group">
    <input
      type="checkbox"
      checked={checked}
      onChange={onChange}
      className="h-4 w-4 rounded border-gray-300 text-[#D3202D] focus:ring-[#D3202D]"
    />
    <span className="text-sm text-gray-700 flex-grow">{label}</span>
    <span className="text-xs text-gray-500">{count}</span>
  </label>
);

const StarRatingFilter = ({ ratings, activeRatings, onRatingChange }) => (
  <div className="space-y-2">
    {ratings
      .sort((a, b) => b.value - a.value)
      .map(({ value, count }) => (
        <label
          key={value}
          className="flex items-center justify-between cursor-pointer"
        >
          <div className="flex items-center">
            <input
              type="checkbox"
              checked={activeRatings.includes(value)}
              onChange={() => onRatingChange(value)}
              className="h-4 w-4 rounded border-gray-300 text-[#D3202D] focus:ring-[#D3202D] mr-3"
            />
            <div className="flex items-center">
              {Array.from({ length: 5 }).map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className={
                    i < value ? "text-yellow-400 fill-yellow-400" : "text-gray-300"
                  }
                />
              ))}
            </div>
          </div>
          <span className="text-xs text-gray-500">{count}</span>
        </label>
      ))}
  </div>
);

export default function AccommodationFilterSidebar({ filters, onFilterChange }) {
  const [activeFilters, setActiveFilters] = useState({
    ratings: [],
    amenities: [],
    meal_plans: [],
    priceRange: null,
  });

  const { accommodations } = useAccommodationsStore();

  // compute min/max price from accommodations list
  const priceBounds = useMemo(() => {
    if (!accommodations || accommodations.length === 0) return { min: 0, max: 0 };
    let min = Infinity;
    let max = -Infinity;
    accommodations.forEach((acc) => {
      const price = acc?.room?.base_price || acc?.price || acc?.min_price || 0;
      const p = Number(price) || 0;
      if (p < min) min = p;
      if (p > max) max = p;
    });
    if (min === Infinity) min = 0;
    if (max === -Infinity) max = 0;
    return { min, max };
  }, [accommodations]);

  const [selectedMin, setSelectedMin] = useState(0);
  const [selectedMax, setSelectedMax] = useState(0);

  useEffect(() => {
    setSelectedMin(priceBounds.min);
    setSelectedMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  useEffect(() => {
    onFilterChange(activeFilters);
  }, [activeFilters, onFilterChange]);

  const {
    rating,
    general_amenities,
    room_amenities,
    meal_plans,
    payment_types,
    cancellation_policies,
  } = filters || {};

  const handleAmenityChange = (amenityId) => {
    setActiveFilters((prev) => {
      const newAmenities = prev.amenities.includes(amenityId)
        ? prev.amenities.filter((id) => id !== amenityId)
        : [...prev.amenities, amenityId];
      return { ...prev, amenities: newAmenities };
    });
  };

  const handleRatingChange = (ratingValue) => {
    setActiveFilters((prev) => {
      const newRatings = prev.ratings.includes(ratingValue)
        ? prev.ratings.filter((r) => r !== ratingValue)
        : [...prev.ratings, ratingValue];
      return { ...prev, ratings: newRatings };
    });
  };

  const clearAllFilters = () => setActiveFilters({ ratings: [], amenities: [], meal_plans: [], priceRange: null });

  const applyPriceRange = () => {
    setActiveFilters((prev) => ({ ...prev, priceRange: { min: priceBounds.min, max: Number(selectedMax || 0) } }));
  };

  const clearPriceRange = () => {
    setSelectedMin(priceBounds.min);
    setSelectedMax(priceBounds.max);
    setActiveFilters((prev) => ({ ...prev, priceRange: null }));
  };

  // Group amenities by their category (amenity_name)
  const amenitiesByCategory = (general_amenities || []).reduce((acc, amenity) => {    
    const category = amenity.amenity_name || 'General';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(amenity);
    return acc;
  }, {});

  const hasActiveFilters =

    activeFilters.ratings.length > 0 ||
    activeFilters.amenities.length > 0 ||
    activeFilters.meal_plans.length > 0;

  return (
    <div className="w-full rounded-xl bg-white p-4 shadow">
      <div className="sticky top-0 bg-white z-10 flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-bold text-gray-900">Filter By</h2>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-sm font-medium text-[#D3202D] hover:underline">
            Clear All
          </button>
        )}
      </div>

      {rating && rating.length > 0 && (
        <FilterSection title="Star Rating">
         <StarRatingFilter
            ratings={rating}
            activeRatings={activeFilters.ratings}
            onRatingChange={handleRatingChange}
          />
        </FilterSection>
      )}

      {/* Price Range Filter */}
      <FilterSection title="Price Range" defaultOpen={true} scrollable={false}>
       <div className="space-y-4 pt-2">
          <div className="relative">
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max > 0 ? priceBounds.max : 1000}
              value={selectedMax}
              onChange={(e) => setSelectedMax(Number(e.target.value))}
              onMouseUp={applyPriceRange} // Apply when user releases the slider
              onTouchEnd={applyPriceRange} // Apply for touch devices
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>{priceBounds.min}</span>
              <span>{priceBounds.max > 0 ? priceBounds.max : 1000}</span>
            </div>
         </div>
        </div>
      </FilterSection>

      {Object.entries(amenitiesByCategory).map(([category, amenities]) => (
        <FilterSection key={category} title={category} scrollable={false} hasLoadMore={true}>
         {amenities.map((amenity) => (
            <Checkbox
              key={amenity.label}
              label={amenity.label}
              count={amenity.count}
              checked={activeFilters.amenities.includes(amenity.label)}
              onChange={() => handleAmenityChange(amenity.label)}
            />
          ))}
        </FilterSection>
      ))}

      {meal_plans && meal_plans?.length > 0 && (
       <FilterSection title="Meal Plan" hasLoadMore={true}>
          {meal_plans.map((plan) => (
            <Checkbox key={plan?.code} label={plan?.name || plan?.code?.replace('_', ' ')} count={plan?.count} />
          ))}
        </FilterSection>
      )}

      {payment_types && payment_types.length > 0 && (
       <FilterSection title="Payment Type" hasLoadMore={true}>
          {payment_types.map((type) => (
            <Checkbox key={type.value} label={(type.name || type.value).replace('_', ' ')} count={type.count} />
          ))}
        </FilterSection>
      )}

      {cancellation_policies && cancellation_policies.length > 0 && (
       <FilterSection title="Cancellation Policy" defaultOpen={false} hasLoadMore={true}>
         {cancellation_policies.map((policy) => (
            <Checkbox key={policy.id} label={policy.name} count={policy.count} />
          ))}
        </FilterSection>
      )}
    </div>
  );
}