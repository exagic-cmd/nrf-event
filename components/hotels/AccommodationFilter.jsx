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

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSelection = (item, type) => {
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
    };

    if (selectedItem.type === "hotel") {
      searchPayload.hotel_id = selectedItem.stuba_id;
      searchPayload.region = false;
    } else if (selectedItem.type === "region") {
      searchPayload.region = selectedItem.region_id;
      searchPayload.hotel_id = false;
    }

    console.log("Search Payload:", searchPayload);
    await setSearchParamsAndSearch(searchPayload);

    if (onSearch) onSearch(searchPayload);
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search Input */}
        <div className="md:col-span-3 relative">
          <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500" />
            <input
              type="text"
              value={search}
              onChange={handleInputChange}
              placeholder="Search hotels or regions..."
              className="w-full bg-transparent outline-none text-lg"
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
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Dropdown with Loading */}
          {showDropdown && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-80 overflow-auto">
              {isLoading ? (
                <div className="px-4 py-8 text-center text-gray-500">
                  <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-gray-300 border-t-yellow-500"></div>
                  <p className="mt-2 text-sm">Searching...</p>
                </div>
              ) : (
                <div className="grid grid-cols-2">
                  <div>
                    <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">
                      Destinations
                    </h6>
                    {filtered.regions.length > 0 ? (
                      filtered.regions.map((region) => (
                        <button
                          key={region.id}
                          type="button"
                          onMouseDown={() => handleSelection(region, "region")}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <MapPin className="h-4 w-4 text-yellow-600" />
                          {region.region_name}
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-sm text-gray-500">
                        No destinations found
                      </div>
                    )}
                  </div>
                  <div>
                    <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">
                      Hotels
                    </h6>
                    {filtered.hotels.length > 0 ? (
                      filtered.hotels.map((hotel) => (
                        <button
                          key={hotel.id}
                          type="button"
                          onMouseDown={() => handleSelection(hotel, "hotel")}
                          className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                        >
                          <Building className="h-4 w-4 text-yellow-600" />
                          {hotel.title}
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

        {/* Check-in */}
        <div className="md:col-span-2 relative">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            startDate={startDate}
            endDate={tempEndDate}
            selectsRange
            selectsStart
            minDate={new Date()}
            placeholderText="Check-in"
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-lg outline-none"
            monthsShown={2}
            dateFormat="MMM d, yyyy"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Check-out */}
        <div className="md:col-span-2 relative">
          <DatePicker
            selected={endDate}
            onChange={handleEndDateChange}
            selectsEnd
            startDate={startDate}
            endDate={endDate}
            minDate={startDate || new Date()}
            placeholderText="Check-out"
            className="w-full rounded-2xl border border-gray-200 px-3 py-2 text-lg outline-none"
            dateFormat="MMM d, yyyy"
          />
          <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </div>
        </div>

        {/* Guests */}
        <div className="md:col-span-3 relative">
          <button
            type="button"
            onClick={() => setShowGuestPopup(!showGuestPopup)}
            className="w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-lg flex items-center justify-between"
          >
            <span>
              {totalGuests} Guest{totalGuests > 1 ? "s" : ""} • {rooms.length} Room
              {rooms.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

          {/* Guest Popup - unchanged */}
          {showGuestPopup && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg p-4">
              {rooms.map((room, i) => (
                <div key={i} className="mb-4 pb-4 border-b last:border-0 last:mb-0 last:pb-0">
                  <div className="flex justify-between items-center mb-3">
                    <span className="font-medium text-sm">Room {i + 1}</span>
                    {rooms.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeRoom(i)}
                        className="text-red-500 text-xs font-medium hover:text-red-600"
                      >
                        Remove
                      </button>
                    )}
                  </div>

                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Adults</span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => updateAdult(i, room.adult - 1)}
                        disabled={room.adult <= 1}
                        className={`w-6 h-6 rounded border flex items-center justify-center ${
                          room.adult <= 1
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Minus className="h-3 w-3" />
                      </button>
                      <span className="w-6 text-center text-sm font-medium">{room.adult}</span>
                      <button
                        type="button"
                        onClick={() => updateAdult(i, room.adult + 1)}
                        disabled={room.adult >= 10}
                        className={`w-6 h-6 rounded border flex items-center justify-center ${
                          room.adult >= 10
                            ? "border-gray-200 text-gray-400 cursor-not-allowed"
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Children</span>
                      <span className="text-xs text-gray-500">
                        {room.children.length}/10
                      </span>
                    </div>

                    {room.children.length >= 1 && (
                      <div className="flex flex-wrap gap-1 mb-2">
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
                              className="bg-transparent text-xs border-none outline-none cursor-pointer"
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
                              className="w-3 h-3 rounded-full bg-red-400 text-white flex items-center justify-center hover:bg-red-500"
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
                        className="w-full text-xs text-blue-600 font-medium py-1 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        + Add Child ({10 - room.children.length} left)
                      </button>
                    )}
                  </div>
                </div>
              ))}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={addRoom}
                  className="flex-1 text-xs border border-yellow-400 text-yellow-600 font-medium py-2 rounded-lg hover:bg-yellow-50 transition-colors"
                >
                  + Add Room
                </button>
                <button
                  type="button"
                  onClick={() => setShowGuestPopup(false)}
                  className="flex-1 bg-yellow-400 text-gray-900 text-xs font-medium py-2 rounded-lg hover:bg-yellow-500 transition-colors"
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
            className="w-full h-full rounded-xl bg-yellow-400 text-gray-900 font-semibold py-1.5 hover:bg-yellow-500 transition"
          >
            Search
          </button>
        </div>
      </div>

      {/* Additional Parameters */}
      <h6 className="mt-6 mb-3 font-medium">Additional Parameters</h6>
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3">
          <label className="block text-sm mb-1">Guest's citizenship</label>
          <select
            value={nationality}
            onChange={(e) => setNationality(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-3 py-2 text-lg"
          >
            {nationalities.map((n) => (
              <option key={n.id} value={n.code}>
                {n.name}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-9">
          <label className="block text-sm mb-1">&nbsp;</label>
          <div className="flex flex-wrap gap-2 mb-3">
            {["All", "1 star", "2 star", "3 star", "4 star", "5 star"].map((label, i) => (
              <label
                key={i}
                className={`cursor-pointer px-3 py-2 border rounded transition-all ${
                  stars === String(i)
                    ? "border-red-500 text-red-500 bg-red-50"
                    : "border-gray-300 hover:border-gray-500"
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