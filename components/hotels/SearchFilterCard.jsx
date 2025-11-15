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
import AccommodationFilter from "./AccommodationFilter";

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

  // Searchable dropdowns
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const isLoading = transferLoading || daytoursLoading;

  // Sync inputs
  useEffect(() => setPickupQuery(selectedPickup?.name || ""), [selectedPickup]);
  useEffect(() => setDropoffQuery(selectedDropoff?.name || ""), [selectedDropoff]);
  useEffect(() => setCountryQuery(selectedCountry?.name || ""), [selectedCountry]);
  useEffect(() => {
    setCityQuery(
      selectedCity?.title || selectedCity?.city_name || selectedCity?.name || ""
    );
  }, [selectedCity]);

  // Load data
  useEffect(() => {
    if (filterActiveTab === 2 && !pickupOptions?.length) {
      fetchPickupOptions();
    }
  }, [filterActiveTab, fetchPickupOptions, pickupOptions?.length]);

  useEffect(() => {
    if ((filterActiveTab === 3 || filterActiveTab === 4) && countries.length === 0) {
      fetchCountriesCities();
    }
  }, [filterActiveTab, fetchCountriesCities, countries.length]);

  // Pickup handlers
  const onPickupChange = (val) => {
    setPickupQuery(val);
    setShowPickupDropdown(true);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    setDropoffQuery("");
    if (val && val.trim()) fetchPickupOptions(val.trim());
  };

  const onPickupSelect = (opt) => {
    setSelectedPickup(opt);
    setPickupQuery(opt.name || opt.title || "");
    setShowPickupDropdown(false);
    setSelectedDropoff(null);
    setDropoffQuery("");
    if (opt?.id) fetchDropoffOptions(opt.id);
  };

  const onDropoffChange = (val) => {
    setDropoffQuery(val);
    setShowDropoffDropdown(true);
    setSelectedDropoff(null);
  };

  const filteredPickup = useMemo(() => {
    const q = (pickupQuery || "").toLowerCase();
    return pickupOptions.filter((p) =>
      (p.name || p.title || "").toLowerCase().includes(q)
    );
  }, [pickupOptions, pickupQuery]);

  const filteredDropoff = useMemo(() => {
    const q = (dropoffQuery || "").toLowerCase();
    return dropoffOptions.filter((d) =>
      (d.name || d.title || "").toLowerCase().includes(q)
    );
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

  const handleSearchChange = async (value) => {
    setSearchQuery(value);
    if (value.trim().length > 1) {
      await fetchSuggestedResults(value.trim());
    } else {
      setSuggestedResults([]);
    }
  };

  const filteredCountries = useMemo(() => {
    if (!countryQuery) return countries;
    const q = countryQuery.toLowerCase();
    return countries.filter((c) =>
      (c.name || "").toLowerCase().includes(q)
    );
  }, [countries, countryQuery]);

  const filteredCities = useMemo(() => {
    if (!selectedCountry) return [];
    if (!cityQuery) return selectedCountry.cities || [];
    const q = cityQuery.toLowerCase();
    return (selectedCountry.cities || []).filter((ct) =>
      (ct.title || ct.city_name || ct.name || "")
        .toLowerCase()
        .includes(q)
    );
  }, [selectedCountry, cityQuery]);

  const handleCategorySearch = async () => {
    // if (!selectedCountry || !selectedCity) {
    //   alert("Please select both country and city");
    //   return;
    // }

    const categoryId = filterActiveTab === 3 ? 3 : 4;
    const categoryType = filterActiveTab === 3 ? 'daytour' : 'accommodation';

    const payload = {
      category_id: categoryId,
      country_id: selectedCountry?.id || 1,
      city_id: selectedCity?.id || 1,
      name: searchQuery || "",
      is_b2c_only: 1,
      is_active: true,
    };

    try {
      await fetchSearchResults(payload);
      const freshResults = useDaytoursStore.getState().searchResults;

      setTimeout(() => {
        onFilterTransfer?.({
          country: selectedCountry,
          city: selectedCity,
          search: searchQuery,
          results: freshResults,
          category: categoryType,
          category_id: categoryId,
          timestamp: Date.now(),
        });
      }, 100);

      setSuggestedResults([]);
    } catch (error) {
      console.error("Search failed:", error);
    }
  };

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

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filterActiveTab === 2) {
      handleTransferSearch();
    } else if (filterActiveTab === 3) {
      handleCategorySearch();
    }
  };

  const handleAccommodationSearch = (data) => {
    onFilterTransfer?.({
      category: "accommodation",
      ...data,
    });
  };

  const Pill = ({ tab }) => (
    <button
  type="button"
  onClick={() => onSetTab?.(tab.id)}
  className={`p-2 sm:px-4 sm:py-2 rounded-2xl text-sm sm:text-md font-semibold transition ${
    filterActiveTab === tab.id
      ? "bg-yellow-300 text-gray-900 sm:py-3.5"
      : "bg-yellow-100 text-gray-700 hover:bg-yellow-200"
  }`}
>
  {tab.name}
</button>

  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-3 mb-4">
        {filterTabs
          ?.filter((t) => [4, 3, 2].includes(t.id))
          .map((t) => (
            <Pill key={t.id} tab={t} />
          ))}
      </div>

     {/* ====== TRANSFERS ====== */}
      {filterActiveTab === 2 && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
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
                        placeholder="Singapore Changi Airport"
                        onChange={(e) => onPickupChange(e.target.value)}
                        className="w-full bg-transparent placeholder:text-gray-400 text-sm md:text-base outline-none"
                      />
                      {pickupQuery && (
                        <button type="button" onClick={() => onPickupChange("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear pick-up">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {showPickupDropdown && pickupQuery && filteredPickup.length > 0 && !selectedPickup && (
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
                        placeholder="Hotel, or Address"
                        disabled={!selectedPickup}
                        className="w-full bg-transparent placeholder:text-gray-400 text-sm md:text-base outline-none disabled:text-gray-400"
                      />
                      {dropoffQuery && (
                        <button type="button" onClick={() => onDropoffChange("")} className="text-gray-400 hover:text-gray-600" aria-label="Clear drop-off">
                          <X className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    {showDropoffDropdown && selectedPickup && dropoffQuery && filteredDropoff.length > 0 && !selectedDropoff && (
                      <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-64 overflow-auto">
                        {filteredDropoff.map((d) => (
                          <button
                            key={d.id || d.name}
                            type="button"
                            onMouseDown={() => {
                              setSelectedDropoff(d);
                              setDropoffQuery(d.name || d.title);
                              setShowDropoffDropdown(false);
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

            <div className="md:col-span-2 mt-1 flex items-stretch">
              <button
  type="submit"
  className="w-full self-end h-auto md:h-[52px] rounded-xl bg-yellow-300 text-gray-900 font-semibold px-3 py-2 md:px-4 md:py-3.5 hover:bg-yellow-400 transition shadow"
  disabled={isLoading}
>
  {isLoading ? "Searching..." : "Search"}
</button>


            </div>
          </div>
        </form>
      )}

      {/* ====== DAY TOURS ====== */}
      {filterActiveTab === 3 && (
        <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3">

            {/* COUNTRY */}
            {/* <div className="md:col-span-3 relative">
              <label className="absolute -top-2 left-3 bg-white text-[11px] text-gray-500 px-1">Country</label>
              <div className="rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex items-center gap-2">
                <MapPin className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={countryQuery}
                  placeholder="Select Country"
                  onFocus={() => setShowCountryDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCountryDropdown(false), 150)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCountryQuery(val);
                    setShowCountryDropdown(true);
                    if (selectedCountry) setSelectedCountry(null);
                  }}
                  className="w-full bg-transparent text-sm md:text-base outline-none"
                />
                {countryQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCountryQuery("");
                      setSelectedCountry(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showCountryDropdown && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                  {filteredCountries.length === 0 ? (
                    <div className="px-3 py-2 text-center text-gray-400">
                      {countryQuery ? "No matches" : "Start typing…"}
                    </div>
                  ) : (
                    filteredCountries.map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedCountry(c);
                          setCountryQuery(c.name || "");
                          setShowCountryDropdown(false);
                          setSelectedCity(null);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <MapPin className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-800">{c.name}</span>
                      </button>
                    ))
                  )}
                  {daytoursLoading && <div className="px-3 py-2 text-center text-gray-400">Loading…</div>}
                </div>
              )}
            </div> */}

            {/* CITY */}
            {/* <div className="md:col-span-3 relative">
              <label className="absolute -top-2 left-3 bg-white text-[11px] text-gray-500 px-1">City</label>
              <div className="rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex items-center gap-2">
                <Building className="h-5 w-5 text-gray-500" />
                <input
                  type="text"
                  value={cityQuery}
                  placeholder="Select City"
                  disabled={!selectedCountry}
                  onFocus={() => selectedCountry && setShowCityDropdown(true)}
                  onBlur={() => setTimeout(() => setShowCityDropdown(false), 150)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setCityQuery(val);
                    setShowCityDropdown(true);
                    if (selectedCity) setSelectedCity(null);
                  }}
                  className="w-full bg-transparent text-sm md:text-base outline-none disabled:text-gray-400"
                />
                {cityQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setCityQuery("");
                      setSelectedCity(null);
                    }}
                    className="text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>

              {showCityDropdown && selectedCountry && (
                <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                  {filteredCities.length === 0 ? (
                    <div className="px-3 py-2 text-center text-gray-400">
                      {cityQuery ? "No matches" : "Start typing…"}
                    </div>
                  ) : (
                    filteredCities.map((ct) => (
                      <button
                        key={ct.id || ct.city_id}
                        type="button"
                        onMouseDown={() => {
                          setSelectedCity(ct);
                          setCityQuery(ct.title || ct.city_name || ct.name || "");
                          setShowCityDropdown(false);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                      >
                        <Building className="h-4 w-4 text-yellow-600" />
                        <span className="text-sm text-gray-800">
                          {ct.title || ct.city_name || ct.name}
                        </span>
                      </button>
                    ))
                  )}
                  {daytoursLoading && <div className="px-3 py-2 text-center text-gray-400">Loading…</div>}
                </div>
              )}
            </div> */}

            {/* SEARCH INPUT */}
            <div className="md:col-span-10 relative rounded-2xl border border-gray-200 bg-white px-3 md:px-4 py-2 md:py-3 flex flex-col">
              <div className="flex items-center">
                <Search className="h-5 w-5 text-gray-500 mr-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder="Search for tours..."
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

              {searchQuery && suggestedResults.length > 0 && (
                <div className="absolute z-20 top-full mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg max-h-60 overflow-auto">
                  {suggestedResults.map((sug) => (
                    <button
                      key={sug.id}
                      type="button"
                      onMouseDown={() => {
                        setSearchQuery(sug.product_title || sug.name);
                        setSuggestedResults([]);
                      }}
                      className="flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-gray-50"
                    >
                      <Search className="h-4 w-4 text-yellow-600" />
                      <span className="text-sm text-gray-800">
                        {sug.product_title || sug.name}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* SEARCH BUTTON */}
            <div className="md:col-span-2 flex items-stretch">
              <button
                type="submit"
                className="w-full self-end h-auto md:h-[52px] rounded-xl bg-yellow-300 text-gray-900 font-semibold px-3 py-2 md:px-4 md:py-3.5 hover:bg-yellow-400 transition shadow"
                disabled={isLoading}
              >
                {isLoading ? "Searching..." : "Search"}
              </button>
            </div>
          </div>
        </form>
      )}


      {/* ====== ACCOMMODATION ====== */}
      {filterActiveTab === 4 && (
        <AccommodationFilter onSearch={handleAccommodationSearch} />
      )}

      {/* ====== COMING SOON ====== */}
      {![2, 3, 4].includes(filterActiveTab) && (
        <div className="rounded-2xl bg-white shadow p-8 text-center text-gray-500">
          Coming Soon...
        </div>
      )}
    </div>
  );
}