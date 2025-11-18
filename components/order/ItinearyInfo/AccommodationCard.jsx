import { MapPin, UtensilsCrossed, Calendar } from 'lucide-react';
import Image from 'next/image';
import { getFullImageUrl } from "@/utils/imageService"
import { useRouter } from "next/navigation"
export default function AccommodationCard({ data }) {
  const accommodation = data;
  const router = useRouter()
  const formatDate = (date) => {
    if (!date) return '-';
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const calculateNights = () => {
    if (!accommodation?.checkin_date || !accommodation?.checkout_date) return null;
    const checkIn = new Date(accommodation.checkin_date);
    const checkOut = new Date(accommodation.checkout_date);
    const diffTime = Math.abs(checkOut - checkIn);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const nights = calculateNights();
  const hotelImage = accommodation?.pictures?.[0]?.image || '/placeholder.svg';
  const goToDetail = (order_id ,itinerary_id) => {
    if (itinerary_id) {
      router.push(`/order/detail/${order_id}?itineraryId=${itinerary_id}`)
    } else {
      router.push(`/order/detail/${order_id}`)
    }
  }

  return (
    <div className="bg-white w-[280px] rounded-xl shadow-lg overflow-hidden border border-gray-100 h-full flex flex-col">
      
      {/* Image Section */}
      <div className="relative h-40 w-full bg-gray-200">
        <Image
          src={getFullImageUrl(hotelImage)}
          alt={accommodation?.hotel_name || 'Hotel'}
          layout="fill"
          objectFit="cover"
        />
        {/* Payment Status Badge */}
        <div className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-full ${
          accommodation?.payment_status === 'Paid' 
            ? 'bg-[#CC9A55] text-white' 
            : 'bg-gray-700 text-white'
        }`}>
          {accommodation?.payment_status || 'Unpaid'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 space-y-3 flex-1 flex flex-col">

        {/* Title + Nights on Right */}
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-sm font-bold text-gray-900 line-clamp-2 flex-1">
            {accommodation?.hotel_name || 'Hotel Name'}
          </h2>

          {/* Nights Badge on Right */}
          {nights && (
            <span className="text-xs font-semibold bg-gray-100 text-[#CC9A55] px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {nights} Nights
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-black mt-0.5 flex-shrink-0" />
          <p className="text-xs text-gray-800 line-clamp-2">
            {accommodation?.hotel_address || 'Address not available'}
          </p>
        </div>

        {/* Meal Plan — Badge line */}
        {accommodation?.meal_plan && accommodation?.meal_plan !== 'Not Included' && (
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-black flex-shrink-0" />
            <span className="text-xs bg-gray-100 text-black  px-2 py-0.5 rounded-full">
              {accommodation?.meal_plan}
            </span>
          </div>
        )}

        {/* Check-in / Check-out */}
        <div className="space-y-2  border-t border-gray-200">
          <div className='flex items-center justify-between bg-[#e6dfd5] p-1 rounded gap-2'>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-black" />
              <p className="text-xs font-semibold text-gray-900  tracking-wide">
                Check-in
              </p>
            </div>
            <div className="text-right p-1">
              <p className="text-xs font-medium text-gray-900">
                {formatDate(accommodation?.checkin_date)}
              </p>
              {/* <p className="text-xs text-gray-900">{accommodation?.checkin_time?.substring(0, 5)}</p> */}
            </div>
          </div>

          <div className='flex items-center justify-between bg-[#e6dfd5] p-1 rounded gap-2'>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-black" />
              <p className="text-xs font-semibold text-gray-900  tracking-wide">
                Check-out
              </p>
            </div>
            <div className="text-right p-1">
              <p className="text-xs font-medium text-gray-900">
                {formatDate(accommodation?.checkout_date)}
              </p>
              {/* <p className="text-xs text-gray-900">{accommodation?.checkout_time?.substring(0, 5)}</p> */}
            </div>
          </div>
        </div>

        {/* Action Button */}
      <button onClick={() => goToDetail(accommodation.order_id, accommodation.itinerary_id)} className="w-full bg-[#CC9A55] hover:bg-[#b8885c] text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors">
          View Details
        </button>

      </div>
    </div>
  );
}
