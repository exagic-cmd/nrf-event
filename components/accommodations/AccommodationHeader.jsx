import { MapPin, Star } from "lucide-react";

const AccommodationHeader = ({ hotelData }) => {
  // ✅ Extract rating from the normalized data
  const rating = hotelData?.rating || {};
  
  // ✅ Get location information
  const getLocationText = () => {
    if (hotelData?.address?.address1 && hotelData?.city) {
      return `${hotelData.address.address1}, ${hotelData.city}, ${hotelData.country}`;
    }
    if (hotelData?.city && hotelData?.country) {
      return `${hotelData.city}, ${hotelData.country}`;
    }
    if (hotelData?.location) {
      return hotelData.location;
    }
    return "Location information not available";
  };

  // ✅ Get star rating display
  const getStarRating = () => {
    if (hotelData?.stars) {
      return `${hotelData.stars} ★`;
    }
    if (rating?.system === "Stars" && rating?.score) {
      return `${rating.score} ★`;
    }
    return null;
  };

  // ✅ Get rating description
  const getRatingDescription = () => {
    if (rating?.description) {
      return rating.description;
    }
    if (rating?.score && rating?.system) {
      return `${rating.system}: ${rating.score}`;
    }
    return null;
  };

  const starRating = getStarRating();
  const ratingDescription = getRatingDescription();
  const locationText = getLocationText();

  return (
    <div className="mb-8 mt-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {/* Star Rating Badge */}
        {starRating && (
          <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm">
            <Star size={14} />
            <span>{starRating}</span>
          </div>
        )}
        
        {/* Hotel Type Badge */}
        {hotelData?.type && (
          <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-sm">
            {hotelData.type}
          </span>
        )}
        
        {/* Rating Description Badge */}
        {ratingDescription && (
          <span className="bg-blue-600 text-white px-2 py-1 rounded-md text-sm">
            {ratingDescription}
          </span>
        )}
      </div>
      
      {/* Hotel Title */}
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        {hotelData?.title || hotelData?.name || "Accommodation"}
      </h1>
      
      {/* Location and Additional Info */}
      <div className="flex flex-wrap items-center gap-4 text-gray-300">
        {/* Location */}
        {locationText && (
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{locationText}</span>
          </div>
        )}
        
        {/* Rating Score (if available) */}
        {rating?.score && (
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" />
            <span>Rating: {rating.score}/100</span>
          </div>
        )}
        
        {/* Hotel Rank (if available) */}
        {hotelData?.hotel_rank && (
          <div className="flex items-center gap-1">
            <span className="text-sm bg-green-600 text-white px-2 py-1 rounded">
              Rank: #{hotelData.hotel_rank}
            </span>
          </div>
        )}
      </div>
      
      {/* Additional Info Row */}
      {(hotelData?.max_pax || hotelData?.valid_from) && (
        <div className="flex flex-wrap items-center gap-4 text-gray-400 text-sm mt-2">
          {/* Maximum Occupancy */}
          {hotelData?.max_pax && (
            <span>Max Occupancy: {hotelData.max_pax} guests</span>
          )}
          
          {/* Validity Period */}
          {hotelData?.valid_from && hotelData?.valid_to && (
            <span>
              Valid: {new Date(hotelData.valid_from).toLocaleDateString()} - {new Date(hotelData.valid_to).toLocaleDateString()}
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default AccommodationHeader;