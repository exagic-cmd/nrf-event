"use client";

import { useState, useEffect } from "react";
import TourSummary from "@/components/tour-summary";
import { useVirtualTourStore } from "@/store/useVirtualTourStore";
export default function TourPage({ prod_id, lang_id , colortext,colorheading }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const { fetchVirtualTour, product, locations, totals } = useVirtualTourStore();

  useEffect(() => {
    if (prod_id && lang_id) {
      fetchVirtualTour(prod_id, 2); 
    }
  }, [prod_id, lang_id, fetchVirtualTour]);

  const handleNext = () => {
    if (currentIndex < locations.length) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  return (
    <div className=" text-white min-h-screen flex flex-col">
     
        <TourSummary
          product={product}
          locations={locations}
          totals={totals}
          selectedLang={lang_id}
          onStartTour={handleNext}
          id={prod_id}
          colortext={colortext}
          colorheading={colorheading}
        />
    
    </div>
  );
}
