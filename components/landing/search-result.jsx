"use client";
import React, { useState, useMemo, useEffect, useRef } from "react";
import { useTranslation } from "next-i18next";
import TransfersCard from "@/components/transfers/TransfersCard";
import Pagination from "@/components/common/Pagination";
import { useTransferStore } from "@/store/useTransferStore";
import { getFullImageUrl } from "@/utils/imageService";

const ITEMS_PER_PAGE = 6; // optional: fewer items for homepage

export default function SearchResult() {
  const { t } = useTranslation("transfer");
  const [sortBy, setSortBy] = useState("cheapest");
  const [currentPage, setCurrentPage] = useState(1);
  const { searchResults, isLoading } = useTransferStore();

  const sectionRef = useRef(null);

  const carsData = useMemo(() => {
    return searchResults.map((item) => {
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
        desc: item.description,
        image: getFullImageUrl(item.vehicle_image),
        price: priceToShow,
        originalPrice: usePromo ? basePrice : null,
        transferType: item.is_two_way
          ? t("transferType.roundTrip")
          : t("transferType.oneWay"),
        features: [
          `${t("features.luggageCapacity")}: ${item.capacity_with_luggage}`,
        ],
      };
    });
  }, [searchResults, t]);

  useEffect(() => {
    if (searchResults.length > 0 && sectionRef.current) {
      const element = sectionRef.current;
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  }, [searchResults]);

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
    <section ref={sectionRef} className="py-10">
      {/* Section Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl font-semibold text-foreground">
          {t("results.showingTransfers")}
        </h2>
      </div>

      {/* Loading Spinner */}
      {isLoading ? (
        <div className="flex justify-center items-center py-20">
          <svg
            className="animate-spin h-8 w-8 text-[#CC9A55]"
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
          {/* 3-Column Grid Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {paginatedTransfers.map((car) => (
              <TransfersCard key={car.id} car={car} />
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="mt-8 flex justify-center">
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={(page) => setCurrentPage(page)}
              />
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          {/* {t("results.noTransfersFound")} */}
        </div>
      )}
    </section>
  );
}
