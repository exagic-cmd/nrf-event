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
        <h1 className="text-xl sm:text-2xl font-bold text-white mb-2 leading-tight">
          {tourName}
        </h1>
        <div className="flex items-center text-gay-50 mb-4">
          <MapPin size={16} className="mr-2 text-[#CC9A55]" />
          <span className="font-medium text-sm">
            {location && t("singapore")}
          </span>
        </div>
      </div>

      {/* Desktop Header */}
      <div className="hidden lg:flex justify-between items-center mb-2 mt-6">
        <div>
          <h1 className="text-lg md:text-2xl font-bold text-white mb-3 leading-tight">
            {tourName}
          </h1>
          <div className="flex items-center text-[#CC9A55] mb-4">
            <MapPin size={18} className="mr-2 text-[#CC9A55]" />
            <span className="font-medium">
              {location && t("singapore")}
            </span>
          </div>
        </div>
      </div>
    </>
  )
}

export default TourHeader
