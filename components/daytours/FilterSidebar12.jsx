// components/daytours/FilterSidebar.jsx
"use client";

import { useState, useMemo, useTransition } from "react";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";

const FILTER_KEYS = [
  "suit_clusters",
  "preference_activities",
  "physical_aspect",
  "activity_intensity",
  "inclusions_exclusions_activity",
  "amenities",
  "sgd_preference",
];

const FILTER_LABELS = {
  suit_clusters: "Travel Clusters",
  preference_activities: "Activities",
  physical_aspect: "Physical Aspect",
  activity_intensity: "Activity Intensity",
  inclusions_exclusions_activity: "Inclusions / Exclusions",
  amenities: "Amenities",
  sgd_preference: "SGD Preference",
};

export default function FilterSidebar({ mode = "daytour" }) {
  const { searchResults, applyClientFilter, resetFilters } = useDaytoursStore();
  const { accommodations } = useAccommodationsStore();

  const [isPending, startTransition] = useTransition();

  // Local selected state – plain object of arrays
  const [selected, setSelected] = useState(() => {
    const init = {};
    FILTER_KEYS.forEach((k) => (init[k] = []));
    return init;
  });

  // -----------------------------------------------------------------
  // 1. Build unique options for every filter key
  // -----------------------------------------------------------------
  const options = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr)).sort();

    const result = {};
    // Decide which keys to expose based on mode
    const keys = mode === "accommodation" ? ["amenities"] : FILTER_KEYS.filter((k) => k !== "amenities");
    keys.forEach((k) => (result[k] = []));

    // Source: for daytour use searchResults, for accommodation use accommodations
    const source = mode === "accommodation" ? (accommodations || []) : (searchResults || []);

    source.forEach((item) => {
      keys.forEach((key) => {
        // Special handling for amenities (comma separated in Hotel_Data)
        if (key === "amenities") {
          const raw = item.amenities || item.Hotel_Data?.amenities || item.normalizedHotelData?.amenities || '';
          if (typeof raw === 'string' && raw.trim()) {
            const parts = raw.split(',').map(s => s.trim()).filter(Boolean);
            result[key].push(...parts);
          } else if (Array.isArray(raw)) {
            result[key].push(...raw.map(String));
          }
          return;
        }

        const values = item[key] || item[key] === 0 ? item[key] : [];
        if (Array.isArray(values)) {
          result[key].push(...values);
        }
      });
    });

    keys.forEach((key) => {
      result[key] = uniq(result[key]);
    });

    return result;
  }, [searchResults, accommodations, mode]);

  // -----------------------------------------------------------------
  // 2. Apply filters whenever `selected` changes
  // -----------------------------------------------------------------
  useMemo(() => {
    startTransition(() => {
      const hasActive = Object.values(selected).some((arr) => arr.length > 0);

      if (!hasActive) {
        resetFilters();
        return;
      }

      applyClientFilter((item) => {
        // Only consider the relevant keys for this mode
        const keys = mode === "accommodation" ? ["amenities"] : FILTER_KEYS.filter((k) => k !== "amenities");
        return Object.entries(selected)
          .filter(([k]) => keys.includes(k))
          .every(([key, selVals]) => {
          if (!selVals.length) return true;

          // Determine item values for the key, with special handling for amenities
          let itemVals = [];
          if (key === 'amenities') {
            const raw = item.amenities || item.Hotel_Data?.amenities || item.normalizedHotelData?.amenities || '';
            if (typeof raw === 'string' && raw.trim()) {
              itemVals = raw.split(',').map(s => s.trim()).filter(Boolean);
            } else if (Array.isArray(raw)) {
              itemVals = raw.map(String);
            } else {
              itemVals = [];
            }
          } else {
            itemVals = item[key] || item[key] === 0 ? item[key] : [];
          }

          if (!Array.isArray(itemVals)) return false;
          return selVals.some((v) => itemVals.includes(v));
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, searchResults]);

  // -----------------------------------------------------------------
  // 3. Toggle helper
  // -----------------------------------------------------------------
  const toggle = (key, value) => {
    setSelected((prev) => ({
      ...prev,
      [key]: prev[key].includes(value)
        ? prev[key].filter((v) => v !== value)
        : [...prev[key], value],
    }));
  };

  // -----------------------------------------------------------------
  // 4. Clear all
  // -----------------------------------------------------------------
  const clearAll = () => {
    const empty = {};
    FILTER_KEYS.forEach((k) => (empty[k] = []));
    setSelected(empty);
    resetFilters();
  };

  // -----------------------------------------------------------------
  // Render
  // -----------------------------------------------------------------
  return (
    <aside className="bg-white rounded-lg shadow p-5 space-y-6 w-full lg:w-80">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Filters</h3>
        <button
          onClick={clearAll}
          className="text-sm text-blue-600 hover:underline"
        >
          Clear all
        </button>
      </div>

      {isPending && (
        <p className="text-xs text-gray-500 animate-pulse">
          Updating results…
        </p>
      )}

      {/* ---- Filter groups ---- */}
      {Object.entries(options).map(([key, values]) =>
        values.length > 0 ? (
          <FilterGroup
            key={key}
            title={FILTER_LABELS[key]}
            options={values}
            selected={selected[key] || []}
            onToggle={(v) => toggle(key, v)}
          />
        ) : null
      )}
    </aside>
  );
}

/* --------------------------------------------------------------
   Reusable checkbox group (plain JS)
   -------------------------------------------------------------- */
function FilterGroup({ title, options, selected, onToggle }) {
  return (
    <div>
      <h4 className="font-medium text-sm mb-2">{title}</h4>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-2">
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