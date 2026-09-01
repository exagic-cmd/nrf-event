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
    <div className="border-b border-border py-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex w-full items-center justify-between text-left"
      >
        <h3 className="text-md font-semibold text-foreground">{title}</h3>
        {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
      </button>
      {isOpen && (
        <div className={`mt-4 ${containerClasses}`}>
          {itemsToShow}
          {canLoadMore && !showAll && !scrollable && (
            <button onClick={() => setShowAll(true)} className="text-sm font-medium text-primary hover:underline pt-2">
              Load More
            </button>
          )}
          {canLoadMore && showAll && !scrollable && (
            <button onClick={() => setShowAll(false)} className="text-sm font-medium text-primary hover:underline pt-2">
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
      className="h-4 w-4 rounded border-border text-primary focus:ring-[#D3202D]"
    />
    <span className="text-sm text-muted-foreground flex-grow">{label}</span>
    {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>}
    {/* {count > 0 && <span className="text-xs text-muted-foreground">{count}</span>} */}
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
              className="h-4 w-4 rounded border-border text-primary focus:ring-[#D3202D] mr-3"
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
          <span className="text-xs text-muted-foreground">{count}</span>
        </label>
      ))}
  </div>
);

const MEAL_NORMALIZE_MAP = {
  // Ratehawk values
  nomeal: 'room_only',
  breakfast: 'breakfast',
  halfboard: 'half_board',
  fullboard: 'full_board',
  allinclusive: 'all_inclusive',
  // Stuba text values (lowercased)
  'room only': 'room_only',
  'half board': 'half_board',
  'full board': 'full_board',
  'all inclusive': 'all_inclusive',
  'all-inclusive': 'all_inclusive',
};

const MEAL_LABELS = {
  room_only: 'Room Only',
  breakfast: 'Breakfast',
  half_board: 'Half Board',
  full_board: 'Full Board',
  all_inclusive: 'All Inclusive',
};

const normalizeMeal = (val) => {
  const lower = (val || '').toLowerCase().trim();
  return MEAL_NORMALIZE_MAP[lower] || lower;
};

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
    payment_types: [],
    unified_meal_plans: [],   // numeric API ids + normalized string keys (room_only, breakfast…)
    unified_cancellation: [], // numeric API ids + 'refundable' | 'non_refundable'
    priceRange: null,
    searchText: "",
  });
  const { accommodations } = useAccommodationsStore();

  // Use a fixed price range for the filter as requested.
  const priceBounds = useMemo(() => {
    if (!accommodations || accommodations.length === 0) {
      // Default fallback if no accommodations
      return { min: 0, max: 1000 };
    }

    // Collect all candidate prices
    const prices = accommodations.map(acc => {
      // Stuba (Result) or Ratehawk (rates): use pre-computed acc.price from store
      if (acc.link_type_id === 9 || acc.link_type_id === 10 || acc.Hotel_Data) {
        // Stuba: extract from Result.TotalPrice
        if (acc.Result) {
          const allPrices = [];
          Object.values(acc.Result).forEach(roomType => {
            if (roomType && typeof roomType === 'object') {
              Object.values(roomType).forEach(option => {
                if (option?.TotalPrice) allPrices.push(parseFloat(option.TotalPrice));
              });
            }
          });
          if (allPrices.length > 0) return Math.min(...allPrices);
        }
        // Ratehawk: extract from rates
        if (Array.isArray(acc.rates) && acc.rates.length > 0) {
          const ratePrices = acc.rates
            .map(rate => parseFloat(rate?.payment_options?.payment_types?.[0]?.amount || 0))
            .filter(p => p > 0);
          if (ratePrices.length > 0) return Math.min(...ratePrices);
        }
        return parseFloat(acc.price || 0);
      }

      return (
        acc.room?.rate_plan?.pricing?.total_promo ||
        acc.room?.rate_plan?.pricing?.total ||
        acc.room?.rate_plan?.pricing?.per_room_total_promo ||
        acc.room?.rate_plan?.pricing?.per_room_total ||
        acc.room?.base_price ||
        acc.price || 0
      );
    });

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    return {
      min: minPrice > 0 ? Math.floor(minPrice) : 0,   // ✅ calculated min
      max: maxPrice > 0 ? Math.ceil(maxPrice) : 1000, // ✅ calculated max
    };
  }, [accommodations]);

  // Determine currency to display in the Price Range title (fallback to USD)
  const currency = useMemo(() => {
    if (!accommodations || accommodations.length === 0) return 'USD';
    const found = accommodations.find(acc => acc.room?.rate_plan?.pricing?.currency || acc.currency || acc.Hotel_Data?.currency);
    return found?.room?.rate_plan?.pricing?.currency || found?.currency || found?.Hotel_Data?.currency || 'USD';
  }, [accommodations]);

  // Unified cancellation & meal plan options from all 3 sources
  const unifiedFilters = useMemo(() => {
    const cancellationCounts = { refundable: 0, non_refundable: 0 };
    const mealCounts = {};

    accommodations.forEach(acc => {
      if (acc.link_type_id === 9 && acc.Result) {
        let hasRefundable = false, hasNonRefundable = false;
        const mealSet = new Set();
        Object.values(acc.Result).forEach(roomType => {
          if (!roomType || typeof roomType !== 'object') return;
          Object.values(roomType).forEach(option => {
            if (!option || typeof option !== 'object') return;
            if (typeof option.cancellable_rooms === 'number') {
              if (option.cancellable_rooms > 0) hasRefundable = true;
              else hasNonRefundable = true;
            }
            const mealText = option.lowest_price_room?.MealType?.['@attributes']?.text;
            if (mealText) mealSet.add(normalizeMeal(mealText));
          });
        });
        if (hasRefundable) cancellationCounts.refundable++;
        if (hasNonRefundable) cancellationCounts.non_refundable++;
        mealSet.forEach(m => { mealCounts[m] = (mealCounts[m] || 0) + 1; });
      } else if (acc.link_type_id === 10 && Array.isArray(acc.rates)) {
        let hasRefundable = false, hasNonRefundable = false;
        const mealSet = new Set();
        acc.rates.forEach(rate => {
          const penalty = rate?.payment_options?.payment_types?.[0]?.cancellation_penalties;
          if (penalty?.free_cancellation_before) hasRefundable = true;
          else hasNonRefundable = true;
          if (rate?.meal) mealSet.add(normalizeMeal(rate.meal));
        });
        if (hasRefundable) cancellationCounts.refundable++;
        if (hasNonRefundable) cancellationCounts.non_refundable++;
        mealSet.forEach(m => { mealCounts[m] = (mealCounts[m] || 0) + 1; });
      }
    });

    // API-provided options (from /accommodations/search)
    const apiMealPlans = (filters?.meal_plans || [])
      .filter(item => item.count > 0)
      .map(item => ({ id: item.id, label: item.title || item.name || String(item.id), count: item.count }));

    const apiCancellationPolicies = (filters?.cancellation_policies || [])
      .filter(item => item.count > 0)
      .map(item => ({ id: item.id, label: item.name || item.title || String(item.id), count: item.count }));

    const stubaRhMealOptions = Object.entries(mealCounts).map(([id, count]) => ({
      id,
      label: MEAL_LABELS[id] || id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      count,
    }));

    const stubaRhCancellationOptions = [
      ...(cancellationCounts.refundable > 0 ? [{ id: 'refundable', label: 'Refundable', count: cancellationCounts.refundable }] : []),
      ...(cancellationCounts.non_refundable > 0 ? [{ id: 'non_refundable', label: 'Non-Refundable', count: cancellationCounts.non_refundable }] : []),
    ];

    return {
      mealPlanOptions: [...apiMealPlans, ...stubaRhMealOptions],
      cancellationOptions: [...apiCancellationPolicies, ...stubaRhCancellationOptions],
    };
  }, [accommodations, filters]);

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
    setActiveFilters({ ratings: [], amenities: [], room_amenities: [], payment_types: [], unified_meal_plans: [], unified_cancellation: [], priceRange: null, searchText: "" });
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
    <div className="w-full rounded-xl bg-surface p-4 shadow">
      <div className="sticky top-0 bg-surface z-10 flex items-center justify-between pb-4 border-b">
        <h2 className="text-lg font-bold text-foreground">Filter By</h2>
        {hasActiveFilters && (
          <button onClick={clearAllFilters} className="text-sm font-medium text-primary hover:underline">
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
            className="w-full border border-border rounded-lg py-2 pl-4 pr-8 text-sm focus:outline-none focus:ring-2 focus:ring-[#D3202D]"
          />
        </div>

        {/* Sort By Dropdown */}
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value)}
            className="w-full appearance-none bg-surface border border-border rounded-lg py-2 pl-4 pr-10 text-sm font-medium text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#D3202D] focus:border-transparent"
          >
            <option value="default">Recommended</option>
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="rating_desc">Rating: High to Low</option>
          </select>
          <ChevronDown size={18} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
        </div>
      </FilterSection>

      {/* Price Range Filter - Always present */}
      <FilterSection title={`Price Range (${currency})`} defaultOpen={true} scrollable={false}>
        <div className="space-y-4 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div className="relative w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Min</span>
              <input
                type="text"
                value={Math.round(selectedMin)}
                readOnly
                className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-2 text-xs text-center pointer-events-none"
              />
            </div>
            <div className="relative w-1/2">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Max</span>
              <input
                type="text"
                value={Math.round(selectedMax)}
                readOnly
                className="w-full rounded-lg border border-border bg-muted py-2 pl-10 pr-2 text-xs text-center pointer-events-none"
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
              className="w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer"
            />
          </div>
        </div>
      </FilterSection>

      {unifiedFilters.cancellationOptions.length > 0 && (
        <FilterSection title="Cancellation Policy" defaultOpen={true}>
          {unifiedFilters.cancellationOptions.map(option => (
            <Checkbox
              key={option.id}
              label={option.label}
              count={option.count}
              checked={(activeFilters.unified_cancellation || []).includes(option.id)}
              onChange={() => handleFilterArrayChange('unified_cancellation', option.id)}
            />
          ))}
        </FilterSection>
      )}

      {unifiedFilters.mealPlanOptions.length > 0 && (
        <FilterSection title="Meal Plan" defaultOpen={true}>
          {unifiedFilters.mealPlanOptions.map(option => (
            <Checkbox
              key={option.id}
              label={option.label}
              count={option.count}
              checked={(activeFilters.unified_meal_plans || []).includes(option.id)}
              onChange={() => handleFilterArrayChange('unified_meal_plans', option.id)}
            />
          ))}
        </FilterSection>
      )}

      {Object.entries(filters || {}).map(([key, items]) => {
        if (!items || items.length === 0 || key === 'room_amenities' || key === 'meal_plans' || key === 'cancellation_policies') return null;

        // Filter out items with count === 0
        const filteredItems = items.filter(item => item.count > 0);
        if (filteredItems.length === 0) return null;

        const config = FILTER_CONFIG[key] || {};
        const title = config.title || key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

        if (config.Component) {
          const { Component, getProps } = config;
          return (
            <FilterSection key={key} title={title} defaultOpen={config.defaultOpen !== false}>
              <Component {...getProps(filteredItems, activeFilters, handleFilterArrayChange)} />
            </FilterSection>
          );
        }

        const handlerKey = config.handlerKey || FILTER_CONFIG.default.handlerKey(key);
        const itemKeyProp = config.itemKey || FILTER_CONFIG.default.itemKey;

        return (
          <FilterSection
            key={key}
            title={title}
            hasLoadMore={filteredItems.length > 5}
            defaultOpen={config.defaultOpen}
          >
            {filteredItems.map((item) => {
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