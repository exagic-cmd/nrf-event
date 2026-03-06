import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from 'next-i18next';
import TransfersCard from "@/components/transfers/TransfersCard";
import PromoButton from "@/components/transfers/PromoButton";
import Pagination from "@/components/common/Pagination";
import { useTransferStore } from "@/store/useTransferStore";
import { getFullImageUrl } from "@/utils/imageService"
import { useSearchParams, useRouter, usePathname } from "next/navigation"
import dynamic from "next/dynamic"
const TransferMap = dynamic(() => import("@/components/transfers/detail/TransferMap"), {
  ssr: false,
  loading: () => <div className="h-64 w-full bg-gray-800 flex items-center justify-center text-gray-400"><p>Loading map...</p></div>,
})
const ITEMS_PER_PAGE = 10;

function TransfersList() {
  const { t } = useTranslation('transfer');
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, isLoading, tripType, setTripType, fetchTransfers, setSelectedTransfer, searchParams: storeSearchParams, setSearchParams, searchTransfers } = useTransferStore();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    const currentTripType = searchParams.get('tripType');
    if (currentTripType && currentTripType !== tripType) {
      setTripType(currentTripType);
      if (storeSearchParams && storeSearchParams.tripType !== currentTripType) {
        setSearchParams({ ...storeSearchParams, tripType: currentTripType });
      }
    }
  }, [searchParams, tripType, setTripType, storeSearchParams, setSearchParams]);

  const vehicleSectionRef = useRef(null);
 const { mapDetails } = useTransferStore()
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
const passengerCapacity =
        Array.isArray(item.baggages) && item.baggages.length === 0
          ? item.capacity_without_luggage
          : item.capacity_with_luggage;
      return {
        ...item, 
        id: item.id,
        name: item.vehicle_name,
       passengers: passengerCapacity,
        suitcases: item.capacity_with_luggage,
        desc: item.description,
        image: getFullImageUrl(item.vehicle_image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null, // Strikethrough original price if promo applies
        transferType: isTwoWay ? t('transferType.roundTrip') : t('transferType.oneWay'),
        tripType: isTwoWay ? "round-trip" : "one-way", // Add tripType to car object for reference
        features: [
          ...(Array.isArray(item.features) ? item.features : []),
          
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

  useEffect(() => {
  if (searchResults.length > 0 && vehicleSectionRef.current) {
    const element = vehicleSectionRef.current;
    const yOffset = -100; 
    const y = element.getBoundingClientRect().top + window.scrollY + yOffset;

    window.scrollTo({ top: y, behavior: "smooth" });
  }
}, [searchResults]);

  const handleTripTypeChange = async (newType) => {
    if (newType === tripType) return;

    setTripType(newType);
    if (setSelectedTransfer) setSelectedTransfer(null);

    if (setSearchParams && storeSearchParams) {
      setSearchParams({
        ...storeSearchParams,
        tripType: newType
      });
    }

    const params = new URLSearchParams(searchParams);
    params.set('tripType', newType);
    router.replace(`${pathname}?${params.toString()}`, { scroll: false });

    if (searchTransfers && storeSearchParams?.pickup && storeSearchParams?.dropoff) {
      const promoId = typeof window !== 'undefined' ? localStorage.getItem('promo_id') : null;
      const searchPayload = {
        pickup_point_id: storeSearchParams.pickup.id,
        dropoff_point_id: storeSearchParams.dropoff.id,
        is_two_way: newType === 'round-trip',
      };
      if (promoId) searchPayload.promo_id = promoId;
      await searchTransfers(searchPayload);
    } else if (fetchTransfers) {
      fetchTransfers({
        tripType: newType,
        pickup: storeSearchParams?.pickup,
        dropoff: storeSearchParams?.dropoff
      });
    }
  };

  const sortedCars = useMemo(() => {
    const sortableCars = [...carsData];
    return sortableCars.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
  }, [carsData, sortBy]);

  const totalPages = Math.ceil(sortedCars.length / ITEMS_PER_PAGE);

  const paginatedTransfers = sortedCars.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );

  const hasAnyPromo = carsData.some(c => c.originalPrice !== null);

  const handleOpenPromoModal = () => {
    if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openPromoModal"));
    }
  };

  return (
    <div ref={vehicleSectionRef} className="space-y-4">
      {isLoading ? (
        <div className="flex justify-start md:justify-center items-start md:items-center py-20">
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
        <>
          <div className="h-64 mb-6 rounded-lg overflow-hidden relative z-0 shadow-lg">
            <TransferMap mapDetails={mapDetails} />
          </div>
          <div className="rounded-xl py-3 px-2 bg-gray-50">
            <div className="flex flex-col md:flex-row items-start justify-between gap-2 md:gap-4">
              <div className="w-full md:w-auto flex flex-row items-center gap-3">
                <p className="lg:text-lg text-md font-medium">
                  {t('results.availableOptions', 'Available Options')}
                </p>
                <div className="flex items-center bg-gray-200 p-1 rounded-lg">
                  <button className="px-3 py-1 text-xs font-medium rounded-md text-gray-500 cursor-default">
                    {tripType === 'round-trip' ? t('round_trip', 'Round Trip') : t('one_way', 'One Way')}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleTripTypeChange(tripType === 'round-trip' ? 'one-way' : 'round-trip');
                    }}
                    className="px-3 py-1 text-xs font-medium rounded-md bg-white text-black shadow-sm hover:bg-gray-50 transition-all duration-200"
                  >
                    {tripType === 'round-trip'
                      ? t('see_one_way_price', 'See One Way Price')
                      : t('see_round_trip_price', 'See Round Trip Price')}
                  </button>
                </div>
              </div>
            </div>
            <p className="text-xs md:text-sm text-gray-500 text-left mt-0">
              {t('tax_fees_included', 'Tax and fees included /Vehicle pictures are inddicative only')}
            </p>
          </div>
          {paginatedTransfers.map((car) => (
            <TransfersCard key={car.id} car={car} tripType={tripType} handleTripTypeChange={handleTripTypeChange} />
          ))}
        </>
      ) : (
        <div className="text-center py-10 text-gray-500">
          {/* {t('results.noTransfersFound')} */}
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
