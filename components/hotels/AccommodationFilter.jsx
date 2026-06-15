// components/hotels/AccommodationFilter.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import { toast, POSITION } from 'react-toastify';
import {
  Search,
  X,
  MapPin,
  Building,
  ChevronDown,
  Plus,
  Minus,
  Calendar,
  Users,
} from "lucide-react";
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useEventStore } from "@/store/useEventStore";
import LoaderSvg from "@/components/common/LoaderSvg";
import { useRouter } from "next/navigation";
const DEFAULT_REGION = {
  id: 4352,
  region_id: 18196,
  region_name: "",
  name: "",
};


export default function AccommodationFilter({ onSearch, initialSearchText = "", initialCheckinDate = null, initialCheckoutDate = null, initialRooms = null, onSearchTextChange, isHomepage = false }) {
  // const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState(initialCheckinDate ? new Date(initialCheckinDate) : null);
  const [endDate, setEndDate] = useState(initialCheckoutDate ? new Date(initialCheckoutDate) : null);
 const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [rooms, setRooms] = useState(initialRooms || [{ adult: 2, children: [] }]);
  const [nationality, setNationality] = useState("SG");
  const [stars, setStars] = useState("");
  const [refund, setRefund] = useState("all");
  const [tempEndDate, setTempEndDate] = useState(null);
  const [isInputFocused, setIsInputFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [childAges, setChildAges] = useState({});
  const [showChildInput, setShowChildInput] = useState({});
  const router = useRouter();

 // const isDesktop = useMediaQuery("(min-width: 768px)");

// selectedItem.type: 'region' | 'hotel'
const [selectedItem, setSelectedItem] = useState({
  ...DEFAULT_REGION,
  type: "region",
});
const [selectedRegion, setSelectedRegion] = useState(DEFAULT_REGION);

const [search, setSearch] = useState(initialSearchText || DEFAULT_REGION.name);

  // Debounce timer ref
  const debounceTimeoutRef = useRef(null);

  const {
    nationalities,
    hotels,
    regions,
    isLoading,
    fetchNationalities,
    fetchHotelsAndRegions,
    setSearchParamsAndSearch,
  } = useAccommodationsStore();

  const { event, FetchEvent } = useEventStore();

  // Fetch nationalities on mount
  // useEffect(() => {
  //   fetchNationalities();
  // }, [fetchNationalities]);

  // Fetch event data on mount
  useEffect(() => {
    FetchEvent();
  }, [FetchEvent]);

  // Get booking date range from event store
  const eventDetails = event?.event;
  const productBookingStart = eventDetails?.product_booking_start ? new Date(eventDetails.product_booking_start) : null;
  const productBookingEnd = eventDetails?.product_booking_end ? new Date(eventDetails.product_booking_end) : null;
  const minSelectableDate = productBookingStart && productBookingStart > new Date() ? productBookingStart : new Date();

  useEffect(() => {
    setStartDate(initialCheckinDate ? new Date(initialCheckinDate) : null);
    setEndDate(initialCheckoutDate ? new Date(initialCheckoutDate) : null);
    setRooms(initialRooms || [{ adult: 2, children: [] }]);
    setSearch(initialSearchText || "");
  }, [initialCheckinDate, initialCheckoutDate, initialRooms, initialSearchText]);

useEffect(() => {
  if (debounceTimeoutRef.current) {
    clearTimeout(debounceTimeoutRef.current);
  }

  if (!isInputFocused) {
    setShowDropdown(false);
    return;
  }
  const query = search && search.trim() ? search.trim() : DEFAULT_REGION.region_name;

  if (!query) {
    setShowDropdown(false);
    return;
  }

  debounceTimeoutRef.current = setTimeout(() => {
    const formatDate = (date) => {
      if (!date) return null;
      const d = new Date(date);
      const y = d.getFullYear();
      const m = String(d.getMonth() + 1).padStart(2, "0");
      const day = String(d.getDate()).padStart(2, "0");
      return `${y}-${m}-${day}`;
    };
    fetchHotelsAndRegions({
      text: query,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      rooms: rooms,
    });
    setShowDropdown(true);
  }, 400);

  return () => {
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }
  };
}, [search, isInputFocused, fetchHotelsAndRegions]);

  const totalGuests = rooms.reduce(
    (sum, r) => sum + r.adult + r.children.length,
    0
  );

  const addRoom = () => setRooms([...rooms, { adult: 1, children: [] }]);
  const removeRoom = (i) => {
    if (rooms.length > 1) setRooms(rooms.filter((_, idx) => idx !== i));
  };

  const updateAdult = (i, val) => {
    const newRooms = [...rooms];
    newRooms[i].adult = Math.max(1, Math.min(10, val));
    setRooms(newRooms);
  };

  const addChild = (i) => {
    const ageToAdd = childAges[i];
    const newRooms = [...rooms];
    if (newRooms[i].children.length < 10) {
      newRooms[i].children.push(ageToAdd);
      // Reset input for that room
      setChildAges({ ...childAges, [i]: 1 });
      setShowChildInput({ ...showChildInput, [i]: false });
    }
    setRooms(newRooms);
  };

  const removeChild = (i, childIndex) => {
    const newRooms = [...rooms];
    newRooms[i].children.splice(childIndex, 1);
    setRooms(newRooms);
  };

  const handleStartDateChange = (dates) => {
    const [start, end] = dates;
     setStartDate(start);
    setEndDate(end); 
   };


  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSelection = (item, type) => {
    console.log("Selected Item:", item, "Type:", type);
    setSelectedItem({ ...item, type });    
    if (type === "hotel") {
      setSearch(item.title);
    } else if (type === "region") {
      setSearch(item.region_name);
      setSelectedRegion(item);
    } else if (type === "tag") {
      setSearch(item.tag);
    }
    setShowDropdown(false);
    setIsInputFocused(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    onSearchTextChange?.(value); // Crucial: Update parent's state
    if (!value.trim()) {
      setSearch("");
      setSelectedItem({ ...DEFAULT_REGION, type: "region" });
      setSelectedRegion(DEFAULT_REGION);
      return;
    }
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  if (!selectedItem) {
   setSelectedItem({ ...DEFAULT_REGION, type: "region", id: DEFAULT_REGION.id, region_id: DEFAULT_REGION.region_id });
  }

  const effectiveSelection = selectedItem || { ...DEFAULT_REGION, type: "region" };

  if (!startDate || !endDate) {
    toast.error("Please select both check-in and check-out dates");
    return;
  }

  const nights = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
  const formatDate = (date) => {
    const d = new Date(date);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const payload = {
    start_date: formatDate(startDate),
    end_date: formatDate(endDate),
    nights,
    rooms,
    nationality,
    refund_policy: refund,
    stars,
   
    hotel_id: null,
    region_id: null,
    ids: [],
    search_query: search,
    text: search, 
    text: search,
  };

  if (effectiveSelection.type === "hotel") {
    payload.hotel_id = effectiveSelection.stuba_id; 
    payload.ids = [effectiveSelection.id];
    payload.region_id = effectiveSelection.region_id; 
  } else if (effectiveSelection.type === "region") {
    payload.region_id = effectiveSelection.region_id;
    payload.hotel_id = null; 
    payload.ids = [];
  }

  console.log("Search Payload:", payload);

  try {
    setIsSearching(true);

    if (!isHomepage) {
      // On listings page: let the parent + Effect 5 own the fetch — calling
      // setSearchParamsAndSearch here causes a duplicate set of API calls.
      if (onSearch) onSearch(payload);
      return;
    }

    // Homepage: fetch first so we can validate results before navigating.
    const results = await setSearchParamsAndSearch(payload);
    if (!results || results.length === 0) {
      toast.error("No options for selected dates/guests.");
      toast.error("Try different dates or guest.");
      return;
    }
    const { error } = useAccommodationsStore.getState();
    if (error) {
      toast.error(error);
      return;
    }
    if (onSearch) onSearch(payload);

  } catch (err) {
    console.error("Search failed:", err);
    toast.error("An error occurred while searching. Please try again.");
  } finally {
    if (!isHomepage) {
      setIsSearching(false);
    }
    if (isHomepage) router.push(`/listings?searched=true&type=accommodation`);
  }
};

  return (
    <form onSubmit={handleSubmit} className="relative rounded-xl md:rounded-2xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.08)] p-3 sm:p-4 md:p-6 md:pb-6">
      <div className="flex flex-col md:grid md:grid-cols-12 gap-2 sm:gap-3">
        {/* Search Input */}
    
          {/* Date Range Picker - SINGLE */}
<div className="md:col-span-4 relative">
          <div className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base sm:text-lg flex items-center justify-between gap-2">
            <Calendar className="h-5 w-5 text-[#D3202D] flex-shrink-0" />
            <DatePicker
              selected={startDate}
              onChange={handleStartDateChange}
              startDate={startDate}
              endDate={endDate}
              selectsRange              
              minDate={minSelectableDate}
              maxDate={productBookingEnd}
              placeholderText="Check-in - Check-out"
              className="w-full bg-transparent outline-none cursor-pointer"
              wrapperClassName="w-full"
              dateFormat="MMM d, yyyy"
              monthsShown={1}
              showPopperArrow={false}
              customInput={
                <div className="flex items-center justify-between w-full">
                  <span className="truncate font-medium">
                    {startDate ? (
                      <>
                        {startDate.toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                        {endDate ? (
                          <>
                            {" "}
                            →{" "}
                            {endDate.toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </>
                        ) : (
                          " → Add checkout"
                        )}
                      </>
                    ) : (
                      "Check-in - Check-out"
                    )}
                  </span>
                  <ChevronDown className="h-5 w-5 text-gray-400" />
                </div>
              }
            />
          </div>
        </div>
        {/* Check-in */}
        {/* <div className="md:col-span-2 relative">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            startDate={startDate}
            endDate={tempEndDate}
            selectsRange
            selectsStart
            minDate={new Date()}
            placeholderText="Check-in"
            className="w-full rounded-xl md:rounded-2xl border border-gray-200 px-3 py-2.5 md:py-2 text-base sm:text-lg outline-none"
            monthsShown={window.innerWidth >= 640 ? 2 : 1}
            dateFormat="MMM d, yyyy"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div> */}

        {/* Check-out */}
        {/* <div className="md:col-span-2 relative">
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            placeholderText="Check-out"
            className="w-full rounded-xl md:rounded-2xl border border-gray-200 px-3 py-2.5 md:py-2 text-base sm:text-lg outline-none"
            dateFormat="MMM d, yyyy"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div> */}

        {/* Guests */}
        <div className="md:col-span-3 relative">
          <button
            type="button"
            onClick={() => setShowGuestPopup(!showGuestPopup)}
            className="w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-base sm:text-lg flex items-center justify-between gap-2 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <Users className="h-5 w-5 text-[#D3202D] flex-shrink-0" />
            <span className="truncate flex-grow text-left">
              {totalGuests} Guest{totalGuests > 1 ? "s" : ""} • {rooms.length} Room
              {rooms.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className="h-5 w-5 flex-shrink-0" />
          </button>

          {/* Guest Popup - Mobile Optimized */}
          {showGuestPopup && (
            <div className="absolute z-20 mt-2 left-0 right-0 md:w-full rounded-xl border bg-white shadow-lg p-3 sm:p-4 max-h-72 sm:max-h-96 overflow-y-auto scrollbar-hide">
              {rooms.map((room, i) => (
                <div key={i} className="mb-3 sm:mb-4 pb-3 sm:pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm sm:text-base">Room {i + 1}</span>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(i)}
                        className="text-red-500 text-xs sm:text-sm font-medium hover:text-red-600 active:text-red-700 px-2 py-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm sm:text-base font-medium">Adults</span>
                    <div className="flex items-center gap-2 sm:gap-3">
                      <button
                        type="button"
                        onClick={() => updateAdult(i, room.adult - 1)}
                        disabled={room.adult <= 1}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded border flex items-center justify-center touch-manipulation ${
                          room.adult <= 1
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <Minus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                      <span className="w-8 text-center text-sm sm:text-base font-medium">{room.adult}</span>
                      <button
                        type="button"
                        onClick={() => updateAdult(i, room.adult + 1)}
                        disabled={room.adult >= 10}
                        className={`w-8 h-8 sm:w-9 sm:h-9 rounded border flex items-center justify-center touch-manipulation ${
                          room.adult >= 10
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50 active:bg-gray-100"
                        }`}
                      >
                        <Plus className="h-3 w-3 sm:h-4 sm:w-4" />
                      </button>
                    </div>
                  </div>

                  <div>
                    <div className="flex items-center gap-4 mb-2">
                      <span className="text-sm sm:text-base font-medium flex-shrink-0">Children</span>
                      <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 flex-grow">
                        {room.children.map((childAge, childIndex) => (
                          <div
                            key={childIndex}
                            className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1"
                          >
                            <span className="text-xs sm:text-sm text-blue-800">{childAge}y</span>
                            <button type="button" onClick={() => removeChild(i, childIndex)} className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500 active:bg-red-600 touch-manipulation flex-shrink-0">
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                      {room.children.length < 10 && !showChildInput[i] && (
                        <button type="button" onClick={() => setShowChildInput({ ...showChildInput, [i]: true })} className="text-xs sm:text-sm text-[#D3202D] font-medium flex-shrink-0">
                          + Add Child
                        </button>
                      )}
                    </div>

                    {showChildInput[i] && room.children.length < 10 && (
                      <div className="flex items-center gap-3">
                        <label className="text-xs text-gray-600 flex-shrink-0">Enter the child age:</label>
                        <div className="relative flex-grow">
                          <input
                            type="number"
                            min="1"
                            max="12"
                            value={childAges[i] ?? ''}
                            onChange={(e) => {
                              const age = e.target.value === '' ? '' : Math.max(0, Math.min(12, parseInt(e.target.value, 10) || 0));
                              setChildAges({ ...childAges, [i]: age });
                            }}
                            placeholder="Age"
                            className="w-full bg-white text-xs sm:text-sm border border-gray-300 rounded-md px-2 py-1.5 pr-16 outline-none focus:ring-1 focus:ring-blue-500"
                          />
                          <button
                            type="button"
                            onClick={() => addChild(i)}
                            disabled={!childAges[i] || childAges[i] < 1}
                            className="absolute right-1 top-1/2 -translate-y-1/2 h-[calc(100%-0.25rem)] text-xs bg-gray-500 hover:bg-gray-600 text-white font-medium px-3 rounded transition-colors touch-manipulation"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    )}

                    {/* <div className="text-right text-xs text-gray-500 mt-1">
                      {room.children.length}/10 children
                    </div> */}
                  </div>


                </div>
              ))}

              <div className="flex gap-2 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={addRoom}
                  className="flex-1 text-xs sm:text-sm border border-[#D3202D] text-[#D3202D] font-medium py-2 sm:py-2.5 rounded-lg transition-colors touch-manipulation"
                >
                  + Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestPopup(false)}
                  className="flex-1 bg-[#D3202D] text-white text-xs sm:text-sm font-medium py-2 sm:py-2.5 rounded-lg transition-colors touch-manipulation"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>
    <div className="md:col-span-3 relative">
          <div className="rounded-lg border border-gray-200 bg-white px-3 py-2.5 flex items-center gap-2">

            <Search className="h-5 w-5 text-[#D3202D] flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              onFocus={() => setIsInputFocused(true)}
              onBlur={() => setTimeout(() => setIsInputFocused(false), 200)}
              placeholder={!startDate || !endDate ? "" : "Search hotels or regions..."}
              disabled={!startDate || !endDate}
              className="w-full bg-transparent outline-none text-base sm:text-lg disabled:cursor-not-allowed disabled:bg-gray-50 disabled:text-gray-400"
              autoComplete="off"
            />
            {search && search !== DEFAULT_REGION.name && (
              <button
                type="button"
                onClick={() => {
                  setSearch(DEFAULT_REGION.name);
                  setSelectedItem({ ...DEFAULT_REGION, type: "region" });
                  setSelectedRegion(DEFAULT_REGION);
                }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            {/* {search && (
              <button
                type="button"
              onClick={() => {
  setSearch(DEFAULT_REGION.name);
  setSelectedItem({ ...DEFAULT_REGION, type: "region" });
  setShowDropdown(false);
}}

                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )} */}
          </div>

          {/* Dropdown with Loading - Mobile Full Width */}
          {showDropdown && (
            <div className="absolute z-20 mt-2 left-0 right-0 md:w-full rounded-xl border bg-white shadow-lg max-h-64 sm:max-h-80 overflow-auto">
              {isLoading ? (
                <div className="px-4 py-6 sm:py-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 sm:h-6 sm:w-6 border-2 border-gray-300 border-t-yellow-500"></div>
                  <p className="mt-2 text-xs sm:text-sm">Searching...</p>
                </div>
              ) : (
                <div>
                  {regions && regions.length > 0 ? (
                    regions.map((tagGroup) =>
                      (tagGroup.regions?.length > 0 || tagGroup.accommodations?.length > 0) && (
                        <div key={tagGroup.tag} className="border-b last:border-b-0">
                          <button
                            type="button"
                            onMouseDown={(e) => {
                              e.preventDefault();
                              handleSelection({ ...tagGroup, type: "tag" }, "tag");
                            }}
                            className="w-full text-left px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0 capitalize hover:bg-gray-100"
                          >
                            {tagGroup.tag}
                          </button>
                          {/* Render Regions if available */}
                          {tagGroup.regions && tagGroup.regions.length > 0 && (
                            <div className="pl-2">
                              {tagGroup.regions.map((region) => (
                                <button
                                  key={region.id || region.region_id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelection({ ...region, type: "region" }, "region");
                                  }}
                                  className="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 text-sm"
                                >
                                  <MapPin className="h-4 w-4 text-[#D3202D] flex-shrink-0" />
                                  <span className="truncate text-black">{region.region_name}</span>
                                </button>
                              ))}
                            </div>
                          )}
                          {/* Render Accommodations if available */}
                          {tagGroup.accommodations && tagGroup.accommodations.length > 0 && (
                            <div className="pl-2">
                              {tagGroup.accommodations.map((hotel) => (
                                <button
                                  key={hotel.id}
                                  type="button"
                                  onMouseDown={(e) => {
                                    e.preventDefault();
                                    handleSelection({ ...hotel, type: "hotel" }, "hotel");
                                  }}
                                  className="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 text-sm"
                                >
                                  <Building className="h-4 w-4 text-yellow-500 flex-shrink-0" />
                                  <span className="truncate text-black">{hotel.title}</span>
                                </button>
                              ))}
                            </div>
                          )}
                        </div>
                      )
                    )
                  ) : (
                    <div className="px-3 py-4 text-center text-sm text-gray-500">No suggestions found.</div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
        {/* Search Button */}
        {/* <div className="md:flex hidden">
          <button
            type="submit"
            className="w-full h-full min-h-[44px] rounded-xl bg-yellow-500 text-gray-900 font-semibold text-base sm:text-lg py-2.5 md:py-1.5 hover:bg-yellow-500 active:bg-yellow-500 transition touch-manipulation"
          >
            Search
          </button>
        </div> */}
     

      {/* Additional Parameters */}
      {/* <h6 className="mt-4 relative sm:mt-5 md:mt-6 mb-2 sm:mb-3 font-medium text-[#D3202D text-sm sm:text-base">Additional Parameters</h6>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3 sm:gap-4">
        <div className="md:col-span-3">
          <label className="block text-xs sm:text-sm mb-1.5 sm:mb-1">Guest's citizenship</label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 sm:py-2.5 text-base sm:text-lg touch-manipulation"
          >
            {nationalities.map((n) => (
              <option key={n.id} value={n.code}>
                {n.name}
              </option>
            ))}
          </select>
        </div> */}

        {/* <div className="md:col-span-9">
          <label className="block text-xs sm:text-sm mb-1.5 sm:mb-1 invisible md:visible">&nbsp;</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {["All", "1 star", "2 star", "3 star", "4 star", "5 star"].map((label, i) => (
              <label
                key={i}
                className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-2.5 border rounded text-xs sm:text-sm transition-all touch-manipulation ${
                  stars === String(i)
                    ? "border-black bg-gray-200 font-medium"
                    : "border-gray-300 hover:border-gray-500 active:bg-gray-50"
                }`}
              >
                <input
                  type="radio"
                  name="stars"
                  value={i}
                  checked={stars === String(i)}
                  onChange={(e) => setStars(e.target.value)}
                  className="sr-only"
                />
                {label}
              </label>
            ))}
          </div>
        </div> 
        
      </div>*/}
      <div className="col-span-2">
          <button
            type="submit"
            className="min-w-full h-[50px] sm:h-[54px] rounded-lg bg-[#D3202D] text-white font-semibold text-base sm:text-lg active:bg-[#D3202D] transition touch-manipulation disabled:opacity-75 flex justify-center items-center"
            disabled={isSearching}
          >
            {isSearching ? (
              <LoaderSvg  className="h-full p-1"/>
            ) : (
              "Search"
            )}
          </button>
         
      </div>
     
     
       </div>
         <div className="flex justify-end gap-1 mt-3">
            <span className="text-xs text-gray-400">Powered by </span>
            <img className="h-5 w-auto" src={ `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1763694508/External%20Links/toureast_logo.png` } alt="Toureast Logo" />
          </div>
    </form>
  );
}