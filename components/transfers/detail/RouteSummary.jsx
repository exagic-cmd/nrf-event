
import { Clock, Milestone, Calendar, Users, ArrowRight, Gift, Search } from "lucide-react"
import { format, addMinutes } from 'date-fns';
import { useEffect, useState } from "react"
import { useTransferStore } from "@/store/useTransferStore"

const RouteSummary = ({ pickup, dropoff, t, title, tripType, SearchClicked, mapDetails, userBookingDetails }) => {
  const { tripType: storeTripType, setTripType } = useTransferStore()
  const currentTripType = storeTripType || tripType || 'round-trip'
  const [promoAvailable, setPromoAvailable] = useState(false);
  const [promoId, setPromoId] = useState(null);
  const [promoAppliedInSearch, setPromoAppliedInSearch] = useState(false);


  const checkPromoStatus = () => {
    try {
      const saved = localStorage.getItem('promo_id');
      const seenUntil = parseInt(localStorage.getItem('promo_seen_until') || '0', 10);
      const appliedInSearch = localStorage.getItem('promo_applied_in_search') === 'true';
      const now = Date.now();
      
      setPromoAppliedInSearch(appliedInSearch && !!saved);
      
      if (saved) {
        setPromoId(saved);
        setPromoAvailable(false);
      } else if (seenUntil && seenUntil > now) {
        setPromoAvailable(true);
      } else {
        setPromoAvailable(false);
      }
    } catch (e) {
      setPromoAvailable(false);
    }
  };

  useEffect(() => {
    checkPromoStatus();
    
    window.addEventListener('promoAppliedAndSearch', checkPromoStatus);
    return () => {
      window.removeEventListener('promoAppliedAndSearch', checkPromoStatus);
    };
  }, []);

  const handlePromoClick = () => {
    window.dispatchEvent(new CustomEvent('openPromoModal'));
  };

  return (
    <div className="bg-white border p-4 rounded-xl space-y-3 text-sm shadow-sm">
      {/* {promoAvailable && !promoAppliedInSearch && (
        <div className="space-y-2 mb-3 pb-3 border-b border-amber-100">
          <button
            onClick={handlePromoClick}
            className="w-full inline-flex items-center justify-center gap-1 px-3 py-2 bg-amber-50 border-2 border-[#D3202D] text-[#D3202D] rounded-lg text-xs font-semibold hover:bg-amber-100 transition-colors"
          >
            <Gift size={14} />
            {promoId ? t('promo.applied') || 'Promo Applied' : t('promo.available',"Promo Available") || 'Promo Available'}
          </button>
          {promoId && (
            <div className="text-center">
              <p className="text-xs text-green-600 font-medium">✓ {t('promo.discountApplied') || 'Discount will be applied'}</p>
              <p className="text-xs text-gray-500 mt-1">Promo ID: {promoId}</p>
            </div>
          )}
        </div>
      )} */}
      {promoAppliedInSearch && promoId && (
        <div></div>
        // <div className="mb-3 pb-3 border-b border-green-100">
        //   <div className="bg-green-50 border border-green-200 rounded-lg px-3 py-2 text-center">
        //     <p className="text-xs text-green-700 font-semibold">✓ {t('promo.activeDiscount') || 'Promo Discount Active'}</p>
        //     <p className="text-xs text-green-600 mt-1">ID: {promoId}</p>
        //   </div>
        // </div>
      )}
      {SearchClicked && (
        <div className="flex justify-between items-center">
        {currentTripType === 'round-trip'
    ? t("round_trip", "Round Trip")
    : t("one_way", "One Way")}
          <div className="flex gap-2">
            {/* <button 
              onClick={() => {
                setTripType(currentTripType === 'round-trip' ? 'one-way' : 'round-trip')
              }} 
              className="text-[#D3202D] text-xs font-semibold bg-gray-100 rounded-md p-1 cursor-pointer hover:bg-gray-200 transition-colors"
            >
              {currentTripType === 'round-trip' ? t("one_way", "One Way") : t("round_trip", "Round Trip")}
            </button> */}
            {/* <div onClick={SearchClicked} className="justify-items-end cursor-pointer">
              <p className="text-[#D3202D] text-xs font-semibold bg-gray-100 rounded-md p-1 ">{t('change3','Change Search')}</p>
            </div> */}
          </div>
        </div>
      )}
       {title && <p className="text-xs font-semibold text-gray-700 mb-1">{title}</p>}
      <div className="flex items-start">
        {/* Timeline dots/line */}
        <div className="flex flex-col items-center mr-2 mt-1">
          <div className="w-2 h-2 bg-black rounded-full"></div>
          <div className="w-[1px] h-14 bg-gray-400 my-[2px]"></div>
          <div className="w-2 h-2 bg-[#D3202D] rounded-full"></div>
        </div>

        {/* Pickup & Dropoff info */}
        <div>
          <p className="text-xs text-gray-500 font-medium">{t("booking.pickup")}</p>
          <p className="text-[13px] font-semibold">{pickup?.name}</p>

          <p className="mt-2 text-xs text-gray-500 font-medium">{t("booking.dropoff")}</p>
          <p className="text-[13px] text-[#D3202D] font-semibold">{dropoff?.name}</p>
        </div>
      </div>
      {(mapDetails || userBookingDetails) && (
        <div className="pt-3 border-t border-gray-200 space-y-2">
          {userBookingDetails?.pickupDate && userBookingDetails?.pickupTime && (
            <>
              {/* <div className="flex items-center gap-2 text-gray-700">
                <Calendar size={16} className="text-gray-400" />
                <span className="font-medium">
                  {format(new Date(userBookingDetails.pickupDate), 'dd MMM yyyy')}
                </span>
              </div> 
              <div className="flex items-center gap-2 text-gray-700">
                <Clock size={16} className="text-gray-400" />
                <span className="font-medium">
                  {userBookingDetails.pickupTime}
                </span>
              </div>*/}
            </>
          )}

            <div className="flex items-center gap-2 text-gray-700">
              <Clock size={15} className="text-gray-800" />
              <span className="font-medium">
                Estimated time:{' '}
                {mapDetails?.estimated_travel_time_text}
              </span>
            </div>
        

          {mapDetails?.distance_text && mapDetails?.distance_km && (
            <div className="flex items-center gap-2 text-gray-700">
              <Milestone size={16} className="text-gray-800" />
              <span className="font-medium">
                <span className="text-gray-500">{t('distance')||"Distance"}:</span>{' '}
                {mapDetails?.distance_text} / {(mapDetails?.distance_km * 0.621371).toFixed(1)} Miles
              </span>
            </div>
          )}

          {/* {userBookingDetails?.passengers && (
            <div className="flex items-center gap-2 text-gray-700">
              <Users size={16} className="text-gray-400" />
              <span className="font-medium">
                {userBookingDetails.passengers} {t(userBookingDetails.passengers > 1 ? 'passengers' : 'passenger')}
              </span>
            </div>
          )} */}

          {/* {!mapDetails && !userBookingDetails?.passengers && (
            <div className="flex items-center gap-2 text-gray-500 text-xs">
              <Clock size={16} className="text-gray-400" />
              <span>{t('completeSearchForDetails')}</span>
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

export default RouteSummary;