"use client";
import { useState, useEffect, useRef } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { getFullImageUrl } from "@/utils/imageService";
import { apiRequest } from "@/lib/clientApi";
import { useRouter } from "next/router";
import LoaderSvg from "@/components/common/LoaderSvg";
import { ChevronLeft, ChevronRight, X, ChevronDown } from "lucide-react"; // ⬅️ added ChevronDown
import Image from "next/image";
import { useTranslation } from "next-i18next";
import useCurrencyStore from "@/store/useCurrencyStore";

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

export default function SuggestionsSection({
  currentProduct,
  currentProductId,
  relatedProducts,
  customColor,
  isNavigating,
  onNavigateToProduct,
}) {
  const { t } = useTranslation("common");
  const { localizedReplace } = useLocalizedRouter();
  const router = useRouter();

  const [selectedRelatedProduct, setSelectedRelatedProduct] = useState(null);
  const [currentProductDetails, setCurrentProductDetails] = useState(null);
  const [comparedProductDetails, setComparedProductDetails] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isModalLoading, setIsModalLoading] = useState(false);
  const [navigatingTo, setNavigatingTo] = useState(null);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false); // ⬅️ new
  const [allProductIds, setAllProductIds] = useState([]); // ⬅️ new

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const languageMap = { en: 1, es: 6, ja: 5 };
  const locale = router.locale || "en";
  const languageId = languageMap[locale] || 1;

  useEffect(() => {
    if (relatedProducts?.length) {
      const ids = relatedProducts.map((p) => p.product_id);
      setAllProductIds(ids);
    }
  }, [relatedProducts]);

  useEffect(() => {
    if (currentProduct?.basicinfo) {
      setCurrentProductDetails(currentProduct.basicinfo);
    } else if (currentProduct) {
      setCurrentProductDetails(currentProduct);
    }
  }, [currentProduct]);

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
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [relatedProducts]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]");
    if (!card) return;
    const style = window.getComputedStyle(card);
    const gap = parseInt(style.marginRight) || 16;
    const cardWidth = card.offsetWidth + gap;
    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  const handleCompare = async (product) => {
    if (!product?.productId) return;
    setSelectedRelatedProduct(product);
    setIsModalOpen(true);
    setIsModalLoading(true);
    setComparedProductDetails(null);

    try {
      const currencyId =
        useCurrencyStore.getState()?.currencyId ||
        (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
        2;
      const productData = await apiRequest({
        endpoint: `product/${product.productId}/${languageId}?currency_id=${currencyId}`,
        method: "GET",
      });
      if (productData?.data?.basicinfo) {
        setComparedProductDetails(productData.data.basicinfo);
      } else {
        console.error("Failed to fetch valid product details:", productData);
        setComparedProductDetails(null);
      }
    } catch (error) {
      console.error("Failed to fetch product details:", error);
      setComparedProductDetails(null);
    } finally {
      setIsModalLoading(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedRelatedProduct(null);
    setComparedProductDetails(null);
    setIsDropdownOpen(false);
  };

  const handleBookNow = (product, productId) => {
    const title = product?.product_description?.title;
    if (!title || !productId) return;
    onNavigateToProduct();
    const slug = slugify(title);
    sessionStorage.removeItem("fromOrder");
    localizedReplace(`/day-tours/${slug}/${productId}`);
    closeModal();
  };

  if (!relatedProducts || relatedProducts.length === 0) {
    return null;
  }

  const products = relatedProducts.map((p) => ({
    productId: p.product_id,
    name: p.Title,
    price: p.Starting_price,
    image: p.image,
    duration: p.duration,
    description: p.Description,
    currency_name: p.currency_name,
  }));

  const ProductDetails = ({ product, productId, isLoading }) => {
    if (isLoading) {
      return (
        <div className="flex-1 p-4 bg-surface rounded-lg animate-pulse">
          <div className="w-full h-48 bg-muted rounded mb-4"></div>
          <div className="h-6 bg-muted rounded w-3/4 mb-2"></div>
          <div className="h-4 bg-muted rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-full"></div>
            <div className="h-4 bg-muted rounded w-5/6"></div>
          </div>
          <div className="h-10 bg-muted rounded w-full mt-6"></div>
        </div>
      );
    }

    if (!product) {
      return (
        <div className="flex-1 flex items-center justify-center text-foreground p-4 bg-surface-muted rounded-lg">
          {t("details_not_available", "Product details not available.")}
        </div>
      );
    }

    const title = product.product_description?.title || t("no_title", "No title available");
    const imageUrl =
      product.images?.length > 0
        ? getFullImageUrl(product.images[0].image)
        : "/placeholder.jpg";
    const highlights = product.product_description?.highlights || [];
    const inclusion = product.product_description?.inclusion || "";
    const exclusion = product.product_description?.exclusion || "";

    return (
      <div className="flex-1 border border-border bg-surface p-2 md:p-4 text-left rounded-lg flex flex-col">
        <div className="relative w-full h-48 rounded overflow-hidden mb-4">
          <Image src={imageUrl} alt={title} fill className="object-cover" />
        </div>
        <h3 className="font-semibold text-sm lg:text-xl mb-2 text-surface-foreground">{title}</h3>
        <p className="text-foreground mb-2  text-xs md:text-lg">
          {t("starts_from", "Starts from")}{" "}
          <span className="font-bold  text-xs md:text-lg text-surface-foreground">
            {product.starting_price || "N/A"} {product.currency}
          </span>
        </p>
        <p className="text-foreground  text-xs md:text-lg mb-4">
          {t("type", "Type")}: {product.tourtype || "N/A"}
        </p>
        <div className="text-left mt-2 text-[12px] md:text-lg text-foreground flex-grow overflow-y-auto pr-2">
          <h4 className="font-bold mb-2  text-md md:text-xl text-primary">{t("highlights", "Highlights")}:</h4>
          <ul className="list-disc list-inside mb-4 space-y-1">
            {highlights.length > 0 ? (
              highlights.map((highlight, index) => <li key={index}>{highlight}</li>)
            ) : (
              <li>{t("no_highlights", "No highlights available.")}</li>
            )}
          </ul>
          <h4 className="font-bold mb-2  text-md md:text-xl text-primary">{t("inclusions", "Inclusions")}:</h4>
          {inclusion ? (
            <div
              className=" text-[12px] text-foreground md:text-lg prose prose-sm prose-invert mb-4"
              dangerouslySetInnerHTML={{ __html: inclusion }}
            />
          ) : (
            <p className="mb-4">{t("no_inclusions", "No inclusion information available.")}</p>
          )}
          <h4 className="font-bold mb-2  text-md md:text-xl text-primary">{t("exclusions", "Exclusions")}:</h4>
          {exclusion ? (
            <div
              className=" text-[12px] text-foreground  md:text-lg prose prose-sm prose-invert"
              dangerouslySetInnerHTML={{ __html: exclusion }}
            />
          ) : (
            <p>{t("no_exclusions", "No exclusion information available.")}</p>
          )}
        </div>
        <button
          className="bg-primary text-white px-4 py-2 rounded w-full transition-colors mt-6 text-md md:text-xl flex items-center justify-center disabled:opacity-70"
          onClick={() => handleBookNow(product, productId)}
          disabled={navigatingTo === productId}
        >
          {navigatingTo === productId ? (
            <>
              <LoaderSvg className="w-5 h-5 mr-2" />
              {t("loading", "Loading...")}
            </>
          ) : (
            t("book_now", "Book Now")
          )}
        </button>
      </div>
    );
  };

  return (
    <div style={{ backgroundColor: customColor }} className="relative w-full bg-surface-muted">
      <div className="container px-12 relative z-10">
        <div className="flex items-center justify-between mb-3 md:mb-6">
          <h2 className=" text-md md:text-xl  font-semibold text-text">
            {t("you_might_also_like", "You might also like")}
          </h2>
          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border border-border transition ${canScrollLeft ? "hover:bg-secondary text-white" : "opacity-40 cursor-not-allowed text-muted-foreground"}`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border border-border transition ${canScrollRight ? "hover:bg-secondary text-white" : "opacity-40 cursor-not-allowed text-muted-foreground"}`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-4"
        >
          {products.map((product) => (
            <div
              key={product.productId}
              data-card
              className="flex flex-col flex-shrink-0 w-[200px]  md:w-[240px] bg-surface/5 rounded-xl shadow-lg hover:shadow-2xl transition-all border border-white/10 overflow-hidden group backdrop-blur-sm"
            >
              <div className="relative w-full h-40 sm:h-44 rounded-t-xl overflow-hidden">
                <Image
                  src={getFullImageUrl(product.image)}
                  alt={product.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>
              <div className="p-3 flex flex-col flex-grow">
                <h3 className="text-surface-foreground font-medium text-sm line-clamp-2 mb-2 h-10">
                  {product.name}
                </h3>
                <p className="text-xs text-foreground line-clamp-2 mb-3 flex-grow">
                  {product.description}
                </p>
                <div className="flex items-center justify-between mt-auto">
                  <span className="font-bold text-base text-primary">
                    {product.price} {product.currency_name}
                  </span>
                  <button
                    onClick={() => handleCompare(product)}
                    className="bg-primary text-white px-3 py-1.5 rounded-md text-xs font-medium transition"
                  >
                    {t("compare", "Compare")}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-2 backdrop-blur-md">
          <div className="bg-surface-muted border border-border text-surface-foreground md:p-6 p-2 rounded-2xl max-w-6xl w-full relative overflow-y-auto max-h-[95vh] shadow-2xl">
            <button
              className="absolute top-4 right-4 text-gray-black hover:text-red-500 transition-colors z-10"
              onClick={closeModal}
            >
              <X size={24} />
            </button>
            <h2 className="text-xl md:text-3xl font-semibold mb-4 text-center text-surface-foreground">
              {t("compare_products", "Compare Products")}
            </h2>
            <div className="flex justify-end mb-4 relative">
              <button
                onClick={() => setIsDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 bg-secondary hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm md:text-base transition"
              >
                {t("compare_to", "Compare to")}:{" "}
                {selectedRelatedProduct?.name || "Select"} <ChevronDown size={18} />
              </button>

              {isDropdownOpen && (
                <div className="absolute right-0 mt-2 bg-surface border border-border rounded-md shadow-lg z-20 w-48 max-h-60 overflow-y-auto">
                  {products
                    .filter((p) => p.productId !== currentProductId)
                    .map((p) => (
                      <button
                        key={p.productId}
                        onClick={() => {
                          setIsDropdownOpen(false);
                          handleCompare(p);
                        }}
                        className={`block w-full text-left px-4 py-2 text-sm hover:bg-secondary ${selectedRelatedProduct?.productId === p.productId
                            ? "bg-muted text-primary"
                            : "text-surface-foreground"
                          }`}
                      >
                        {p.name}
                      </button>
                    ))}
                </div>
              )}
            </div>

            <div className="flex gap-1">
              <ProductDetails
                product={currentProductDetails}
                productId={currentProductId}
                isLoading={!currentProductDetails}
              />
              <ProductDetails
                product={comparedProductDetails}
                productId={selectedRelatedProduct?.productId}
                isLoading={isModalLoading}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
