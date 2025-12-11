// components/daytours/FilterSidebar.tsx
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";

// Reordered for a more logical flow in the UI
const FILTER_KEYS = [
  "preference_activities",
  "physical_aspect",
  "activity_intensity",
  "inclusions_exclusions_activity",
];

const FILTER_LABELS = {
  preference_activities: "Activities",
  physical_aspect: "Physical Aspect",
  activity_intensity: "Activity Intensity",
  inclusions_exclusions_activity: "Inclusions / Exclusions",
  amenities: "Amenities",
};

const normalizeValue = (str: string): string => {
  return str
    .trim()
    .toLowerCase()
    .replace(/\s+/g, " ")
    .replace(/[-–—]/g, "-")
    .replace(/[^\w\s-]/g, "")
    .replace(/\s*\/\s*/g, " / ");
};

const normalizeAmenities = (raw: any): string[] => {
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(',')
      .map(s => normalizeValue(s))
      .filter(Boolean);
  }
  if (Array.isArray(raw)) {
    return raw.map(item => normalizeValue(String(item)));
  }
  return [];
};

const normalizeFilterOption = (value: string): string => {
  return normalizeValue(value);
};

export default function FilterSidebar({
  mode = "daytour",
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
}) {
  const { 
    searchResults, 
    applyClientFilter, 
    resetFilters,
  } = useDaytoursStore();
  const { accommodations, applyAccommodationFilter, resetAccommodationFilters } = useAccommodationsStore();
  const [isPending, startTransition] = useTransition();
  const [isMobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const ALL_KEYS = [...FILTER_KEYS, "amenities"];
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    ALL_KEYS.forEach((k) => (init[k] = []));
    return init;
  });

  const hasActiveFilters = Object.values(selected).some((arr) => arr.length > 0);

  // -----------------------------------------------------------------
  // 1. Build unique options (normalized for matching, original for display)
  // -----------------------------------------------------------------
  const options = useMemo(() => {
    const result: Record<string, string[]> = {};
    const counts: Record<string, Record<string, number>> = {};

    const currentResults = searchResults || [];
    const currentAccommodations = accommodations || [];
    const effectiveMode =
      mode === "accommodation" ||
      (currentAccommodations.length > 0 && currentResults.length === 0)
        ? "accommodation"
        : "daytour";

    const keys = effectiveMode === "accommodation" ? ["amenities"] : FILTER_KEYS;
    keys.forEach((k) => {
      result[k] = [];
      counts[k] = {};
    });

    const source = effectiveMode === "accommodation" ? currentAccommodations : currentResults;

    const seen = new Set<string>(); // to avoid duplicates

    source.forEach((item) => {
      keys.forEach((key) => {
        let itemValues: string[] = [];
        if (key === "amenities") {
          const raw = item.amenities || item.Hotel_Data?.amenities || item.normalizedHotelData?.amenities || '';
          itemValues = [...new Set(raw.split(',').map(s => s.trim()).filter(Boolean))];
        } else {
          const values = item[key];
          if (Array.isArray(values)) {
            itemValues = [...new Set(values.map(v => String(v)))];
          } else if (values === 0 || values) {
            itemValues = [String(values)];
          }
        }

        itemValues.forEach(value => {
          if (!value) return;
          const norm = normalizeValue(value);
          if (norm) {
            // Add to unique options list if not seen
            if (!seen.has(norm)) {
              seen.add(norm);
              result[key].push(value);
            }
            // Increment count for this value
            counts[key][value] = (counts[key][value] || 0) + 1;
          }
        });
      });
    });

    // Sort alphabetically
    Object.keys(result).forEach(k => {
      result[k].sort((a, b) => a.localeCompare(b));
    });

    return { options: result, counts };
  }, [searchResults, accommodations, mode]);

  // -----------------------------------------------------------------
  // 2. Apply filter in useEffect
  // -----------------------------------------------------------------
  useEffect(() => {
    startTransition(() => {
      const currentResults = searchResults || [];
      const currentAccommodations = accommodations || [];
      const effectiveMode =
        mode === "accommodation" ||
        (currentAccommodations.length > 0 && currentResults.length === 0)
          ? "accommodation"
          : "daytour";

      if (!hasActiveFilters) {
        effectiveMode === "accommodation" ? resetAccommodationFilters() : resetFilters();
        return;
      }

      const applyFn = effectiveMode === "accommodation" ? applyAccommodationFilter : applyClientFilter;

      applyFn((item) => {
        const keys = effectiveMode === "accommodation" ? ["amenities"] : FILTER_KEYS;

        return Object.entries(selected)
          .filter(([k]) => keys.includes(k))
          .every(([key, selVals]) => {
            if (!selVals.length) return true;

            let itemVals: string[] = [];

            if (key === "amenities") {
              const raw = item.amenities || item.Hotel_Data?.amenities || item.normalizedHotelData?.amenities || '';
              itemVals = normalizeAmenities(raw);
            } else {
              const val = item[key];
              itemVals = Array.isArray(val)
                ? val.map(v => normalizeValue(String(v)))
                : (val === 0 || val ? [normalizeValue(String(val))] : []);
            }

            // AND logic: ALL selected must match
            return selVals.every((selectedRaw) => {
              const selectedNorm = normalizeFilterOption(selectedRaw);
              return itemVals.includes(selectedNorm);
            });
          });
      });
    });
  }, [
    selected,
    searchResults,
    accommodations,
    mode,
    applyClientFilter,
    applyAccommodationFilter,
    resetFilters,
    resetAccommodationFilters,
    hasActiveFilters,
  ]);

  // -----------------------------------------------------------------
  // 3. Toggle
  // -----------------------------------------------------------------
  const toggle = (key: string, rawValue: string) => {
    setSelected((prev) => {
      const prevVals = Array.isArray(prev[key]) ? prev[key] : [];
      const normalizedNew = normalizeFilterOption(rawValue);
      const normalizedPrev = prevVals.map(normalizeFilterOption);

      if (normalizedPrev.includes(normalizedNew)) {
        return {
          ...prev,
          [key]: prevVals.filter((v) => normalizeFilterOption(v) !== normalizedNew),
        };
      } else {
        return {
          ...prev,
          [key]: [...prevVals, rawValue],
        };
      }
    });
  };

  // -----------------------------------------------------------------
  // 4. Clear all
  // -----------------------------------------------------------------
  const clearAll = () => {
    const empty: Record<string, string[]> = {};
    ALL_KEYS.forEach((k) => (empty[k] = []));
    setSelected(empty);

    const effectiveMode =
      mode === "accommodation" ||
      ((accommodations || []).length > 0 && (searchResults || []).length === 0)
        ? "accommodation"
        : "daytour";

    effectiveMode === "accommodation" ? resetAccommodationFilters() : resetFilters();
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
 return (
  <aside className="bg-white rounded-lg shadow p-5 w-full">
    {/* --- DESKTOP VIEW --- */}
    <div className="hidden lg:block lg:overflow-y-auto lg:max-h-[80vh]">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#D3202D] text-lg">Search & Sort</h3>
      </div>
      {/* Search and Sort Controls */}
      <div className="space-y-4 mt-4 mb-2">
        <div>
          <input
            type="text"
            placeholder="Search by name..."
            value={searchTerm || ''}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-3 py-2 border text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3202D] focus:border-transparent transition"
          />
        </div>
        <div>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-[#D3202D] focus:border-transparent transition"
          >
            <option value="price_asc">Price: Low to High</option>
            <option value="price_desc">Price: High to Low</option>
            <option value="name_asc">Name: A to Z</option>
            <option value="name_desc">Name: Z to A</option>
          </select>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-[#D3202D] text-lg">Filters</h3>
        {hasActiveFilters && (
          <button onClick={clearAll} className="text-sm text-blue-600 hover:underline">
            Clear all
          </button>
        )}
      </div>
      <div className="mt-3 space-y-6">
        {Object.entries(options.options).map(([key, values]) =>
          values.length > 0 ? (
            <FilterGroup
              key={key}
              title={FILTER_LABELS[key] || key}
              options={values}
              selected={selected[key] || []}
              // @ts-ignore
              counts={options.counts[key] || {}}
              onToggle={(v) => toggle(key, v)}
            />
          ) : null
        )}
      </div>
    </div>

    {/* --- MOBILE VIEW --- */}
    <div className="lg:hidden">
      <button
        className="font-semibold w-full text-center text-[#D3202D] text-lg"
        onClick={() => setMobileFiltersVisible(true)}
      >
        Filters 
      </button>

      {isMobileFiltersVisible && (
        <div className="fixed inset-0 mt-12 bg-white z-50 p-6 overflow-y-auto">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#D3202D] text-lg">Search & Sort</h3>
          </div>
          <div className="space-y-4 mt-4 mb-2">
            <div>
              <input
                type="text"
                placeholder="Search by name..."
                value={searchTerm || ''}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border text-xs border-gray-300 rounded-lg focus:ring-2 focus:ring-[#D3202D] focus:border-transparent transition"
              />
            </div>
            <div>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 text-xs rounded-lg focus:ring-2 focus:ring-[#D3202D] focus:border-transparent transition"
              >
                <option value="price_asc">Price: Low to High</option>
                <option value="price_desc">Price: High to Low</option>
                <option value="name_asc">Name: A to Z</option>
                <option value="name_desc">Name: Z to A</option>
              </select>
            </div>
          </div>
          <hr className="my-4" />
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-[#D3202D] text-lg">Filters</h3>
          </div>
          <div className="mt-3 space-y-6">
      {isPending && (
        <p className="text-xs text-gray-500 animate-pulse">Updating results…</p>
      )}

      {Object.entries(options.options).map(([key, values]) =>
        values.length > 0 ? (
          <FilterGroup
            key={key}
            title={FILTER_LABELS[key] || key}
            options={values}
            selected={selected[key] || []}
            // @ts-ignore
            counts={options.counts[key] || {}}
            onToggle={(v) => toggle(key, v)}
          />
        ) : null
      )}
          </div>
          {/* Bottom Sticky Controls on Mobile */}
          <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between">
            {hasActiveFilters && (
              <button
                onClick={clearAll}
                className="text-sm text-blue-600 hover:underline"
              >
                Clear all
              </button>
            )}
            <button
              onClick={() => setMobileFiltersVisible(false)}
              className="bg-[#D3202D] text-white px-6 py-2 rounded-lg font-semibold ml-auto"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  </aside>
);

}

function FilterGroup({
  title,
  options,
  selected,
  counts,
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  counts: Record<string, number>;
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h4 className="font-medium text--[#D3202D] text-sm mb-2">{title}</h4>
      <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
        {options.map((opt) => {
          const count = counts[opt] || 0;
          return (
            <label
              key={opt}
              className="flex items-center text-sm cursor-pointer hover:text-blue-600"
            >
              <input
                type="checkbox"
                checked={selected.includes(opt)}
                onChange={() => onToggle(opt)}
                className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300 flex-shrink-0"
              />
              <span className="truncate flex-grow">{opt}</span>
              <span className="text-xs text-gray-500 ml-2 flex-shrink-0">({count})</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}