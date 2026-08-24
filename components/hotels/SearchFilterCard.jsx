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
  Building2,
  Plane,
  Ship,
  Train,
  Landmark,
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
  const [selectedPickupCategory, setSelectedPickupCategory] = useState(null);
  const [selectedDropoffCategory, setSelectedDropoffCategory] = useState(null);
  const tripTypeDropdownRef = useRef(null);

  // Searchable dropdowns
  const [showCountryDropdown, setShowCountryDropdown] = useState(false);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [countryQuery, setCountryQuery] = useState("");
  const [cityQuery, setCityQuery] = useState("");

  const [showPickupDropdown, setShowPickupDropdown] = useState(false);
  const [showDropoffDropdown, setShowDropoffDropdown] = useState(false);
  const [pickupFocused, setPickupFocused] = useState(false);
  const [dropoffFocused, setDropoffFocused] = useState(false);

  const isLoading = transferLoading || daytoursLoading || isSearching;
  const { prefillData, updatePrefillDataFromCart } = useOrderStore();
  const { items: cartItems } = useCartStore();

  const getIconForCategory = (type) => {
    switch ((type || "").toLowerCase()) {
      case "airport":
        return <Plane size={16} className="text-red-600" />;
      case "cruise":
        return <Ship size={16} className="text-cyan-600" />;
      case "hotel":
      case "villa":
      case "apartment":
        return <Building2 size={16} className="text-gray-700" />;
      case "train":
      case "metro":
        return <Train size={16} className="text-purple-600" />;
      case "attraction":
      case "attractions":
        return <Landmark size={16} className="text-orange-600" />;
      default:
        return <MapPin size={16} className="text-gray-400" />;
    }
  };
  useEffect(() => {
    updatePrefillDataFromCart(cartItems);
  }, [cartItems, updatePrefillDataFromCart]);

  const availablePickupCategories = useMemo(() => {
    if (!pickupOptions || pickupOptions.length === 0) return [];
    const uniqueTypes = [...new Set(pickupOptions.map(item => (item.type || "").toLowerCase()).filter(Boolean))];
    return uniqueTypes.map((type, index) => ({
      id: `pickup-cat-${index}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      nameKey: type
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [pickupOptions]);

  const availableDropoffCategories = useMemo(() => {
    if (!dropoffOptions || dropoffOptions.length === 0) return [];
    const uniqueTypes = [...new Set(dropoffOptions.map(item => (item.type || "").toLowerCase()).filter(Boolean))];
    return uniqueTypes.map((type, index) => ({
      id: `dropoff-cat-${index}`,
      name: type.charAt(0).toUpperCase() + type.slice(1),
      nameKey: type
    })).sort((a, b) => a.name.localeCompare(b.name));
  }, [dropoffOptions]);

  const filteredPickupOptions = useMemo(() => {
    let options = pickupOptions;
    if (selectedPickupCategory) {
      options = options.filter(opt => (opt.type || "").toLowerCase() === selectedPickupCategory.toLowerCase());
    }
    const q = (pickupQuery || "").toLowerCase();
    if (!q) return options;
    return options.filter((p) =>
      (p.name || p.title || "").toLowerCase().includes(q) || (p.type || "").toLowerCase().includes(q)
    );
  }, [pickupOptions, pickupQuery, selectedPickupCategory]);

  const filteredDropoffOptions = useMemo(() => {
    let options = dropoffOptions;
    if (selectedDropoffCategory) {
      options = options.filter(opt => (opt.type || "").toLowerCase() === selectedDropoffCategory.toLowerCase());
    }
    const q = (dropoffQuery || "").toLowerCase();
    if (!q) return options;
    return options.filter((d) =>
      (d.name || d.title || "").toLowerCase().includes(q) || (d.type || "").toLowerCase().includes(q)
    );
  }, [dropoffOptions, dropoffQuery, selectedDropoffCategory]);

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
    //if (isHomepage) return; // Don't auto-load on homepage
    if (filterActiveTab === 2 && !pickupOptions?.length) {
      fetchPickupOptions();
    }
  }, [filterActiveTab, fetchPickupOptions, pickupOptions?.length, isHomepage]);

  useEffect(() => {
    if ((filterActiveTab === 3 || filterActiveTab === 4) && countries.length === 0) {
      fetchCountriesCities();
    }
  }, [filterActiveTab, fetchCountriesCities, countries.length]);

  // Guard refs to prevent infinite re-runs
  const daytourAutoRunRef = useRef(null);
  const accAutoRunRef = useRef(null);

  // Auto-load Day Tours listing with empty name when Day Tours tab becomes active
  useEffect(() => {
    let mounted = true;
    const loadDayTours = async () => {
      if (isHomepage) return; // Don't auto-search on homepage
      if (filterActiveTab !== 3) return;

      const payloadKey = JSON.stringify({ country: selectedCountry?.id, city: selectedCity?.id, name: "" });
      if (daytourAutoRunRef.current === payloadKey) return; // already ran for same payload
      daytourAutoRunRef.current = payloadKey;

      setIsSearching(true);
      try {
        const apiPayload = {
          category_id: 3,
          country_id: selectedCountry?.id,
          city_id: selectedCity?.id,
          name: "",
          is_b2c_only: 1,
          is_active: true,
        };
        let results = await fetchSearchResults(apiPayload);

        // fallback if empty and no name
        if (mounted && Array.isArray(results)) {
          setTimeout(() => {
            onFilterTransfer?.({
              country: selectedCountry,
              city: selectedCity,
              search: "",
              results: results,
              category: "daytour",
              category_id: 3,
              timestamp: Date.now(),
            });
          }, 100);
        }
      } catch (err) {
        console.error("Daytour auto-load failed:", err);
        daytourAutoRunRef.current = null; // allow retry next time
      } finally {
        if (!isHomepage) setIsSearching(false);
      }
    };

    // Small delay to allow any remote data (countries) to settle
    const t = setTimeout(loadDayTours, 150);
    return () => {
      mounted = false;
      clearTimeout(t);
    };
  }, [filterActiveTab, fetchSearchResults, selectedCountry, selectedCity, onFilterTransfer, isHomepage]);

  // Auto-run Accommodation search when tab becomes active using persisted params or prefill data
  useEffect(() => {
    if (isHomepage) return; // Don't auto-search on homepage
    if (filterActiveTab !== 4) return;

    // If explicit accommodation params exist, reuse them
    const hasAccParams = accommodationParams && (accommodationParams.text || accommodationParams.start_date || accommodationParams.rooms);
    let payload = null;

    if (hasAccParams) {
      payload = accommodationParams;
    } else if (prefillData && (prefillData.pickup_point || prefillData.date)) {
      // If no accommodationParams but we have prefill data (e.g., from cart), use that to search
      payload = {
        text: prefillData.pickup_point || "",
        start_date: prefillData.date || null,
        end_date: prefillData.date || null,
        rooms: rooms || [],
      };
    }

    if (!payload) return; // Nothing to run

    const key = JSON.stringify(payload);
    if (accAutoRunRef.current === key) return; // already ran for this payload
    accAutoRunRef.current = key;

    const t = setTimeout(() => handleAccommodationSearch(payload), 150);
    return () => clearTimeout(t);
  }, [filterActiveTab, accommodationParams, prefillData, rooms]);

  // Pickup handlers
  const onPickupChange = (val) => {
    setPickupQuery(val);
    setSelectedPickup(null);
    setSelectedDropoff(null);
    setDropoffQuery("");
  };

  const onPickupSelect = (opt) => {
    setSelectedPickup(opt);
    setPickupQuery(opt.name || opt.title || "");
    setShowPickupDropdown(false);
    setPickupFocused(false);
    setSelectedDropoff(null);
    setDropoffQuery("");
    setSelectedDropoffCategory(null);
    if (opt?.id) {
      fetchDropoffOptions(opt.id);
    }
  };

  const handlePickupCategorySelect = (category) => {
    setSelectedPickupCategory((category.nameKey || category.name).toLowerCase());
    setPickupQuery("");
    setPickupFocused(true);
    setShowPickupDropdown(true);
  };

  const onDropoffChange = (val) => {
    if (!selectedPickup) return;
    const value = val;
    setDropoffQuery(value);
    setSelectedDropoff(null);
  };

  const handleDropoffCategorySelect = (category) => {
    setSelectedDropoffCategory((category.nameKey || category.name).toLowerCase());
    setDropoffQuery("");
    setShowDropoffDropdown(true);
    setDropoffFocused(true);
  };

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
    // Pre-mark the auto-run ref so the auto-run effect doesn't fire a second
    // time when setAccommodationParams triggers its dependency update below.
    accAutoRunRef.current = JSON.stringify(data);
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
      <div className="flex flex-wrap gap-1 lg:gap-1">
        {filterTabs
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
                       readOnly={!selectedPickupCategory && !selectedPickup}
                       value={selectedPickup?.name || pickupQuery}
                       placeholder={selectedPickupCategory ? `Search ${selectedPickupCategory}...` : "Pick-up point (e.g. Airport)"}
                       onChange={(e) => onPickupChange(e.target.value)}
                       onFocus={() => {
                         setPickupFocused(true);
                         setShowPickupDropdown(true);
                       }}
                       onBlur={() => {
                         setTimeout(() => {
                           setShowPickupDropdown(false);
                           setPickupFocused(false);
                         }, 200);
                       }}
                       className={`w-full bg-transparent placeholder:text-gray-400 text-base sm:text-lg outline-none ${(!selectedPickupCategory && !selectedPickup) ? 'cursor-pointer' : ''}`}
                     />
                     {(selectedPickup || pickupQuery || selectedPickupCategory) && (
                       <button
                         type="button"
                         onClick={() => {
                           setPickupQuery("");
                           setSelectedPickup(null);
                           setSelectedDropoff(null);
                           setDropoffQuery("");
                           setSelectedPickupCategory(null);
                         }}
                         className="text-gray-400 hover:text-gray-600"
                         aria-label="Clear pick-up"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     )}
                   </div>

                   {pickupFocused && !pickupQuery && !selectedPickup && !selectedPickupCategory && availablePickupCategories.length > 0 && (
                     <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg z-50 max-h-[50vh] overflow-y-auto">
                       <ul className="py-2">
                         <li className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                           Select Category
                         </li>
                         {availablePickupCategories.map((category) => (
                           <li
                             key={category.id}
                             onMouseDown={(e) => { e.preventDefault(); handlePickupCategorySelect(category); }}
                             className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                           >
                             <div className="p-2 bg-gray-100 rounded-full">{getIconForCategory(category.nameKey)}</div>
                             <span className="text-gray-900 font-medium">{category.name}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {showPickupDropdown && (pickupQuery || selectedPickupCategory) && pickupQuery !== selectedPickup?.name && (
                     <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-[50vh] overflow-auto z-50">
                       {!selectedPickupCategory && availablePickupCategories?.filter(c => (c.name || c.nameKey) && (c.name || c.nameKey).toLowerCase().includes(pickupQuery.toLowerCase()) && (c.name || c.nameKey).toLowerCase() !== pickupQuery.toLowerCase()).map((category) => (
                         <li
                           key={`cat-${category.id}`}
                           onMouseDown={(e) => { e.preventDefault(); handlePickupCategorySelect(category); }}
                           className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                         >
                           <div className="p-2 bg-gray-100 rounded-full">{getIconForCategory(category.nameKey)}</div>
                           <span className="text-gray-900 font-medium">{category.name} <span className="text-xs text-gray-500 font-normal">(Category)</span></span>
                         </li>
                       ))}
                       {transferLoading ? (
                         <li className="px-3 py-2.5 text-center text-gray-800">Loading...</li>
                       ) : filteredPickupOptions.length > 0 ? (
                         filteredPickupOptions.map((option) => (
                           <li
                             key={option.id}
                             onClick={() => onPickupSelect(option)}
                             className="flex justify-between items-center px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-300 last:border-b-0 text-gray-900"
                           >
                             <div className="flex text-sm items-center gap-2">
                               {getIconForCategory(option.type)}
                               <span>{option.name}</span>
                             </div>
                             <span className="text-xs text-gray-500 capitalize">{option.type}</span>
                           </li>
                         ))
                       ) : (
                         (selectedPickupCategory || availablePickupCategories?.filter(c => (c.name || c.nameKey) && (c.name || c.nameKey).toLowerCase().includes(pickupQuery.toLowerCase()) && (c.name || c.nameKey).toLowerCase() !== pickupQuery.toLowerCase()).length === 0) && (
                           <li className="px-3 py-2.5 text-center text-gray-500">No results found</li>
                         )
                       )}
                     </ul>
                   )}
                 </div>

                 {/* Drop-off */}
                 <div className="md:col-span-4 relative">
                   <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2 h-full">
                     <Building className="h-5 w-5 text-[#D3202D]" />
                     <input
                       type="text"
                       readOnly={!selectedDropoffCategory && !selectedDropoff}
                       value={dropoffQuery}
                       onChange={(e) => onDropoffChange(e.target.value)}
                       onFocus={() => {
                         if (selectedPickup && (dropoffOptions.length > 0 || selectedDropoffCategory)) {
                           setDropoffFocused(true);
                           setShowDropoffDropdown(true);
                         }
                       }}
                       onBlur={() => {
                         setTimeout(() => {
                           setShowDropoffDropdown(false);
                           setDropoffFocused(false);
                         }, 200);
                       }}
                       disabled={!selectedPickup}
                       placeholder={selectedDropoffCategory ? `Search ${selectedDropoffCategory}...` : "Drop-off point (e.g. Hotel)"}
                       className={`w-full bg-transparent placeholder:text-gray-400 text-base sm:text-lg outline-none disabled:text-gray-400 ${(!selectedDropoffCategory && !selectedDropoff) ? 'cursor-pointer' : ''}`}
                     />
                     {(dropoffQuery || selectedDropoff || selectedDropoffCategory) && (
                       <button
                         type="button"
                         onClick={() => {
                           setDropoffQuery("");
                           setSelectedDropoff(null);
                           setSelectedDropoffCategory(null);
                         }}
                         className="text-gray-400 hover:text-gray-600"
                         aria-label="Clear drop-off"
                       >
                         <X className="h-4 w-4" />
                       </button>
                     )}
                   </div>

                   {dropoffFocused && !dropoffQuery && !selectedDropoff && !selectedDropoffCategory && selectedPickup && availableDropoffCategories.length > 0 && (
                     <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg z-50 max-h-[50vh] overflow-y-auto">
                       <ul className="py-2">
                         <li className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider bg-gray-50 sticky top-0">
                           Select Category
                         </li>
                         {availableDropoffCategories.map((category) => (
                           <li
                             key={category.id}
                             onMouseDown={(e) => { e.preventDefault(); handleDropoffCategorySelect(category); }}
                             className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                           >
                             <div className="p-2 bg-gray-100 rounded-full">{getIconForCategory(category.nameKey)}</div>
                             <span className="text-gray-900 font-medium">{category.name}</span>
                           </li>
                         ))}
                       </ul>
                     </div>
                   )}

                   {showDropoffDropdown && (dropoffQuery || selectedDropoffCategory) && dropoffQuery !== selectedDropoff?.name && selectedPickup && (
                     <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-[50vh] overflow-auto z-50">
                       {!selectedDropoffCategory && availableDropoffCategories?.filter(c => (c.name || c.nameKey) && (c.name || c.nameKey).toLowerCase().includes(dropoffQuery.toLowerCase()) && (c.name || c.nameKey).toLowerCase() !== dropoffQuery.toLowerCase()).map((category) => (
                         <li
                           key={`cat-${category.id}`}
                           onMouseDown={(e) => { e.preventDefault(); handleDropoffCategorySelect(category); }}
                           className="flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0"
                         >
                           <div className="p-2 bg-gray-100 rounded-full">{getIconForCategory(category.nameKey)}</div>
                           <span className="text-gray-900 font-medium">{category.name} <span className="text-xs text-gray-500 font-normal">(Category)</span></span>
                         </li>
                       ))}
                       {filteredDropoffOptions.length > 0 ? (
                         filteredDropoffOptions.map((option) => (
                           <li
                             key={option.id}
                             onClick={() => {
                               setSelectedDropoff(option);
                               setDropoffQuery(option.name || option.title);
                               setShowDropoffDropdown(false);
                             }}
                             className="flex justify-between items-center px-3 py-2.5 hover:bg-gray-50 cursor-pointer border-b border-gray-300 last:border-b-0 text-gray-900"
                           >
                             <div className="flex text-sm items-center gap-2">
                               {getIconForCategory(option.type)}
                               <span>{option.name}</span>
                             </div>
                             <span className="text-xs text-gray-500 capitalize">{option.type}</span>
                           </li>
                         ))
                       ) : (
                         (selectedDropoffCategory || availableDropoffCategories?.filter(c => (c.name || c.nameKey) && (c.name || c.nameKey).toLowerCase().includes(dropoffQuery.toLowerCase()) && (c.name || c.nameKey).toLowerCase() !== dropoffQuery.toLowerCase()).length === 0) && (
                           <li className="px-3 py-2.5 text-center text-gray-500">No results found</li>
                         )
                       )}
                     </ul>
                   )}
                 </div>

                 {/* Search button */}
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
                 <div className="md:col-span-12 right-0 flex justify-end gap-1">
                   <span className="text-xs text-gray-400">Powered by </span>
                   <img className="h-5 w-auto" src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/toureast_logo.png`} alt="Toureast Logo" />
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
              <img className="h-5 w-auto" src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/toureast_logo.png`} alt="Toureast Logo" />
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