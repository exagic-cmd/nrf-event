import { Wifi, Car, Utensils, Dumbbell, Tv, Waves } from "lucide-react";

const AmenityIcon = ({ amenity }) => {
  const amenityIcons = {
    'wifi': Wifi,
    'parking': Car,
    'restaurant': Utensils,
    'gym': Dumbbell,
    'tv': Tv,
    'pool': Waves,
  };

  const amenityLower = amenity.toLowerCase();
  const IconComponent = Object.keys(amenityIcons).find(key => 
    amenityLower.includes(key)
  ) ? amenityIcons[Object.keys(amenityIcons).find(key => amenityLower.includes(key))] : null;

  return IconComponent ? <IconComponent size={20} /> : <span>•</span>;
};

const AccommodationAmenities = ({ amenities }) => {
  if (!amenities) return null;

  const amenitiesList = amenities.split(', ').slice(0, 12);

  return (
    <div className="mb-8">
      <h2 className="text-2xl font-bold text-white mb-6">Amenities</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {amenitiesList.map((amenity, index) => (
          <div key={index} className="flex items-center gap-3 text-muted-foreground">
            <div className="text-primary">
              <AmenityIcon amenity={amenity} />
            </div>
            <span className="text-sm">{amenity.trim()}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AccommodationAmenities;