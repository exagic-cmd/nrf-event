"use client";

import Image from "next/image";
import { useTranslation } from "next-i18next";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useRef, useState, useEffect } from "react";
import { useUpsellStore } from "@/store/useUpsellStore";
import { useRouter } from "next/router";
import { getFullImageUrl } from "@/utils/imageService";
import { slugify } from "@/utils/slugify";
export default function EssentialsSection() {
  const { t } = useTranslation("common");
  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const router = useRouter();
  const { upsellProducts, fetchUpsellProducts, isLoading } = useUpsellStore();


  useEffect(() => {
    fetchUpsellProducts();
  }, []);

  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    return () => el.removeEventListener("scroll", checkScroll);
  }, [upsellProducts]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("div > div");
    if (!card) return;
    const cardWidth = card.offsetWidth + 24; // account for gap
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };


  const goToDetail = (item) => {
    const slug = slugify(item.category_name || 'essentials');
    router.push(`/${slug}/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full py-12 bg-black text-white flex justify-center">
        Loading...
      </div>
    );
  }

  return (
    <section className="w-full py-12 md:py-24 bg-black text-[#CC9A55]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-12">
          <div></div>
          <div className="space-y-2 text-center md:text-center">
            <h2 className="font-bold tracking-tighter text-3xl md:text-4xl text-white">
              {t("essentials.title", "Travel Essentials")}
            </h2>
            <p className="max-w-[900px] text-white md:text-xl/relaxed text-md/relaxed">
              {t(
                "essentials.subtitle",
                "Add these essentials to make your airport transfer experience smoother."
              )}
            </p>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border border-[#CC9A55] transition ${
                canScrollLeft
                  ? "hover:bg-brand-secondary hover:text-surface-foreground text-[#CC9A55]"
                  : "opacity-40 cursor-not-allowed text-[#CC9A55]"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border border-[#CC9A55] transition ${
                canScrollRight
                  ? "hover:bg-brand-secondary hover:text-surface-foreground text-[#CC9A55]"
                  : "opacity-40 cursor-not-allowed text-[#CC9A55]"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Cards Layout */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto scroll-smooth scrollbar-hide"
        >
          {Array.isArray(upsellProducts) &&
            upsellProducts.map((item) => (
              <div
                key={item.id}
                className="bg-brand-secondary text-white p-6 rounded-lg flex flex-col min-h-[360px] max-h-[360px] w-[300px] flex-shrink-0"
              >
                {/* Fixed Image Area */}
                <div className="relative w-full h-64 mb-4 rounded-md overflow-hidden">
                  <Image
                    src={getFullImageUrl(item.image)}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <h3 className="font-bold text-lg line-clamp-2 h-24">
                  {item.title}
                </h3>
             <div className="h-12">
                <p className="text-sm text-white/90 line-clamp-2 mb-1">
  {item.description || item.category_name}
</p>
             </div>
               <div className="mt-auto flex justify-between items-center pt-2">
                 <span className="font-bold text-lg text-white">
                    {item.starting_price} SGD
                 </span>
                 <button
                  onClick={() => goToDetail(item)}
                  className="bg-black text-white px-4 py-2 rounded-md transition"
                >
                  View Details
                </button>
               </div>
              </div>
            ))}
        </div>
      </div>
    </section>
  );
}
