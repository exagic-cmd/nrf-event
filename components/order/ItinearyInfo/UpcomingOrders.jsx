"use client"

import { Calendar, Eye, AlertCircle } from "lucide-react"
import { useOrderStore } from "@/store/useOrderStore"
import { getFullImageUrl } from "@/utils/imageService"
import CancelModal from "./CancelModal"
import { useTranslation } from "next-i18next"

const UpcomingOrders = ({ onViewDetails }) => {
  const { t } = useTranslation("order")
  const { upcomingBookings } = useOrderStore()

  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const getItineraryImage = (itinerary) => {
    const firstImage = itinerary?.product_images?.[0]
    if (firstImage?.image) {
      return getFullImageUrl(firstImage.image)
    }
    return "/travel-booking.png"
  }

  const formatPickupTime = (itinerary) => {
    const pickupTime = itinerary?.pickup_time
    if (pickupTime) {
      if (pickupTime.includes("AM") || pickupTime.includes("PM")) {
        return pickupTime
      }
      const [hours, minutes] = pickupTime.split(":")
      const hoursInt = Number.parseInt(hours)
      const ampm = hoursInt >= 12 ? "PM" : "AM"
      const hour12 = hoursInt % 12 || 12
      return `${hour12}:${minutes} ${ampm}`
    }
    return null
  }

  const allItineraryItems = upcomingBookings.flatMap((order) =>
    (order.itineraries || []).map((itinerary) => ({
      ...itinerary,
      order_id: order.order_id,
      booking_status: order.booking_status,
      tour_date: order.tour_date,
    }))
  )

  if (!allItineraryItems || allItineraryItems.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <Calendar className="w-16 h-16 text-[#CC9A55] mx-auto mb-4" />
        <p className="text-black text-lg font-medium">
          {t("noUpcomingBookingsFound")}
        </p>
        <p className="text-black text-sm mt-2">
          {t("futureAdventuresAppearHere")}
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl md:text-3xl font-bold text-black">
          {t("upcomingOrders")}
        </h2>
        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
          {allItineraryItems.length}{" "}
          {allItineraryItems.length === 1 ? t("item") : t("items")}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-8xl mx-auto">
        {allItineraryItems.map((item) => (
          <div
            key={`${item.order_id}-${item.id}`}
            className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200 hover:shadow-xl transition-all duration-300 flex flex-col sm:flex-row"
          >
            {/* Image */}
            <div className="relative flex-shrink-0 w-full md:h-40 md:w-44 h-40">
              <img
                src={getItineraryImage(item) || "/placeholder.svg"}
                alt={item.title || t("activity")}
                className="w-full h-full object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-t-none"
              />
              <span
                className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium ${
                  item.booking_status?.toLowerCase() === "confirmed"
                    ? "bg-gray-800 text-white font-semibold"
                    : "bg-[#CC9A55] text-white font-semibold"
                }`}
              >
                {item.booking_status}
              </span>
            </div>

            {/* Content */}
            <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-gray-800 mb-2 line-clamp-1">
                  {item.title}
                </h3>

                <div className="space-y-1 text-sm text-gray-600">
                  {/* Date & Pickup */}
                  <div className="flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    <span>
                      {formatDate(item.date)}
                      {formatPickupTime(item) &&
                        ` ${t("at")} ${formatPickupTime(item)}`}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col sm:flex-row gap-2 mt-3">
                {item.booking_status?.toLowerCase() === "confirmed" ? (
                  <button
                    onClick={() =>
                      onViewDetails({
                        order_id: item.order_id,
                        itinerary_id: item.id,
                      })
                    }
                    className="flex-1 bg-[#CC9A55] text-white font-medium py-2 px-3 rounded-lg flex items-center justify-center space-x-1 hover:bg-[#cb913f] transition-colors text-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    <span>{t("details")}</span>
                  </button>
                ) : (
                  <div className="flex items-center justify-center text-gray-500 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium w-full">
                    <AlertCircle className="w-4 h-4 mr-2" />
                    {t("awaitingConfirmation")}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default UpcomingOrders
