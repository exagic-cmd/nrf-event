"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useTransferStore } from "@/store/useTransferStore"
import { useTranslation } from "next-i18next"
import debounce from "lodash.debounce"
import { MapPin, Search, X, ArrowLeftRight, ArrowUpDown, Building2, Plane, Ship, Train } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import RouteSummary from "./detail/RouteSummary"
const TransferSearchFilter = ({ onSearch, showModal: showModalProp, setShowModal: setShowModalProp, forceSearch }) => {
  const { t } = useTranslation("transfer","common")
  const router = useRouter()
  const searchParams = useSearchParams()

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
    searchTransfers,
    setTripType,
    categoryOptions,
    isLoading,
    setSearchParams: setStoreSearchParams,
    searchParams: storeSearchParams,
  } = useTransferStore()

  const resetTransferStore = useTransferStore((state) => state.resetTransferStore)

  const [pickupQuery, setPickupQuery] = useState("")
  const [dropoffQuery, setDropoffQuery] = useState("")
  const [showPickupList, setShowPickupList] = useState(false)
  const [showDropoffList, setShowDropoffList] = useState(false)
  const [pickupFocused, setPickupFocused] = useState(false)
  const [dropoffFocused, setDropoffFocused] = useState(false)
  const [hasAutoSearched, setHasAutoSearched] = useState(false)
 const hasMountedRef = useRef(false) // 👈 NEW
const hasResetRef = useRef(false); // 👈 new
  const pickupRef = useRef(null)
  const dropoffRef = useRef(null)

  const debouncedFetchPickup = useCallback(
    debounce((query) => {
      if (query && query.length > 1) {
        fetchPickupOptions(query)
      }
    }, 400),
    [fetchPickupOptions],
  )

  const debouncedFetchDropoff = useCallback(
    debounce((query) => {
      if (query && query.length > 1) {
        setShowDropoffList(true)
      }
    }, 300),
    [],
  )
useEffect(() => {
  const urlSearched = searchParams.get("searched") === "true";
  const hasStoredParams = storeSearchParams?.pickup && storeSearchParams?.dropoff;

  if (hasStoredParams) {
    setPickupQuery(storeSearchParams.pickup.name);
    setDropoffQuery(storeSearchParams.dropoff.name);
    setSelectedPickup(storeSearchParams.pickup);
    setSelectedDropoff(storeSearchParams.dropoff);
    setTripType(storeSearchParams.tripType);
  }
  if (urlSearched && hasStoredParams && !hasAutoSearched) {
    setTimeout(() => {
      handleSearch();
      setHasAutoSearched(true);
    }, 500);
    const params = new URLSearchParams(searchParams.toString());
    params.delete("searched");
    const newUrl =
      window.location.pathname +
      (params.toString() ? "?" + params.toString() : "");
    window.history.replaceState({}, "", newUrl);
  }
  if (!hasStoredParams && !hasResetRef.current) {
    resetTransferStore();
    hasResetRef.current = true;
  }
}, [storeSearchParams, searchParams, hasAutoSearched]);

  useEffect(() => {
    if (pickupQuery.length > 1) {
      if (pickupQuery === selectedPickup?.name) {
        setShowPickupList(false)
        return
      }
      debouncedFetchPickup(pickupQuery)
      setShowPickupList(true)
    } else {
      setShowPickupList(false)
      debouncedFetchPickup.cancel()
    }
  }, [pickupQuery, selectedPickup, debouncedFetchPickup])

  useEffect(() => {
    if (selectedDropoff) {
      setDropoffQuery(selectedDropoff.name)
    } else {
      setDropoffQuery("")
    }
  }, [selectedDropoff])

  useEffect(() => {
    return () => {
      debouncedFetchPickup.cancel()
      debouncedFetchDropoff.cancel()
    }
  }, [debouncedFetchPickup, debouncedFetchDropoff])

  const handlePickupChange = (value) => {
    setPickupQuery(value)
    setSelectedPickup(null)
    setSelectedDropoff(null)
    setDropoffQuery("")
  }

  const handlePickupSelect = (option) => {
    setSelectedPickup(option)
    setPickupQuery(option.name)
    setShowPickupList(false)
    setPickupFocused(false)
    fetchDropoffOptions(option.id).then(() => {
      setShowDropoffList(true)
    })
  }

  const handleDropoffSelect = (option) => {
    setSelectedDropoff(option)
    setDropoffQuery(option.name)
    setShowDropoffList(false)
    setDropoffFocused(false)
  }

  const handleSwapLocations = () => {
    if (selectedPickup && selectedDropoff) {
      const tempPickup = selectedPickup
      const tempDropoff = selectedDropoff

      setSelectedPickup(tempDropoff)
      setSelectedDropoff(tempPickup)
      setPickupQuery(tempDropoff.name)
      setDropoffQuery(tempPickup.name)
    }
  }

  const handleSearch = () => {
    if (!selectedPickup?.id || !selectedDropoff?.id || !tripType) {
      alert(t("validation.completeAllSelections"))
      return
    }

    setStoreSearchParams({
      pickup: selectedPickup,
      dropoff: selectedDropoff,
      tripType: tripType,
    })

    searchTransfers({
      pickup_point_id: selectedPickup.id,
      dropoff_point_id: selectedDropoff.id,
      is_two_way: tripType === "round-trip",
    })
    onSearch()
  }

  const handleCategorySelect = (category, isPickup = true) => {
    const searchTerm = t(category.nameKey).toLowerCase()
    if (isPickup) {
      setPickupQuery(searchTerm)
      debouncedFetchPickup(searchTerm)
    } else {
      setDropoffQuery(searchTerm)
      setShowDropoffList(true)
    }
  }

  const filteredDropoffOptions = useMemo(() => {
    if (!dropoffQuery) {
      return dropoffOptions
    }
    return dropoffOptions
      .filter((opt) => opt.name.toLowerCase().includes(dropoffQuery.toLowerCase()))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [dropoffOptions, dropoffQuery])

  const getIconForCategory = (categoryId) => {
    switch (categoryId) {
      case "hotel":
        return <Building2 size={20} style={{ color: "#1a1a1a" }} />
         case "Hotel":
        return <Building2 size={20} style={{ color: "#1a1a1a" }} />
      case "airport":
        return <Plane size={20} style={{ color: "#cc9955" }} />
      case "ferry":
        return <Ship size={20} style={{ color: "#00BCD4" }} />
      case "railway":
        return <Train size={20} style={{ color: "#9C27B0" }} />
      default:
        return <MapPin size={20} style={{ color: "#9E9E9E" }} />
    }
  }

  return (
    <div className="relative py-0 md:py-2 mt-6 md:mt-0 w-full">
     
      <div className="relative z-10 w-full">
       <div className="w-full">
         <RouteSummary 
            pickup={selectedPickup}
            dropoff={selectedDropoff}
            t={t}
            SearchClicked={() => setShowModalProp(true)}
            tripType={tripType}
        />
        
       </div>

      {showModalProp && (
  <div className="fixed inset-0 z-50 bg-black/90 flex justify-center items-center">
    <div className="bg-white lg:rounded-lg w-full h-full lg:h-auto lg:max-w-3xl p-6 relative lg:max-h-[90vh] overflow-y-auto">
      {!forceSearch && (
        <button
          className="absolute top-4 md:mt-0 mt-12 right-4 text-gray-500  hover:bg-gray-200 z-10"
          onClick={() => setShowModalProp(false)}
        >
          <X size={20} />
        </button>
      )}

      <h3 className="text-lg font-semibold mb-4">{t("modal.title")}</h3>

      <div className="flex gap-6 mb-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="one-way"
            checked={tripType === "one-way"}
            onChange={() => setTripType("one-way")}
            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {t("tripType.oneWay")}
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input
            type="radio"
            value="round-trip"
            checked={tripType === "round-trip"}
            onChange={() => setTripType("round-trip")}
            className="w-4 h-4 text-purple-600 border-gray-300 focus:ring-purple-500"
          />
          <span className="text-sm font-medium text-gray-700">
            {t("tripType.roundTrip")}
          </span>
        </label>
      </div>

      <PickupDropoffInputs
        setSelectedDropoff={setSelectedDropoff}
        pickupOptions={pickupOptions}
        dropoffOptions={dropoffOptions}
        pickupQuery={pickupQuery}
        dropoffQuery={dropoffQuery}
        setPickupQuery={handlePickupChange}
        setDropoffQuery={setDropoffQuery}
        showPickupList={showPickupList}
        showDropoffList={showDropoffList}
        filteredDropoffOptions={filteredDropoffOptions}
        handlePickupSelect={handlePickupSelect}
        handleDropoffSelect={handleDropoffSelect}
        selectedPickup={selectedPickup}
        selectedDropoff={selectedDropoff}
        setShowDropoffList={setShowDropoffList}
        handleSwapLocations={handleSwapLocations}
        categoryOptions={categoryOptions}
        handleCategorySelect={handleCategorySelect}
        pickupFocused={pickupFocused}
        dropoffFocused={dropoffFocused}
        setPickupFocused={setPickupFocused}
        setDropoffFocused={setDropoffFocused}
        pickupRef={pickupRef}
        dropoffRef={dropoffRef}
        isLoading={isLoading}
        getIconForCategory={getIconForCategory}
        t={t}
      />

      <div className="flex justify-end mt-6 w-full">
        <button
        onClick={handleSearch}
        className="bg-[#D3202D] text-white w-1/2 py-3 mt-6 rounded-lg font-medium transition-colors"
      >
        {t("buttons.searchTransfer")}
      </button>
      </div>
    </div>
  </div>
)}

      </div>
    </div>
  )
}

function PickupDropoffInputs({
  pickupOptions,
  dropoffOptions,
  setSelectedDropoff,
  pickupQuery,
  dropoffQuery,
  setPickupQuery,
  setDropoffQuery,
  showPickupList,
  showDropoffList,
  filteredDropoffOptions,
  handlePickupSelect,
  handleDropoffSelect,
  selectedPickup,
  selectedDropoff,
  setShowDropoffList,
  handleSwapLocations,
  categoryOptions,
  handleCategorySelect,
  pickupFocused,
  dropoffFocused,
  setPickupFocused,
  setDropoffFocused,
  pickupRef,
  dropoffRef,
  isLoading,
  getIconForCategory,
  t,
}) {
  const dropoffContainerRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropoffContainerRef.current && !dropoffContainerRef.current.contains(event.target)) {
        setShowDropoffList(false)
      }
    }

    if (showDropoffList) {
      document.addEventListener("click", handleClickOutside)
    } else {
      document.removeEventListener("click", handleClickOutside)
    }

    return () => {
      document.removeEventListener("click", handleClickOutside)
    }
  }, [showDropoffList, setShowDropoffList])

  const showPickupSuggestions = pickupFocused && !pickupQuery && !selectedPickup
  const showDropoffSuggestions = false

  return (
    <div className="space-y-4">
      {/* Pickup and Dropoff Section */}
      <div className="flex flex-col lg:flex-row lg:items-center gap-2">
        {/* Pickup Section */}
        <div className="flex-1 relative">
          <label className="block text-sm font-medium text-black mb-2">{t("labels.pickupPoint")}</label>
          <div className="relative">
            <input
              ref={pickupRef}
              type="text"
              value={selectedPickup?.name || pickupQuery}
              onChange={(e) => setPickupQuery(e.target.value)}
              onFocus={() => setPickupFocused(true)}
              onBlur={() => setTimeout(() => setPickupFocused(false), 200)}
              placeholder={t("placeholders.selectPickupLocation")}
              className="w-full px-3 py-2 text-base border border-gray-300 rounded-lg outline-none text-gray-900 placeholder-gray-400"
            />
            {(selectedPickup || pickupQuery) && (
              <button
                onClick={() => setPickupQuery("")}
                className="bg-white rounded p-1 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}

            {/* Category Suggestions for Pickup */}
            {showPickupSuggestions && (
  <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
    <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 rounded-lg">
    {t("searchHint")}
    </div>
  </div>
)}

            {/* Search Results for Pickup */}
            {showPickupList && pickupQuery && (
              <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-60 overflow-auto z-50">
                {isLoading ? (
                  <li className="p-3 text-center text-gray-500">{t("loading")}</li>
                ) : pickupOptions.length > 0 ? (
                  pickupOptions.map((option) => (
                    <li
                      key={option.id}
                      onClick={() => handlePickupSelect(option)}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-gray-900"
                    >
                      <div className="flex items-center text-sm md:text-base  gap-2">
                        {getIconForCategory(option.type)}
                        <span>{option.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{t(`types.${option.type}`)}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-center text-gray-500">{t("noResults")}</li>
                )}
              </ul>
            )}
          </div>
        </div>
        {/* Dropoff Section */}
        <div className="flex-1 relative" ref={dropoffContainerRef}>
          <label className="block text-xs md:text-sm font-medium text-black mb-2">{t("labels.to")}</label>
          <div className="relative">
            <input
              ref={dropoffRef}
              type="text"
              value={dropoffQuery}
              onChange={(e) => {
                if (!selectedPickup) return
                const value = e.target.value
                setDropoffQuery(value)
                setShowDropoffList(true)
                if (!value) setSelectedDropoff(null)
              }}
              onFocus={() => {
                setDropoffFocused(true)
                if (selectedPickup) {
                  setShowDropoffList(true)
                }
              }}
              onBlur={() => setTimeout(() => setDropoffFocused(false), 200)}
              disabled={!selectedPickup}
              placeholder={
                selectedPickup ? t("placeholders.selectDropoffLocation") : t("placeholders.selectPickupFirst")
              }
              className="w-full text-base px-3 py-2 border border-gray-300 rounded-lg outline-none text-gray-900 placeholder-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
            />
            {dropoffQuery && (
              <button
                onClick={() => {
                  setDropoffQuery("")
                  setSelectedDropoff(null)
                }}
                className="bg-white rounded p-1 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X size={18} />
              </button>
            )}

            {/* Search Results for Dropoff */}

            {showDropoffList && selectedPickup && (
              <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-60 overflow-auto z-50">
                {filteredDropoffOptions.length > 0 ? (
                  filteredDropoffOptions.map((option) => (
                    <li
                      key={option.id}
                      onClick={() => handleDropoffSelect(option)}
                      className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0 text-gray-900"
                    >
                      <div className="flex items-center text-sm md:text-base gap-2">
                        {getIconForCategory(option.type)}
                        <span>{option.name}</span>
                      </div>
                      <span className="text-xs text-gray-500 capitalize">{t(`types.${option.type}`)}</span>
                    </li>
                  ))
                ) : (
                  <li className="p-3 text-center text-gray-500">{t("noResults")}</li>
                )}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransferSearchFilter