import { Globe } from "lucide-react"
import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";

 
export function Preloader() {
   const { t } = useTranslation("common");
     const [event, setEvent] = useState(null);
   
     useEffect(() => {
       async function loadEvent() {
         const data = await $helpers.getEventData();
        
         setEvent(data);
       }
   
       loadEvent();
     }, []);
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-gradient-to-br from-orange-50 via-white to-red-50">
      <div className="flex flex-col items-center space-y-4">
        <div className="w-20 h-20 bg-[#D3202D] rounded-full flex items-center justify-center animate-spin-slow">
          <img
             src={`https://res.cloudinary.com/www-travelpakistani-com/${event?.event?.logo}`}
            alt="Loading icon"
            className="w-10 h-10"
          />
        </div>
        <p className="text-lg font-semibold text-gray-700">{t('find_perfect_transfer')}</p>
      </div>
    </div>
  )
}
