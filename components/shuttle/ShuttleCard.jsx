"use client";

import Image from "next/image";
import { useRouter } from "next/router";
import { useState } from "react";
import { getFullImageUrl } from "@/utils/imageService";
import Loading2Svg from "@/components/common/LoaderSvg";

export default function ShuttleCard({ product }) {
  const isShuttle = product.pickup_group === 1;
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = () => {
    setIsLoading(true);
    router.push(`/day-tours/detail/${product.id}`);
  };

  return (
    <div className="rounded-2xl bg-white shadow-sm hover:shadow-lg transition overflow-hidden">
      
      {/* Image */}
      <div className="relative h-48 bg-gray-100">
        <Image
          src={
            product.image
              ? `${getFullImageUrl(product.image)}`
              : "/placeholder-transfer.jpg"
          }
          alt={product.title}
          fill
          className="object-cover"
        />

        {isShuttle && (
          <span className="absolute top-3 left-3 bg-black/80 text-white text-xs px-3 py-1 rounded-full">
            Shuttle Service
          </span>
        )}
      </div>

      {/* Content */}
      <div className="p-4 space-y-2">
        <h3 className="font-semibold text-gray-900 line-clamp-2">
          {product.title}
        </h3>

        <p className="text-sm text-gray-500">
          📍 {product.City_name}, {product.Country_name}
        </p>

        <div className="flex items-center justify-between pt-3">
          <div>
            <p className="text-xs text-gray-400">From</p>
            <p className="text-lg font-bold">
              {product.currency} {product.starting_price}
            </p>
          </div>

          <button
            onClick={handleNavigate}
            disabled={isLoading}
            className="inline-flex items-center justify-center bg-[#D3202D] text-white font-semibold px-5 py-2.5 rounded-lg text-sm hover:bg-[#b71c1c] transition-colors duration-300 text-center shadow-sm hover:shadow-md min-w-[120px]"
          >
            {isLoading ? <Loading2Svg className="w-5 h-5 text-white" /> : "View Details"}
          </button>
        </div>
      </div>
    </div>
  );
}
