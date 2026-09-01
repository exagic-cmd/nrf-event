"use client";

import Image from "next/image";
import { useUpsellStore } from "@/store/useUpsellStore";
import { useCartStore } from "@/store/useCartStore";
import { getFullImageUrl } from "@/utils/imageService";
import { useEffect } from "react";
import { useRouter } from "next/router";
import { slugify } from "@/utils/slugify";

export default function UpsellProductsRow() {
  const { productBasedUpsell, fetchProductBasedUpsell, isLoading } = useUpsellStore();
  const { items: cartItems } = useCartStore();
  const router = useRouter();

  useEffect(() => {
    if (cartItems && cartItems.length > 0) {
      const productIds = cartItems.map(item => item.tourId).filter(id => id !== undefined);
      const uniqueIds = [...new Set(productIds)];
      if (uniqueIds.length > 0) {
        fetchProductBasedUpsell(uniqueIds);
      }
    }
  }, [cartItems, fetchProductBasedUpsell]);

  const goToDetail = (item) => {
    const slug = slugify(item.category_name || 'essentials');
    router.push(`/${slug}/${item.id}`);
  };

  if (isLoading) {
    return (
      <div className="w-full py-2 bg-surface text-surface-foreground flex justify-center">
        Loading...
      </div>
    );
  }

  return (
    <div className="w-full overflow-x-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-200">
      <div className="flex flex-nowrap space-x-2">
        {Array.isArray(productBasedUpsell) &&
          productBasedUpsell.slice(0, 12).map((item) => (
            <div
              key={item.id}
              className="w-[120px] bg-muted rounded-lg shadow-sm flex-shrink-0 flex flex-col text-center"
            >
              <div className="relative w-full h-16 rounded-t-lg overflow-hidden">
                <Image
                  src={getFullImageUrl(item.image)}
                  alt={item.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="p-1 flex flex-col flex-grow">
                <h4 className="font-semibold text-xs text-surface-foreground line-clamp-2">
                  {item.title}
                </h4>
                <button
                  onClick={() => goToDetail(item)}
                  className="mt-1 bg-secondary text-surface-foreground px-2 py-1 rounded-md text-xs font-medium hover:bg-secondary transition"
                >
                  View
                </button>
              </div>
            </div>
          ))}
      </div>
    </div>
  );
}
