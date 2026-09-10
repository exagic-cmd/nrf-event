import React from "react"
import { CloudSun, Umbrella, Ticket, CheckCircle2, XCircle } from "lucide-react"
import { useTranslation } from "next-i18next"

export default function DigitalIdentity({ cityName, weatherInfo, displayDayItemsCount, essentialItemsCount, paidCount, unpaidCount }) {
  const { t } = useTranslation("order");
  return (
    <div className="space-y-6">
      <div className="rounded-[20px] bg-surface p-5 md:p-7">
        <div className="grid gap-4 lg:grid-cols-[1fr_300px] lg:items-start">
          <div>
            <p className="text-sm font-bold uppercase tracking-[0.22em] text-primary">{t("digital_itinerary")}</p>
            <h1 className="mt-2 text-3xl font-black tracking-tight text-foreground md:text-4xl">{cityName}</h1> {/* No static text here */}
            <p className="mt-3 max-w-2xl text-base leading-7 text-muted-foreground">{t("digital_itinerary_description")}</p>
          </div>
          <div className="flex items-center gap-4 rounded-2xl border border-border bg-muted p-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <CloudSun className="h-8 w-8 text-primary" />
            </div>
            <div>
              <p className="text-3xl font-black text-foreground">{weatherInfo?.weather?.temp_c || 30}°C</p> {/* No static text here */}
              <p className="text-xs text-muted-foreground">{weatherInfo?.weather?.summary || t("humid_showers_possible")}</p>
            </div>
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
            <Umbrella className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-bold">{displayDayItemsCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("planned_services")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-border bg-muted p-3">
            <Ticket className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-bold">{essentialItemsCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("essentials_ready")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-primary/10 p-3">
            <CheckCircle2 className="h-6 w-6 shrink-0 text-primary" />
            <div>
              <p className="text-2xl font-bold">{paidCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("confirmed_orders")}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 rounded-xl border bg-primary/10 p-3">
            <XCircle className="h-6 w-6 shrink-0 text-destructive" />
            <div>
              <p className="text-2xl font-bold">{unpaidCount}</p>
              <p className="text-[10px] text-muted-foreground">{t("pending_orders")}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
