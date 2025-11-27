// components/daytours/FilterSidebar.tsx
"use client";

import { useState, useMemo, useEffect, useTransition } from "react";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";

const FILTER_KEYS = [
  "suit_clusters",
  "preference_activities",
  "physical_aspect",
  "activity_intensity",
  "inclusions_exclusions_activity",
  "sgd_preference",
];

const FILTER_LABELS = {
  suit_clusters: "Travel Clusters",
  preference_activities: "Activities",
  physical_aspect: "Physical Aspect",
  activity_intensity: "Activity Intensity",
  inclusions_exclusions_activity: "Inclusions / Exclusions",
  sgd_preference: "SGD Preference",
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

export default function FilterSidebar({ mode = "daytour" }) {
  const { searchResults, applyClientFilter, resetFilters } = useDaytoursStore();
  const { accommodations, applyAccommodationFilter, resetAccommodationFilters } = useAccommodationsStore();
  const [isPending, startTransition] = useTransition();
  const [isMobileFiltersVisible, setMobileFiltersVisible] = useState(false);

  const ALL_KEYS = [...FILTER_KEYS, "amenities"];
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const init: Record<string, string[]> = {};
    ALL_KEYS.forEach((k) => (init[k] = []));
    return init;
  });

  // -----------------------------------------------------------------
  // 1. Build unique options (normalized for matching, original for display)
  // -----------------------------------------------------------------
  const options = useMemo(() => {
    const result: Record<string, string[]> = {};

    const currentResults = searchResults || [];
    const currentAccommodations = accommodations || [];
    const effectiveMode =
      mode === "accommodation" ||
      (currentAccommodations.length > 0 && currentResults.length === 0)
        ? "accommodation"
        : "daytour";

    const keys = effectiveMode === "accommodation" ? ["amenities"] : FILTER_KEYS;
    keys.forEach((k) => (result[k] = []));

    const source = effectiveMode === "accommodation" ? currentAccommodations : currentResults;

    const seen = new Set<string>(); // to avoid duplicates

    // source.forEach((item) => {
    //   keys.forEach((key) => {
    //     if (key === "amenities") {
    //       const raw = item.amenities || item.Hotel_Data?.amenities || item.normalizedHotelData?.amenities || '';
    //       const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
    //       parts.forEach(part => {
    //         const norm = normalizeValue(part);
    //         if (norm && !seen.has(norm)) {
    //           seen.add(norm);
    //           result[key].push(part); // store original for display
    //         }
    //       });
    //     } else {
    //       const values = item[key];
    //       if (Array.isArray(values)) {
    //         values.forEach(v => {
    //           const str = String(v);
    //           const norm = normalizeValue(str);
    //           if (norm && !seen.has(norm)) {
    //             seen.add(norm);
    //             result[key].push(str);
    //           }
    //         });
    //       } else if (values === 0 || values) {
    //         const str = String(values);
    //         const norm = normalizeValue(str);
    //         if (norm && !seen.has(norm)) {
    //           seen.add(norm);
    //           result[key].push(str);
    //         }
    //       }
    //     }
    //   });
    // });

    // Sort alphabetically
    Object.keys(result).forEach(k => {
      result[k].sort((a, b) => a.localeCompare(b));
    });

    return result;
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

      const hasActive = Object.values(selected).some((arr) => arr.length > 0);

      if (!hasActive) {
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
  <aside className="bg-white rounded-lg shadow p-5 w-full lg:overflow-y-auto lg:max-h-[80vh]">
    <div className="flex items-center justify-between">
    
      <h3 className="font-semibold hidden lg:flex text-[#D3202D] text-lg">Filters</h3>
      <button 
        onClick={clearAll} 
        className="text-sm text-blue-600 hover:underline hidden lg:block"
      >
        Clear all
      </button>
      <button
        className="lg:hidden font-semibold px-8 text-[#D3202D] text-lg"
        onClick={() => setMobileFiltersVisible(!isMobileFiltersVisible)}
      >
        {isMobileFiltersVisible ? 'Apply' : 'Filters'}
      </button>
    </div>

    <div
      className={`
        mt-6 space-y-6
        lg:block
        ${isMobileFiltersVisible ? 'block fixed inset-0 bg-white z-50 p-6 overflow-y-auto' : 'hidden'}
      `}
    >
      {isPending && (
        <p className="text-xs text-gray-500 animate-pulse">Updating results…</p>
      )}

      {Object.entries(options).map(([key, values]) =>
        values.length > 0 ? (
          <FilterGroup
            key={key}
            title={FILTER_LABELS[key] || key}
            options={values}
            selected={selected[key] || []}
            onToggle={(v) => toggle(key, v)}
          />
        ) : null
      )}

      {/* Bottom Sticky Controls on Mobile */}
      {isMobileFiltersVisible && (
        <div className="fixed bottom-0 left-0 w-full bg-white border-t p-4 flex justify-between">
          <button
            onClick={clearAll}
            className="text-sm text-blue-600 hover:underline"
          >
            Clear all
          </button>

          <button
            onClick={() => setMobileFiltersVisible(false)}
            className="bg-[#D3202D] text-white px-6 py-2 rounded-lg font-semibold"
          >
            Apply
          </button>
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
  onToggle,
}: {
  title: string;
  options: string[];
  selected: string[];
  onToggle: (value: string) => void;
}) {
  return (
    <div>
      <h4 className="font-medium text--[#D3202D] text-sm mb-2">{title}</h4>
      <div className="space-y-1 max-h-96 overflow-y-auto pr-2">
        {options.map((opt) => (
          <label
            key={opt}
            className="flex items-center text-sm cursor-pointer hover:text-blue-600"
          >
            <input
              type="checkbox"
              checked={selected.includes(opt)}
              onChange={() => onToggle(opt)}
              className="mr-2 h-4 w-4 text-blue-600 rounded border-gray-300"
            />
            <span className="truncate">{opt}</span>
          </label>
        ))}
      </div>
    </div>
  );
}