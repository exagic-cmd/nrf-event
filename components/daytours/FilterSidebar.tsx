// components/daytours/FilterSidebar.tsx
"use client";

import { useState, useMemo, useTransition } from "react";
import { useDaytoursStore } from "@/store/useDaytoursStore";

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
};

export default function FilterSidebar() {
  const { searchResults, applyClientFilter, resetFilters } = useDaytoursStore();
  const [isPending, startTransition] = useTransition();

  // Selected filters: { suit_clusters: ["Solo", "Couple"], ... }
  const [selected, setSelected] = useState(() => {
    const init = {};
    FILTER_KEYS.forEach((k) => (init[k] = []));
    return init;
  });

  // -----------------------------------------------------------------
  // 1. Build unique options for each filter
  // -----------------------------------------------------------------
  const options = useMemo(() => {
    const uniq = (arr) => Array.from(new Set(arr)).sort();

    const result = {};
    FILTER_KEYS.forEach((k) => (result[k] = []));

    searchResults.forEach((item) => {
      FILTER_KEYS.forEach((key) => {
        const values = item[key] || [];
        if (Array.isArray(values)) {
          result[key].push(...values);
        }
      });
    });

    FILTER_KEYS.forEach((key) => {
      result[key] = uniq(result[key]);
    });

    return result;
  }, [searchResults]);

  // -----------------------------------------------------------------
  // 2. Apply filter whenever `selected` changes
  // -----------------------------------------------------------------
  useMemo(() => {
    startTransition(() => {
      const hasActive = Object.values(selected).some((arr) => arr.length > 0);

      if (!hasActive) {
        resetFilters();
        return;
      }

      applyClientFilter((item) => {
        return Object.entries(selected).every(([key, selVals]) => {
          if (!selVals.length) return true;
          const itemVals = item[key] || [];
          return selVals.some((v) => itemVals.includes(v));
        });
      });
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selected, searchResults]);

  // -----------------------------------------------------------------
  // 3. Toggle a checkbox
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
  // 4. Clear all filters
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

      {/* Filter groups */}
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