"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import { useTranslation } from "next-i18next";
import { useLocalizedRouter } from "@/components/localizedRouter";
import SvgLoader2 from "@/components/common/Loader2Svg";

const slugify = (text) => {
  if (!text) return "";
  return encodeURIComponent(
    text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "")
  );
};

export default function RecommendedProducts() {
  const { t } = useTranslation("common");
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCardId, setLoadingCardId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const { localizedReplace } = useLocalizedRouter();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/recommendedProducts`);
        const data = await res.json();
        setProducts(data?.data?.products || []);
      } catch (err) {
        console.error("Error fetching recommended products:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Scroll checking
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
    window.addEventListener("resize", checkScroll); // responsive
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [products]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]");
    if (!card) return;
    const style = window.getComputedStyle(card);
    const gap = parseInt(style.marginRight) || 16; // account for gap
    const cardWidth = card.offsetWidth + gap;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const goToDetail = (item) => {
    setLoadingCardId(item.id);
     sessionStorage.removeItem("fromOrder");
    localizedReplace(`/day-tours/${slugify(item.title)}/${item.id}`);
  };

  return (
    <section className="relative w-full py-2 md:py-4 bg-[#D0E9FF]">
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-[#D0E9FF] pointer-events-none">
          <SvgLoader2 />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-[#D3202D]">
            {t("recommended_products", "Recommended Products")}
          </h2>

          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border border-gray-600 transition ${
                canScrollLeft
                  ? "hover:bg-gray-800 text-black"
                  : "opacity-40 cursor-not-allowed text-gray-500"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border border-gray-600 transition ${
                canScrollRight
                  ? "hover:bg-gray-800 text-black"
                  : "opacity-40 cursor-not-allowed text-gray-500"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        {/* Product Cards */}
        {!loading && products.length > 0 ? (
          <div
            ref={scrollRef}
            className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2"
          >
            {products.map((item) => (
              <div
                key={item.id}
                data-card
                className="flex flex-col flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all border border-gray-100 overflow-hidden relative"
              >
                {loadingCardId === item.id && (
                  <div className="absolute inset-0 z-20 flex justify-center items-center bg-white/80 rounded-xl">
                    <SvgLoader2 />
                  </div>
                )}
                <div className="relative w-full h-36 sm:h-40 md:h-44 rounded-t-xl overflow-hidden">
                  <Image
                    src={getFullImageUrl(item.image)}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-black font-medium text-xs sm:text-sm line-clamp-2 mb-1.5 h-9 sm:h-10">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-2">
                    {item.short_desc}
                  </p>
                  <div className="flex items-center justify-between mt-auto">
                    <span className="font-semibold text-[#D3202D] text-xs sm:text-sm">
                      {item.starting_price} SGD
                    </span>
                    <button
                      onClick={() => goToDetail(item)}
                      disabled={loadingCardId}
                      className="bg-[#D3202D]  text-white px-2.5 md:py-2 py-1 rounded-md text-[11px] sm:text-xs font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loadingCardId === item.id
                        ? t("loading", "Loading...")
                        : t("view_details", "View Details")}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          !loading && (
            <div className="py-12 text-center text-gray-500">
              {t("no_products", "No Recommended Products Found")}
            </div>
          )
        )}
      </div>
    </section>
  );
}
