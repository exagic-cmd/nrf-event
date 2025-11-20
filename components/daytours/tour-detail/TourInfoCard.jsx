import {
  ChevronDown,
  ChevronRight,
  Clock,
  Mountain,
  UserCheck,
  Globe,
  Bus,
  CarTaxiFront,
} from "lucide-react"
import { useTranslation } from "next-i18next"

const TourInfoCard = ({ apiData, onScrollToOptions, onProceedBooking }) => {
  const { t } = useTranslation("daytour")

  const startingPrice = apiData.starting_price || ""

  const tourFeatures = [
    ...(apiData.duration ? [{
      icon: Clock,
      title: t("duration"),
      desc: `${apiData.duration} ${t("hours")}`
    }] : []),

    ...(apiData.tourtype ? [{
      icon: Mountain,
      title: t("tour_type"),
      desc: apiData.tourtype === "Private Tour"
        ? t("privateTour", "Private Tour")
        : t("shareTour", "Share Tour")
    }] : []),

    ...(apiData.guide_tour ? [{
      icon: UserCheck,
      title: t("guide"),
      desc: apiData.guide_tour === "yes" ? t("guided") : t("no_guide")
    }] : []),

    ...(apiData.guidelanguage ? [{
      icon: Globe,
      title: t("language"),
      desc: t("english")
    }] : []),

    ...(apiData.return_transfer === "yes" ? [{
      icon: Bus,
      title: t("return_transfer"),
      desc: t("included")
    }] : []),

    ...(apiData.pickup_included === "yes" ? [{
      icon: CarTaxiFront,
      title: t("pickup_included"),
      desc: t("available")
    }] : []),
  ]

  return (
    <div className="lg:col-span-2 space-y-4 sm:space-y-6">
      {/* Mobile Pricing Card */}
      <div className="hidden md:block
 bg-blue-50 p-4 rounded-xl border bordee-[#D3202D] mb-6">
        <div className="text-center">
          <div className="text-sm text-gray-600">{t("starting_from")}</div>
          <div className="my-2">
            <span className="text-2xl font-bold text-gray-900">SGD {startingPrice}</span>
          </div>
          {apiData?.is_group ? (
            <button
              onClick={onScrollToOptions}
              className="w-full bg-[#D3202D] text-white px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {t("choose_tour_type")}
              <ChevronDown size={20} />
            </button>
          ) : (
            <button
              onClick={onProceedBooking}
              className="w-full bg-[#D3202D] text-white px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {t("proceed_booking")}
              <ChevronRight size={20} />
            </button>
          )}
        </div>
      </div>

      {/* Tour Features - Responsive Grid */}
      <div className="flex overflow-x-auto gap-3 pb-2 scrollbar-hide sm:grid sm:grid-cols-2 sm:gap-3 rounded-lg">
        {tourFeatures.map((feature, i) => {
          const IconComponent = feature.icon
          return (
            <div
              key={i}
              className="flex items-center justify-between gap-2 p-3 bg-blue-50 rounded-lg shadow-sm border border-[#D3202D] flex-shrink-0 "
            >       
              <div className="flex items-center gap-2">
                <div className="bg-blue-50 p-2 rounded-lg">
                  <IconComponent size={14} className="text-[black]" />
                </div>
                <div className="font-medium text-sm text-black">{feature.title}</div>
              </div>
              <div className="text-xs text-black">{feature.desc}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default TourInfoCard
