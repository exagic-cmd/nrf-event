// components/hotels/AccommodationFilter.jsx
import React, { useState, useMemo } from "react";
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

export default function AccommodationFilter({ onSearch }) {
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [showGuestPopup, setShowGuestPopup] = useState(false);
  const [rooms, setRooms] = useState([{ adult: 2, children: [] }]);
  const [nationality, setNationality] = useState("all");
  const [stars, setStars] = useState("0");
  const [refund, setRefund] = useState("all");
  const [tempEndDate, setTempEndDate] = useState(null);

  // Mock data — replace with API
  const accomItems = [
    { id: 1, type: "hotel", title: "Burj Al Arab" },
    { id: 2, type: "hotel", title: "Atlantis The Palm" },
    { id: 3, type: "region", region_name: "Downtown Dubai" },
    { id: 4, type: "region", region_name: "Dubai Marina" },
  ];

  const nationalities = [
    { name: "All", code: "all" },
    { name: "UAE", code: "AE" },
    { name: "India", code: "IN" },
    { name: "USA", code: "US" },
  ];

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return {
      hotels: accomItems.filter(
        (i) => i.type === "hotel" && i.title.toLowerCase().includes(q)
      ),
      regions: accomItems.filter(
        (i) => i.type === "region" && i.region_name.toLowerCase().includes(q)
      ),
    };
  }, [search]);

  const totalGuests = rooms.reduce(
    (sum, r) => sum + r.adult + r.children.length,
    0
  );

  const addRoom = () => setRooms([...rooms, { adult: 2, children: [] }]);
  const removeRoom = (i) => {
    if (rooms.length > 1) setRooms(rooms.filter((_, idx) => idx !== i));
  };

  const updateAdult = (i, val) => {
    const newRooms = [...rooms];
    newRooms[i].adult = Math.max(1, Math.min(4, val));
    setRooms(newRooms);
  };

  const addChild = (i, age) => {
    const newRooms = [...rooms];
    if (newRooms[i].children.length < 3) {
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

  // Handle check-in date range selection
  const handleStartDateChange = (dates) => {
    const [start, end] = dates;
    setStartDate(start);
    setTempEndDate(end);
    
    // Only set the actual endDate when range selection is complete
    if (end) {
      setEndDate(end);
      setTempEndDate(null); // Clear temp after selection is complete
    }
  };

  const handleEndDateChange = (date) => {
    setEndDate(date);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch({
      search,
      startDate,
      endDate,
      rooms,
      nationality,
      stars,
      refund,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl bg-white shadow p-4 md:p-6">
      <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
        {/* Search */}
        <div className="md:col-span-3 relative">
          <div className="rounded-2xl border border-gray-200 bg-white px-3 py-2 flex items-center gap-2">
            <Search className="h-5 w-5 text-gray-500 " />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setShowDropdown(!!e.target.value.trim());
              }}
              placeholder="Search hotels or regions..."
              className="w-full bg-transparent outline-none text-lg"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {showDropdown && (
            <div className="absolute z-20 mt-2 w-full rounded-xl border bg-white shadow-lg max-h-80 overflow-auto">
              <div className="grid grid-cols-2">
                <div>
                  <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">
                    Destinations
                  </h6>
                  {filtered.regions.map((r) => (
                    <button
                      key={r.id}
                      type="button"
                      onMouseDown={() => {
                        setSearch(r.region_name);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      <MapPin className="h-4 w-4 text-yellow-600" />
                      {r.region_name}
                    </button>
                  ))}
                </div>
                <div>
                  <h6 className="px-3 py-2 text-xs font-semibold text-gray-600 bg-gray-50">
                    Hotels
                  </h6>
                  {filtered.hotels.map((h) => (
                    <button
                      key={h.id}
                      type="button"
                      onMouseDown={() => {
                        setSearch(h.title);
                        setShowDropdown(false);
                      }}
                      className="w-full text-left px-3 py-2 hover:bg-gray-50 flex items-center gap-2 text-sm"
                    >
                      <Building className="h-4 w-4 text-yellow-600" />
                      {h.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Check-in with Date Range (but only shows start date) */}
        <div className="md:col-span-2 relative">
          <DatePicker
            selected={startDate}
            onChange={handleStartDateChange}
            startDate={startDate}
            endDate={tempEndDate} // Use tempEndDate only during selection
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

        {/* Check-out - Single Date Selection */}
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
              {totalGuests} Guest{totalGuests > 1 ? "s" : ""} • {rooms.length} Room{rooms.length > 1 ? "s" : ""}
            </span>
            <ChevronDown className="h-4 w-4" />
          </button>

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
                  
                  {/* Adults Counter - Compact */}
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
                        disabled={room.adult >= 4}
                        className={`w-6 h-6 rounded border flex items-center justify-center ${
                          room.adult >= 4 
                            ? "border-gray-200 text-gray-400 cursor-not-allowed" 
                            : "border-gray-300 text-gray-700 hover:border-gray-400 hover:bg-gray-50"
                        }`}
                      >
                        <Plus className="h-3 w-3" />
                      </button>
                    </div>
                  </div>

                  {/* Children Section - Compact */}
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium">Children</span>
                      <span className="text-xs text-gray-500">
                        {room.children.length}/3
                      </span>
                    </div>
                    
                    {/* Selected Children - Compact Tags */}
                    {room.children.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-2">
                        {room.children.map((childAge, childIndex) => (
                          <div 
                            key={childIndex} 
                            className="flex items-center gap-1 bg-blue-50 border border-blue-200 rounded-full px-2 py-1"
                          >
                            <select
                              value={childAge}
                              onChange={(e) => updateChildAge(i, childIndex, parseInt(e.target.value))}
                              className="bg-transparent text-xs border-none outline-none cursor-pointer"
                            >
                              {Array.from({ length: 13 }, (_, index) => (
                                <option key={index} value={index}>
                                  {index}y
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
                    
                    {/* Add Child Button */}
                    {room.children.length < 3 && (
                      <button
                        type="button"
                        onClick={() => addChild(i, 5)}
                        className="w-full text-xs text-blue-600 font-medium py-1 border border-dashed border-blue-300 rounded-lg hover:bg-blue-50 transition-colors"
                      >
                        + Add Child ({3 - room.children.length} left)
                      </button>
                    )}
                  </div>
                </div>
              ))}
              
              {/* Add Room and Done Buttons */}
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
              <option key={n.code} value={n.code}>
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