import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { MapPin, Star, Wifi, Car, Utensils } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function AccommodationCard({ accommodation, category = "accommodation" }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("accommodation");
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Extract hotel data from the new API structure
  const hotelData = accommodation.Hotel_Data;
  const results = Array.isArray(accommodation.Result) ? accommodation.Result : [accommodation.Result];
  console.log(hotelData)
  // Find the lowest price from all room results
  const lowestPrice = results.reduce((min, result) => {
    const price = parseFloat(result.Room.Price["@attributes"].amt);
    return price < min ? price : min;
  }, parseFloat(results[0]?.Room.Price["@attributes"].amt) || 0);

  // Parse address if available
  // const address = hotelData.address ? JSON.parse(hotelData.address) : {};
  const address = hotelData?.address;
  
  // Parse rating if available
  const rating = hotelData.rating ? JSON.parse(hotelData.rating) : null;
  
  // Parse amenities and convert to array
  const amenities = hotelData.amenities ? hotelData.amenities.split(', ').slice(0, 3) : [];
  
  // Parse media to get images
  const media = hotelData.media ? hotelData.media : [];
  const mainImage = hotelData.length > 0 ? media[0].url : hotelData.image;

  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      // Check if already in cart
      const alreadyExists = items.some(
        (item) => item.tourId === hotelData.stuba_id && item.category === "accommodation"
      );

      if (alreadyExists) {
        setShowModal(true);
      } else {
        // Navigate to accommodation details page
        localizedPush(`/accommodation/detail/${hotelData.stuba_id}`);
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
              className="bg-[#CC9A55] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden p-4 flex flex-col md:flex-row gap-4 cursor-pointer"
        role="button"
        tabIndex={0}
        onClick={handleCardClick}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleCardClick(); }}
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader2 />
          </div>
        )}

        {/* Image */}
        <div className="relative w-full md:w-[180px] flex-shrink-0 flex justify-center items-center">
          <img
           src={$helpers.getEnv('CLOUDINARY_BASE_URL') + mainImage}
            alt={hotelData.title}
            className="object-cover h-[120px] w-full md:w-[180px] rounded-lg"
          />

          {/* Star Rating Badge */}
          {hotelData.stars && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-yellow-500">
              <Star size={10} />
              <span>{hotelData.stars} ★</span>
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between">
          <div>
            <h2 className="font-semibold text-lg">{hotelData.title}</h2>
            
            {/* Location and Rating */}
            <div className="flex flex-wrap gap-4 mt-1 text-sm text-gray-600">
              {(address || hotelData.country_name) && (
                <div className="flex items-center gap-1">
                  <MapPin size={14} />
                  <span>{address || hotelData.country_name}</span>
                </div>
              )}
              {/* {rating && (
                <div className="flex items-center gap-1">
                  <Star size={14} className="text-yellow-500" />
                  <span>{rating.description || `${hotelData.stars} stars`}</span>
                </div>
              )} */}
              {/* {hotelData.type && (
                <div className="text-gray-500">
                  {hotelData.type}
                </div>
              )} */}
            </div>

            {/* Description */}
            <p className="text-sm text-gray-700 line-clamp-2 mt-2">
              {hotelData.description}
            </p>

            {/* Room Types Preview */}
                  {results.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                    {results.slice(0, 2).map((result, idx) => (
                      <span 
                      key={idx}
                      className="px-2 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
                      >
                      {result.Room.RoomType["@attributes"].text}
                      </span>
                    ))}
                    {results.length > 2 && (
                      <span 
                      className="px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full hover:bg-gray-200 cursor-help"
                      title={results.slice(2).map(result => result.Room.RoomType["@attributes"].text).join(', ')}
                      >
                      +{results.length - 2} more
                      </span>
                    )}
                    </div>
                  )}

                  {/* Amenities */}
            {/* {amenities.length > 0 && (
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                {amenities.map((amenity, idx) => (
                  <li key={idx}>{amenity}</li>
                ))}
              </ul>
            )} */}
          </div>

          {/* Bottom Section */}
          <div className="flex justify-between items-end mt-3">
            <div>
              {/* Price display */}
              <div className="flex items-center gap-2">
                <p className="text-lg font-bold text-[#CC9A55]">
                  {formatPrice(lowestPrice)} {accommodation.currency || 'USD'}
                </p>
              </div>
              
              {/* Room count and per night info */}
              {/* <div className="text-xs text-gray-500 mt-1">
                <span>{results.length} room type{results.length !== 1 ? 's' : ''} available</span>
                <span className="mx-1">•</span>
                <span>per stay</span>
              </div> */}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default AccommodationCard;