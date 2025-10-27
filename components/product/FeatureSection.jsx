import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import ProductCard from "../cards/ProductCard";
import ProductCard2 from "../cards/ProductCard2";
import ProductCard3 from "../cards/ProductCard3";
import ProductCard4 from "../cards/ProductCard4";
import { useProductStore } from "@/store/useProductStore";
import { useLocalizedRouter } from "@/components/localizedRouter";

const FeatureSection = ({ feature, products }) => {
  const { localizedPush } = useLocalizedRouter();
  const { bookProduct } = useProductStore();

  const scrollRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollButtons = () => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth);
    }
  };

  const scrollLeft = () => {
    scrollRef.current?.scrollBy({ left: -300, behavior: "smooth" });
    setTimeout(updateScrollButtons, 300);
  };

  const scrollRight = () => {
    scrollRef.current?.scrollBy({ left: 300, behavior: "smooth" });
    setTimeout(updateScrollButtons, 300);
  };

  useEffect(() => {
    updateScrollButtons();
    const el = scrollRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);

    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, []);
  const slugify = (text) => {
    if (!text) return "";
    const processedText = text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") 
        .replace(/[^\p{L}\p{N}-]+/gu, "") 
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    return encodeURIComponent(processedText);
  }
  const handleBookNow = async (product) => {
    try {
      useProductStore.getState().setBookingProduct(product);
      await bookProduct(product.id);
      localizedPush(`/day-tours/${slugify(product.title)}/${product.id}`);
    } catch (error) {
      // Handle error if needed
    }
  };

  const renderCard = (product) => {
    const cardProps = {
      product,
      onBookNow: () => handleBookNow(product),
      featureName: feature.name,
    };

    switch (feature.template_type) {
      case "Type 1":
        return <ProductCard key={product.id} {...cardProps} />;
      case "Type 2":
        return <ProductCard2 key={product.id} {...cardProps} />;
      case "Type 3":
        return <ProductCard3 key={product.id} {...cardProps} />;
      case "Type 4":
        return <ProductCard4 key={product.id} {...cardProps} />;
      case "Type 5":
        return <ProductCard key={product.id} {...cardProps} />;
      default:
        return <ProductCard key={product.id} {...cardProps} />;
    }
  };

  return (
    <section className="mb-12  relative">
      <h2 className="text-2xl font-bold mb-1 text-center">{feature.name}</h2>
      <p className="text-gray-600 mb-4 text-center">{feature.description}</p>

     {/* Left Scroll Button */}

<button
  onClick={scrollLeft}
  disabled={!canScrollLeft}
  className={`absolute top-1/2 -translate-y-1/2 left-2 z-10 rounded-full p-2 shadow-md bg-white hover:bg-gray-100 transition-opacity lg:hidden ${
    !canScrollLeft ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  <ChevronLeft className="w-5 h-5 text-gray-700" />
</button>

{/* Right Scroll Button (visible only below lg) */}
<button
  onClick={scrollRight}
  disabled={!canScrollRight}
  className={`absolute top-1/2 -translate-y-1/2 right-2 z-10 rounded-full p-2 shadow-md bg-white hover:bg-gray-100 transition-opacity lg:hidden ${
    !canScrollRight ? "opacity-50 cursor-not-allowed" : ""
  }`}
>
  <ChevronRight className="w-5 h-5 text-gray-700" />
</button>


      {/* Cards */}
      <div
        ref={scrollRef}
        className=" mt-6 lg:grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 4xl:grid-cols-5  lg:gap-4 px-1 flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory hide-scrollbar w-full"
      >
        {products.map((product) => (
          <div
            key={product.id}
            className="snap-start"
          >
            {renderCard(product)}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FeatureSection;
