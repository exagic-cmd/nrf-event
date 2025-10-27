import MapView from "@/components/common/Map"
import TourRoute from "@/components/product/ProductInfo/TourRoute"
import { useTranslation } from "next-i18next";
const TourMapSection = ({ center, tourMapData }) => {
    const { t } = useTranslation("daytour");

  return (
    <div className="px-4 sm:px-6 lg:px-12 mt-8 lg:mt-12">
      <div className="w-full">
        <MapView center={center} zoom={10} height="300px" width="100%" pointers={tourMapData} />
      </div>
      <h2 className="text-lg sm:text-xl lg:text-[23px] mb-4 sm:mb-6 font-semibold mt-6">{t('routeTimeline')}</h2>
      <TourRoute stops={tourMapData} />
    </div>
  )
}

export default TourMapSection
