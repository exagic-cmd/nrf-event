"use client";

import LoaderSvg from "@/components/common/LoaderSvg";
import { useTranslation } from "next-i18next";
import { useState, useEffect, useRef, useTransition } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useLocalizedRouter } from "@/components/localizedRouter";

export function TransferBenefitsSection() {
  const { t } = useTranslation("common");
  const { localizedPush } = useLocalizedRouter();
  const { fetchSearchResults } = useDaytoursStore();

  const scrollContainerRef = useRef(null);

  const [topDayTours, setTopDayTours] = useState([]);
  const [isLoadingDay, setIsLoadingDay] = useState(true);
  const [loadingTourId, setLoadingTourId] = useState(null);

  const benefits = t("transferBenefits.benefits", { returnObjects: true }) || [];
  const [current, setCurrent] = useState(0);

  /* Auto change text every 4 sec */
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  /* Load top day tours */
  useEffect(() => {
    const loadDayTours = async () => {
      setIsLoadingDay(true);
      try {
        const results = await fetchSearchResults({
          category_id: 3,
          is_b2c_only: 1,
          is_active: 1,
        });

        if (results?.length) {
          setTopDayTours(results.slice(0, 6));
        }
      } catch (err) {
        console.error("Error loading day tours:", err);
      } finally {
        setIsLoadingDay(false);
      }
    };

    loadDayTours();
  }, [fetchSearchResults]);

  const handleCardClick = (tour) => {
    setLoadingTourId(tour.id);
    localizedPush(`/day-tours/detail/${tour.id}`);
  };

  const scroll = (dir) => {
    if (!scrollContainerRef.current) return;
    const amount = scrollContainerRef.current.offsetWidth * 0.8;
    scrollContainerRef.current.scrollBy({
      left: dir === "left" ? -amount : amount,
      behavior: "smooth",
    });
  };

  return (
    <section className="w-full py-12 md:py-16">
      <div className="container relative  min-w-full px-3 md:px-8 lg:px-12">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
              Top Day Tours
            </h2>
            <p className="text-[#D3202D] font-semibold text-sm md:text-base tracking-wide">
              EXPLORE OUR HAND-PICKED SELECTION OF TOP-RATED DAY TOURS.
            </p>
          </div>
          
          {/* Navigation Arrows */}
          <div className="hidden md:flex gap-2 mt-4 md:mt-0">
            <button
              onClick={() => scroll("left")}
              className="p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 bg-[#D3202D] rounded-full text-white hover:bg-red-700 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoadingDay ? (
          <p className="text-center text-gray-600">Loading top day tours...</p>
        ) : (
          <div className="relative">
            {/* Scrollable Container */}
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide pb-4"
            >
              {topDayTours.map((tour) => (
                <div
                  key={tour.id}
                 
                  className="flex-shrink-0 w-full md:w-96 cursor-pointer snap-start group"
                >
                  {/* Card Container */}
                  <div className=" rounded-2xl h-[426px] md:h-[446px] lg:w-[380px] ">
                    
                    {/* Image Container */}
                    <div className="relative h-56 md:h-64 overflow-hidden">
                      <img
                        src={
                          `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${tour.image}` ||
                          "/placeholder.jpg"
                        }
                        alt={tour.product_title}
                        className="w-full h-full object-cover rounded-xl"
                      />
                      
                      {/* Rating Badge */}
                      <div className="absolute top-3 right-3 bg-black/20 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-white text-sm">5.0</span>
                      </div>
                    </div>

                    {/* Content */}
                    <div className="py-4">
                      {/* Title */}
                      <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-1 line-clamp-1">
                        {tour.product_title}
                      </h3>
                      
                      {/* Subtitle */}
                      <p className="text-gray-600 text-sm mb-3">
                        ({tour.category_name})
                      </p>

                      {/* Description */}
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {tour.short_desc || "Explore amazing experiences!"}
                      </p>

                      {/* Footer */}
                      <div className="flex items-center bg-[#F7F7F780] rounded-xl py-3 px-1 justify-between">
                        <p className="text-2xl font-bold text-gray-900">
                         <span className="">{tour?.currency}</span> {tour?.starting_price} 
                        </p>
                        <button
                          onClick={() => handleCardClick(tour)}
                          className="bg-[#D3202D] hover:bg-red-700 text-white font-semibold py-2 px-2 rounded-lg transition-colors text-sm w-[120px] flex justify-center items-center"
                          disabled={loadingTourId === tour.id}
                        >
                          {loadingTourId === tour.id ? (
                            <LoaderSvg />
                          ) : (
                            "See More"
                          )}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation Arrows for Small Screens (Bottom Center) */}
        <div className="flex justify-center gap-2 mt-0 md:hidden">
          <button
            onClick={() => scroll("left")}
            className="p-2 bg-gray-300 rounded-full text-gray-700 hover:bg-gray-400 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll("right")}
            className="p-2 bg-[#D3202D] rounded-full text-white hover:bg-red-700 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}