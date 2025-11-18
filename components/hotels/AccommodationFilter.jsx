// components/hotels/AccommodationFilter.jsx
import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Search,
  X,
  MapPin,
  Building,
  ChevronDown,
  Plus,
  Minus,
} from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";

export default function AccommodationFilter({ onSearch }) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [rooms, setRooms] = useState([{ adult: 1, children: [] }]);
  const [nationality, setNationality] = useState("SG");
  const [stars, setStars] = useState("");
  const [refund, setRefund] = useState("all");
  const [tempEndDate, setTempEndDate] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

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

  // Fetch nationalities on mount
  useEffect(() => {
    fetchNationalities();
  }, [fetchNationalities]);

  // DEBOUNCED: Fetch hotels & regions only after 400ms pause
  useEffect(() => {
    // Clear previous timeout
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    const query = search.trim();

    if (!query) {
      setShowDropdown(false);
      return;
    }

    debounceTimeoutRef.current = setTimeout(() => {
      fetchHotelsAndRegions(query);
      setShowDropdown(true);
    }, 400);

    // Cleanup on unmount or new input
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, [search, fetchHotelsAndRegions]);

  // Client-side filtering of results (after API returns)
  const filtered = useMemo(() => {
    const q = search.toLowerCase();

    const filteredHotels = hotels.filter((hotel) =>
      hotel.title?.toLowerCase().includes(q)
    );

    const filteredRegions = regions.filter((region) =>
      region.region_name?.toLowerCase().includes(q)
    );

    return {
      hotels: filteredHotels,
      regions: filteredRegions,
    };
  }, [search, hotels, regions]);

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

  const addChild = (i, age) => {
    const newRooms = [...rooms];
    if (newRooms[i].children.length < 10) {
      newRooms[i].children.push(age);
    }
    setRooms(newRooms);
  };

  const removeChild = (i, childIndex) => {
    const newRooms = [...rooms];
    newRooms[i].children.splice(childIndex, 1);
    setRooms(newRooms);
  };

  const updateChildAge = (i, childIndex, age) => {
    const newRooms = [...rooms];
    newRooms[i].children[childIndex] = age;
    setRooms(newRooms);
  };

  const handleStartDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setTempEndDate(end);
    if (end) {
      setEndDate(end);
      setTempEndDate(null);
    }
  };

  const handleCalendarOpen = () => {
    if (startDate || endDate || tempEndDate) {
      setStartDate(null);
      setEndDate(null);
      setTempEndDate(null);
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSelection = (item, type) => {
    console.log("Selected Item:", item, "Type:", type);
    setSelectedItem({ ...item, type });
    setSearch(type === "hotel" ? item.title : item.region_name);
    setShowDropdown(false);
  };

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearch(value);
    if (!value.trim()) {
      setSelectedItem(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedItem) {
      alert("Please select a hotel or destination from the dropdown");
      return;
    }

    if (!startDate || !endDate) {
      alert("Please select both check-in and check-out dates");
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

    const searchPayload = {
      search,
      start_date: formatDate(startDate),
      end_date: formatDate(endDate),
      nights,
      rooms,
      nationality,
      refund_policy: refund,
      stars,
      ids:''
    };
      console.log("Selected Item before payload:", selectedItem);
  
    if (selectedItem.type === "hotel") {
      searchPayload.hotel_id = selectedItem.stuba_id;
      searchPayload.region = false;
      if (selectedItem?.link_type_id!=9)
        searchPayload.ids = [selectedItem?.id];
    } else if (selectedItem.type === "region") {
      searchPayload.region = selectedItem.region_id;
      searchPayload.hotel_id = false;
    }

    console.log("Search Payload:", searchPayload);
    await setSearchParamsAndSearch(searchPayload);

    if (onSearch) onSearch(searchPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-xl md:rounded-2xl bg-white shadow p-3 sm:p-4 md:p-6 ">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-2 sm:gap-3">
        {/* Search Input */}
        <div className="md:col-span-3 relative">
          <div className="rounded-xl md:rounded-2xl border border-gray-200 bg-white px-3 py-2.5 md:py-2 flex items-center gap-2">
            <Search className="h-4 w-4 sm:h-5 sm:w-5 text-gray-500 flex-shrink-0" />
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              placeholder="Search hotels or regions..."
              className="w-full bg-transparent outline-none text-base sm:text-lg"
              autoComplete="off"
            />
            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setSelectedItem(null);
                  setShowDropdown(false);
                }}
                className="text-gray-400 hover:text-gray-600 flex-shrink-0"
              >
                <X className="h-4 w-4" />
              </button>
            )}
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
                <div className="grid grid-cols-1 sm:grid-cols-2">
                  <div>
                    <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0">
                      Destinations
                    </h6>
                    {filtered.regions.length > 0 ? (
                      filtered.regions.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onMouseDown={() => handleSelection(region, "region")}
                          className="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <MapPin className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="truncate">{region.region_name}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No destinations found
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50 sticky top-0">
                      Hotels
                    </h6>
                    {filtered.hotels.length > 0 ? (
                      filtered.hotels.map((hotel) => (
                        <button
                          key={hotel.id}
                          type="button"
                          onMouseDown={() => handleSelection(hotel, "hotel")}
                          className="w-full text-left px-3 py-2.5 sm:py-2 hover:bg-gray-50 active:bg-gray-100 flex items-center gap-2 text-sm"
                        >
                          <Building className="h-4 w-4 text-yellow-600 flex-shrink-0" />
                          <span className="truncate">{hotel.title}</span>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No hotels found
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
          {/* Date Range Picker - SINGLE */}
<div className="md:col-span-4 relative">
  <DatePicker
    selected={startDate}
    onChange={handleStartDateChange}
    startDate={startDate}
    endDate={endDate}
    selectsRange
    minDate={new Date()}
    placeholderText="Check-in - Check-out"
    className="w-full rounded-xl md:rounded-2xl border border-gray-200 px-3 py-2.5 md:py-2 text-base sm:text-lg outline-none cursor-pointer"
    wrapperClassName="w-full"
    dateFormat="MMM d, yyyy"
    monthsShown={window.innerWidth >= 768 ? 2 : 1}
    showPopperArrow={false}
    onCalendarOpen={handleCalendarOpen}
    customInput={
      <div className="flex items-center justify-between pr-8">
        <span className="truncate font-medium">
          {startDate ? (
            <>
              {startDate.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
              })}
              {endDate ? (
                <> → {endDate.toLocaleDateString("en-US", { month: "short", day: "numeric" })}</>
              ) : (
                " → Add checkout"
              )}
            </>
          ) : (
            "Check-in - Check-out"
          )}
        </span>
        <ChevronDown className="h-4 w-4 text-gray-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </div>
    }
  />
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
            className="w-full rounded-xl md:rounded-2xl border border-gray-200 bg-white px-3 py-2.5 md:py-2 text-base sm:text-lg flex items-center justify-between"
          >
            <span className="truncate">
              {totalGuests} Guest{totalGuests > 1 ? "s" : ""} • {rooms.length} Room
              {rooms.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className="h-4 w-4 flex-shrink-0" />
          </button>

          {/* Guest Popup - Mobile Optimized */}
          {showGuestPopup && (
            <div className="absolute z-20 mt-2 left-0 right-0 md:w-full rounded-xl border bg-white shadow-lg p-3 sm:p-4 max-h-72 sm:max-h-96 overflow-y-auto">
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

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm sm:text-base font-medium">Children</span>
                      <span className="text-xs text-gray-500">
                        {room.children.length}/10
                      </span>
                    </div>

                    {room.children.length >= 1 && (
                      <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-2">
                        {room.children.map((childAge, childIndex) => (
                          <div
                            key={childIndex}
                            className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1"
                          >
                            <select
                              value={childAge}
                              onChange={(e) =>
                                updateChildAge(i, childIndex, parseInt(e.target.value))
                              }
                              className="bg-transparent text-xs sm:text-sm border-none outline-none cursor-pointer min-w-0"
                            >
                              {Array.from({ length: 13 }, (_, index) => (
                                <option key={index} value={index + 1}>
                                  {index + 1}y
                                </option>
                              ))}
                            </select>
                            <button
                              type="button"
                              onClick={() => removeChild(i, childIndex)}
                              className="w-4 h-4 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500 active:bg-red-600 touch-manipulation flex-shrink-0"
                            >
                              <X className="h-2 w-2" />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    {room.children.length < 10 && (
                      <button
                        type="button"
                        onClick={() => addChild(i, 1)}
                        className="w-full text-xs sm:text-sm text-blue-600 font-medium py-2 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 active:bg-blue-100 transition-colors touch-manipulation"
                      >
                        + Add Child ({10 - room.children.length} left)
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2 sm:pt-3">
                <button
                  type="button"
                  onClick={addRoom}
                  className="flex-1 text-xs sm:text-sm border border-yellow-400 text-yellow-600 font-medium py-2 sm:py-2.5 rounded-lg hover:bg-yellow-50 active:bg-yellow-100 transition-colors touch-manipulation"
                >
                  + Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestPopup(false)}
                  className="flex-1 bg-yellow-400 text-gray-900 text-xs sm:text-sm font-medium py-2 sm:py-2.5 rounded-lg hover:bg-yellow-500 active:bg-yellow-600 transition-colors touch-manipulation"
                >
                  Done
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Search Button */}
        <div className="md:col-span-2">
          <button
            type="submit"
            className="w-full h-full min-h-[44px] rounded-xl bg-yellow-400 text-gray-900 font-semibold text-base sm:text-lg py-2.5 md:py-1.5 hover:bg-yellow-500 active:bg-yellow-600 transition touch-manipulation"
          >
            Search
          </button>
        </div>
      </div>

      {/* Additional Parameters */}
      <h6 className="mt-4 sm:mt-5 md:mt-6 mb-2 sm:mb-3 font-medium text-sm sm:text-base">Additional Parameters</h6>
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
        </div>

        <div className="md:col-span-9">
          <label className="block text-xs sm:text-sm mb-1.5 sm:mb-1 invisible md:visible">&nbsp;</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {["All", "1 star", "2 star", "3 star", "4 star", "5 star"].map((label, i) => (
              <label
                key={i}
                className={`cursor-pointer px-3 sm:px-4 py-2 sm:py-2.5 border rounded text-xs sm:text-sm transition-all touch-manipulation ${
                  stars === String(i)
                    ? "border-red-500 text-red-500 bg-red-50 font-medium"
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
      </div>
    </form>
  );
}