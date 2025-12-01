import { MapPin } from "lucide-react"
import { useTranslation } from "next-i18next"

const TourHeader = ({ apiData }) => {
  const { t } = useTranslation("daytour")
  const tourName = apiData.product_description?.title || ""
  const location = apiData.city || ""

  return (
    <>
      {/* Mobile Header */}
      <div className="block lg:hidden mb-6">
        <h1 className="text-xl sm:text-2xl font-semibold text-white mb-2 leading-tight">
          {tourName}
        </h1>
        <div className="flex items-center text-gay-50 mb-4">
          <MapPin size={16} className="mr-2 text-[#D3202D]" />
          <span className="font-small text-sm">
            {location && t("singapore")}
          </span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center mb-2 mt-6">
        <div>
          <h1 className="text-lg font-semibold mb-2 leading-tight">
            {tourName}
          </h1>
          <div className="flex items-center text-[#D3202D] mb-4">
            <MapPin size={16} className="mr-2 text-[#D3202D]" />
            <span className="font-small text-sm">
              {location && t("singapore")}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default TourHeader
