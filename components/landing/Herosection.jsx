"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowRightLeft,
  ArrowRight,
  Search,
  CarFront,
  Clock,
  Users,
  Zap,
  Luggage,
  X,
  Building2,
  Plane,
  Ship,
  Train,
} from "lucide-react" 
import { useState, useEffect, useRef, useCallback } from "react"
import { useTransferStore } from "@/store/useTransferStore"
import { useRouter } from "next/navigation"
import debounce from "lodash.debounce"
import {getFullImageUrl} from '@/utils/imageService'
import Link from "next/link";
import { useTranslation } from "next-i18next"
export default function HomePage() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [expandedIndex, setExpandedIndex] = useState(0)
  const router = useRouter()
const { t } = useTranslation("common")
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
    setSearchParams, 
    isLoading,
    categoryOptions,
    vehicles,
     fetchVehicles,
     resetTransferStore
  } = useTransferStore()

  useEffect(() => {
    resetTransferStore()
    fetchVehicles()
  }, [resetTransferStore, fetchVehicles])

  const [pickupQuery, setPickupQuery] = useState("")
  const [dropoffQuery, setDropoffQuery] = useState("")
  const [showPickupList, setShowPickupList] = useState(false)
  const [showDropoffList, setShowDropoffList] = useState(false)
  const [pickupFocused, setPickupFocused] = useState(false)

  const pickupRef = useRef(null)
  const dropoffRef = useRef(null)
  const pickupBlurTimeout = useRef(null)

  const debouncedFetchPickup = useCallback(
    debounce((query) => {
      if (query && query.length > 1) {
        fetchPickupOptions(query)
      }
    }, 400),
    [fetchPickupOptions],
  )
useEffect(() => {
  return () => {
    setSelectedPickup(null)
    setSelectedDropoff(null)
    setPickupQuery("")
    setDropoffQuery("")
  }
}, [])

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
    }
  }, [debouncedFetchPickup])

  const handlePickupChange = (value) => {
    setPickupQuery(value)
    setSelectedPickup(null)
    setSelectedDropoff(null)
    setDropoffQuery("")
  }

  const handlePickupSelect = (option) => {
    if (pickupBlurTimeout.current) {
      clearTimeout(pickupBlurTimeout.current)
    }
    setSelectedPickup(option)
    setPickupQuery(option.name)
    setShowPickupList(false)
    setPickupFocused(false)
    fetchDropoffOptions(option.id).then(() => {
      setShowDropoffList(false)
    })
  }

  const handleDropoffSelect = (option) => {
    setSelectedDropoff(option)
    setDropoffQuery(option.name)
    setShowDropoffList(false)
  }
  const handleCategorySelect = (category) => {
    if (pickupBlurTimeout.current) {
      clearTimeout(pickupBlurTimeout.current)
    }
    const searchTerm = category.name || category.nameKey
    setPickupQuery(searchTerm)
    setPickupFocused(true)
    fetchPickupOptions(searchTerm)
    setShowPickupList(true)
    if (pickupRef.current) {
      pickupRef.current.focus()
    }
  }
const handleChatAI = () => {
  if (!selectedPickup || !selectedDropoff) {
    alert("Please select both pickup and dropoff locations");
    return;
  }

  setSearchParams({
    pickup: selectedPickup,
    dropoff: selectedDropoff,
    tripType: tripType,
  });

  router.push("/agentAI");
};
  const getIconForCategory = (categoryId) => {
    switch (categoryId) {
      case "hotel":
        return <Building2 size={20} style={{ color: "#1a1a1a" }} />
      case "airport":
        return <Plane size={20} style={{ color: "#cc9955" }} />
      case "ferry":
        return <Ship size={20} style={{ color: "#00BCD4" }} />
      case "railway":
        return <Train size={20} style={{ color: "#9C27B0" }} />
      default:
        return <Search size={20} style={{ color: "#9E9E9E" }} />
    }
  }

  const showPickupSuggestions = pickupFocused && !pickupQuery && !selectedPickup

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % vehicles.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + vehicles.length) % vehicles.length)
  }

const handleBookTransfer = () => {
  if (!selectedPickup || !selectedDropoff) {
    alert("Please select both pickup and dropoff locations")
    return
  }

  setSearchParams({
    pickup: selectedPickup,
    dropoff: selectedDropoff,
    tripType: tripType,
  })
  router.push("/transfers?searched=true")
}


  return (
    <div className="h-full bg-background">
      {/* Modern Full-Screen Hero Section */}
    <section className=" lg:pt-28 py-2 md:py-8 relative min-h-screen h-[100vh] lg:h-[90vh] flex items-center justify-center overflow-hidden">

        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover min-w-full"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1757667939/External%20Links/Home_page_Banner.jpg')",
            }}
          ></div>
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        <div className="relative z-10 container">
          <div className="grid lg:grid-cols-2 md:gap-6 gap-8 lg:gap-0 lg:items-start ">
      
           <div className="ml-1 md:ml-2 lg:ml-5 xl:ml-6 text-center lg:text-start">
              <div className="space-y-2 sm:space-y-4 mt-4 md:mt-6">
                <h1 className="text-lg lg:text-3xl font-bold leading-tight">
                  <span className="text-white">
                   <span className="text-[#CC9A55] text-3xl md:text-6xl"> #1</span>
                      <span className="text-3xl md:text-5xl"> {t("choice_for_singapore")}</span><br />
                       <span className="text-2xl md:text-4xl">{t("airport_transfers")}</span>
                  </span>
                 
               
               
                </h1>
                <p className="md:text-md text-xs my-12 text-gray-200 leading-relaxed max-w-lg md:mx-auto mx-6  lg:mx-0">
                   {t("trusted_description")}
                </p>
              </div>

              {/* Feature highlights */}
              <div className="hidden sm:flex mt-2 md:mt-8 flex-wrap gap-3 sm:gap-4 justify-center lg:justify-start">
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-3 rounded-full border border-black/20">
                  <Clock className="h-5 w-5 text-[#CC9A55]" />
                  <span className="text-white font-medium">{t("available_247")}</span>
                </div>
                <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-3 rounded-full border border-black/20">
                  <Zap className="h-5 w-5 text-[#CC9A55]" />
                  <span className="text-white font-medium">{t("instant_booking")}</span>
                </div>
              </div>

              {/* Quick stats */}
              <div className="hidden md:flex justify-between mx-0 md:mx-64 lg:mx-0 max-w-60 pt-6 sm:pt-8">
                <div className="text-center bg-black/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-black/20 ">
                  <div className="md:text-2xl text-xl font-bold text-[#CC9A55]">15min</div>
                  <div className="text-sm md:text-base text-gray-300">{t("avg_pickup")}</div>
                </div>
                <div className="h-12 w-1 bg-white"></div>
                <div className="text-center bg-black/10 backdrop-blur-sm px-4 py-3 rounded-xl border border-black/20">
                  <div className="md:text-2xl text-xl font-bold text-[#CC9A55]">4.9★</div>
                  <div className="text-sm md:text-base text-gray-300">{t("rating")}</div>
                </div>
              </div>
            </div>

            {/* Right Content - Modern Booking Form */}
            <div className="flex mx-4 lg:mx-0  justify-center lg:justify-end">
              <Card className="  w-full max-w-lg p-6 md:p-8 bg-white/95 backdrop-blur-xl border-0 shadow-2xl rounded-2xl">
                <div className="space-y-2 sm:space-y-6">
                  <div className="text-center md:mb-2 mb-6">
                    <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">{t("book_your_ride")}</h3>
                    {/* <p className="text-sm sm:text-base text-gray-600">Quick & easy booking in minutes</p> */}
                  </div>
  <div className="flex gap-4 py-1">
                    <div
                      onClick={() => setTripType("one-way")}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-full transition-all ${
                        tripType === "one-way"
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {tripType === "one-way" && <ArrowRight className="h-4 w-4 md:h-5 md:w-5" />}
                      <input
                        type="radio"
                        value="one-way"
                        checked={tripType === "one-way"}
                        readOnly
                        className="hidden"
                      />
                      <span className="md:text-sm text-xs font-medium">{t("one_way")}</span>
                    </div>
                    <div
                      onClick={() => setTripType("round-trip")}
                      className={`flex items-center gap-2 cursor-pointer p-2 rounded-full transition-all ${
                        tripType === "round-trip"
                          ? "bg-black text-white"
                          : "bg-white text-black"
                      }`}
                    >
                      {tripType === "round-trip" && (<ArrowRightLeft className="h-4 w-4 md:h-5 md:w-5" />)}
                      <input
                        type="radio"
                        value="round-trip"
                        checked={tripType === "round-trip"}
                        readOnly
                        className="hidden"
                      />
                      <span className="md:text-sm text-xs font-medium">{t("round_trip")}</span>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t("from")}</label>
                      <div className="relative">
                        <Search className="absolute left-4 md:top-4 top-3 h-4 w-4 md:h-5 md:w-5 text-black" />
                        <input
                          ref={pickupRef}
                          type="text"
                          value={selectedPickup?.name || pickupQuery}
                          onChange={(e) => handlePickupChange(e.target.value)}
                          onFocus={() => {
                            setPickupFocused(true)
                            if (pickupQuery && pickupQuery !== selectedPickup?.name) {
                              setShowPickupList(true)
                            }
                          }}
                          onBlur={() => {
                            pickupBlurTimeout.current = setTimeout(() => {
                              setShowPickupList(false)
                              setPickupFocused(false)
                            }, 200)
                          }}
                         placeholder={t("search_pickup_location")}
                          className="text-base w-full pl-12 pr-4 md:py-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-xl  text-gray-900 font-medium"
                        />
                        {(selectedPickup || pickupQuery) && (
                          <button
                            onClick={() => {
                              setPickupQuery("")
                              setSelectedPickup(null)
                              setSelectedDropoff(null)
                              setDropoffQuery("")
                            }}
                            className="absolute right-3 top-1/2 py-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {showPickupSuggestions && (
  <div className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg z-50">
    <div className="p-3 text-center text-xs text-gray-500 bg-gray-50 rounded-lg">
     {t("search_hint")}
    </div>
  </div>
)}

                        {showPickupList && pickupQuery && pickupQuery !== selectedPickup?.name && (
                          <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-60 overflow-auto z-50">
                            {isLoading ? (
                              <li className="p-3 text-center text-gray-800">Loading...</li>
                            ) : pickupOptions.length > 0 ? (
                              pickupOptions.map((option) => (
                                <li
                                  key={option.id}
                                  onClick={() => handlePickupSelect(option)}
                                  className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-300 last:border-b-0 text-gray-900"
                                >
                                  <div className="flex text-sm md:text-normal items-center gap-2">
                                    {getIconForCategory(option.type)}
                                    <span>{option.name}</span>
                                  </div>
                                  <span className="text-xs text-gray-500 capitalize">{option.type}</span>
                                </li>
                              ))
                            ) : (
                              <li className="p-3 text-center text-gray-500">No results found</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-gray-700">{t("to")}</label>
                      <div className="relative">
                        <Search className="absolute md:text-base text-sm left-4 md:top-4 top-3 h-4 w-4 md:h-5 md:w-5 text-black" />
                        <input
                          ref={dropoffRef}
                          type="text"
                          value={dropoffQuery}
                          onChange={(e) => {
                            if (!selectedPickup) return
                            const value = e.target.value
                            setDropoffQuery(value)
                            if (!value) setSelectedDropoff(null)
                          }}
                          onFocus={() => {
                            if (selectedPickup && dropoffOptions.length > 0) {
                              setShowDropoffList(true)
                            }
                          }}
                          onBlur={() => setTimeout(() => setShowDropoffList(false), 200)}
                          disabled={!selectedPickup}
                          placeholder={t("search_dropoff_location")} 
                          className="text-base w-full pl-12 pr-4 md:py-4 py-2 bg-gray-50 border-2 border-gray-300 rounded-xl text-gray-900 font-medium disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        {dropoffQuery && (
                          <button
                            onClick={() => {
                              setDropoffQuery("")
                              setSelectedDropoff(null)
                            }}
                            className="absolute right-3 top-1/2 py-2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                          >
                            <X size={14} />
                          </button>
                        )}

                        {showDropoffList && selectedPickup && (
                          <ul className="absolute top-full left-0 w-full mt-1 bg-white shadow-lg border border-gray-200 rounded-lg max-h-60 overflow-auto z-50">
                            {dropoffOptions.length > 0 ? (
                              dropoffOptions
                                .filter((opt) => opt.name.toLowerCase().includes(dropoffQuery.toLowerCase()))
                                .map((option) => (
                                  <li
                                    key={option.id}
                                    onClick={() => handleDropoffSelect(option)}
                                    className="flex justify-between items-center p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-300 last:border-b-0 text-gray-900"
                                  >
                                    <div className="flex text-sm md:text-normal items-center gap-2">
                                      {getIconForCategory(option.type)}
                                      <span>{option.name}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 capitalize">{option.type}</span>
                                  </li>
                                ))
                            ) : (
                              <li className="p-3 text-center text-gray-500">{t("no_result_found")}</li>
                            )}
                          </ul>
                        )}
                      </div>
                    </div>

                  

                   <div className="relative">
                     <Button
                      onClick={handleBookTransfer}
                      className="w-full bg-[#CC9A55] text-white text-md md:text-lg font-semibold rounded-xl shadow-lg  cursor-pointer"
                    >
                    <img   className="md:h-8 md:w-8 h-6 w-6 mr-2 "src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1758270303/External%20Links/nzrfxvu3mwnk4hrnbval.svg" alt="" />
                    {t("show_offers")}
                    </Button>
                   </div>

                    <div className="relative">
                      <div className="absolute inset-0 flex items-center">
                        <div className="w-full border-t border-gray-200"></div>
                      </div>
                      <div className="relative flex justify-center text-sm">
                        <span className="px-4 text-gray-500">{t("or")}</span>
                      </div>
                    </div>

                   <Button
      variant="outline"
      asChild
      className=" w-full border-2 py-4 text-md md:text-lg font-semibold rounded-xl transition-all duration-300 bg-transparent cursor-pointer flex items-center justify-center"
    >
      <Link href="/chat">
      <img className="md:h-8 md:w-8 h-6 w-6 mr-2" src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1758270488/External%20Links/jkm3oe48q775vhygkr9m.svg" alt="" />
      <span>{t("chat_with_ai")}</span>
      </Link>
    </Button>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </section>

    <section className="py-4 md:py-12 lg:py-16 bg-black">
  <div className="container mx-auto px-4 lg:px-12">
    <div className="text-center mb-12 sm:mb-16">
      <h2 className="text-3xl md:text-4xl font-bold text-white mb-2 md:mb-6">
       {t("choose_your_perfect")}
        <span className="bg-[#CC9A55] bg-clip-text text-transparent">
        {' '}{t("ride")}
        </span>
      </h2>
      <p className="text-md md:text-xl text-white max-w-2xl mx-auto leading-relaxed px-4">
        {t("vehicle_description")}
      </p>
    </div>

    <div className="hidden lg:block max-w-6xl mx-auto bg-white rounded-3xl shadow-2xl overflow-hidden">
      <div className="grid lg:grid-cols-5 min-h-[400px] sm:min-h-[500px]">
        
        {/* Left Side - Vehicle List */}
        <div className="lg:col-span-2 bg-[#CC9A55] p-4 sm:p-6">
<h3 className="text-lg sm:text-xl font-bold text-white  mb-4 sm:mb-6">{t("available_vehicles")}</h3>
          <div className="space-y-3 sm:space-y-4">
            {vehicles && vehicles.length > 0 ? (vehicles.slice(0, 4).map((vehicle, index) => (
              <button
                key={vehicle.id}
                onClick={() => setCurrentSlide(index)}
                className={`w-full p-3 sm:p-4 rounded-2xl transition-all duration-300 text-left cursor-pointer ${
                  currentSlide === index
                    ? "bg-orange-100 border-2 border-[#CC9A55] shadow-lg transform scale-105"
                    : "bg-white border-2 border-gray-200 hover:border-[#fad6a2] shadow-md hover:shadow-lg hover:scale-102"
                }`}
              >
                <div className="flex items-center gap-3 sm:gap-4">
                  <div className="flex-shrink-0">
                    <img
                      src={getFullImageUrl(vehicle?.image) || "/placeholder.svg"}
                      alt={vehicle.vehicle_type}
                      className="w-16 sm:w-20 h-12 sm:h-14 object-contain"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold text-gray-900 truncate text-sm sm:text-base">
                      {vehicle?.vehicle_type}
                    </h4>
                    <div className="flex items-center gap-2 sm:gap-4 mt-1">
                      <span className="text-xs sm:text-sm text-gray-600 flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {vehicle?.min_capacity} - {vehicle?.max_capacity}
                      </span>
                    </div>
                  </div>
                </div>
              </button>
            ))) : (<p>{t("no_vehicles_available")}</p>)}
          </div>
        </div>

        {/* Right Side - Selected Vehicle Details */}
        <div className="lg:col-span-3 md:p-6 p-8 flex flex-col justify-center">
          {vehicles && vehicles.length > 0 ? (<div className="space-y-4 sm:space-y-6">
            
            {/* Vehicle Image and Header */}
            <div className="text-start">
              <h3 className="text-xl sm:text-md font-bold text-gray-900 mb-2">
                {vehicles[currentSlide]?.vehicle_type}
              </h3>
            </div>

            {/* Vehicle Stats */}
            <div className="grid grid-cols-1 gap-3 sm:gap-4">
              <img className="h-60 w-full object-contain " src={getFullImageUrl(vehicles[currentSlide]?.image)} alt="" />
            </div>

            {/* Features */}
            <div className="flex ">
            <div className="mr-4 ">
<h4 className="text-base sm:text-lg font-semibold text-gray-900 mb-4">{t("whats_included")}</h4>
              <p className="text-sm sm:text-base text-gray-600 leading-relaxed mb-4">
                 {vehicles[currentSlide]?.description || t("default_vehicle_description")}
              </p>
            </div>
              <div className="flex items-center gap-4">
                <div className="flex flex-col items-center text-center">
                  <Users className="h-6 w-6 text-orange-600 mb-2" />
                  <div>
                    <div className="font-bold text-gray-900 w-12 ">
                      {vehicles[currentSlide]?.min_capacity} - {vehicles[currentSlide]?.max_capacity}
                    </div>
                    <div className="text-xs text-gray-600">{t("passengers")}</div>
                  </div>
                </div>
                <div className="flex flex-col items-center text-center ">
                  <Luggage className="h-6 w-6 text-blue-600 mb-2" />
                  <div>
                    <div className="font-bold text-gray-900">
                      {vehicles[currentSlide]?.capacity_with_luggage || 0}
                    </div>
                    <div className="text-xs text-gray-600">{t("luggage")}</div>
                  </div>
                </div>
              </div>
            </div>

          </div>) : (<p>{t("no_vehicles_available")}</p>)}
        </div>

      </div>
    </div>

    {/* Mobile Accordion */}
    <div className="lg:hidden space-y-4 max-w-2xl mx-auto">
      {vehicles && vehicles.length > 0 ? (
        vehicles.slice(0, 4).map((vehicle, index) => (
          <div
            key={vehicle.id}
            className="border rounded-2xl shadow-sm overflow-hidden"
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full flex items-center justify-between p-4 bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    getFullImageUrl(vehicle?.image) || "/placeholder.svg"
                  }
                  alt={vehicle.vehicle_type}
                  className="w-16 h-12 object-contain"
                />
                <div>
                  <h4 className="font-semibold text-gray-900">
                    {vehicle?.vehicle_type}
                  </h4>
                  <span className="text-sm text-gray-600 flex items-center gap-1">
                    <Users className="h-4 w-4" />{" "}
                    {vehicle?.min_capacity} - {vehicle?.max_capacity}
                  </span>
                </div>
              </div>
              {/* <span className="text-xs text-gray-500 capitalize">
                {vehicle?.vehicle_type}
              </span> */}
            </button>
            {expandedIndex === index && (
              <div className="p-4 bg-white">
                <img
                  src={getFullImageUrl(vehicle?.image) || "/placeholder.svg"}
                  alt={vehicle.vehicle_type}
                  className="w-full h-40 object-contain mb-4 rounded-lg"
                />
                <p className="text-gray-600 text-sm mb-4">
                  {vehicle?.description}
                </p>
                <div className="flex justify-around text-center">
                  <div className="flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    <div>
                      <div className="font-bold text-gray-900">
                        {vehicle?.min_capacity} - {vehicle?.max_capacity}
                      </div>
                      <div className="text-xs text-gray-600">{t("passengers")}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Luggage className="h-6 w-6 text-blue-600" />
                    <div>
                      <div className="font-bold text-gray-900">
                        {vehicle?.capacity_with_luggage || 0}
                      </div>
                      <div className="text-xs text-gray-600">{t("luggage")}</div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      ) : (
        <p>{t("no_vehicles_available")}</p>
      )}
    </div>
  </div>
</section>

    </div>
  )
}