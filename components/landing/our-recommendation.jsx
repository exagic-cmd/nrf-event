"use client";

import LoaderSvg from "@/components/common/LoaderSvg";
import { useTranslation } from "next-i18next";
import { useState, useEffect, useRef, useTransition } from "react";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useEventStore } from "@/store/useEventStore";

export function OurRecommendation({ layout = 1
  
 }) {
  const { t } = useTranslation("common");
  const { localizedPush } = useLocalizedRouter();
  const { fetchSearchResults, searchResults } = useDaytoursStore();
  const { event } = useEventStore();

  const scrollContainerRef = useRef(null);
  const carousel3Ref = useRef(null);

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

  const hasFetchedToursRef = useRef(false);
  /* Sync with searchResults from store (e.g. when currency refetches) */
  useEffect(() => {
    if (searchResults?.length) {
      setTopDayTours(searchResults.slice(0, 6));
    }
  }, [searchResults]);

  /* Load top day tours dynamically from recommended_products if available, otherwise fetch from API */
  useEffect(() => {
    if (event?.event?.recommended_products?.length) {
      const mappedTours = event.event.recommended_products.map((tour) => ({
        id: tour.id,
        product_title: tour.title,
        category_name: tour.category_name || "Day Tours",
        image: tour.image,
        short_desc: tour.short_description || tour.short_desc,
        currency: tour.currency || "SGD",
        starting_price: tour.starting_price,
        rating: tour.rating || 5.0,
      }));
      setTopDayTours(mappedTours);
      setIsLoadingDay(false);
    } else {
      if (hasFetchedToursRef.current) return;
      hasFetchedToursRef.current = true;

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
          hasFetchedToursRef.current = false; // allow retry on error
          console.error("Error loading day tours:", err);
        } finally {
          setIsLoadingDay(false);
        }
      };

      loadDayTours();
    }
  }, [event, fetchSearchResults]);

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


  const [carouselIndex, setCarouselIndex] = useState(2);
  const activeCarouselIndex = topDayTours.length > 2 ? carouselIndex : Math.max(0, topDayTours.length - 1);

  useEffect(() => {
    if (topDayTours.length < 2 || !carousel3Ref.current) return;

    const carousel = carousel3Ref.current;
    const thirdProduct = carousel.children[2];
    if (!thirdProduct) return;

    carousel.scrollLeft = thirdProduct.offsetLeft - (carousel.offsetWidth - thirdProduct.offsetWidth) / 2;
  }, [topDayTours.length]);

    // LAYOUT 1 
  if (layout === 1) {
    return (
      <section className="w-full py-12 md:py-16">
        <div className="container relative  min-w-full px-3 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
                Top Day Tours
              </h2>
              <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
                EXPLORE OUR HAND-PICKED SELECTION OF TOP-RATED DAY TOURS.
              </p>
            </div>

            <div className="hidden md:flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => scroll("left")}
                className="p-2 bg-secondary rounded-full text-muted-foreground hover:bg-secondary transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary-hover transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {isLoadingDay ? (
            <p className="text-center text-muted-foreground">Loading top day tours...</p>
          ) : (
            <div className="relative">
              <div
                ref={scrollContainerRef}
                className="flex overflow-x-auto gap-6 snap-x snap-mandatory scrollbar-hide pb-8"
              >
                {topDayTours.map((tour) => (
                  <div
                    key={tour.id}
                    className="flex-shrink-0 w-full md:w-96 snap-start group"
                  >
                    <div className=" rounded-2xl h-[426px] md:h-[446px] lg:w-[380px] ">
                      <div className="relative h-56 md:h-64 overflow-hidden">
                        <img
                          src={`${tour.image}` || "/placeholder.jpg"}
                          alt={tour.product_title}
                          className="w-full h-full object-cover rounded-xl"
                        />
                        <div className="absolute top-3 right-3 bg-black/20 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                          <Star size={16} className="text-yellow-400 fill-yellow-400" />
                          <span className="font-semibold text-white text-sm">5.0</span>
                        </div>
                      </div>

                      <div className="py-4">
                        <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-1">
                          {tour.product_title}
                        </h3>
                        <p className="text-muted-foreground text-sm mb-3">
                          ({tour.category_name})
                        </p>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {tour.short_desc || "Explore amazing experiences!"}
                        </p>
                        <div className="flex items-center md:bg-surface bg-foreground/20 rounded-xl py-3 px-1 justify-between">
                          <p className="text-2xl font-bold text-foreground">
                            <span className="">{tour?.currency}</span> {tour?.starting_price}
                          </p>
                          <button
                            onClick={() => handleCardClick(tour)}
                            className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-2 px-2 rounded-lg transition-colors text-sm w-[120px] flex justify-center items-center"
                            disabled={loadingTourId === tour.id}
                          >
                            {loadingTourId === tour.id ? <LoaderSvg /> : "See More"}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex justify-center gap-2 mt-0 md:hidden">
            <button
              onClick={() => scroll("left")}
              className="p-2 bg-secondary rounded-full text-muted-foreground hover:bg-secondary transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary-hover transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    );
  }


    //LAYOUT 2 
  if (layout === 2) {
    return (
      <section className="w-full py-12 md:py-16">
        <div className="px-4 md:px-8 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
                EXPLORE OUR HAND-PICKED SELECTION OF TOP-RATED DAY TOURS.
              </p>
              <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
                Top Day Tours
              </h2>
            </div>

            <div className="hidden md:flex gap-2 mt-4 md:mt-0">
              <button
                onClick={() => scroll("left")}
                className="p-2 bg-secondary rounded-full text-muted-foreground hover:bg-secondary transition-all"
              >
                <ChevronLeft size={20} />
              </button>
              <button
                onClick={() => scroll("right")}
                className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary-hover transition-all"
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>

          {isLoadingDay ? (
            <p className="text-center text-muted-foreground">Loading top day tours...</p>
          ) : (
            <div
              ref={scrollContainerRef}
              className="flex overflow-x-auto gap-5 snap-x snap-mandatory scrollbar-hide pb-8"
            >
              {topDayTours.map((tour) => (
                <div
                  key={tour.id}
                  className="flex-shrink-0 w-[80%] sm:w-[47%] md:w-[calc(33.333%-14px)] lg:w-[calc(25%-15px)] snap-start"
                >
                  <div className="rounded-2xl overflow-hidden h-full flex flex-col bg-surface shadow-sm hover:shadow-md transition-shadow">
                    <div className="relative h-44 md:h-48">
                      <img
                        src={`${tour.image}` || "/placeholder.jpg"}
                        alt={tour.product_title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-primary-foreground px-2.5 py-1 rounded-full flex items-center gap-1">
                        <Star size={13} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-foreground text-xs">5.0</span>
                      </div>
                    </div>

                    <div className="p-4 flex flex-col flex-1">
                      <h3 className="text-base font-bold text-foreground line-clamp-1">
                        {tour.product_title}
                      </h3>
                      <p className="text-muted-foreground text-xs mt-0.5">
                        {tour.category_name}
                      </p>
                      <p className="text-muted-foreground text-sm mt-2 line-clamp-2 flex-1">
                        {tour.short_desc || "Explore amazing experiences!"}
                      </p>

                      <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50">
                        <p className="text-lg font-bold text-foreground">
                          {tour?.currency} {tour?.starting_price}
                        </p>
                        <button
                          onClick={() => handleCardClick(tour)}
                          className="border border-primary text-primary hover:bg-primary hover:text-primary-foreground font-semibold py-1.5 px-3 rounded-lg transition-colors text-sm flex justify-center items-center min-w-[90px]"
                          disabled={loadingTourId === tour.id}
                        >
                          {loadingTourId === tour.id ? <LoaderSvg /> : "See More"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          <div className="flex justify-center gap-2 mt-0 md:hidden">
            <button
              onClick={() => scroll("left")}
              className="p-2 bg-secondary rounded-full text-muted-foreground hover:bg-secondary transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary-hover transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </section>
    );
  }

  const scrollCarousel3ToIndex = (i) => {
    const el = carousel3Ref.current;
    if (!el || !el.children.length || !topDayTours.length) return;
    const clamped = ((i % topDayTours.length) + topDayTours.length) % topDayTours.length;
    const card = el.children[clamped];
    if (card) {
      el.scrollTo({
        left: card.offsetLeft - (el.offsetWidth - card.offsetWidth) / 2,
        behavior: "smooth",
      });
    }
    setCarouselIndex(clamped);
  };

  const handleCarousel3Scroll = () => {
    const el = carousel3Ref.current;
    if (!el || !el.children.length) return;
    const center = el.scrollLeft + el.offsetWidth / 2;
    let closest = 0;
    let closestDist = Infinity;
    Array.from(el.children).forEach((child, i) => {
      const childCenter = child.offsetLeft + child.offsetWidth / 2;
      const dist = Math.abs(childCenter - center);
      if (dist < closestDist) {
        closestDist = dist;
        closest = i;
      }
    });
    setCarouselIndex(closest);
  };


  //   LAYOUT 3  
  return (
    <section className="w-full py-12 md:py-16">
      <div className="px-4 md:px-8 lg:px-12">
        <div className="text-center mb-8">
          <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
            EXPLORE OUR HAND-PICKED SELECTION OF TOP-RATED DAY TOURS.
          </p>
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mt-2">
            Top Day Tours
          </h2>
        </div>

        {isLoadingDay ? (
          <p className="text-center text-muted-foreground">Loading top day tours...</p>
        ) : (
          <div className="relative">
            <div
              ref={carousel3Ref}
              onScroll={handleCarousel3Scroll}
              className="flex overflow-x-auto gap-5 snap-x snap-mandatory scrollbar-hide px-[10%] sm:px-[20%] md:px-[26%]"
            >
              {topDayTours.map((tour, i) => (
                <div
                  key={tour.id}
                  className={`flex-shrink-0 w-[80%] sm:w-[60%] md:w-[48%] snap-center transition-all duration-300 ${
                    i === activeCarouselIndex ? "opacity-100 scale-100" : "opacity-40 scale-[0.92]"
                  }`}
                >
                  <div className="rounded-2xl overflow-hidden bg-surface shadow-lg">
                    <div className="relative h-56 md:h-64">
                      <img
                        src={`${tour.image}` || "/placeholder.jpg"}
                        alt={tour.product_title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-3 right-3 bg-black/20 px-3 py-1.5 rounded-full flex items-center gap-1 shadow-md">
                        <Star size={16} className="text-yellow-400 fill-yellow-400" />
                        <span className="font-semibold text-white text-sm">5.0</span>
                      </div>
                    </div>

                    <div className="py-4 px-4">
                      <h3 className="text-lg md:text-xl font-bold text-foreground mb-1 line-clamp-1">
                        {tour.product_title}
                      </h3>
                      <p className="text-muted-foreground text-sm mb-3">
                        ({tour.category_name})
                      </p>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {tour.short_desc || "Explore amazing experiences!"}
                      </p>
                      <div className="flex items-center bg-foreground/5 rounded-xl py-3 px-3 justify-between">
                        <p className="text-2xl font-bold text-foreground">
                          <span className="">{tour?.currency}</span> {tour?.starting_price}
                        </p>
                        <button
                          onClick={() => handleCardClick(tour)}
                          className="bg-primary hover:bg-primary-hover text-primary-foreground font-semibold py-2 px-2 rounded-lg transition-colors text-sm w-[120px] flex justify-center items-center"
                          disabled={loadingTourId === tour.id}
                        >
                          {loadingTourId === tour.id ? <LoaderSvg /> : "See More"}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Floating arrows overlaid on the track */}
            <button
              onClick={() => scrollCarousel3ToIndex(activeCarouselIndex - 1)}
              className="hidden sm:flex absolute left-0 md:left-4 top-1/2 -translate-y-1/2 p-2.5 bg-surface shadow-md rounded-full text-muted-foreground hover:bg-secondary transition-all z-10"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollCarousel3ToIndex(activeCarouselIndex + 1)}
              className="hidden sm:flex absolute right-0 md:right-4 top-1/2 -translate-y-1/2 p-2.5 bg-primary shadow-md rounded-full text-primary-foreground hover:bg-primary-hover transition-all z-10"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}

        {/* Bubble indicators */}
        {!isLoadingDay && topDayTours.length > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {topDayTours.map((tour, i) => (
              <button
                key={tour.id}
                onClick={() => scrollCarousel3ToIndex(i)}
                aria-label={`Go to tour ${i + 1}`}
                className={`h-2.5 rounded-full transition-all ${
                    i === activeCarouselIndex ? "w-6 bg-primary" : "w-2.5 bg-secondary"
                }`}
              />
            ))}
          </div>
        )}

        {/* Mobile arrows */}
        {!isLoadingDay && (
          <div className="flex justify-center gap-2 mt-4 sm:hidden">
            <button
              onClick={() => scrollCarousel3ToIndex(activeCarouselIndex - 1)}
              className="p-2 bg-secondary rounded-full text-muted-foreground hover:bg-secondary transition-all"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scrollCarousel3ToIndex(activeCarouselIndex + 1)}
              className="p-2 bg-primary rounded-full text-primary-foreground hover:bg-primary-hover transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        )}
      </div>
    </section>
  );
}