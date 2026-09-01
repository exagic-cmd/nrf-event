// components/LocationSearchForm.tsx
"use client"

import { useState, useRef, useEffect, useCallback } from "react"
import { MapPin, X } from "lucide-react"
import debounce from "lodash.debounce"
import { useTransferStore } from "@/store/useTransferStore"

export default function LocationSearchForm({ onConfirm, initialPickup, initialDropoff }) {
  const {
    fetchPickupOptions,
    fetchDropoffOptions,
    pickupOptions,
    dropoffOptions,
    isLoading,
    setSelectedPickup,
    setSelectedDropoff,
    selectedPickup,
    selectedDropoff,
  } = useTransferStore()

  const [pickupQuery, setPickupQuery] = useState(initialPickup?.name || "")
  const [dropoffQuery, setDropoffQuery] = useState(initialDropoff?.name || "")
  const [showPickupList, setShowPickupList] = useState(false)
  const [showDropoffList, setShowDropoffList] = useState(false)

  const pickupRef = useRef(null)
  const dropoffRef = useRef(null)

  const debouncedFetchPickup = useCallback(
    debounce((query) => {
      if (query && query.length > 1) fetchPickupOptions(query)
    }, 400),
    [fetchPickupOptions],
  )

  useEffect(() => {
    return () => debouncedFetchPickup.cancel()
  }, [debouncedFetchPickup])

  const handlePickupChange = (val: string) => {
    setPickupQuery(val)
    setSelectedPickup(null)
    setSelectedDropoff(null)
    setDropoffQuery("")
    if (val.length > 1) {
      debouncedFetchPickup(val)
      setShowPickupList(true)
    } else {
      setShowPickupList(false)
    }
  }

  const handlePickupSelect = (opt) => {
    setSelectedPickup(opt)
    setPickupQuery(opt.name)
    setShowPickupList(false)
    fetchDropoffOptions(opt.id)
  }

  const handleDropoffSelect = (opt) => {
    setSelectedDropoff(opt)
    setDropoffQuery(opt.name)
    setShowDropoffList(false)
  }

  return (
    <div className="space-y-4">
      {/* Pickup */}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
        <input
          ref={pickupRef}
          type="text"
          value={pickupQuery}
          onChange={(e) => handlePickupChange(e.target.value)}
          onFocus={() => setShowPickupList(true)}
          placeholder="Search pickup location..."
          className="w-full pl-10 pr-4 py-3 border rounded-lg"
        />
        {pickupQuery && (
          <button
            onClick={() => setPickupQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={18} />
          </button>
        )}
        {showPickupList && pickupOptions.length > 0 && (
          <ul className="absolute z-50 bg-surface border w-full mt-1 max-h-60 overflow-auto">
            {pickupOptions.map((opt) => (
              <li key={opt.id} onClick={() => handlePickupSelect(opt)} className="p-2 hover:bg-muted cursor-pointer">
                {opt.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Dropoff */}
      <div className="relative">
        <MapPin className="absolute left-3 top-3 h-5 w-5 text-orange-500" />
        <input
          ref={dropoffRef}
          type="text"
          value={dropoffQuery}
          onChange={(e) => setDropoffQuery(e.target.value)}
          onFocus={() => setShowDropoffList(true)}
          placeholder="Search dropoff location..."
          disabled={!selectedPickup}
          className="w-full pl-10 pr-4 py-3 border rounded-lg disabled:bg-muted"
        />
        {dropoffQuery && (
          <button
            onClick={() => setDropoffQuery("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
          >
            <X size={18} />
          </button>
        )}
        {showDropoffList && dropoffOptions.length > 0 && (
          <ul className="absolute z-50 bg-surface border w-full mt-1 max-h-60 overflow-auto">
            {dropoffOptions.map((opt) => (
              <li
                key={opt.id}
                onClick={() => handleDropoffSelect(opt)}
                className="p-2 hover:bg-muted cursor-pointer"
              >
                {opt.name}
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        onClick={() => onConfirm(selectedPickup, selectedDropoff)}
        className="w-full bg-orange-600 text-white py-3 rounded-lg"
      >
        Confirm Locations
      </button>
    </div>
  )
}
