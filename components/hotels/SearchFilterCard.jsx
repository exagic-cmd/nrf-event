"use client";

import { toast, POSITION } from 'react-toastify';
import React, { useEffect, useMemo, useState, useRef } from "react";
import {
  MapPin,
  Building,
  X,
  ArrowLeftRight,
  Search,
  ChevronDown,
} from "lucide-react";
import { useTransferStore } from "@/store/useTransferStore";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import AccommodationFilter from "./AccommodationFilter";
import { useCartStore } from "@/store/useCartStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useSearchValuesStore } from "@/store/searchValues.store.js";
import LoaderSvg from "@/components/common/LoaderSvg";

const dayTourPlaceholders = [
  "Search attractions like Marina Bay Sands",
  "Try Merlion Park or Gardens by the Bay",
  "Search for Sentosa Island attractions",
  "Chinatown Heritage Centre",
  "Universal Studios Singapore",
  "Search temples like Buddha Tooth Relic Temple",
  "Clarke Quay Riverside",
];

export default function SearchFilterCard({
  filterActiveTab,
  filterTabs,
  onSetTab,
  onFilterTransfer,
  initialSearchQuery,
  onUpdateSearchQuery,
  initialAccommodationText,
  isHomepage = false,
  rooms, onUpdateRooms, stars, onUpdateStars, initialCheckinDate, initialCheckoutDate, onDatesUpdated,
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
    fetchTransfers,
    setSearchParams,
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
    searchQuery: daytourStoreSearchQuery, 
    setSearchQuery: setDaytourStoreSearchQuery,
    setSuggestedResults,
    isLoading: daytoursLoading,
  } = useDaytoursStore();

  const { daytourParams, setDaytourParams, transferParams, accommodationParams, setAccommodationParams } = useSearchValuesStore();

  const [pickupQuery, setPickupQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [dropoffQuery, setDropoffQuery] = useState("");
  const [searchQuery, setSearchQuery] = useState(initialSearchQuery || daytourParams.searchQuery || "");
  const [accommodationSearchText, setAccommodationSearchText] = useState(initialAccommodationText || "");
  const [placeholderIndex, setPlaceholderIndex] = useState(0); // For daytour placeholders
  const [showTripTypeDropdown, setShowTripTypeDropdown] = useState(false);
  const tripTypeDropdownRef = useRef(null);


  // Searchable dropdowns
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);

  const isLoading = transferLoading || daytoursLoading || isSearching;
  const { prefillData, updatePrefillDataFromCart } = useOrderStore();
  const { items: cartItems } = useCartStore();
  useEffect(() => {
    updatePrefillDataFromCart(cartItems);
  }, [cartItems, updatePrefillDataFromCart]);

  useEffect(() => {
    if (filterActiveTab === 2 && !isHomepage) {
      if (transferParams.pickup) setSelectedPickup(transferParams.pickup);
      if (transferParams.dropoff) setSelectedDropoff(transferParams.dropoff);
      if (transferParams.tripType) setTripType(transferParams.tripType);
    }
  }, [filterActiveTab, transferParams, setSelectedPickup, setSelectedDropoff, setTripType]);

  useEffect(() => {
    if (transferParams.pickup) {
      setPickupQuery(transferParams.pickup.name || "");
    }
    if (transferParams.dropoff) {
      setDropoffQuery(transferParams.dropoff.name || "");
    }
  }, [transferParams]);


  // Sync inputs
  useEffect(() => setPickupQuery(selectedPickup?.name || ""), [selectedPickup]);
  useEffect(() => setDropoffQuery(selectedDropoff?.name || ""), [selectedDropoff]);
  useEffect(() => setCountryQuery(selectedCountry?.name || ""), [selectedCountry]);
  useEffect(() => {
    setCityQuery(
      selectedCity?.title || selectedCity?.city_name || selectedCity?.name || ""
    );
  }, [selectedCity]);

  // useEffect(() => {
  //   if (initialSearchQuery !== undefined) setSearchQuery(initialSearchQuery);
  //   else if (daytourParams.searchQuery !== undefined) setSearchQuery(daytourParams.searchQuery);
  // }, [initialSearchQuery, daytourParams.searchQuery]);

  // Effect for rotating placeholder
  useEffect(() => {
    if (filterActiveTab === 3) {
      const interval = setInterval(() => {
        setPlaceholderIndex(prevIndex => (prevIndex + 1) % dayTourPlaceholders.length);
      }, 3000); // Change every 3 seconds
      return () => clearInterval(interval);
    }
  }, [filterActiveTab]);
  
  // Click outside handler for trip type dropdown
  useEffect(() => {
    function handleClickOutside(event) {
        if (tripTypeDropdownRef.current && !tripTypeDropdownRef.current.contains(event.target)) {
            setShowTripTypeDropdown(false);
        }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [tripTypeDropdownRef]);

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
    const pickupName = (opt.name || opt.title || "").toLowerCase();
    let prefName = null;
    if ((pickupName.includes("changi airport") || pickupName.includes("terminal")) && prefillData && prefillData.pickup_point) {
         const pref = prefillData.pickup_point;
         prefName = pref?.name || pref?.title || pref;
         setDropoffQuery(prefName);
         // If prefill is already a full object with an id, accept it as selectedDropoff
         if (pref && typeof pref === "object" && (pref.id || pref.place_id)) {
           setSelectedDropoff(pref);
         }
    }
    if (opt?.id) {
      fetchDropoffOptions(opt.id);
      // try to immediately match a prefill name to existing dropoffOptions
      if (prefName && dropoffOptions && dropoffOptions.length) {
        const prefNameLower = (prefName || "").toLowerCase();
        const match = dropoffOptions.find((d) => ((d.name || d.title || "").toLowerCase() === prefNameLower));
        if (match) {
          setSelectedDropoff(match);
          setDropoffQuery(match.name || match.title || prefName);
        }
      }
    }
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

  // When dropoff options load, if we have a dropoffQuery but no selectedDropoff,
  // try to auto-select an option that matches the prefilled name.
  useEffect(() => {
    if (dropoffQuery && !selectedDropoff && dropoffOptions && dropoffOptions.length) {
      const q = (dropoffQuery || "").toLowerCase();
      const match = dropoffOptions.find((d) => ((d.name || d.title || "").toLowerCase() === q));
      if (match) {
        setSelectedDropoff(match);
        setDropoffQuery(match.name || match.title || q);
      }
    }
  }, [dropoffOptions, dropoffQuery, selectedDropoff, setSelectedDropoff]);

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
    onUpdateSearchQuery?.(value);
    setDaytourParams({ searchQuery: value }); // Update the correct store
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
    setIsSearching(true);
    // if (!selectedCountry || !selectedCity) {
    //   alert("Please select both country and city");
    //   return;
    // }

    const categoryId = filterActiveTab === 3 ? 3 : 4;
    const categoryType = filterActiveTab === 3 ? 'daytour' : 'accommodation';

    
    const apiPayload = {
      category_id: categoryId, 
      country_id: selectedCountry?.id,
      city_id: selectedCity?.id,
      name: searchQuery,
      is_b2c_only: 1,
      is_active: true,
    };

    try {
      // Perform initial search with the keyword
      let results = await fetchSearchResults(apiPayload);

      // If no results and a search query was used, perform a fallback search
      if (results.length === 0 && searchQuery) {
        console.log("Daytour search with keyword failed, performing fallback...");
        const fallbackPayload = { ...apiPayload, name: "" }; // Remove the keyword
        results = await fetchSearchResults(fallbackPayload);
      }

      // Determine the final search query to persist
      const finalSearchQuery = (results && results.length > 0 && !searchQuery) ? "" : searchQuery;

      setTimeout(() => {
        onFilterTransfer?.({
          country: selectedCountry,
          city: selectedCity,
          search: finalSearchQuery,
          results: results,
          category: categoryType,
          category_id: categoryId,
          timestamp: Date.now(),
        });
      }, 100);

      setSuggestedResults([]);
    } catch (error) {
      console.error("Search failed:", error);
    } finally {
      if (!isHomepage) setIsSearching(false);
    }
  };

  const handleTransferSearch = async () => {
  if (!selectedPickup || !selectedDropoff) {
    toast.error("Please select both pick-up and drop-off locations");
    return;
  }

  setIsSearching(true);
  try {
    // Trigger the API call through the store
    await fetchTransfers({
      pickup: selectedPickup,
      dropoff: selectedDropoff,
      tripType: tripType,
    });
  } catch (error) {
    console.error("Transfer search failed:", error);
  }
  if (!isHomepage) setIsSearching(false);

  // Also call the parent callback if needed
  onFilterTransfer?.({
    category: 'transfer',         
    pickup: selectedPickup,
    dropoff: selectedDropoff,
    isTwoWay: tripType === "round-trip",
  });
};

  const handleSubmit = (e) => {
    e.preventDefault();
    if (filterActiveTab === 2) {
      handleTransferSearch();
    } else if (filterActiveTab === 3) {
      handleCategorySearch();
    // Accommodation search is handled by AccommodationFilter's onSearch prop
    }
  };

  const handleAccommodationSearch = (data) => {
    setIsSearching(true);
    setAccommodationParams(data);
    onFilterTransfer?.({
      category: "accommodation",
      ...data,
    });
    // On the homepage, the search triggers a navigation, unmounting this component.
    if (!isHomepage) {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    setIsSearching(false);
    setSuggestedResults([]);
  }, [filterActiveTab, setSuggestedResults]);

  const Pill = ({ tab }) => (
    <button
      type="button"
      onClick={() => onSetTab?.(tab.id)}
      className={`p-3 md:p-4 py-2 rounded-t-lg ml-4 text-sm sm:text-md font-semibold transition ${
        filterActiveTab === tab.id
          ? "bg-[#D3202D] text-white sm:py-2.5"
          : "bg-[#E6E6E6] text-black "
      }`}
    >
      {tab.name}
    </button>

  );

  return (
    <div className="w-full">
      <div className="flex flex-wrap gap-1 lg:gap-3">
        {filterTabs
          ?.filter((t) => [4, 3, 2].includes(t.id))
          .map((t) => (
            <Pill key={t.id} tab={t} />
          ))}
      </div>
<div className="transition-all duration-500 ease-in-out">
           {/* ====== TRANSFERS ====== */}
           {filterActiveTab === 2 && (
             <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
               <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                 {/* Trip Type */}
                 <div className="md:col-span-2 relative" ref={tripTypeDropdownRef}>
                   <button
                     type="button"
                     onClick={() => setShowTripTypeDropdown(!showTripTypeDropdown)}
                     className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center justify-between gap-2 h-full cursor-pointer"
                   >
                     <ArrowLeftRight className="h-5 w-5 text-[#D3202D] flex-shrink-0" />
                     <span className="flex-grow text-left text-base sm:text-lg font-medium">
                       {tripType === 'one-way' ? 'One Way' : 'Round Trip'}
                     </span>
                     <ChevronDown className={`h-5 w-5 flex-shrink-0 text-gray-400 transition-transform ${showTripTypeDropdown ? 'rotate-180' : ''}`} />
                   </button>

                   {showTripTypeDropdown && (
                     <div className="absolute z-20 mt-2 w-full rounded-xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                       <button
                         type="button"
                         onClick={() => { setTripType('one-way'); setShowTripTypeDropdown(false); }}
                         className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                       >
                         One Way
                       </button>
                       <button
                         type="button"
                         onClick={() => { setTripType('round-trip'); setShowTripTypeDropdown(false); }}
                         className="flex w-full items-center gap-2 px-3 py-2 text-left text-sm hover:bg-gray-50"
                       >
                         Round Trip
                       </button>
                     </div>
                   )}
                 </div>
                 {/* Pick-up */}
                 <div className="md:col-span-4 relative">
                   <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 h-full">
                     <MapPin className="h-5 w-5 text-[#D3202D]" />
                     <input
                       type="text"
                       value={pickupQuery}
                       placeholder="Pick-up point (e.g. Airport)"
                       onChange={(e) => onPickupChange(e.target.value)}
                       className="w-full bg-transparent placeholder:text-gray-400 text-base sm:text-lg outline-none"
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
                           <MapPin className="h-4 w-4 text-[#D3202D]" />
                           <span className="text-sm text-black">{p.name || p.title}</span>
                         </button>
                       ))}
                       {isLoading && <div className="px-3 py-2 text-center text-gray-400">Loading...</div>}
                     </div>
                   )}
                 </div>
     
                 {/* Swap Button */}
                 {/* <div className="hidden md:flex md:col-span-1 items-center justify-center">
                   <button type="button" onClick={swapLocations} className="rounded-full p-2 hover:bg-gray-100" title="Swap">
                     <ArrowLeftRight className="h-5 w-5 text-gray-400" />
                   </button>
                 </div> */}
     
                 {/* Drop-off */}
                 <div className="md:col-span-4 relative">
                   <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 h-full">
                     <Building className="h-5 w-5 text-[#D3202D]" />
                     <input
                       type="text"
                       value={dropoffQuery}
                       onChange={(e) => onDropoffChange(e.target.value)}
                       placeholder="Drop-off point (e.g. Hotel)"
                       disabled={!selectedPickup && !dropoffQuery}
                       className="w-full bg-transparent placeholder:text-gray-400 text-base sm:text-lg outline-none disabled:text-gray-400"
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
                           <Building className="h-4 w-4 text-[#D3202D]" />
                           <span className="text-sm text-black">{d.name || d.title}</span>
                         </button>
                       ))}
                       {isLoading && <div className="px-3 py-2 text-center text-gray-400">Loading...</div>}
                     </div>
                   )}
                 </div>
                 
                 {/* Search button */}
                 <div className="md:col-span-2 flex items-stretch">
                   <button
                     type="submit"                     className="min-w-full rounded-lg  bg-[#D3202D] text-white font-semibold text-base sm:text-lg  py-3 md:py-2 active:bg-[#D3202D] transition touch-manipulation flex justify-center items-center"
                   disabled={isLoading}                   
                   >
                     {isLoading ? (
                      <LoaderSvg />
                    ) : "Search"}
                   </button>
                 </div>
                 <div className="md:col-span-12 right-0 flex justify-end gap-1">
                   <span className="text-xs text-gray-400">Powered by </span>
                   <img className="h-5 w-auto" src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763694508/External%20Links/toureast_logo.png" alt="Toureast Logo" />
                 </div>
               </div>
             </form>
           )}
      {/* ====== DAY TOURS ====== */}
      {filterActiveTab === 3 && (
        <form onSubmit={handleSubmit} className="relative rounded-2xl bg-white text-black shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-4 md:p-6">
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
                        <MapPin className="h-4 w-4 text-[#D3202D]" />
                        <span className="text-sm text-white">{c.name}</span>
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
                        <Building className="h-4 w-4 text-[#D3202D]" />
                        <span className="text-sm text-white">
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
            <div className="md:col-span-10 relative">
              <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2">
                <Search className="h-5 w-5 text-[#D3202D] flex-shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  placeholder={filterActiveTab === 3 ? dayTourPlaceholders[placeholderIndex] : "Search for tours..."}
                  className="w-full bg-transparent text-base outline-none py-0.5 placeholder:text-gray-400"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery("");
                      onUpdateSearchQuery?.("");
                      setDaytourParams({ searchQuery: "" }); // Clear store
                      setSuggestedResults([]);
                    }}
                    className="ml-auto text-gray-400 hover:text-gray-600"
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
                      <Search className="h-4 w-4 text-[#D3202D]" />
                      <span className="text-sm text-black">
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
                className="min-w-full rounded-lg bg-[#D3202D] text-white font-semibold text-base sm:text-lg py-3 md:py-2 active:bg-[#D3202D] transition touch-manipulation flex justify-center items-center"
                disabled={isLoading}
              >
                {isLoading ? (
                  <LoaderSvg />
                ) : "Search"}
              </button>
            </div>
            <div className=" flex justify-end md:col-span-12 gap-1">
              <span className="text-xs text-gray-400">Powered by </span>
              <img className="h-5 w-auto" src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763694508/External%20Links/toureast_logo.png" alt="Toureast Logo" />
            </div>
          </div>
        </form>
      )}


      {/* ====== ACCOMMODATION ====== */}
      {filterActiveTab === 4 && (
        <AccommodationFilter 
          onSearch={handleAccommodationSearch}
          initialSearchText={accommodationParams.text || initialAccommodationText}
          initialCheckinDate={accommodationParams.start_date || initialCheckinDate}
          initialCheckoutDate={accommodationParams.end_date || initialCheckoutDate}
          initialRooms={accommodationParams.rooms || rooms}
          isHomepage={isHomepage}
        />
      )}
</div>
      {/* ====== COMING SOON ====== */}
      {![4, 2, 3].includes(filterActiveTab) && (
        <div className="rounded-2xl bg-white shadow p-8 text-center text-gray-500">
          Coming Soon...
        </div>
      )}
    </div>
  );
}