"use client";

import { useTranslation } from "next-i18next";
import { useState, useEffect, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
    <section className="w-full py-6 md:py-12 bg-[#D0E9FF] text-[#D3202D]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        

        {isLoadingDay ? (
          <p className="text-center text-[#D3202D]">Loading top day tours...</p>
        ) : (
          <>
          <div className="text-center mb-p">
          <h2 className="font-bold tracking-tighter text-md md:text-xl">
            Top Day Tours
          </h2>
          <p className="mt-2 max-w-2xl mb-1 text-sm md:text-md mx-auto">
            Explore our hand-picked selection of top-rated day tours.
          </p>
        </div>
          <div className="relative">
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-4 snap-x snap-mandatory scrollbar-hide pb-1"
            >
              {topDayTours.map((tour) => (
                <Card
                  key={tour.id}
                  onClick={() => handleCardClick(tour)}
                  className="flex-shrink-0 w-80 bg-[#233BA0] border border-gray-700 rounded-xl cursor-pointer snap-start"
                >
                  <CardHeader className="p-0">
                    <img
                      src={
                        `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${tour.image}` ||
                        "/placeholder.jpg"
                      }
                      alt={tour.product_title}
                      className="w-full h-48 object-cover rounded-t-xl"
                    />
                  </CardHeader>

                  <CardContent className="p-2">
                    <CardTitle className="text-sm lg:text-md mb-2 font-normal line-clamp-2 text-white transition-colors">
                      {tour.product_title}
                    </CardTitle>
<div className="flex justify-between text-white font-semibold">
  <p className="">{tour?.starting_price} SGD</p>
<p>{tour?.category_name}</p>
</div>
                    {/* <CardDescription className="text-sm text-white line-clamp-3">
                      {tour.short_desc || "Explore amazing experiences!"}
                    </CardDescription> */}
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* LEFT ARROW */}
            <button
              onClick={() => scroll("left")}
              className="absolute top-1/2 left-0 -translate-y-1/2 p-2 bg-black/60 rounded-full text-white hover:bg-[#D3202D] hover:text-black transition-all"
            >
              <ChevronLeft size={24} />
            </button>

            {/* RIGHT ARROW */}
            <button
              onClick={() => scroll("right")}
              className="absolute top-1/2 right-0 -translate-y-1/2 p-2 bg-black/60 rounded-full text-white hover:bg-[#D3202D] hover:text-black transition-all"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          </>
        )}
      </div>
    </section>
  );
}
