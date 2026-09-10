import React from "react"
import { BedDouble, ChevronLeft, ChevronRight, MapPin, Map, ExternalLink, Clock, LogIn, LogOut, Moon } from "lucide-react"
import { getFullImageUrl } from "@/utils/imageService"
import { useTranslation } from "next-i18next"

const capitalize = (str) => (str ? str.charAt(0).toUpperCase() + str.slice(1) : str)

const formatTime = (timeStr) => {
  if (!timeStr) return t("time_tba")
  try {
    const [hours, minutes] = timeStr.split(":")
    const hour = parseInt(hours)
    const minute = parseInt(minutes)
    const period = hour >= 12 ? "PM" : "AM"
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minute.toString().padStart(2, "0")} ${period}`
  } catch {
    return timeStr
  }
}

export default function Accommodation({ accommodation, availableHotelsLength, currentHotelIndex, setCurrentHotelIndex, hotelImages = [], hotelImageIndex, setHotelImageIndex, nights, cityName, onViewDetails }) {
  const { t } = useTranslation("order")
  
  const formatDateLocal = (value) => {
    if (!value) return t("date_pending")
    return new Date(value).toLocaleDateString("en-US", {
      weekday: "short",
      month: "short",
      day: "numeric",
    })
  }

  if (!accommodation) return null

  return (
    <section className="mt-3 rounded-[24px] bg-surface p-4 shadow-sm ring-1 ring-border md:p-6">
      <div className="mb-5 flex items-center justify-between">
        <div className="mb-5 flex items-center ">
        <div className="flex items-center gap-3">
          <BedDouble className="h-6 w-6 text-primary" />
          <div>
            <h2 className="text-lg md:text-2xl font-bold">{capitalize(accommodation?.hotel_name || accommodation?.title || t("hotel_accommodation"))}</h2>
          </div>
        </div>
      </div>
        {availableHotelsLength > 1 && (
          <div className="flex items-center gap-2">
            <button
              className="rounded-full border border-border bg-surface p-2 text-foreground shadow-sm transition hover:bg-muted disabled:opacity-30"
              disabled={currentHotelIndex === 0}
              onClick={() => setCurrentHotelIndex((prev) => Math.max(0, prev - 1))}
            >
              <ChevronLeft className="h-5 w-5" /> {/* No static text here */}
            </button>
            <span className="text-xs font-bold text-muted-foreground">{currentHotelIndex + 1} / {availableHotelsLength}</span>
            <button
              className="rounded-full border border-border bg-surface p-2 text-foreground shadow-sm transition hover:bg-muted disabled:opacity-30"
              disabled={currentHotelIndex === availableHotelsLength - 1}
              onClick={() => setCurrentHotelIndex((prev) => Math.min(availableHotelsLength - 1, prev + 1))}
            >
              <ChevronRight className="h-5 w-5" /> {/* No static text here */}
            </button>
          </div>
        )}
      </div>

      

      <div className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
        <div className="relative h-[250px] overflow-hidden rounded-2xl bg-muted">
          <img src={getFullImageUrl(hotelImages?.[hotelImageIndex]?.image)} alt={accommodation?.hotel_name || accommodation?.title || "Hotel"} className="h-full w-full object-cover" />
          {hotelImages.length > 1 && (
            <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 gap-1.5">
              {hotelImages.map((_, i) => (
                <button key={i} onClick={() => setHotelImageIndex(i)} className={`h-1.5 rounded-full transition-all ${i === hotelImageIndex ? "w-6 bg-primary" : "w-1.5 bg-primary-foreground/60"}`} />
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col justify-between bg-muted/50 p-3 md:p-4 rounded-2xl border border-border">
          <div className="space-y-2">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {/* Row 1: Check-in & Check-out */}
              <div className="rounded-xl bg-surface p-3 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <LogIn className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("check_in")}</p>
                </div>
                <p className="mt-1 text-sm sm:text-base font-bold text-foreground">{formatDateLocal(accommodation?.checkin_date || accommodation?.check_in_date)}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(accommodation?.checkin_time || accommodation?.check_in_time)}
                </div>
              </div>
              <div className="rounded-xl bg-surface p-3 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <LogOut className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("check_out")}</p>
                </div>
                <p className="mt-1 text-sm sm:text-base font-bold text-foreground">{formatDateLocal(accommodation?.checkout_date || accommodation?.check_out_date)}</p>
                <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                  <Clock className="h-3 w-3" />
                  {formatTime(accommodation?.checkout_time || accommodation?.check_out_time)}
                </div>
              </div>

              {/* Row 2 on Mobile: Duration & Location */}
              <div className="rounded-xl bg-surface p-3 shadow-sm border border-border">
                <div className="flex items-center gap-2 mb-1">
                  <Moon className="h-3.5 w-3.5 text-primary" />
                  <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">{t("duration")}</p>
                </div> 
                <p className="mt-1 text-sm sm:text-base font-bold text-foreground">{nights} {nights > 1 ? t("nights") : t("night")}</p>
              </div> 
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(accommodation?.hotel_address || accommodation?.hotel_name || cityName)}`}
                target="_blank"
                rel="noreferrer"
                className="rounded-xl bg-surface p-3 shadow-sm border border-border flex flex-col justify-center transition hover:bg-gray-50 group"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <Map className="h-4 w-4 text-primary" />
                    <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{t("location")}</p>
                  </div> 
                  <ExternalLink className="h-3 w-3 text-secondary group-hover:text-primary transition" /> 
                </div> 
                <p className="mt-1 text-sm text-foreground font-bold">{t("open_in_google_maps")}</p>
              </a>

              {/* Row 3 on Mobile: Address */}
              <div className="col-span-2 sm:col-span-2 rounded-xl bg-surface p-3 shadow-sm border border-border min-h-[80px] flex flex-col justify-center">   
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-primary" />
                  <p className="text-[10px] font-bold text-foreground uppercase tracking-tight">{t("address")}</p>
                </div> 
                <p className="mt-1 text-sm text-foreground line-clamp-2 leading-relaxed">{accommodation?.hotel_address || accommodation?.address}</p>
              </div>
            </div>

            {!accommodation?.is_package_tour && (
              <button
                onClick={() => onViewDetails && onViewDetails(accommodation)}
                className="ml-auto w-fit bg-primary text-surface font-bold py-2 px-5 rounded-lg transition-all flex items-center justify-center gap-2 shadow-sm text-sm"
              >
                <span>{t("view_details")}</span>
                <ExternalLink className="h-3.5 w-3.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
