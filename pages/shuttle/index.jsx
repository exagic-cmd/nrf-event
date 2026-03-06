"use client";

import { useEffect, useState, useRef } from "react";
import ShuttleCard from "@/components/shuttle/ShuttleCard";
import { apiRequest } from "@/lib/clientApi";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const res = await apiRequest({
        endpoint: "products?category_id=2",
        method: "GET",
      });

      const allTransfers = res?.data?.data?.data || [];
      const shuttleServices = allTransfers.filter(
        (item) =>
          item.pickup_group === 1 ||
          (item.pickup_point_group_name && item.pickup_point_group_name.toLowerCase().includes("shuttle")) ||
          (item.title && item.title.toLowerCase().includes("shuttle"))
      );
      setProducts(shuttleServices);
    } catch (error) {
      console.error("Failed to fetch products", error);
    } finally {
      setLoading(false);
    }
  };

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -350 : 350;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  return (
    <div className="max-w-7xl mt-12 mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-xl lg:text-3xl font-bold">
          Shuttle & Transfer Services
        </h1>
        <p className="text-gray-500 mt-1">
          Reliable airport & city shuttle services across Singapore
        </p>
      </div>

      {/* Loading */}
      {loading && (
        <div className="text-center text-gray-500">Loading transfers...</div>
      )}

      {/* Horizontal Scroll Container */}
      {!loading && products.length > 0 && (
        <div className="relative group">
          <div
            ref={scrollContainerRef}
            className="flex space-x-6 overflow-x-auto pb-4 scrollbar-hide"
          >
            {products.map((item) => (
              <div key={item.id} className="flex-shrink-0 w-[90%] sm:w-80">
                <ShuttleCard product={item} />
              </div>
            ))}
          </div>
          {/* Scroll Buttons */}
          <button
            onClick={() => scroll("left")}
            className="absolute top-1/2 -translate-y-1/2 -left-5 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition opacity-0 group-hover:opacity-100 hidden lg:block"
            aria-label="Scroll left"
          >
            <ChevronLeft className="h-6 w-6 text-gray-800" />
          </button>
          <button
            onClick={() => scroll("right")}
            className="absolute top-1/2 -translate-y-1/2 -right-5 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition opacity-0 group-hover:opacity-100 hidden lg:block"
            aria-label="Scroll right"
          >
            <ChevronRight className="h-6 w-6 text-gray-800" />
          </button>
        </div>
      )}

      {/* Empty State */}
      {!loading && products.length === 0 && (
        <p className="text-center text-gray-500 mt-10">
          No shuttle services available.
        </p>
      )}
    </div>
  );
}
