"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  MapPin,
  Building,
  X,
  ArrowLeftRight,
  Search,
} from "lucide-react";
import { useTransferStore } from "@/store/useTransferStore";
import { useDaytoursStore } from "@/store/useDaytoursStore";

export default function SearchFilterCard({
  filterActiveTab,
  filterTabs,
  onSetTab,
  onFilterTransfer,
}) {
  const {
    pickupOptions,
    dropoffOptions,
    fetchPickupOptions,
    fetchDropoffOptions,
    setSelectedPickup,
    setSelectedDropoff,
    selectedPickup,
    selectedDropoff,
    tripType,
    setTripType,
    isLoading: transferLoading,
  } = useTransferStore();

  const {
    countries,
    fetchCountriesCities,
    selectedCountry,
    selectedCity,
    setSelectedCountry,
    setSelectedCity,
    fetchSearchResults,
    fetchSuggestedResults,
    suggestedResults,
    setSuggestedResults,
    isLoading: daytoursLoading,
  } = useDaytoursStore();

  const [pickupQuery, setPickupQuery] = useState("");
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  const isLoading = transferLoading || daytoursLoading;

  useEffect(() => setPickupQuery(selectedPickup?.name || ""), [selectedPickup]);
  useEffect(() => setDropoffQuery(selectedDropoff?.name || ""), [selectedDropoff]);

  // Seed pickups when Transfer tab opens
  useEffect(() => {
    if (filterActiveTab === 2 && !pickupOptions?.length) {
      fetchPickupOptions("a");
    }
  }, [filterActiveTab, fetchPickupOptions, pickupOptions?.length]);

  // Fetch countries when Day Tours or Accommodation tab opens
  useEffect(() => {
    if ((filterActiveTab === 3 || filterActiveTab === 4) && countries.length === 0) {
      fetchCountriesCities();
    }
  }, [filterActiveTab, fetchCountriesCities, countries.length]);

  const onPickupChange = (val) => {
    setPickupQuery(val);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    setDropoffQuery("");
    if (val && val.trim()) fetchPickupOptions(val.trim());
  };

  const onPickupSelect = (opt) => {
    setSelectedPickup(opt);
    setPickupQuery(opt.name || opt.title || "");
    setSelectedDropoff(null);
    setDropoffQuery("");
    if (opt?.id) fetchDropoffOptions(opt.id);
  };

  const onDropoffChange = (val) => {
    setDropoffQuery(val);
    setSelectedDropoff(null);
  };

  const filteredPickup = useMemo(() => {
    const q = (pickupQuery || "").toLowerCase();
    return pickupOptions.filter((p) => (p.name || p.title || "").toLowerCase().includes(q));
  }, [pickupOptions, pickupQuery]);

  const filteredDropoff = useMemo(() => {
    const q = (dropoffQuery || "").toLowerCase();
    return dropoffOptions.filter((d) => (d.name || d.title || "").toLowerCase().includes(q));
  }, [dropoffOptions, dropoffQuery]);

  const swapLocations = () => {
    if (!(selectedPickup || pickupQuery || selectedDropoff || dropoffQuery)) return;
    const oldSelPickup = selectedPickup;
    const oldQueryPickup = pickupQuery;

    setSelectedPickup(selectedDropoff || null);
    setPickupQuery(dropoffQuery || selectedDropoff?.name || selectedDropoff?.title || "");

    setSelectedDropoff(oldSelPickup || null);
    setDropoffQuery(oldQueryPickup || oldSelPickup?.name || oldSelPickup?.title || "");

    const newPickupId = (selectedDropoff || {}).id;
    if (newPickupId) fetchDropoffOptions(newPickupId);
  };

  // Handle search input changes with debouncing
  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (value.trim().length > 1) {
      await fetchSuggestedResults(value.trim());
    } else {
      setSuggestedResults([]);
    }
  };

  // Handle category search (Day Tours & Accommodation)
  // In the handleCategorySearch function, add this:

const handleCategorySearch = async () => {
  if (!selectedCountry || !selectedCity) {
    alert("Please select both country and city");
    return;
  }

  const categoryId = filterActiveTab === 3 ? 3 : 4;
  const categoryType = filterActiveTab === 3 ? 'daytour' : 'accommodation';

  const payload = {
    category_id: categoryId,
    country_id: selectedCountry.id,
    city_id: selectedCity.id,
    name: searchQuery || "",
    is_b2c_only: 1,
  };

  console.log("🔄 Starting search with payload:", payload);
  
  try {
    // Call the API
    await fetchSearchResults(payload);
    
    // Get fresh results after API call
    const freshResults = useDaytoursStore.getState().searchResults;
    console.log("✅ Search completed, fresh results:", freshResults.length);

    // IMPORTANT: Force a small delay to ensure store is updated
    setTimeout(() => {
      // Call the callback to trigger page state update
      if (onFilterTransfer) {
        console.log("📤 Calling onFilterTransfer to update page state");
        onFilterTransfer({
          country: selectedCountry,
          city: selectedCity,
          search: searchQuery,
          results: freshResults,
          category: categoryType,
          category_id: categoryId,
          timestamp: Date.now(), // Add timestamp to force re-render
          forceUpdate: true // Add force flag
        });
      }
    }, 100);

    // Clear suggestions after search
    setSuggestedResults([]);
    
  } catch (error) {
    console.error("❌ Search failed:", error);
  }
};

  // Handle transfer search
  const handleTransferSearch = () => {
    if (!selectedPickup || !selectedDropoff) {
      alert("Please select both pick-up and drop-off locations");
      return;
    }

    onFilterTransfer?.({
      pickup: selectedPickup,
      dropoff: selectedDropoff,
      isTwoWay: tripType === "round-trip",
      category: 'transfer'
    });
  };

  // Unified submit handler
  const handleSubmit = (e) => {
    e.preventDefault();

    if (filterActiveTab === 2) {
      handleTransferSearch();
    } else if (filterActiveTab === 3 || filterActiveTab === 4) {
      handleCategorySearch();
    }
  };

  // Pill button for tabs
  const Pill = ({ tab }) => (
    <button
      type="button"
      onClick={() => onSetTab?.(tab.id)}
      className={`px-4 py-2 rounded-2xl text-md font-semibold transition ${
        filterActiveTab === tab.id
          ? "bg-yellow-300 text-gray-900 py-3.5"
          : "bg-yellow-100 text-gray-700 hover:bg-yellow-200"
      }`}
    >
      {tab.name}
    </button>
  );

  return (
    <div className="w-full">
      {/* Top pills */}
      <div className="flex flex-wrap gap-3 mb-4">
        {filterTabs
          ?.filter((t) => [4, 3, 2].includes(t.id))
          .map((t) => (
            <Pill key={t.id} tab={t} />
          ))}
      </div>

      {/* Transfers form */}
      {filterActiveTab === 2 && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
          {/* Trip type */}
          <div className="flex items-center gap-6 px-2 pt-1">
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" onClick={() => setTripType("one-way")}>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ring-2 ${tripType === "one-way" ? "ring-yellow-400 bg-yellow-400" : "ring-gray-300 bg-white"}`} />
              One way
            </label>
            <label className="flex items-center gap-2 text-sm font-medium cursor-pointer" onClick={() => setTripType("round-trip")}>
              <span className={`inline-flex h-4 w-4 items-center justify-center rounded-full ring-2 ${tripType === "round-trip" ? "ring-yellow-400 bg-yellow-400" : "ring-gray-300 bg-white"}`} />
              Round trip
            </label>
          </div>

          {/* Pick-up & Dropoff */}
          <div className="mt-3 grid grid-cols-1 md:grid-cols-12 gap-3">
            <div className="md:col-span-10 space-y-3">
              <div className="rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3">
                <div className="grid grid-cols-1 md:grid-cols-12 items-center gap-2">
                  {/* Pick-up */}
                  <div className="md:col-span-5 relative">
                    <label className="absolute -top-2 left-3 bg-white text-[11px] text-gray-500 px-1">Pick-up point</label>
                    <div className="flex items-center gap-2 pt-2">
                      <MapPin className="h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={pickupQuery}
                        placeholder="Dubai Airport, DXB • Dubai"
                        onChange={(e) => onPickupChange(e.target.value)}
                        className="w-full bg-transparent placeholder:text-gray-400 text-sm md:text-base outline-none"
                      />
                      {pickupQuery && (
                        <button type="button" onClick={() => onPickupChange("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear pick-up">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* pickup suggestions */}
                    {pickupQuery && filteredPickup.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
                        {filteredPickup.map((p) => (
                          <button
                            key={p.id || p.name}
                            type="button"
                            onMouseDown={() => onPickupSelect(p)}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                          >
                            <MapPin className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-gray-800">{p.name || p.title}</span>
                          </button>
                        ))}
                        {isLoading && <div className="px-3 py-2 text-center text-gray-400">Loading...</div>}
                      </div>
                    )}
                  </div>

                  {/* Swap */}
                  <div className="hidden md:flex md:col-span-1 items-center justify-center">
                    <button type="button" onClick={swapLocations} className="rounded-full p-2 hover:bg-gray-100" title="Swap">
                      <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                    </button>
                  </div>

                  {/* Dropoff */}
                  <div className="md:col-span-6 relative">
                    <label className="absolute -top-2 left-3 bg-white text-[11px] text-gray-500 px-1">To</label>
                    <div className="flex items-center gap-2 pt-2">
                      <Building className="h-5 w-5 text-gray-500" />
                      <input
                        type="text"
                        value={dropoffQuery}
                        onChange={(e) => onDropoffChange(e.target.value)}
                        placeholder="Airport, hotel, or address"
                        disabled={!selectedPickup}
                        className="w-full bg-transparent placeholder:text-gray-400 text-sm md:text-base outline-none disabled:text-gray-400"
                      />
                      {dropoffQuery && (
                        <button type="button" onClick={() => onDropoffChange("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear drop-off">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {/* dropoff suggestions */}
                    {selectedPickup && dropoffQuery && filteredDropoff.length > 0 && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
                        {filteredDropoff.map((d) => (
                          <button
                            key={d.id || d.name}
                            type="button"
                            onMouseDown={() => {
                              setSelectedDropoff(d);
                              setDropoffQuery(d.name || d.title);
                            }}
                            className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                          >
                            <Building className="h-4 w-4 text-yellow-600" />
                            <span className="text-sm text-gray-800">{d.name || d.title}</span>
                          </button>
                        ))}
                        {isLoading && <div className="px-3 py-2 text-center text-gray-400">Loading...</div>}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 mt-1 flex items-stretch">
              <button 
                type="submit" 
                className="w-full self-end h-[52px] md:h-auto rounded-xl bg-yellow-300 text-gray-900 font-semibold py-3.5 hover:bg-yellow-400 transition shadow"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Day Tours & Accommodation Form */}
      {(filterActiveTab === 3 || filterActiveTab === 4) && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
            {/* Country */}
            <div className="md:col-span-3 relative rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex items-center">
              <MapPin className="h-5 w-5 text-gray-500 mr-2" />
              <select
                value={selectedCountry?.id || ""}
                onChange={(e) => {
                  const country = countries.find((c) => c.id === Number(e.target.value));
                  setSelectedCountry(country || null);
                  setSelectedCity(null);
                }}
                className="w-full bg-transparent text-sm md:text-base outline-none"
              >
                <option value="">Select Country</option>
                {countries.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || c.title}
                  </option>
                ))}
              </select>
            </div>

            {/* City */}
            <div className="md:col-span-3 relative rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex items-center">
              <Building className="h-5 w-5 text-gray-500 mr-2" />
              <select
                value={selectedCity?.id || ""}
                onChange={(e) => {
                  const city = selectedCountry?.cities?.find(
                    (ct) => String(ct.id || ct.city_id) === e.target.value
                  );
                  setSelectedCity(city || null);
                }}
                className="w-full bg-transparent text-sm md:text-base outline-none"
                disabled={!selectedCountry}
              >
                <option value="">Select City</option>
                {selectedCountry?.cities?.map((ct) => (
                  <option
                    key={ct.id || ct.city_id}
                    value={ct.id || ct.city_id}
                  >
                    {ct.title || ct.city_name || ct.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Search Input */}
            <div className="md:col-span-4 relative rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex flex-col">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={filterActiveTab === 3 ? "Search for tours..." : "Search for accommodations..."}
                  className="w-full bg-transparent text-sm md:text-base outline-none placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      setSuggestedResults([]);
                    }}
                    className="ml-2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {/* Suggested Results Dropdown */}
              {searchQuery && suggestedResults.length > 0 && (
                <div className="absolute z-20 top-full mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                  {suggestedResults.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery(sug.title || sug.name);
                        setSuggestedResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-800">
                        {sug.title || sug.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Search Button */}
            <div className="md:col-span-2 flex items-stretch">
              <button
                type="submit"
                className="w-full h-[52px] md:h-auto rounded-xl bg-yellow-300 text-gray-900 font-semibold py-3.5 hover:bg-yellow-400 transition shadow"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      )}

      {/* Coming Soon fallback */}
      {filterActiveTab !== 2 && filterActiveTab !== 3 && filterActiveTab !== 4 && (
        <div className="rounded-2xl bg-white shadow p-8 text-center text-gray-500">Coming Soon...</div>
      )}
    </div>
  );
}