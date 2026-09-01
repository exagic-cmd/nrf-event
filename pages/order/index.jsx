"use client"

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation"
import { MapPin, Clock, Cloud, BotMessageSquare, ChevronLeft, ChevronRight } from "lucide-react";
import PastBookings from "@/components/order/ItinearyInfo/PastBookings"
import Recommended from "@/components/order/RecommentedProducts"
import UpcomingOrders from "@/components/order/ItinearyInfo/UpcomingOrders"
import { useOrderStore } from "@/store/useOrderStore"
import useUserStore from "@/store/useAuthStore"
import ProtectedRoute from "@/components/order/ProtectedRoute"
import LoadingSvg2 from "@/components/common/Loader2Svg"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import AccommodationCard from '@/components/order/ItinearyInfo/AccommodationCard';
const TravelInfoPage = () => {
  const { t } = useTranslation("order")
  const router = useRouter()
  const {
    upcomingBookings,
    pastBookings,
    selectedTrip,
    setSelectedTrip,
    loading,
    error,
    fetchUpcomingBookings,
    fetchPastBookings,
    clearError,
    weatherInfo,
    fetchWeatherInfo,
    accommodations
  } = useOrderStore()

  const { token, user, qrCode } = useUserStore()
  const [scrollPosition, setScrollPosition] = useState(0);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);
  const scrollContainerRef = useRef(null);
 const handleScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setScrollPosition(scrollLeft);
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 400;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  useEffect(() => {
    handleScroll();
  }, []);
  useEffect(() => {
    if (token) {
      fetchUpcomingBookings(token)
      fetchPastBookings(token)
      fetchWeatherInfo(user?.id)
    }
  }, [fetchUpcomingBookings, fetchPastBookings, fetchWeatherInfo, token, qrCode])

  const getDaysUntil = (dateString) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const targetDate = new Date(dateString)
    targetDate.setHours(0, 0, 0, 0)
    const diffTime = targetDate - today
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const handleViewDetails = (order) => {
    if (order.itinerary_id) {
      router.push(`/order/detail/${order.order_id}?itineraryId=${order.itinerary_id}`)
    } else {
      router.push(`/order/detail/${order.order_id}`)
    }
  }

  const handleDetailsClick = (trip) => {
    if (trip.itinerary_id) {
      router.push(`/order/detail/${trip.order_id}?itineraryId=${trip.itinerary_id}`)
    }
  }

  const handleShowQRCode = (item) => {
    console.log("Show QR code for item:", item.id, "from order:", item.order_id)
  }

  const handleReviewClick = (item) => {
    const itineraryId = item.id
    const Code = qrCode
    if (itineraryId && Code) {
      router.push(`/review/${Code}/${itineraryId}`)
    }
  }

  const handleReviewSubmit = () => {
    if (selectedTrip) {
      const itineraryId = selectedTrip.id
      const Code = qrCode
      if (itineraryId) {
        router.push(`/review/${Code}/${itineraryId}`)
      }
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-surface-muted mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <span>{error}</span>
                <button
                  onClick={clearError}
                  className="ml-2 underline hover:no-underline"
                >
                  {t("dismiss")}
                </button>
              </div>
            </div>
          )}
<button
  onClick={() => router.push("/chat")} 
  className="fixed bottom-6 right-6 z-50 bg-gradient-to-br from-[#D3202D] to-[#e5a1a1] text-white 
             p-4 rounded-full shadow-lg hover:scale-105 transition-transform duration-300"
  aria-label="Chat with AI"
>
 <BotMessageSquare/>
</button>

          {weatherInfo ? (
            <div className="relative mt-4 md:mt-12 overflow-hidden rounded-2xl bg-gradient-to-br from-[#D3202D] to-[#e5a1a1] text-white shadow-2xl">
              <div className="absolute inset-0 bg-black opacity-10"></div>

              <div className="relative p-8 flex justify-between items-start lg:items-center">
                {/* Left Side - Destination + Booking */}
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-medium opacity-90">
                    {t("nextDestination")}
                  </p>
                  <h1 className="text-xl md:text-5xl font-bold tracking-tight">
                    {weatherInfo.city}
                  </h1>

                  <div className="flex items-center space-x-2 text-sm opacity-90">
                    <Clock className="w-4 h-4" />
                    <span>
                      {weatherInfo.is_upcoming
                        ? t("daysToGo", { count: weatherInfo.remaining_days })
                        : t("noUpcomingBookings")}
                    </span>
                  </div>
                  {/* <p>
                    {t("date")}: {weatherInfo?.date}
                  </p> */}
                </div>

                {/* Right Side - Weather Info */}
                <div className="flex flex-col items-end mt-6 lg:mt-0 text-right">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl md:text-5xl font-bold">
                      {weatherInfo.weather?.temp_c} °C
                    </span>
                    <Cloud />
                  </div>
                  <p className="md:text-lg opacity-90">
                    {weatherInfo.weather?.summary}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <LoadingSvg2 />
          )}

{accommodations?.length > 0 && (
  <div className="relative text-white">
    <div className="flex justify-between items-center px-4 mb-4">
      <h2 className="text-xl font-semibold text-primary">Accommodations</h2>
      <div className="flex space-x-2">
        <button 
          onClick={() => scroll('left')}
          type="button" 
          className="p-2 rounded-full bg-secondary/50 hover:bg-primary hover:text-surface-foreground text-white shadow transition-colors duration-200"
        >
          <ChevronLeft size={20} />
        </button>
        <button 
          onClick={() => scroll('right')}
          type="button" 
          className="p-2 rounded-full bg-muted hover:bg-primary text-surface-foreground shadow transition-colors duration-200"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>

    <div 
      ref={scrollContainerRef}
      onScroll={handleScroll}
      className="overflow-x-auto px-4 scrollbar-hide"
    >
      <div className="flex gap-4 pb-4">
        {accommodations.map((acc) => (
          <div key={acc.id} className="w-full ">
            <AccommodationCard data={acc} goToDetail={handleViewDetails} />
          </div>
        ))}
      </div>
    </div>
  </div>
)}


         {loading ? (
  <LoadingSvg2 />
) : (
  <>
    <UpcomingOrders
      orders={upcomingBookings}
      onOrderClick={() => {}}
      onViewDetails={handleViewDetails}
      onShowQRCode={handleShowQRCode}
    />
    <PastBookings
      pastTrips={pastBookings}
      onReviewClick={handleReviewClick}
      onDetailsClick={handleDetailsClick}
    />
    <Recommended />
  </>
)}
        </div>
      </div>
    </ProtectedRoute>
  )
}

export default TravelInfoPage
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "order"])),
    },
  };
}