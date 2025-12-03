import { MapPin } from 'lucide-react';

const NearbyLandmarks = ({ landmarks, hotelLatitude, hotelLongitude }) => {
  // Haversine formula to calculate distance between two lat/lng points
  const getDistanceInKm = (lat1, lon1, lat2, lon2) => {
    const R = 6371; // Radius of the Earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; // Distance in km
  };

  // Filter out landmarks that don't have a title to display
  const validLandmarks = (landmarks || [])
    .filter(landmark => landmark.title && (landmark.latitude || landmark.longitude))
    .map(landmark => {
      const lat1 = parseFloat(hotelLatitude);
      const lon1 = parseFloat(hotelLongitude);
      const lat2 = parseFloat(landmark.latitude);
      const lon2 = parseFloat(landmark.longitude);

      let distance = null;
      if (!isNaN(lat1) && !isNaN(lon1) && !isNaN(lat2) && !isNaN(lon2)) {
        distance = getDistanceInKm(lat1, lon1, lat2, lon2).toFixed(1);
      }
      return { ...landmark, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  if (validLandmarks.length === 0) {
    return null; // Don't render the component if there are no landmarks
  }

  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
        <h2 className="text-xl font-bold mb-6 text-gray-900">What's Nearby?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-5">
          {validLandmarks.map((landmark) => (
            <div key={landmark.id} className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-[#D3202D] mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-medium text-gray-800 text-[15px]">{landmark.title}</p>
                  {landmark.description && <p className="text-xs text-gray-500 mt-1">{landmark.description}</p>}
                </div>
              </div>
              {landmark.distance !== null && <span className="text-sm text-gray-500 font-medium whitespace-nowrap">{landmark.distance} km</span>}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default NearbyLandmarks;