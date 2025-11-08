import { Star, Check, MapPin, Clock } from "lucide-react";
import { useState, useEffect } from "react";

const AccommodationInfoCard = ({ 
  hotelData, 
  startingPrice, 
  allRooms = [], 
  currency = "USD",
  onScrollToOptions, 
  onProceedBooking,
  selectedRoom = null // ✅ Add selectedRoom prop
}) => {
  const [lowestPrice, setLowestPrice] = useState(startingPrice || 0);
  const [amenities, setAmenities] = useState([]);

  // ✅ Calculate the lowest price from available rooms OR use selected room price
  useEffect(() => {
    if (selectedRoom) {
      // Use selected room price
      setLowestPrice(selectedRoom.price || startingPrice || 0);
    } else if (allRooms && allRooms.length > 0) {
      // Use minimum price from available rooms
      const minPrice = Math.min(...allRooms.map(room => room.price || 0));
      setLowestPrice(minPrice > 0 ? minPrice : startingPrice || 0);
    } else {
      setLowestPrice(startingPrice || 0);
    }
  }, [allRooms, startingPrice, selectedRoom]); // ✅ Add selectedRoom to dependencies

  // ✅ Extract and format amenities
  useEffect(() => {
    if (hotelData?.amenities) {
      if (typeof hotelData.amenities === 'string') {
        setAmenities(hotelData.amenities.split(',').map(a => a.trim()).slice(0, 5));
      } else if (Array.isArray(hotelData.amenities)) {
        setAmenities(hotelData.amenities.slice(0, 5));
      } else if (Array.isArray(hotelData.features)) {
        setAmenities(hotelData.features.slice(0, 5));
      }
    } else if (Array.isArray(hotelData?.features)) {
      setAmenities(hotelData.features.slice(0, 5));
    }
  }, [hotelData]);

  // ✅ Format price with currency
  const formatPrice = (price) => {
    if (!price || price === 0) return "Price not available";
    return `${currency} ${price.toLocaleString()}`;
  };

  // ✅ Get room count text
  const getRoomCountText = () => {
    if (!allRooms || allRooms.length === 0) return "No rooms available";
    if (allRooms.length === 1) return "1 room option available";
    return `${allRooms.length} room options available`;
  };

  // ✅ Get cancellation policy info
  const hasFreeCancellation = () => {
    if (selectedRoom) {
      // Check selected room's cancellation policy
      return selectedRoom.cancellationPolicy && 
             selectedRoom.cancellationPolicy.toLowerCase().includes('refundable');
    }
    if (!allRooms || allRooms.length === 0) return false;
    return allRooms.some(room => 
      room.cancellationPolicy && 
      room.cancellationPolicy.toLowerCase().includes('refundable')
    );
  };

  // ✅ Get hotel highlights
  const getHotelHighlights = () => {
    const highlights = [];
    
    if (hotelData?.stars) {
      highlights.push(`${hotelData.stars}-star hotel`);
    }
    
    if (hotelData?.category_name) {
      highlights.push(hotelData.category_name);
    }
    
    if (hotelData?.rating?.description) {
      highlights.push(hotelData.rating.description);
    }
    
    return highlights.slice(0, 2);
  };

  // ✅ Handle scroll to room options
  const handleScrollToOptions = () => {
    if (onScrollToOptions) {
      onScrollToOptions();
    } else {
      // Fallback: scroll to RoomTypes component
      const roomTypesSection = document.getElementById('room-types-section');
      if (roomTypesSection) {
        roomTypesSection.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const highlights = getHotelHighlights();
  const freeCancellationAvailable = hasFreeCancellation();
  const roomCountText = getRoomCountText();

  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-900 rounded-xl p-6 sticky top-24">
        {/* Price Section */}
        <div className="mb-6">
          <div className="text-3xl font-bold text-[#CC9A55] mb-2">
            {formatPrice(lowestPrice)}
          </div>
          <div className="text-gray-400 text-sm">
            {selectedRoom ? "Selected room price" : startingPrice ? "Starting price per night" : "Contact for pricing"}
          </div>
          {selectedRoom && (
            <div className="text-green-400 text-sm mt-1">
              ✓ Room Selected
            </div>
          )}
          {!selectedRoom && allRooms && allRooms.length > 0 && (
            <div className="text-green-400 text-sm mt-1">
              {roomCountText}
            </div>
          )}
        </div>

        {/* Selected Room Info */}
        {selectedRoom && (
          <div className="mb-4 p-3 bg-[#CC9A55]/10 border border-[#CC9A55]/30 rounded-lg">
            <div className="text-white text-sm font-medium mb-1">
              {selectedRoom.roomType}
            </div>
            <div className="text-gray-300 text-xs">
              {selectedRoom.mealType}
            </div>
          </div>
        )}

        {/* Hotel Highlights */}
        {highlights.length > 0 && (
          <div className="mb-4">
            <div className="flex flex-wrap gap-2">
              {highlights.map((highlight, index) => (
                <span 
                  key={index}
                  className="bg-gray-800 text-white px-2 py-1 rounded-md text-xs"
                >
                  {highlight}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Top Amenities Preview */}
        {amenities.length > 0 && (
          <div className="mb-6">
            <h4 className="text-white text-sm font-medium mb-2">Top Amenities:</h4>
            <div className="flex flex-wrap gap-1">
              {amenities.map((amenity, index) => (
                <span 
                  key={index}
                  className="bg-gray-800 text-gray-300 px-2 py-1 rounded text-xs"
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-3">
          <button
            onClick={handleScrollToOptions} // ✅ Use the fixed handler
            disabled={!allRooms || allRooms.length === 0}
            className="w-full bg-[#CC9A55] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#b88a45] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedRoom ? "Change Room" : allRooms && allRooms.length > 0 ? `Choose Room (${allRooms.length})` : 'No Rooms Available'}
          </button>

          <button
            onClick={onProceedBooking}
            disabled={!selectedRoom}
            className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {selectedRoom ? "Book Now" : "Select a Room First"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccommodationInfoCard;