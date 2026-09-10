"use client"

import { useEffect, useMemo, useState, useRef } from "react"
import { useRouter } from "next/navigation"
import {
  BedDouble,
  BotMessageSquare,
  Bus,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  CloudSun,
  ExternalLink,
  Gift,
  Map,
  MapPin,
  MessageSquareText,
  XCircle, // Added XCircle for unpaid bookings
  FileText, // Add FileText icon for vouchers
  PlaneLanding,
  QrCode,
  Star,
  Ticket,
  TrendingUp,
  Umbrella,
  Clock,
  LogIn,
  LogOut,
  X,
  Moon,
  Loader2
} from "lucide-react"
import { Cell, Pie, PieChart, ResponsiveContainer } from "recharts"
import { useOrderStore } from "@/store/useOrderStore"
import useUserStore from "@/store/useAuthStore"
import ProtectedRoute from "@/components/order/ProtectedRoute"
import LoadingSvg2 from "@/components/common/Loader2Svg"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useVoucherStore } from "@/store/useVoucherStore"
import LandmarkList from "@/components/order/Landmarks"
import RecommendedProducts from "@/components/order/RecommentedProducts"
import VouchersList from "@/components/order/VouchersList"
import EssentialAddonCard from "@/components/order/EssentialAddonCard"
import DigitalIdentity from "@/components/order/DigitalIdentity"
import DestinationInfo from "@/components/order/DestinationInfo"
import Accommodation from "@/components/order/Accommodation"


import { encodeShareToken } from "@/utils/cryptoUtils"
import { getFullImageUrl } from "@/utils/imageService"

/**
 * UI State mapping icons based on category
 */
const getItineraryImage = (item) => {
  return getFullImageUrl(
    item?.product_images?.[0]?.image ||
      item?.pickup_point_image ||
      item?.dropoff_point_image ||
      item?.image ||
      item?.cover
  )
}

const getCategoryRank = (categoryId) => {
  if (categoryId === 2) return 1
  if (categoryId === 3 || categoryId === 1 || categoryId === 8) return 2
  if (categoryId === 4) return 3
  if (categoryId === 11) return 4
  return 5
}

const getCategoryIcon = (categoryId) => {
  if (categoryId === 1) return Ticket
  if (categoryId === 2) return Bus
  if (categoryId === 3) return Map
  if (categoryId === 4) return BedDouble
  if (categoryId === 11) return Gift
  if (categoryId === 8) return PlaneLanding
  return CalendarDays
}

const MediaRail = ({ items = [] }) => (
  <div className="grid gap-3 md:grid-cols-2">
    {items.map((item, index) => (
      <figure key={`${item.src}-${index}`} className="overflow-hidden rounded-xl border border-border bg-surface">
        {item.type === "video" ? (
          <video className="h-44 w-full bg-muted object-cover" controls poster={item.poster} preload="metadata">
            <source src={item.src} type="video/mp4" />
          </video>
        ) : (
          <img src={item.src} alt={item.caption} className="h-44 w-full object-cover" />
        )}
        <figcaption className="px-3 py-2 text-sm font-medium text-foreground">{item.caption}</figcaption>
      </figure>
    ))}
  </div>
)

const Modal = ({ active, onClose }) => {
  if (!active) return null

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-black/40 backdrop-blur-sm px-4 py-2 sm:items-center animate-in fade-in duration-300">
      <div className="w-full max-w-lg rounded-[28px] bg-surface shadow-2xl animate-in zoom-in-95 slide-in-from-bottom-8 duration-500">
        <div className="flex items-center justify-between border-b border-border p-3 md:p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <active.icon className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.15em] text-primary">
                {active.guideLabel}
              </p>
              <h3 className="text-lg font-bold text-foreground leading-none">{active.title}</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="group rounded-full p-2 transition-all hover:bg-muted active:scale-90"
          >
            <X className="h-5 w-5 text-muted-foreground transition-colors group-hover:text-foreground" />
          </button>
        </div>
        <div className="max-h-[60vh] overflow-y-auto p-5 md:p-6 text-foreground scrollbar-hide">
          {active.content}
        </div>
      </div>
    </div>
  )
}

const TravelInfoPage = () => {
  // Helper functions that need `t`
  const { t } = useTranslation("order","common")
  const formatDate = (value) => {
    if (!value) return t("date_pending")
    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeStr) => {
    if (!timeStr) return t("time_tba")
    try {
      const [hours, minutes] = timeStr.split(':')
      const hour = parseInt(hours)
      const minute = parseInt(minutes)
      const period = hour >= 12 ? 'PM' : 'AM'
      const displayHour = hour % 12 || 12
      return `${displayHour}:${minute.toString().padStart(2, '0')} ${period}`
    } catch { return timeStr }
  }

  const getCategoryLabel = (categoryId) => {
    if (categoryId === 1) return t("category_attraction")
    if (categoryId === 2) return t("category_transfer")
    if (categoryId === 3) return t("category_day_tour")
    if (categoryId === 4) return t("category_hotel")
    if (categoryId === 11) return t("category_add_on")
    if (categoryId === 8) return t("category_package_tour")
    return t("category_service")
  }

  const getVoucherTitle = (voucher) =>
    capitalize(voucher?.title || voucher?.redemption?.sku?.description || voucher?.itinerary?.product_title || t("travel_voucher"))

  const getVoucherSubtitle = (voucher) =>
    capitalize(voucher?.redemption?.sku?.description || voucher?.itinerary?.product_title || t("voucher_qr_details_ready"))

  const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : str;

  const router = useRouter()
  const {
    upcomingBookings,
    pastBookings,
    loading,
    error,
    fetchUpcomingBookings,
    fetchPastBookings,
    clearError,
    weatherInfo,
    fetchWeatherInfo,
    accommodations,
  } = useOrderStore()
  const { vouchers, loading: vouchersLoading, fetchVouchers } = useVoucherStore()
  const { token, user, qrCode } = useUserStore()
  const [currentHotelIndex, setCurrentHotelIndex] = useState(0)
  const [visibleReviewsCount, setVisibleReviewsCount] = useState(6)
  const [hotelImageIndex, setHotelImageIndex] = useState(0)
  const [activeModal, setActiveModal] = useState(null)
  const [reviewLoadingId, setReviewLoadingId] = useState(null)
  const [detailLoadingId, setDetailLoadingId] = useState(null)

  useEffect(() => {
    if (token) {
      fetchUpcomingBookings(token)
      fetchPastBookings(token)
      fetchWeatherInfo(user?.id)
      if (user?.access_token) fetchVouchers(user.access_token)
    }
  }, [fetchUpcomingBookings, fetchPastBookings, fetchWeatherInfo, fetchVouchers, token, qrCode, user?.access_token])

  const itineraryItems = useMemo(
    () =>
      (upcomingBookings || []).flatMap((order) =>
        (order.itineraries || []).map((item) => ({
          ...item,
          order_id: order.order_id,
          booking_status: item.booking_status || order.booking_status,
        }))
      ),
    [upcomingBookings]
  )

  const pastItineraryItems = useMemo(
    () =>
      (pastBookings || []).flatMap((order) =>
        (order.itineraries || []).map((item) => ({
          ...item,
          order_id: order.order_id,
          tour_date: item.date || item.tour_date || order.tour_date,
          booking_status: order.booking_status,
        }))
      ), [pastBookings]);

  const firstUpcomingItineraryId = useMemo(() => {
    const firstActivity = itineraryItems.find((item) => item.category_id !== 11 && item.category_id !== 4)
    return firstActivity?.itinerary_id || firstActivity?.id
  }, [itineraryItems])

  const addonItems = itineraryItems.filter((item) => item.category_id === 11)
  const dayItems = itineraryItems.filter((item) => item.category_id !== 11 && item.category_id !== 4)
  
  const availableHotels = useMemo(() => {
    if (accommodations?.length > 0) return accommodations
    return itineraryItems.filter((item) => item.category_id === 4)
  }, [accommodations, itineraryItems])

  const accommodation = availableHotels[currentHotelIndex] || null

  const hotelImages = useMemo(() => {
    if (!accommodation) return []
    const images = accommodation?.pictures?.length > 0
      ? accommodation.pictures
      : (accommodation?.product_images || [])
    return images.map((img) => ({ ...img, image: img.image || img.name }))
  }, [accommodation])

  useEffect(() => {
    if (currentHotelIndex >= availableHotels.length) {
      setCurrentHotelIndex(0)
    }
  }, [availableHotels.length, currentHotelIndex])

  useEffect(() => {
    setHotelImageIndex(0)
  }, [currentHotelIndex])

  useEffect(() => {
    if (hotelImages.length <= 1) return
    const timer = setInterval(() => {
      setHotelImageIndex((prev) => (prev + 1) % hotelImages.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [hotelImages.length])

  const paidCount = useMemo(() => {
    return upcomingBookings.filter(order => order.booking_status === "Confirmed").length;
  }, [upcomingBookings]);

  const unpaidCount = useMemo(() => {
    return upcomingBookings.filter(order => order.booking_status !== "Confirmed").length;
  }, [upcomingBookings]);

  const nights = daysBetween(accommodation?.checkin_date || accommodation?.check_in_date, accommodation?.checkout_date || accommodation?.check_out_date)
  
  function daysBetween(start, end) {
    if (!start || !end) return null
    const diff = new Date(end) - new Date(start)
    if (Number.isNaN(diff)) return null
    return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)))
  }

  const cityName = weatherInfo?.city || (availableHotels[0]?.city_name) || t("your_destination");


  const displayAddons = addonItems
  const displayDayItems = dayItems
  const displayVouchers = vouchers || []
  
  const essentialItems = [
    ...displayAddons.map((item) => ({ kind: "addon", item })),
    ...displayVouchers.map((item) => ({ kind: "voucher", item })),
  ]
  const overviewItems = [...displayDayItems, ...displayAddons]
    .sort((a, b) => {
      const dateA = new Date(a.date || a.tour_date || a.checkin_date || "2999-12-31").getTime()
      const dateB = new Date(b.date || b.tour_date || b.checkin_date || "2999-12-31").getTime()
      if (dateA !== dateB) return dateA - dateB
      return getCategoryRank(a.category_id) - getCategoryRank(b.category_id)
    })
    .slice(0, 5)
  const statChartData = useMemo(() => [
    { name: "Accommodation", value: availableHotels.length, color: "hsl(var(--primary))" },
    { name: "Transfers", value: displayDayItems.filter((item) => item.category_id === 2).length, color: "hsl(var(--secondary-brand))" },
    { name: "Add-ons", value: displayAddons.length, color: "hsl(var(--accent))" },
    { name: "Vouchers", value: displayVouchers.length, color: "hsl(var(--muted-foreground))" },
    { name: "Day tours", value: displayDayItems.filter((item) => item.category_id === 3 || item.category_id === 8).length, color: "hsl(var(--chart-3))" },
    { name: "Attractions", value: displayDayItems.filter((item) => item.category_id === 1).length, color: "hsl(var(--chart-4))" },
  ].filter((item) => item.value > 0), [availableHotels.length, displayDayItems, displayAddons.length, displayVouchers.length])

  const statTotal = statChartData.reduce((sum, item) => sum + item.value, 0)

  const openDetails = (item) => {
    const itineraryId = item.itinerary_id || item.id
    if (!itineraryId) return
    setDetailLoadingId(itineraryId)
    const encoded = encodeShareToken(itineraryId)
    if (encoded.success) router.push(`/order/detail/${encoded.data}`)
  }



  const transportHighlights = [
    {
      src: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/NS19_Toa_Payoh_MRT_Exit_D_20220712_192031.jpg`,
      caption: t("mrt_station_entrance"),
    },
    {
      src: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Bombardier-9thOct.avif`,
      caption: t("mrt_train"),
    },
  ]

  const modalTiles = [
    {
      title: t("about_singapore"),
      guideLabel: t("destination_guide"),
      icon: MapPin,
      content: (
        <div className="space-y-6">
          <div className="overflow-hidden rounded-3xl border border-gray-200 bg-black">
            <iframe
              className="w-full aspect-[16/9]"
              src="https://www.youtube.com/embed/2sA4dLPvKFs?rel=0&autoplay=1&mute=1"
              title="Singapore Travel Guide"
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture; web-share"
              allowFullScreen
            />
          </div>

          <div className="space-y-4">
            <p className="leading-7 text-gray-700">
              {t("about_singapore_description")}
            </p>

           
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4"> {/* No static text here */}
              <h4 className="font-semibold text-gray-950">{t("marina_bay_sands")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("marina_bay_sands_description")}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4"> {/* No static text here */}
              <h4 className="font-semibold text-gray-950">{t("gardens_by_the_bay")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("gardens_by_the_bay_description")}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4"> {/* No static text here */}
              <h4 className="font-semibold text-gray-950">{t("orchard_road")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("orchard_road_description")}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4"> {/* No static text here */}
              <h4 className="font-semibold text-gray-950">{t("sentosa_island")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("sentosa_island_description")}</p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("weather"),
      guideLabel: t("destination_guide"),
      icon: CloudSun,
      content: (
        <div className="space-y-3">
          <div className="flex items-center gap-4">
            {weatherInfo?.weather?.icon && (
              <img src={weatherInfo.weather.icon} alt={weatherInfo?.weather?.summary || t("weather")} className="h-14 w-14" />
            )}
            <p className="text-4xl font-bold text-gray-950">{weatherInfo?.weather?.temp_c || 30} °C</p>
          </div>
          <p>{weatherInfo?.weather?.summary || t("weather_summary_default")}</p>
        </div>
      ),
    },
    {
      title: t("public_transport"),
      guideLabel: t("destination_guide"),
      icon: Bus,
      content: (
        <div className="space-y-6">
          <div className="space-y-4">
            <p className="leading-7 text-gray-700">
              {t("public_transport_description")}
            </p>
            <a
              href="https://mrtmapsingapore.com/"
              target="_blank"
              rel="noreferrer noopener"
              className="inline-flex items-center gap-2 rounded-full border border-primary bg-primary/10 px-4 py-2 text-sm font-semibold text-primary transition hover:bg-primary/20"
            >
              <ExternalLink className="h-4 w-4" />
              {t("view_mrt_map_routes")}
            </a>
          </div>

          <MediaRail items={transportHighlights} />

          <div className="grid gap-4">
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-950">{t("mrt_basics")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("mrt_basics_description")}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-950">{t("how_to_pay")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("how_to_pay_description")}</p>
            </div>
            <div className="rounded-3xl border border-gray-200 bg-gray-50 p-4">
              <h4 className="font-semibold text-gray-950">{t("esim_for_visitors")}</h4>
              <p className="text-sm text-gray-600 mt-2">{t("esim_for_visitors_description")}</p>
              <div className="flex jusitfy-between">
                <p className="text-sm text-primary mt-2">{t("recommended_provider")}</p>
              <a
                href="https://www.airalo.com/"
                target="_blank"
                rel="noreferrer noopener"
                className="text-sm font-semibold text-primary underline"
              >
                airalo.com
              </a></div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t("tour_overview"),
      guideLabel: t("destination_guide"),
      icon: CalendarDays,
      content: (
        <div className="relative space-y-2 before:absolute before:left-[19px] before:top-2 before:h-[calc(100%-20px)] before:w-[1px] before:bg-gray-100">
          {overviewItems.map((item, index) => {
            const Icon = getCategoryIcon(item.category_id);
            return (
              <div key={`${item.id}-${index}`} className="relative flex gap-4 pl-0">
                <div className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border-[3px] border-white bg-gray-950 shadow-sm">
                  <Icon className="h-3.5 w-3.5 text-white" />
                </div>
                <div className="flex-1 rounded-2xl border border-gray-50 bg-gray-50/40 p-3.5 transition-all hover:bg-white hover:shadow-sm">
                  <div className="flex items-center justify-between mb-0.5">
                    <p className="text-[9px] font-black uppercase tracking-widest text-primary">{getCategoryLabel(item.category_id)}</p>
                    {(item.date || item.tour_date) && <p className="text-[10px] font-bold text-gray-400">{formatDate(item.date || item.tour_date)}</p>}
                  </div> {/* No static text here */}
                  <h4 className="text-[13px] font-bold text-gray-900 leading-snug">{item.title || item.addon_info?.title || item.hotel_name || t("booked_service")}</h4>
                  {item.pickup_time && (
                    <div className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-gray-500">
                      <Clock className="h-3 w-3" />
                      <span>{item.pickup_time}</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      ),
    },
    {
      title: t("tour_statistics"),
      guideLabel: t("destination_guide"),
      icon: TrendingUp,
      content: (
        <div className="grid gap-6 md:grid-cols-[200px_1fr] items-start">
          <div className="relative h-44 w-44 mx-auto md:mx-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statChartData} dataKey="value" innerRadius={38} outerRadius={68} paddingAngle={4} stroke="none">
                  {statChartData.map((entry) => (
                    <Cell key={entry.name} fill={entry.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <p className="text-2xl font-extrabold text-foreground">{statTotal}</p> {/* No static text here */}
              <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-muted-foreground">{t("items")}</p>
            </div>
          </div>

          <div className="space-y-3">
            {statChartData.map((stat) => {
              const pct = statTotal ? Math.round((stat.value / statTotal) * 100) : 0
              return (
                <div key={stat.name} className="rounded-xl border border-border bg-muted p-3">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className="h-3 w-3 rounded-full" style={{ backgroundColor: stat.color }} />
                      <p className="text-sm font-semibold text-foreground">{stat.name}</p>
                    </div> {/* No static text here */}
                    <p className="text-sm font-bold text-foreground">{stat.value} <span className="text-xs text-muted-foreground">({pct}%)</span></p>
                  </div>

                  <div className="h-2 w-full rounded-full bg-secondary">
                    <div className="h-2 rounded-full" style={{ width: `${pct}%`, backgroundColor: stat.color }} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      ),
    },
    {
      title: t("customer_reviews"),
      guideLabel: t("destination_guide"),
      icon: MessageSquareText,
      content: (
        <div className="w-full">
          {pastItineraryItems.length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {pastItineraryItems.map((item, idx) => {
                const isLoading = reviewLoadingId === `${item.id}-${idx}`;
                return (
                <div 
                  key={`${item.id}-${idx}`} 
                  className="flex items-center gap-3 rounded-2xl border border-gray-100 text-foreground bg-surface p-3 transition-all hover:bg-primary/30 hover:text-secondary hover:shadow-md"
                >
                  <div className="h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-primary/5">
                    <img 
                      src={getItineraryImage(item) || "/placeholder.svg"} 
                      alt={item.title || item.hotel_name} 
                      className="h-full w-full object-cover" 
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-[13px] font-bold text-primary truncate">
                      {capitalize(item.title || item.addon_info?.title || item.hotel_name || t("booked_service"))}
                    </h4>
                    <div className="mt-1 flex items-center gap-1.5 text-[11px] font-medium text-foreground">
                      <CalendarDays className="h-3 w-3 text-foreground" />
                      <span>{formatDate(item.tour_date)}</span>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setReviewLoadingId(`${item.id}-${idx}`);
                      router.push(`/review/${qrCode}/${item.id || item.itinerary_id}`);
                    }}
                    disabled={isLoading}
                    className="shrink-0 rounded-lg bg-primary px-3.5 py-1.5 text-[11px] font-bold text-primary-foreground transition-all hover:bg-primary-hover active:scale-95 shadow-sm min-w-[65px] flex items-center justify-center disabled:opacity-70"
                  >
                    {isLoading ? <Loader2 className="h-3 w-3 animate-spin" /> : t("review")}
                  </button>
                </div>
              )})}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-muted">
                <Star className="h-8 w-8 text-muted-foreground" />
              </div>
              <p className="mt-4 text-sm font-medium text-muted-foreground italic">
                {t("no_past_trips_for_review")}
              </p>
            </div>
          )}
        </div>
      ),
    },
  ]

  // Global loading state
  if (loading || vouchersLoading) {
    return (
      <div className="min-h-screen bg-surface-muted flex items-center justify-center">
        <LoadingSvg2 />
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen pt-6 md:pt-12 bg-surface-muted">
        <button
          onClick={() => router.push("/chat")}
          className="fixed bottom-6 right-6 z-50 rounded-full bg-primary p-4 text-primary-foreground shadow-xl transition-transform duration-300 hover:scale-105"
          aria-label={t("chat_with_ai")}
        >
          <BotMessageSquare />
        </button>

        <div className="mx-auto max-w-7xl px-4 py-8 pt-12 sm:px-6 lg:px-8">
          {error && (
            <div className="mb-4 flex items-center justify-between rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-destructive">
              <span>{error}</span>
              <button onClick={clearError} className="font-semibold underline">{t("dismiss")}</button>
            </div>
          )}

          <section className="overflow-hidden rounded-[28px] shadow-2xl ">
            <div className="space-y-6">
              <DigitalIdentity
                cityName={cityName}
                weatherInfo={weatherInfo}
                displayDayItemsCount={displayDayItems.length}
                essentialItemsCount={essentialItems.length}
                paidCount={paidCount}
                unpaidCount={unpaidCount}
              />

              <DestinationInfo 
                modalTiles={modalTiles} 
                onOpen={(tile) => setActiveModal(tile.title)} 
              />
            </div>
          </section>

          {accommodation && (
            <Accommodation
              accommodation={accommodation}
              availableHotelsLength={availableHotels.length}
              currentHotelIndex={currentHotelIndex}
              setCurrentHotelIndex={setCurrentHotelIndex}
              hotelImages={hotelImages}
              hotelImageIndex={hotelImageIndex}
              setHotelImageIndex={setHotelImageIndex}
              nights={nights}
              cityName={cityName}
              onViewDetails={openDetails}
            />
          )}

          {(vouchers.length > 0 || displayAddons.length > 0) && (
          <section className="mt-8">
            {/* Travel Essentials Section */}
            <div className="rounded-[24px] bg-surface text-foreground shadow-sm ring-1 ring-border">
              <div className="space-y-3">
            {/* Vouchers Section */}
            {vouchers.length > 0 && (
            <VouchersList vouchers={vouchers} loading={vouchersLoading} />
            )}

            {/* Add-ons Section - Using identical grid and card style */}
            {displayAddons.length > 0 && (
              <div className="mt-8 space-y-4">
                <div className="flex items-center gap-3">
                  <Gift className="w-6 h-6 text-primary" />
                  <h2 className="text-xl sm:text-2xl font-bold "> {/* No static text here */}
                    {t("extra_services")}
                  </h2>
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {displayAddons.map((item) => (
                    <EssentialAddonCard key={item.id} item={item} onClick={openDetails} />
                  ))}
                </div>
              </div>
            )}

              </div>
            </div>
          </section>
          )}

          {displayDayItems.length > 0 && (
          <section className="mt-8 pb-10">
            <div className="mb-4 flex items-center gap-3">
              <CalendarDays className="h-6 w-6 text-primary" />
              <div>
                <p className="text-sm font-bold uppercase tracking-[0.18em] text-primary">{t("day_by_day_itinerary")}</p>
                <h2 className="text-xl md:text-3xl text-foreground font-bold">{t("upcoming_trip_flow")}</h2>
              </div>
            </div>

              <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
                {displayDayItems.map((item, index) => (
                  <article key={item.id} className="group flex flex-row overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5 transition-all duration-300 hover:scale-[1.01] hover:shadow-xl md:h-[170px] h-[170px]">
                    {(() => {
                      const rawStatus = String(item.status || item.booking_status || "").trim();
                      const normalizedStatus = rawStatus.toLowerCase();
                      const isConfirmed = ["confirmed", "paid"].includes(normalizedStatus);
                      const statusLabel = rawStatus || t("confirmation_pending");
                      const thumb = getItineraryImage(item) || "https://cdn.pixabay.com/photo/2016/11/29/06/22/landscape-1867809_1280.jpg"
                      return (
                        <>
                    {/* Image Section */}
                    <div 
                      onClick={() => isConfirmed ? openDetails(item) : null}
                      className={`relative h-full w-[35%] sm:w-[40%] shrink-0 bg-gray-100 overflow-hidden ${isConfirmed ? 'cursor-pointer' : 'cursor-default'}`}
                    >
                      <img
                        src={getItineraryImage(item)}
                        alt={item.title || item.hotel_name || "Booked service"}
                        className={`h-full w-full object-cover transition-transform duration-500 ${isConfirmed ? 'group-hover:scale-110' : 'grayscale-[0.5] opacity-80'}`}
                      />
                      {!isConfirmed && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center backdrop-blur-[1px]">
                           <p className="text-white text-[10px] font-black uppercase tracking-[0.2em] border border-white/30 px-2 py-1 rounded bg-black/20">{statusLabel}</p>
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent sm:hidden" />
                    </div>

                    {/* Content Section */}
                    <div className="flex flex-1 flex-col">
                      {/* Row 1: Header section with Date, Time and Status */}
                      <div className="flex items-center text-foreground p-2 bg-muted border-b border-border">
                        <div className="flex flex-wrap items-center gap-3">
                           <div className="flex items-center gap-1.5">
                            <CalendarDays className="h-4 w-4 text-primary" />
                            <span className="text-xs font-bold md:text-sm text-foreground">{formatDate(item.date || item.tour_date)}</span>
                          </div>
                          {item.pickup_time && (
                            <div className="flex items-center gap-1.5 border-l border-gray-300 pl-3">
                              <Clock className="h-4 w-4 text-primary" />
                              <span className="text-xs font-bold md:text-sm text-foreground">{item.pickup_time}</span>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Row 2: Title and Button */}
                      <div className="flex flex-1 flex-col justify-between p-3 overflow-hidden">
                        <div className="min-w-0">
                          <h3 className="line-clamp-1 md:text-sm text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                            {capitalize(item.title || item.hotel_name || "Booked service")}
                          </h3>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary">
                              {getCategoryLabel(item.category_id)}
                            </span>
                            <span className="rounded-full bg-secondary text-secondary-foreground px-2 py-0.5 text-[10px] font-bold border border-border">
                              {statusLabel}
                            </span>
                          </div>
                        </div>
                        <div className="mt-auto pt-4 flex items-center justify-between">
                          <div /> {/* Spacer */}
                          {isConfirmed ? (
                          <button
                            onClick={() => openDetails(item)}
                            disabled={detailLoadingId === (item.itinerary_id || item.id)}
                            className="flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-xs font-bold text-primary-foreground transition hover:bg-primary-hover disabled:opacity-70"
                          >
                            {detailLoadingId === (item.itinerary_id || item.id) ? (
                              <Loader2 className="h-3.5 w-3.5 animate-spin mr-2" />
                            ) : null}
                            <span>{t("view_detail")}</span>
                            {detailLoadingId !== (item.itinerary_id || item.id) && (
                              <ExternalLink className="h-3.5 w-3.5 ml-2" />
                            )}
                          </button>
                          ) : (
                            <p className="text-[10px] font-bold text-red-500/80 uppercase "> 
                              {t("order_unconfirmed")}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                        </>
                      )
                    })()}
                  </article>
                ))}
              </div>
          </section>
          )}

           {firstUpcomingItineraryId && (
              <div className="mb-8">
                <LandmarkList itineraryId={firstUpcomingItineraryId} />
              </div>
            )}

            <div className="mb-8">
              <RecommendedProducts />
            </div>
        </div>
        <Modal 
          active={modalTiles.find(t => t.title === activeModal)} 
          onClose={() => { setActiveModal(null); setVisibleReviewsCount(6); }} 
        />
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
  }
}
