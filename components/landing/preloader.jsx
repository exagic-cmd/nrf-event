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
        <div className="w-20 h-20 bg-[#f4f4f4] rounded-full flex items-center justify-center animate-spin-slow">
          <img
             src={ `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1765185574/External%20Links/mobb.png` }
            alt="Loading icon"
            className=" h-12"
          />
        </div>
        <p className="text-lg font-semibold text-gray-700">{t('find_perfect_transfer')}</p>
      </div>
    </div>
  )
}
