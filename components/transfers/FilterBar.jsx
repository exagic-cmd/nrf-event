"use client"

import { useState, useEffect, useRef, useCallback, useMemo } from "react"
import { useTransferStore } from "@/store/useTransferStore"
import { useTranslation } from "next-i18next"
import debounce from "lodash.debounce"
import { useRouter, useSearchParams } from "next/navigation"
import RouteSummary from "./detail/RouteSummary"
const TransferSearchFilter = ({ onSearch, showModal: showModalProp, setShowModal: setShowModalProp, forceSearch }) => {
  const { t } = useTranslation("transfer", "common")
  const router = useRouter()
  const searchParams = useSearchParams()

  const {
    pickupOptions,
    dropoffOptions,
    fetchPickupOptions,
    setSelectedPickup,
    setSelectedDropoff,
    selectedPickup,
    selectedDropoff,
    tripType,
    setTripType,
    searchParams: storeSearchParams,
  } = useTransferStore()

  const resetTransferStore = useTransferStore((state) => state.resetTransferStore)

  const [pickupQuery, setPickupQuery] = useState("")
  const [dropoffQuery, setDropoffQuery] = useState("")
  const [hasAutoSearched, setHasAutoSearched] = useState(false)
  const hasResetRef = useRef(false) // 👈 new

  const debouncedFetchPickup = useCallback(
    debounce((query) => {
      if (query && query.length > 1) {
        fetchPickupOptions(query)
      }
    }, 400),
    [fetchPickupOptions],
  )

  useEffect(() => {
    const hasStoredParams = storeSearchParams?.pickup && storeSearchParams?.dropoff

    if (hasStoredParams) {
      setPickupQuery(storeSearchParams.pickup.name)
      setDropoffQuery(storeSearchParams.dropoff.name)
      setSelectedPickup(storeSearchParams.pickup)
      setSelectedDropoff(storeSearchParams.dropoff)

      const urlTripType = searchParams.get("tripType")
      if (!urlTripType && storeSearchParams.tripType) {
         setTripType(storeSearchParams.tripType)
      }
    }
  }, [storeSearchParams, setSelectedPickup, setSelectedDropoff, setTripType, searchParams])

  useEffect(() => {
    const urlTripType = searchParams.get("tripType")
    if (urlTripType && (urlTripType === "one-way" || urlTripType === "round-trip")) {
      setTripType(urlTripType)
    }
  }, [searchParams, setTripType])

  useEffect(() => {
    const hasStoredParams = storeSearchParams?.pickup && storeSearchParams?.dropoff
    if (!hasStoredParams && !hasResetRef.current) {
      resetTransferStore()
      hasResetRef.current = true
      const urlTripType = searchParams.get("tripType")
      if (urlTripType && (urlTripType === "one-way" || urlTripType === "round-trip")) {
        setTripType(urlTripType)
      }
    }
  }, [storeSearchParams, searchParams, resetTransferStore, setTripType])


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
      </div>
    </div>
  )
}

export default TransferSearchFilter