"use client"

import { useState } from "react"
import { History, Calendar, Star, Search, Eye, AlertCircle } from "lucide-react"
import { useOrderStore } from "@/store/useOrderStore"
import { getFullImageUrl } from "@/utils/imageService"
import { useTranslation } from "next-i18next"
import Loader2Svg from "@/components/common/Loader2Svg"

const PastBookings = ({ onReviewClick, onDetailsClick }) => {
  const { t } = useTranslation("order")
  const { pastBookings } = useOrderStore()
  const [showPastBookings, setShowPastBookings] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [sortBy, setSortBy] = useState("date")
  const [filterBy, setFilterBy] = useState("all")
  const [loadingItemId, setLoadingItemId] = useState(null)

  const formatDateTime = (date, time) => {
    if (!date) return "-"
    const dateObj = new Date(date)
    const formattedDate = dateObj.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })

    if (time) {
      if (time.includes("AM") || time.includes("PM")) {
        return `${formattedDate} at ${time}`
      }
      const [hours, minutes] = time.split(":")
      const hoursInt = Number.parseInt(hours)
      const ampm = hoursInt >= 12 ? "PM" : "AM"
      const hour12 = hoursInt % 12 || 12
      return `${formattedDate} at ${hour12}:${minutes} ${ampm}`
    }
    return formattedDate
  }

  const allItineraryItems = pastBookings.flatMap((order) =>
    (order.itineraries || []).map((itinerary) => ({
      ...itinerary,
      order_id: order.order_id,
      booking_status: order.booking_status,
      tour_date: itinerary.date || itinerary.tour_date || order.tour_date,
      checkin_date: itinerary.check_in_date || order.checkin_date,
    }))
  )

  const filteredAndSortedTrips = allItineraryItems
    .filter((item) => {
      const matchesSearch =
        (item.title || item.hotel_name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
        (item.tour_date || item.checkin_date || item.date || "").includes(searchTerm)

      const matchesFilter =
        filterBy === "all" ||
        (filterBy === "confirmed" && item.booking_status.toLowerCase() === "confirmed") ||
        (filterBy === "unconfirmed" && item.booking_status.toLowerCase() !== "confirmed")

      return matchesSearch && matchesFilter
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "name":
          return (a.title || a.hotel_name || "").localeCompare(b.title || b.hotel_name || "")
        case "date":
        default:
          const dateA = new Date(a.tour_date || a.checkin_date || a.date || "")
          const dateB = new Date(b.tour_date || b.checkin_date || b.date || "")
          return dateB - dateA
      }
    })

  const getItineraryImage = (item) => {
    const firstImage = item?.product_images?.[0]
    if (firstImage?.image) {
      return getFullImageUrl(firstImage.image)
    }
    return "/placeholder.svg"
  }

  return (
    <div className="mt-12">
      <div className="text-end">
        <button
          onClick={() => setShowPastBookings(!showPastBookings)}
          className="inline-flex items-center space-x-3 bg-primary text-primary-foreground px-4 py-2 md:px-8 md:py-4 rounded-xl font-semibold text-base md:text-lg shadow-lg hover:shadow-xl transition-all duration-300"
        >
          <History className="w-6 h-6" />
          <span>{showPastBookings ? t("hidePastTrips") : t("viewPastTrips")}</span>
          {allItineraryItems.length > 0 && (
            <span className="bg-surface text-muted-foreground px-2 py-1 rounded-full text-sm font-bold">
              {allItineraryItems.length}
            </span>
          )}
        </button>
      </div>

      {showPastBookings && (
        <div className="mt-8">
          <h2 className="text-xl font-semibold text-primary mb-6 text-start">
            {t("pastTrips")}
          </h2>

          {/* Search + filters */}
          <div className="mb-6 space-y-4">
            <div className="flex flex-col lg:flex-row gap-4 max-w-4xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5" />
                <input
                  type="text"
                  placeholder={t("searchPlaceholder")}
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none transition-all"
                />
              </div>

              <div className="flex flex-col sm:flex-row gap-2">
                <select
                  value={filterBy}
                  onChange={(e) => setFilterBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="all">{t("allStatus")}</option>
                  <option value="confirmed">{t("confirmed")}</option>
                  <option value="unconfirmed">{t("unconfirmed")}</option>
                </select>

                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full sm:w-auto px-4 py-3 border border-border rounded-xl focus:ring-2 focus:ring-primary focus:border-primary outline-none"
                >
                  <option value="date">{t("sortByDate")}</option>
                  <option value="name">{t("sortByName")}</option>
                </select>
              </div>
            </div>

            {(searchTerm || filterBy !== "all") && (
              <div className="text-center text-sm text-muted-foreground">
                {t("showingResults", {
                  count: filteredAndSortedTrips.length,
                  total: allItineraryItems.length,
                })}
              </div>
            )}
          </div>

          {filteredAndSortedTrips.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 md:gap-6 max-w-8xl mx-auto">
              {filteredAndSortedTrips.map((item) => {
                const isConfirmed = item.booking_status.toLowerCase() === "confirmed"
                return (
                  <div
                    key={`${item.order_id}-${item.id}`}
                    className="relative bg-surface rounded-xl shadow-lg overflow-hidden border border-border hover:shadow-xl transition-all duration-300 flex flex-col"
                  >
                    {loadingItemId === item.id && (
                      <div className="absolute inset-0 bg-surface/80 z-10 flex items-center justify-center">
                        <Loader2Svg />
                      </div>
                    )}
                    <div className="flex flex-col sm:flex-row flex-1">
                      <div className="relative flex-shrink-0 w-full md:h-40 md:w-44 h-40">
                        <img
                          src={getItineraryImage(item) || "/placeholder.svg"}
                          alt={item.title || item.hotel_name || t("trip")}
                          className="w-full h-full object-cover rounded-t-xl sm:rounded-l-xl sm:rounded-t-none"
                        />
                        <span
                          className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-bold shadow-md ${
                            isConfirmed ? "bg-secondary text-secondary-foreground" : "bg-primary text-primary-foreground"
                          }`}
                        >
                          {isConfirmed ? t("confirmed") : t("unconfirmed")}
                        </span>
                      </div>

                      <div className="flex-1 p-3 sm:p-4 flex flex-col justify-between">
                        <h3 className="text-base sm:text-lg font-bold line-clamp-1 text-foreground mb-2">
                          {item.title || item.hotel_name}
                        </h3>

                        <div className="flex items-center">
                          <Calendar className="w-4 h-4 mr-2" />
                          <span>
                            {formatDateTime(item.tour_date || item.checkin_date || item.date, item.pickup_time)}
                          </span>
                        </div>

                        {isConfirmed ? (
                          <div className="flex flex-col sm:flex-row gap-2 mt-3">
                            <button
                              onClick={() => {
                                setLoadingItemId(item.id);
                                onReviewClick(item);
                              }}
                              disabled={loadingItemId === item.id}
                              className="flex-1 bg-primary text-primary-foreground font-medium py-2 rounded-lg flex items-center justify-center space-x-1 transition-colors text-sm disabled:opacity-50"
                            >
                              <Star className="w-4 h-4" />
                              <span>{t("review")}</span>
                            </button>
                            <button
                              onClick={() => {
                                setLoadingItemId(item.id);
                                onDetailsClick &&
                                onDetailsClick({ order_id: item.order_id, itinerary_id: item.id });
                              }}
                              disabled={loadingItemId === item.id}
                              className="flex-1 bg-secondary text-secondary-foreground font-medium py-2 rounded-lg flex items-center justify-center space-x-1 hover:bg-secondary/80 transition-colors text-sm disabled:opacity-50"
                            >
                              <Eye className="w-3 h-3" />
                              <span>{t("details")}</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center mt-3 justify-center text-muted-foreground bg-muted px-3 py-2 rounded-lg text-sm font-medium w-full">
                            <AlertCircle className="w-4 h-4 mr-2" />
                            {t("unconfirmedOrder")}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted rounded-xl max-w-4xl mx-auto">
              <History className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-muted-foreground text-lg font-medium">
                {searchTerm || filterBy !== "all" ? t("noSearchResults") : t("noPastTrips")}
              </p>
              <p className="text-muted-foreground text-sm mt-2">
                {searchTerm || filterBy !== "all" ? t("tryAdjustingSearch") : t("travelMemoriesAppear")}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default PastBookings
