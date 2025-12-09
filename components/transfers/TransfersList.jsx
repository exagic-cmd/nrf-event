import React, { useState, useMemo } from "react";
import { useTranslation } from 'next-i18next';
import TransfersCard from "@/components/transfers/TransfersCard";
import Pagination from "@/components/common/Pagination";
import { useTransferStore } from "@/store/useTransferStore";
import { getFullImageUrl } from "@/utils/imageService"
const ITEMS_PER_PAGE = 8;

function TransfersList({ searchPerformed }) {
  const { t } = useTranslation('transfer');
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, isLoading, tripType } = useTransferStore();

  const carsData = useMemo(() => {
    return searchResults.map(item => {
      const isTwoWay = tripType === "round-trip"; // Use tripType from store instead of item.is_two_way
      
      // Determine base and promo price based on trip type
      let basePrice, promoPrice;
      
      if (isTwoWay) {
        // For round trip - use two_way prices
        basePrice = parseFloat(item.two_way_price || item.final_price);
        promoPrice = parseFloat(item.two_way_promo_price || item.final_promo_price);
      } else {
        // For one way - use one way prices
        basePrice = parseFloat(item.final_price);
        promoPrice = parseFloat(item.final_promo_price);
      }

      // Check if promo price is valid and applicable
      const usePromo = promoPrice > 0 && !isNaN(promoPrice) && promoPrice < basePrice;
      const priceToShow = usePromo ? promoPrice : basePrice;

      return {
        ...item,
        id: item.id,
        name: item.vehicle_name,
        passengers: item.max_capacity,
        suitcases: item.capacity_with_luggage,
        desc: item.description,
        image: getFullImageUrl(item.vehicle_image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null, // Strikethrough original price if promo applies
        transferType: isTwoWay ? t('transferType.roundTrip') : t('transferType.oneWay'),
        tripType: isTwoWay ? "round-trip" : "one-way", // Add tripType to car object for reference
        features: [
          `${t('features.luggageCapacity')}: ${item.capacity_with_luggage}`,
          isTwoWay 
            ? t('transferType.roundTrip') 
            : t('transferType.oneWay')
        ],
        // Optional: expose raw prices for debugging or future use
        _raw: {
          isTwoWay,
          basePrice,
          promoPrice,
          usePromo,
          twoWayPrice: item.two_way_price,
          twoWayPromoPrice: item.two_way_promo_price,
          oneWayPrice: item.final_price,
          oneWayPromoPrice: item.final_promo_price
        }
      };
    });
  }, [searchResults, t, tripType]);

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
      {paginatedTransfers.length > 0 && (
        <div className="rounded-xl py-3 px-4 bg-white">
          <p className="text-lg font-semibold">{t('results.showingTransfers')}</p>
        </div>
      )}

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
        <div className="text-center py-16 bg-white rounded-xl mx-auto shadow-md max-w-3xl ">
          <h3 className="text-xl font-semibold text-gray-800">
            {searchPerformed ? t('results.noTransfersFound') : "Please search for a transfer"}
          </h3>
          <p className="text-gray-500 mt-2">
            {searchPerformed
              ? "Please try different pick-up, drop-off, or dates."
              : "Use the search filter above to find available transfers."}
          </p>
        </div>
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
