import AudioNotePlayer from "./AudioNotePlayer.jsx";
import TourLocationDetails from "@/components/daytours/tourroute/TourLocationDetails";
import { MapPin, Clock, Car, Footprints } from "lucide-react";

export default function LocationTransition({ prevLocation, nextLocation, travelInfo, onNext, title, translation, details }) {
  return (
    <div className="bg-white max-w-xl md:max-w-7xl  text-black p-2 rounded-lg shadow-lg  mx-auto my-4 ">
    
     <h2 className="text-lg lg:text-xl text-start mb-2 text-black font-semibold pl-2">
  {title}
</h2>

{/* Travel info row */}
{details && (
  <div className="flex items-center gap-6 text-gray-800 text-sm pl-2">
    {details.travel_distance && (
      <div className="flex items-center gap-1">
        <MapPin size={16} className="text-red-500" />
        <span>{details.travel_distance}</span>
      </div>
    )}

    {details.travel_time && (
      <div className="flex items-center gap-1">
        <Clock size={16} className="text-red-500" />
        <span>{details.travel_time}</span>
      </div>
    )}

    {details.travel_mode && (
      <div className="flex items-center gap-1">
        {details.travel_mode.toUpperCase() === "WALKING" ? (
          <Footprints size={16} className="text-red-500" />
        ) : (
          <Car size={16} className="text-red-500" />
        )}
        <span className="capitalize">{details.travel_mode.toLowerCase()}</span>
      </div>
    )}
  </div>
)}
      <div className="space-y-4 md:space-y-6">
        {travelInfo && travelInfo.length > 0 ? (
          <div>
            {/* <h3 className="text-md font-semibold text-gray-400">Travel Note</h3> */}
            {travelInfo.map((info, index) => (
              <div key={index} className=" mt-6">
                {info.isFallback && (
                  <p className="text-sm text-gray-800 mb-2">Audio not available in the selected language. Playing in English.</p>
                )}
                {info.guideFallback && (
                  <p className="text-sm text-gray-800 mb-2">No audio available for the selected guide for this segment.</p>
                )}
                {info.url && <AudioNotePlayer audioUrl={info.url} />}
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-sm text-gray-800 mb-2">No audio available for this part of the tour.</p>
          </div>
        )}
        <TourLocationDetails translation={translation} details={details} travel={true} />
      </div>
   {/* <div className="lg:mx-2 mx-1 flex justify-end">
       <button
        onClick={onNext}
        className=" bg-[#CC9A55]  hover:bg-[#e1b97b] text-black font-bold py-3 px-8 rounded-lg mt-8 transition duration-300 ease-in-out"
      >
         Next Stop 
      </button>
   </div> */}
    </div>
  );
}
