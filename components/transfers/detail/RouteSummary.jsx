
const RouteSummary = ({ pickup, dropoff, t, title, tripType, SearchClicked }) => {
  return (
    <div className="bg-white border p-4 rounded-xl space-y-3 text-sm shadow-sm">
      {SearchClicked && (
        <div className="flex justify-between items-center">
        {tripType === 'round-trip'
    ? t("tripType.roundTrip")
    : t("tripType.oneWay")}
          {/* <div onClick={SearchClicked} className="justify-items-end cursor-pointer">
            <p className="text-[#D3202D] text-xs font-semibold bg-gray-100 rounded-md p-1 ">{t('change')}</p>
          </div> */}
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
      
    </div>
  );
};

export default RouteSummary;