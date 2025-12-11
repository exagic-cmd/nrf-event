// components/accommodations/AccommodationInfoCard.jsx
import { Star, Check, MapPin, Clock, Bed } from "lucide-react";
import { formatPrice } from "@/utils/priceUtils";
import { useState, useEffect } from "react";

const AccommodationInfoCard = ({
  hotelData,
  startingPrice,
  allRooms = [],
  currency = "USD",
  onScrollToOptions,
  onProceedBooking,
  selectedRoom = null,
  nights = 1, roomsCount = 1,
 // hotelData?.meta?. = 1,
}) => {
  const [lowestPrice, setLowestPrice] = useState(0);
  const [amenities, setAmenities] = useState([]);

  useEffect(() => {
    // Calculate total price for all rooms and all nights
    // startingPrice is the total for ALL nights for 1 room
    // We multiply by roomsCount to get the total for all requested rooms
    let priceFor1Room = 0;

    if (selectedRoom) {
      priceFor1Room = (selectedRoom?.rate_plan?.pricing?.total_promo)  || 0;
    } else if (allRooms.length > 0) {
      const min = Math.min(...allRooms.map(r => r.pricing?.total_promo || 0));
      priceFor1Room = min > 0 ? min : startingPrice || 0;
    } else {
      priceFor1Room = startingPrice || 0;
    }

    // Multiply by number of rooms to get total
    setLowestPrice(priceFor1Room * roomsCount);
  }, [allRooms, startingPrice, selectedRoom, roomsCount]);

  useEffect(() => {

    const extract = () => {
      if (hotelData?.amenities) {
        if (typeof hotelData.amenities === "string") {
          return hotelData.amenities.split(",").map(a => a.trim()).slice(0, 5);
        }
        if (Array.isArray(hotelData.amenities)) {
          return hotelData.amenities.slice(0, 5);
        }
      }
      return hotelData?.features?.slice(0, 5) || [];
    };
    setAmenities(extract());
  }, [hotelData]);

  const getRoomCountText = () => {
    if (!allRooms.length) return "No rooms available";
    return allRooms.length === 1 ? "1 room option" : `${allRooms.length} room options`;
  };

  const hasFreeCancellation = () => {
    if (selectedRoom) return selectedRoom.cancellationPolicy?.toLowerCase().includes("refundable");
    return allRooms.some(r => r.cancellationPolicy?.toLowerCase().includes("refundable"));
  };

  const highlights = [];
  if (hotelData?.stars) highlights.push(`${hotelData.stars}-star`);
  if (hotelData?.category_name) highlights.push(hotelData.category_name);
  if (hotelData?.rating?.description) highlights.push(hotelData.rating.description);

  const freeCancellation = hasFreeCancellation();
  const roomCountText = getRoomCountText();

  return (
    <div className="lg:col-span-1">
      <div className="bg-white  lg:flex-col justify-end  py-2 sticky top-4 mr-0 lg:mr-2 ">
        {/* Price */}
        <div className="mb-0 flex justify-end">
          <div className="text-lg lg:text-2xl text-[#D3202D] mb-1">
          <span className="text-sm md:text-md text-black">  Starting Price </span><span className="font-semibold">SGD {formatPrice(lowestPrice)}</span>
          
          </div>
         
            

          {/* {selectedRoom && (
            <div className="mt-2 inline-flex items-center gap-1.5 bg-blue-50 text-[#233BA0] text-xs px-2 py-1 rounded-full">
              <Check className="h-3 w-3" />
              Room Selected
            </div>
          )} */}

          {/* {!selectedRoom && allRooms.length > 0 && (
            <div className="text-[#233BA0] text-xs mt-1.5">
              {roomCountText} available
            </div>
          )} */}
        </div>
 <div className="text-black text-sm flex justify-end gap-1 mb-3">
                for {roomsCount} room{roomsCount > 1 ? "s" : ""} × {nights} night{nights > 1 ? "s" : ""}
 </div>
        {/* Selected Room */}
        {/* {selectedRoom && (
          <div className="mb-2 p-4 bg-gradient-to-r from-[#D3202D]/10 to-transparent border border-[#D3202D]/30 rounded-xl">
            <div className="text-[#233BA0] font-semibold text-sm mb-1">
              {selectedRoom.roomType}
            </div>
            <div className="text-black text-xs">
              {selectedRoom.mealType}
            </div>
            {freeCancellation && (
              <div className="text-[#233BA0] text-xs mt-1.5 flex items-center gap-1">
                <Check className="h-3 w-3" />
                Free cancellation
              </div>
            )}
          </div>
        )} */}

        {/* Highlights */}
        {/* {highlights.length > 0 && (
          <div className="mb-5">
            <div className="flex flex-wrap gap-2">
              {highlights.slice(0, 2).map((h, i) => (
                <span
                  key={i}
                  className="bg-gray-800 text-white px-3 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1"
                >
                  {h.includes("star") && <Star className="h-3 w-3 fill-yellow-500 text-yellow-500" />}
                  {h}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {/* Amenities */}
        {/* {amenities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-[#D3202D] text-sm font-medium mb-2.5">Top Amenities</h4>
            <div className="flex flex-wrap gap-1.5">
              {amenities.map((a, i) => (
                <span key={i} className="bg-blue-50 text-[#233BA0] px-2.5 py-1.5 rounded-md text-xs">
                  {a}
                </span>
              ))}
            </div>
          </div>
        )} */}

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={onScrollToOptions}
            disabled={!allRooms.length}
            className="w-full bg-[#D3202D]  text-white lg:py-3 font-semibold py-3 px-3 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {selectedRoom ? "Choose Room" : `Choose Room (${allRooms.length})`}
          </button>

          {/* <button
            onClick={onProceedBooking}
            disabled={!selectedRoom}
            className="w-full bg-white hover:bg-gray-100 text-gray-900 py-3.5 px-4 rounded-xl font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
          >
            {selectedRoom ? "Proceed to Book" : "Select a Room First"}
          </button> */}
        </div>

        {!selectedRoom && freeCancellation && (
          <div className="mt-4 text-center">
            <span className="inline-flex items-center gap-1 text-green-400 text-xs">
              <Check className="h-3.5 w-3.5" />
              Free cancellation available on some rooms
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationInfoCard;