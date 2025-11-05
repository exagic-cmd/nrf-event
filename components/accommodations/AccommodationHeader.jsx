import { MapPin, Star } from "lucide-react";

const AccommodationHeader = ({ hotelData, address, rating }) => {
  return (
    <div className="mb-8 mt-6">
      <div className="flex flex-wrap items-center gap-2 mb-2">
        {hotelData.stars && (
          <div className="flex items-center gap-1 bg-yellow-500 text-white px-2 py-1 rounded-md text-sm">
            <Star size={14} />
            <span>{hotelData.stars} ★</span>
          </div>
        )}
        {hotelData.type && (
          <span className="bg-gray-600 text-white px-2 py-1 rounded-md text-sm">
            {hotelData.type}
          </span>
        )}
      </div>
      
      <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
        {hotelData.title}
      </h1>
      
      <div className="flex flex-wrap items-center gap-4 text-gray-300">
        {address.city && (
          <div className="flex items-center gap-1">
            <MapPin size={16} />
            <span>{address.address1}, {address.city}, {address.country}</span>
          </div>
        )}
        
        {rating && (
          <div className="flex items-center gap-1">
            <Star size={16} className="text-yellow-400" />
            <span>{rating.description}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default AccommodationHeader;