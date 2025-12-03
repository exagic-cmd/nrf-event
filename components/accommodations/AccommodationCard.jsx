import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import {  Star, Wifi, Car, Utensils, Bed, Bath, Tv, Coffee,CircleParking ,ParkingCircle, Baby, Waves, Dumbbell, Fan, Accessibility, Hotel } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import SvgLoader2 from "@/components/common/Loader2Svg";
import LoaderSvg from "@/components/common/LoaderSvg";
import { getFullImageUrl } from "@/utils/imageService";
function AccommodationCard({ accommodation, category = "accommodation" }) {

  const amenityIconMap = {
    wifi: Wifi,
    internet: Wifi,
    transfer: Car,
    parking: CircleParking,
    pool: Waves,
    gym: Dumbbell,
    restaurant: Utensils,
    bar: Utensils,
    breakfast: Utensils,
    'room service': Bed,
    'air conditioning': Fan,
    tv: Tv,
    family: Baby,
    children: Baby,
    accessibility: Accessibility,
    shuttle: Car,
  };

  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("accommodation");
  const { items } = useCartStore();
  const { searchParams } = useAccommodationsStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const roomsArr = Array.isArray(searchParams?.rooms) ? searchParams.rooms : (typeof searchParams?.rooms === 'number' ? new Array(Number(searchParams.rooms)).fill({}) : [{ adult: 1, children: [] }]);
      const roomsCount = Array.isArray(searchParams?.rooms) ? searchParams.rooms.length : (Number(searchParams?.rooms) || roomsArr.length);
      const totalAdults = roomsArr.reduce((sum, r) => sum + (Number(r?.adult) || 0), 0) || 0;
      const totalChildren = roomsArr.reduce((sum, r) => {
        if (Array.isArray(r?.children)) return sum + r.children.length;
        return sum + (Number(r?.children) || 0);
      }, 0) || 0;
  
  const {
    id,
    name,
    address,
    accommodation_type,
    star_rating,
    photo, 
    room,
    amenities,
  } = accommodation;

  const lowestPrice = room?.base_price || 0;

  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      // Check if already in cart
      const alreadyExists = items.some(item =>
        item.tourId === id && item.category === "accommodation"
      );

      if (alreadyExists) {
      setShowModal(true);
      } else {
      // Navigate to accommodation details page
      localizedPush({
        pathname: `/accommodation/detail/${id}`,
        // No link_type_id in the new API, so we remove it
        });
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4">{t("card.modal.alreadyInCart")}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#D3202D] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="relative border rounded-xl shadow-sm bg-white w-full mx-auto overflow-hidden flex flex-col md:flex-row gap-3"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <LoaderSvg />
          </div>
        )}

        {/* Image */}
        <div className="relative w-full md:w-[300px] flex-shrink-0 flex justify-center items-center">
          <img
           src={getFullImageUrl(photo?.image) || '/images/placeholder-hotel.jpg'}
            alt={name}
            className="object-cover h-[235px] w-full md:w-[300px]"
          />
          {/* Star Rating Badge */}
          {star_rating && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-yellow-500">
              <Star size={10} />
              <span>{parseFloat(star_rating).toFixed(1)} ★</span>
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between pr-2.5 pl-2.5">
          <div>
           <div className="flex flex-col justify-between my-1">
             <h2 className="font-bold text-md lg:text-md line-clamp-1 text-[#D3202D]">{name}</h2>
            
            {/* Location and Rating */}
            <div className="flex md:flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              {address && (
                <div className="flex items-center gap-1">
                  <Hotel className="" size={12} />
                  <span className="">{accommodation_type}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 mt-2">
              <ul>
                
                <li className="text-[12px]">{address}</li>
              </ul>
              <div className="flex items-center gap-2 text-gray-700">
                {(() => {
                  const availableIcons = [];
                  const amenityKeywords = Object.keys(amenityIconMap);
                  if (Array.isArray(amenities)) {
                    for (const amenity of amenities) {
                      const lowerAmenity = amenity.toLowerCase();
                      const foundKeyword = amenityKeywords.find(keyword => lowerAmenity.includes(keyword));
                      if (foundKeyword && !availableIcons.some(icon => icon.keyword === foundKeyword)) {
                        availableIcons.push({ Icon: amenityIconMap[foundKeyword], keyword: foundKeyword });
                      }
                    }
                  }
                  const iconsToShow = availableIcons.slice(0, 5);
                  const remainingCount = availableIcons.length - iconsToShow.length;

                  return (
                    <>
                      {iconsToShow.map(({ Icon }, index) => <Icon key={index} className="w-4 h-4" />)}
                    </>
                  );
                })()}
              </div>
            </div>
           </div>
            {/* Room Info Section */}
<div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm bg-[#f5f5f5] p-2 rounded">

  {/* First Column: Guests */}
  <div>
    {(() => {
      // derive counts from searchParams
      

      return (
        <>
          <p className="font-semibold">{roomsCount} room{roomsCount !== 1 ? 's' : ''}</p>
          <p className="text-gray-700 text-[12px]">For {totalAdults} adult{totalAdults !== 1 ? 's' : ''} and {totalChildren} child{totalChildren !== 1 ? 'ren' : ''}</p>
        </>
      );
    })()}
  </div>

  {/* Second Column: Policies */}
<div>
    <ul className="space-y-1 text-gray-700 text-[12px]">
        {Array.isArray(amenities) && amenities.slice(0, 2).map((amenity, i) => (
            <li key={i} className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2" />
                {amenity}
            </li>
        ))}
        {Array.isArray(amenities) && amenities.length > 3 && (
            <li className="flex items-center">
                <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2" />
                <span className="font-semibold text-gray-600">
                    +{amenities.length - 3} more
                </span>
            </li>
        )}
    </ul>
</div>

  {/* Third Column: Price */}
  <div className="text-right">
    <p className="text-lg font-bold text-primary"> {formatPrice(lowestPrice)} {room?.rate_plan?.currency || 'SGD'}</p>
    {/* <p className="text-gray-700 text-[12px]">for a night for {totalAdults}  adults and {totalChildren} children</p> */}
  </div>

</div>


          </div>

          {/* Bottom Section */}
<div className="flex items-end mt-1">
  {/* Left side: price (mobile only) */}
  <div className="block md:hidden mr-auto">
    <p className="text-lg font-bold text-primary">
      {formatPrice(lowestPrice)}{" "}
      {room?.rate_plan?.currency || 'SGD'}
    </p>
    <p className="text-[11px] md:text-[12px] text-gray-700 mb-2">
      for a night for {totalAdults} adults and {totalChildren} children
    </p>
  </div>

  {/* Right side button */}
  <button
    type="button"
    onClick={handleCardClick}
    className="rounded-lg mb-2.5 bg-[#D3202D] text-white px-4 py-2 active:bg-[#b71c1c] transition touch-manipulation cursor-pointer ml-auto flex justify-center items-center h-[40px] w-[110px]"
  >
    {isLoading ? (
      <LoaderSvg className="h-5 w-5" />
    ) : (
      "Book Now"
    )}
  </button>
</div>




        </div>
      </div>
    </>
  );
}

export default AccommodationCard;