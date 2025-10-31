import { useTranslation } from "next-i18next"; 
const MapView = () => {
  const { t } = useTranslation("daytour"); 

  return (
    <div className="w-full lg:w-[350px] h-[400px] lg:h-[100vh] lg:sticky lg:top-0 rounded-xl overflow-hidden shadow-md">
      <iframe
        title={t('hotelMap')}
        className="w-full h-full"
        src="https://www.google.com/maps/embed?pb=..."
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  )
}

export default MapView
