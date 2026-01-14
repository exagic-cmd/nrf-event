// components/product/BookingPreviewSlider.js
import { useState } from 'react';
import { useTranslation } from "next-i18next";
import { getFullImageUrl } from '@/utils/imageService';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const BookingPreviewSlider = ({ items = [], bookingDetailsMap = {} }) => {
  const { t } = useTranslation("daytour");
  const [current, setCurrent] = useState(0);

  if (!items.length) return null;

  const handlePrev = () => {
    setCurrent((prev) => (prev - 1 + items.length) % items.length);
  };

  const handleNext = () => {
    setCurrent((prev) => (prev + 1) % items.length);
  };
   const item = items[current];
  const details = bookingDetailsMap[item.key] || {};

  const isTransfer = !!item.vehicle;
  const pickupSurcharge = Number(item?.pickupSurcharge) || 0;
  const returnSurcharge = Number(item?.returnSurcharge) || 0;

  const hasPickupSurcharge = pickupSurcharge > 0;
  const hasReturnSurcharge = returnSurcharge > 0;

  const totalSurcharge = pickupSurcharge + returnSurcharge;

  let surchargeScope = "";
  if (hasPickupSurcharge && hasReturnSurcharge) {
    surchargeScope = `(${t("roundtrip")})`;
  } else if (hasReturnSurcharge) {
    surchargeScope = `(${t("return")})`;
  } else if (hasPickupSurcharge) {
    surchargeScope = `(${t("pickup")})`;
  }


  const title = isTransfer ? item.vehicle?.name : item.title;
  const image = isTransfer
    ? (item.vehicle?.image?.startsWith("http") ? item.vehicle.image : getFullImageUrl(item.vehicle?.image))
    : (item.image?.startsWith("http") ? item.image : getFullImageUrl(item.image));

  const total = typeof item.pricing === "object" ? item.pricing?.total : item.pricing;

  const adultCount = item?.adults || 0;
  const childCount = item?.child || 0;
  const totalAdult = item?.pricing?.totalAdult || 0;
  const totalChild = item?.pricing?.totalChild || 0;

  const date = details.date || item.selectedDate;
  const overallTotal = items.reduce((sum, i) => {
    const itemTotal = typeof i.pricing === "object" ? i.pricing?.total : i.pricing;
    return sum + (Number(itemTotal) || 0);
  }, 0);

  return (
    <div className='bg-white p-6 rounded-lg shadow-md '>
      <div className="flex justify-between items-center mb-4">
        <button
          onClick={handlePrev}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
          title={t('previous')}
        >
          <ChevronLeft size={20} className="text-slate-500" />
        </button>

        <span className="text-sm text-slate-500 font-medium">
          {t('product')} {current + 1} {t('of')} {items.length}
        </span>

        <button
          onClick={handleNext}
          className="w-9 h-9 flex items-center justify-center rounded-full bg-gray-200 hover:bg-gray-300 transition"
          title={t('next')}
        >
          <ChevronRight size={20} className="text-slate-500" />
        </button>
      </div>

      <img
        src={image}
        alt={title}
        className="rounded-lg mb-4 w-full h-40 object-cover object-center"
      />

      <h3 className="text-lg font-semibold line-clamp-2 truncate mb-1">{title}</h3>
      <p className="text-sm text-gray-500 mb-3">{date}</p>

      {isTransfer ? (
        <>
         <div className='flex justify-between'>
           <p className="text-sm text-gray-500 mb-1">
            {t('passengers')}: {item.vehicle?.passengers}
          </p>
          <p className="text-sm text-gray-500 mb-1">
            {t('baggage')}: {item.baggage}
          </p>
         </div>
     {isTransfer && totalSurcharge > 0 && (
  <p className="text-sm text-green-500 my-2">
    {t("surcharges_included")}: {apiData?.currency} {totalSurcharge} {surchargeScope}
  </p>
)}

          <div className="pt-2 flex flex-col justify-between text-md font-normal">
            <div className='flex justify-between'>
              <span>{t('subtotal')}</span>
              <span className="text-[#D3202D]">{apiData?.currency} {total}</span>
            </div>
            <div className='flex border-t mt-4 pt-2 justify-between text-lg font-semibold'>
              <span>{t('total_all_items')}</span>
              <span className="text-[#D3202D]">{apiData?.currency} {overallTotal}</span>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="text-sm text-gray-800">
            <div className="flex justify-between mb-1">
              <span>{adultCount} {t('adultsPreview')}</span>
              <span>{apiData?.currency} {totalAdult}</span>
            </div>
            <div className="flex justify-between mb-1">
              <span>{childCount} {childCount === 1 ? t('child') : t('childrenPreview')}</span>
              <span>{apiData?.currency} {totalChild}</span>
            </div>
          </div>

          <div className="pt-2 flex flex-col justify-between text-md font-normal">
            <div className='flex justify-between'>
              <span>{t('subtotal')}</span>
              <span className="text-[#D3202D]">{apiData?.currency} {total}</span>
            </div>
            <div className='flex border-t mt-4 pt-2 justify-between text-lg font-semibold'>
              <span>{t('total_all_items')}</span>
              <span className="text-[#D3202D]">{apiData?.currency} {overallTotal}</span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BookingPreviewSlider;
