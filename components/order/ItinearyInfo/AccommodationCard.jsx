import { MapPin, UtensilsCrossed, Calendar } from 'lucide-react';
import Image from 'next/image';
import { getFullImageUrl } from "@/utils/imageService"
import { useRouter } from "next/navigation"
import { useState } from 'react'; 
import { AlertCircle } from 'lucide-react';
import LoaderSvg from '@/components/common/LoaderSvg'; 
import { encodeShareToken } from "@/utils/cryptoUtils";

export default function AccommodationCard({ data }) {
  const accommodation = data;
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false); 

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
  const hotelImage = accommodation?.pictures?.[0]?.image;
  const finalImageUrl = hotelImage ? getFullImageUrl(hotelImage) : "/placeholder.svg";
  const goToDetail = (order_id ,itinerary_id) => {
    if (itinerary_id) {
      const encoded = encodeShareToken(itinerary_id);
      if (encoded.success) {
        setIsLoading(true);
        router.push(`/order/detail/${encoded.data}`);
      }
    }
    // Note: isLoading will reset when the component unmounts during navigation.
  };

  return (
    <div className="bg-surface w-[280px] rounded-xl shadow-lg overflow-hidden border border-border h-full flex flex-col">
      
      {/* Image Section */}
      <div className="relative h-40 w-full bg-muted">
        <Image
          src={finalImageUrl || "/placeholder.svg"}
          alt={accommodation?.hotel_name || 'Hotel'}
          layout="fill"
          objectFit="cover"
        />
        {/* Payment Status Badge */}
        <div className={`absolute top-2 right-2 text-xs font-semibold px-3 py-1 rounded-full ${
          accommodation?.payment_status === 'Paid' 
            ? 'bg-primary text-primary-foreground' 
            : 'bg-secondary text-secondary-foreground'
        }`}>
          {accommodation?.payment_status || 'Unpaid'}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-2 space-y-3 flex-1 flex flex-col">

        {/* Title + Nights on Right */}
        <div className="flex justify-between items-start gap-2">
          <h2 className="text-sm md:text-md font-bold text-foreground line-clamp-2 h-10 flex-1">
            {accommodation?.hotel_name || 'Hotel Name'}
          </h2>

          {/* Nights Badge on Right */}
          {nights && (
            <span className="text-xs font-semibold bg-muted text-primary px-2 py-1 rounded-full whitespace-nowrap flex-shrink-0">
              {nights} Nights
            </span>
          )}
        </div>

        {/* Address */}
        <div className="flex items-start gap-2">
          <MapPin className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
          <p className="text-xs text-foreground line-clamp-2">
            {accommodation?.hotel_address || 'Address not available'}
          </p>
        </div>

        {/* Meal Plan — Badge line */}
        {accommodation?.meal_plan && accommodation?.meal_plan !== 'Not Included' && (
          <div className="flex items-center gap-2">
            <UtensilsCrossed className="w-4 h-4 text-primary flex-shrink-0" />
            <span className="text-xs bg-muted text-primary px-2 py-0.5 rounded-full">
              {accommodation?.meal_plan}
            </span>
          </div>
        )}

        {/* Check-in / Check-out */}
        <div className="space-y-2  border-t border-gray-200">
          <div className='flex items-center justify-between bg-[#f4f4f4] p-1 rounded gap-2'>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[#cc9a55]" />
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

          <div className='flex items-center justify-between bg-[#f4f4f4] p-1 rounded gap-2'>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4 text-[#cc9a55]" />
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
      {accommodation?.payment_status !== 'Paid' ? (
        // Display "Awaiting Confirmation" message
        <div className="flex items-center justify-center text-gray-500 bg-gray-100 px-3 py-2 rounded-lg text-sm font-medium w-full">
          <AlertCircle className="w-4 h-4 mr-2" />
            Awaiting Confirmation
        </div>
      ) : (
        // Display "View Details" button
        <button
            onClick={() => goToDetail(accommodation.order_id, accommodation.itinerary_id)}
            className="w-full bg-[#cc9a55] text-white font-medium py-2 px-3 rounded-lg text-sm transition-colors flex items-center justify-center"
            disabled={isLoading}
          >
            {isLoading ? (
              <LoaderSvg className="animate-spin h-5 w-5 text-white" />
            ) : (
              'View Details'
            )}
          </button>
      )}


      
      </div>
    </div>
  );
}
