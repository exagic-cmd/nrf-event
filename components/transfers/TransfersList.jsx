import React, { useState, useMemo } from "react";
import { useTranslation } from 'next-i18next';
import TransfersCard from "@/components/transfers/TransfersCard";
import Pagination from "@/components/common/Pagination";
import { useTransferStore } from "@/store/useTransferStore";
import { getFullImageUrl } from "@/utils/imageService"
const ITEMS_PER_PAGE = 8;

function TransfersList() {
  const { t } = useTranslation('transfer');
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, isLoading } = useTransferStore(); 

  const carsData = useMemo(() => {
    return searchResults.map(item => {
      const basePrice = parseFloat(item.final_price);
      const promoPrice = parseFloat(item.final_promo_price);
      const usePromo = promoPrice > 0;
      const priceToShow = usePromo ? promoPrice : basePrice;

      return {
        ...item, 
        id: item.id,
        name: item.vehicle_name,
        passengers: item.max_capacity,
        suitcases: item.capacity_with_luggage,
        desc:item.description,
        image:getFullImageUrl(item.vehicle_image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null,
        transferType: item.is_two_way ? t('transferType.roundTrip') : t('transferType.oneWay'),
        features: [
          `${t('features.luggageCapacity')}: ${item.capacity_with_luggage}`,
        ],
      };
    });
  }, [searchResults, t]);

  const sortedCars = useMemo(() => {
    const sortableCars = [...carsData];
    return sortableCars.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [carsData, sortBy]);

  const totalPages = Math.ceil(sortedCars.length / ITEMS_PER_PAGE);

  const paginatedTransfers = sortedCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  return (
    <div className="space-y-4">
      <div className="rounded-xl py-3 px-4 bg-white">
        <p className="text-lg font-semibold">{t('results.showingTransfers')}</p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-8 w-8 text-[#D3202D]"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8H4z"
            />
          </svg>
        </div>
      ) : paginatedTransfers.length > 0 ? (
        paginatedTransfers.map((car) => <TransfersCard key={car.id} car={car} />)
      ) : (
        <div className="text-center py-10 text-gray-500">{t('results.noTransfersFound')}</div>
      )}

      {!isLoading && totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={(page) => setCurrentPage(page)}
        />
      )}
    </div>
  );
}

export default TransfersList;
