import { Star, Check } from "lucide-react";

const AccommodationInfoCard = ({ hotelData, lowestPrice, currency, onScrollToOptions, onProceedBooking }) => {
  const isAvailable = hotelData.is_valid === 1;

  return (
    <div className="lg:col-span-2">
      <div className="bg-gray-900 rounded-xl p-6 sticky top-24">
        <div className="mb-6">
          <div className="text-3xl font-bold text-[#CC9A55] mb-2">
            {currency} {lowestPrice}
          </div>
          <div className="text-gray-400 text-sm">Total for stay</div>
        </div>

        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-2 text-green-400">
            <Check size={18} />
            <span className="text-sm">Free cancellation</span>
          </div>
          
          <div className="flex items-center gap-2 text-green-400">
            <Check size={18} />
            <span className="text-sm">Best price guarantee</span>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onScrollToOptions}
            className="w-full bg-[#CC9A55] text-white py-3 px-4 rounded-xl font-semibold hover:bg-[#b88a45] transition-colors flex items-center justify-center gap-2"
          >
            Choose Room Type
          </button>
          
          {isAvailable && (
            <button
              onClick={onProceedBooking}
              className="w-full bg-white text-gray-900 py-3 px-4 rounded-xl font-semibold hover:bg-gray-100 transition-colors"
            >
              Book Now
            </button>
          )}
        </div>

        {!isAvailable && (
          <div className="mt-4 p-3 bg-red-900/30 border border-red-700 rounded-lg">
            <div className="text-red-400 text-sm text-center">
              Currently not available for selected dates
            </div>
          </div>
        )}

        <div className="mt-6 pt-6 border-t border-gray-700">
          <div className="text-sm text-gray-400">
            <div className="flex justify-between mb-1">
              <span>Check-in:</span>
              <span>2:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Check-out:</span>
              <span>12:00 PM</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AccommodationInfoCard;