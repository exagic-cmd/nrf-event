"use client";

import React, { useState, Children, useEffect, useMemo, useCallback } from "react";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { Star, ChevronDown, ChevronUp } from "lucide-react";
const FilterSection = ({ title, children, defaultOpen = true, scrollable = false, hasLoadMore = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [showAll, setShowAll] = useState(false);

  const childArray = Children.toArray(children);
  const initialItemCount = 5;
  // Use the explicit prop to decide if "Load More" is needed
  const canLoadMore = hasLoadMore && childArray.length > initialItemCount;

  const itemsToShow = canLoadMore && !showAll ? childArray.slice(0, initialItemCount) : childArray;
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
          {canLoadMore && !showAll && !scrollable && (
            <button onClick={() => setShowAll(true)} className="text-sm font-medium text-[#D3202D] hover:underline pt-2">
              Load More
            </button>
          )}
          {canLoadMore && showAll && !scrollable && (
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
    {count > 0 && <span className="text-xs text-gray-500">{count}</span>}
    {/* {count > 0 && <span className="text-xs text-gray-500">{count}</span>} */}
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

const FILTER_CONFIG = {
  rating: {
    title: "Star Rating",
    Component: StarRatingFilter,
    getProps: (items, activeFilters, handler) => ({
      ratings: items,
      activeRatings: activeFilters.ratings,
      onRatingChange: (value) => handler('ratings', value),
    }),
  },
  general_amenities: {
    title: "General Amenities",
    defaultOpen: true,
    handlerKey: 'amenities',
    itemKey: 'id',
    itemLabel: 'label',
  },
  room_amenities: {
    title: "Room Amenities",
    defaultOpen: false,
    handlerKey: 'room_amenities',
    itemKey: 'id',
    itemLabel: 'name',
  },
  meal_plans: {
    title: "Meal Plan",
    handlerKey: 'meal_plans',
    itemKey: 'id',
    itemLabel: 'title',
  },
  payment_types: {
    title: "Payment Type",
    handlerKey: 'payment_types',
    itemKey: 'value',
    itemLabel: 'value',
  },
  cancellation_policies: {
    title: "Cancellation Policy",
    handlerKey: 'cancellation_policies',
    itemKey: 'id',
    itemLabel: 'name',
  },
  // Default config for any other filter type
  default: {
    handlerKey: (key) => key,
    itemKey: 'id',
    itemLabel: (item) => item.title || item.name || item.value,
  },
};

export default function AccommodationFilterSidebar({ filters, onFilterChange, sortBy, onSortChange }) {
  const [activeFilters, setActiveFilters] = useState({
    ratings: [],
    amenities: [],
    room_amenities: [],
    meal_plans: [], // by code
    payment_types: [], // by value
    cancellation_policies: [], // by id
    priceRange: null,
    searchText: "",
  });
  const { accommodations } = useAccommodationsStore();

  // compute min/max price from accommodations list
  const priceBounds = useMemo(() => {
    if (!accommodations || accommodations.length === 0) return { min: 0, max: 1000 };
    let min = Infinity;
    let max = -Infinity;
    accommodations.forEach((acc) => {
      const price = acc?.room?.base_price || acc?.price || acc?.min_price || 0;
      const p = Number(price) || 0;
      if (p < min) min = p;
      if (p > max) max = p;
    });
    if (min === Infinity) min = 0; // fallback
    if (max === -Infinity || max === 0) max = 1000; // fallback
    return { min, max };
  }, [accommodations]);

  const [selectedMin, setSelectedMin] = useState(0);
  const [selectedMax, setSelectedMax] = useState(0);

  useEffect(() => {
    setSelectedMin(priceBounds.min);
    setSelectedMax(priceBounds.max);
  }, [priceBounds.min, priceBounds.max]);

  const memoizedOnFilterChange = useCallback(onFilterChange, [onFilterChange]);
  useEffect(() => { memoizedOnFilterChange(activeFilters); }, [activeFilters, memoizedOnFilterChange]);

  const handleFilterArrayChange = (filterKey, value) => {
    setActiveFilters((prev) => {
      const currentValues = prev[filterKey] || [];
      const newValues = currentValues.includes(value)
        ? currentValues.filter((v) => v !== value)
        : [...currentValues, value];
      return { ...prev, [filterKey]: newValues };
    });
  };

  const clearAllFilters = () => {
    setActiveFilters({ ratings: [], amenities: [], room_amenities: [], meal_plans: [], payment_types: [], cancellation_policies: [], priceRange: null, searchText: "" });
    setSelectedMin(priceBounds.min);
    setSelectedMax(priceBounds.max);
    onSortChange("default");
  };

  const applyPriceRange = () => {
    setActiveFilters((prev) => ({ ...prev, priceRange: { min: Number(selectedMin || 0), max: Number(selectedMax || 0) } }));
  };
  const clearPriceRange = () => {
    setSelectedMin(priceBounds.min);
    setSelectedMax(priceBounds.max);
    setActiveFilters((prev) => ({ ...prev, priceRange: null }));
  };
  const hasActiveFilters = useMemo(() => {
    return sortBy !== 'default' || Object.values(activeFilters).some(value => {
      if (Array.isArray(value)) return value.length > 0;
      if (value && typeof value === 'object') return Object.keys(value).length > 0;
      return false;
    });
  }, [activeFilters, sortBy]);

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

      {/* Search & Sort Section */}
      <FilterSection title="Search & Sort" defaultOpen={true}>
        {/* Hotel Name Search */}
        <div className="relative mb-4"> {/* Added mb-4 for spacing */}
          <input
            type="text"
            placeholder="Search by name..."
            value={activeFilters.searchText}
            onChange={(e) => {
              const { value } = e.target;
              setActiveFilters(prev => ({ ...prev, searchText: value }));
            }}
            className="w-full border border-gray-300 rounded-lg py-2 pl-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none bg-white border border-gray-300 rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-gray-700 focus:outline-none focus:ring-2 focus:ring-[#D3202D] focus:border-transparent"
          >
            <option value="default">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none" />
        </div>
      </FilterSection>

      {/* Price Range Filter - Always present */}
      <FilterSection title="Price Range" defaultOpen={true} scrollable={false}>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Min</span>
              <input
                type="text"
                value={Math.round(selectedMin)}
                onChange={(e) => setSelectedMin(Number(e.target.value))}
                onBlur={applyPriceRange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-2 text-xs text-center"
              />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-gray-500">Max</span>
              <input
                type="text"
                value={Math.round(selectedMax)}
                onChange={(e) => setSelectedMax(Number(e.target.value))}
                onBlur={applyPriceRange}
                className="w-full rounded-lg border border-gray-300 bg-gray-50 py-2 pl-10 pr-2 text-xs text-center"
              />
            </div>
          </div>
          <div className="relative">
            <input
              type="range"
              min={priceBounds.min}
              max={priceBounds.max}
              value={selectedMax}
              onChange={(e) => setSelectedMax(Number(e.target.value))}
              onMouseUp={applyPriceRange} // Apply when user releases the slider
              onTouchEnd={applyPriceRange} // Apply for touch devices
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
         </div>
        </div>
      </FilterSection>

      {Object.entries(filters || {}).map(([key, items]) => {
        if (!items || items.length === 0 || key === 'room_amenities') return null;

        const config = FILTER_CONFIG[key] || {};
        const title = config.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (config.Component) {
          const { Component, getProps } = config;
          return (
            <FilterSection key={key} title={title} defaultOpen={config.defaultOpen !== false}>
              <Component {...getProps(items, activeFilters, handleFilterArrayChange)} />
            </FilterSection>
          );
        }

        const handlerKey = config.handlerKey || FILTER_CONFIG.default.handlerKey(key);
        const itemKeyProp = config.itemKey || FILTER_CONFIG.default.itemKey;

        return (
          <FilterSection key={key} title={title} hasLoadMore={items.length > 5} defaultOpen={config.defaultOpen}>
            {items.map((item) => {
              const itemLabel = typeof config.itemLabel === 'function' ? config.itemLabel(item) : item[config.itemLabel];
              const itemKey = item[itemKeyProp] ?? item.value ?? item.id;
              return (
                <Checkbox
                  key={itemKey}
                  label={itemLabel}
                  count={item.count}
                  checked={(activeFilters[handlerKey] || []).includes(itemKey)}
                  onChange={() => handleFilterArrayChange(handlerKey, itemKey)}
                />
              );
            })}
          </FilterSection>
        );
      })}
    </div>
  );
}