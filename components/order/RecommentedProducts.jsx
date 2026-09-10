"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import { useTranslation } from "next-i18next";
import { useLocalizedRouter } from "@/components/localizedRouter";
import useLanguageStore from "@/store/useLanguageStore";
import SvgLoader2 from "@/components/common/Loader2Svg";
import { getCurrencyRate } from "@/utils/getIP";
import formatPrice from "@/lib/formatPrice";
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

export default function RecommendedProducts({ customColor }) {
  const { t } = useTranslation(["order", "common"]);
  const scrollRef = useRef(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingCardId, setLoadingCardId] = useState(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [currencyData, setCurrencyData] = useState(null);
  const { localizedReplace } = useLocalizedRouter();

  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const match = priceStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(match) || 0;
  };

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { languageId } = useLanguageStore.getState();
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/recommendedProducts/${languageId || 1}`
        );
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

  // Fetch currency rates
  // useEffect(() => {
  //   const fetchRate = async () => {
  //     try {
  //       const rate = await getCurrencyRate();
  //       if (rate && rate.exchange_rate !== 1) {
  //         setCurrencyData(rate);
  //       }
  //     } catch (err) {
  //       console.error("Error fetching currency rate:", err);
  //     }
  //   };
  //   fetchRate();
  // }, []);

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
    <section  style={{ backgroundColor: customColor }}  className="relative w-full py-4 md:py-8 bg-surface-muted">
      {/* Loader Overlay */}
      {loading && (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-surface-muted/80 pointer-events-none">
          <SvgLoader2 />
        </div>
      )}

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header with arrows */}
        <div className="flex items-center justify-between mb-6 md:mb-10">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-primary">
            {t("recommended_products")}
          </h2>

          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border border-border transition ${
                canScrollLeft
                  ? "hover:bg-primary hover:text-primary-foreground text-foreground"
                  : "opacity-40 cursor-not-allowed text-muted-foreground"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border border-border transition ${
                canScrollRight
                  ? "hover:bg-primary hover:text-primary-foreground text-foreground"
                  : "opacity-40 cursor-not-allowed text-muted-foreground"
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
                className="flex flex-col flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] bg-surface rounded-xl shadow-sm hover:shadow-md transition-all border border-border overflow-hidden relative"
              >
                {loadingCardId === item.id && (
                  <div className="absolute inset-0 z-20 flex justify-center items-center bg-surface/80 rounded-xl">
                    <SvgLoader2 />
                  </div>
                )}
                <div className="relative w-full h-36 sm:h-40 md:h-44 rounded-t-xl overflow-hidden">
                  <Image
                    src={getFullImageUrl(item.image) ||(item.image)|| "/placeholder.svg"}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-foreground font-medium text-xs sm:text-sm line-clamp-2 mb-1.5 h-9 sm:h-10">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-500 line-clamp-2 mb-2">
                    {item.short_desc}
                  </p>
                   <div className="flex items-center justify-between mt-auto">
                    <div className="flex flex-col text-left">
                      <span className="font-semibold text-[#CC9A55] text-xs sm:text-sm">
                        {item.starting_price} {item?.currency}
                      </span>
                      {currencyData && currencyData.exchange_rate !== 1 && (
                        <span className="text-[10px] text-gray-500 font-medium">
                          Est. {formatPrice(displayPrice * currencyData.exchange_rate)} {currencyData.currency}
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => goToDetail(item)}
                      disabled={loadingCardId}
                      className="bg-[#CC9A55] hover:bg-[#b88a45] text-white px-2.5 md:py-2 py-1 rounded-md text-[11px] sm:text-xs font-medium transition disabled:opacity-70 disabled:cursor-not-allowed"
                    >
                      {loadingCardId === item.id
                        ? t("loading", "Loading...")
                        : t("view_details")}
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
