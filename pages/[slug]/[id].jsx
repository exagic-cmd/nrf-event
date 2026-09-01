"use client";

import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useUpsellStore } from "@/store/useUpsellStore";
import { useCartStore } from "@/store/useCartStore";
import { getFullImageUrl } from "@/utils/imageService";
import Layout from "@/components/layout/Layout";

export default function ProductDetail() {
  const router = useRouter();
  const { id } = router.query;

  const { upsellDetail, fetchUpsellDetail, isLoading, error } = useUpsellStore();
  const { addItem } = useCartStore();

  const fetchedRef = useRef(false);
  const [popupMessage, setPopupMessage] = useState("");
  const [showPopup, setShowPopup] = useState(false);

  useEffect(() => {
    if (id && !fetchedRef.current) {
      fetchUpsellDetail(id, 1);
      fetchedRef.current = true;
    }
  }, [id, fetchUpsellDetail]);

  const handleAddToCart = () => {
    const cartItem = {
      id,
      title: upsellDetail?.title,
      image: upsellDetail?.image,
      pax: 1,
      price: upsellDetail?.price || 0,
      type: "upsell",
    };

  const result = addItem(cartItem);

  if (result.status === "added") {
    setPopupMessage("✅ Added to cart!");
    setShowPopup(true);
  } else {
    setPopupMessage("⚠️ Already in cart!");
    setShowPopup(true);

    setTimeout(() => {
      setShowPopup(false);
       router.push('/');
    }, 1000);
  }
};


  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-red-500">
        {error}
      </div>
    );
  }

  if (!upsellDetail) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Product not found
      </div>
    );
  }

  const { title, description, features = [], image, price, city, tourtype } =
    upsellDetail;

  return (
    <Layout><div className="relative min-h-screen md:mt-20 mt-8 bg-black text-white px-6 py-10">
      {/* Popup Message */}
    {showPopup && (
  <div className="fixed inset-0 flex items-center justify-center bg-black/60 z-50">
    <div className="bg-surface text-surface-foreground px-6 py-6 rounded-lg shadow-xl text-center w-80">
      <p className="mb-4 font-semibold">{popupMessage}</p>
      
      {popupMessage.includes("Added") && (
        <div className="flex flex-col gap-3">
          <button
            onClick={() => router.push("/checkout")}
            className="bg-brand-secondary text-white py-2 rounded-lg font-medium"
          >
            Go to Checkout
          </button>
          <button
            onClick={() => {
              setShowPopup(false);
              router.push("/");
            }}
            className="border border-border text-muted-foreground py-2 rounded-lg font-medium hover:bg-muted"
          >
            Continue Shopping
          </button>
        </div>
      )}
    </div>
  </div>
)}


      <div className="max-w-4xl mx-auto grid md:grid-cols-2 gap-8 bg-surface p-4 md:p-12 rounded-xl">
        {/* Image Section */}
        <div className="flex flex-col">
          <Image
            src={getFullImageUrl(image)}
            placeholder="blur"
            blurDataURL={
              image ? getFullImageUrl(image) : "/images/placeholder.jpg"
            }
            alt={title}
            width={500}
            height={600}
            className="rounded-2xl shadow-lg"
          />

          {/* Desktop Buttons */}
          <div className="hidden md:block mt-6">
            <button
              onClick={handleAddToCart}
              className="bg-brand-secondary px-6 py-3 rounded-xl font-medium shadow-md w-full"
            >
              Add to Cart
            </button>
            <div className="flex justify-center mt-4">
              <Link href="/" className="text-muted-foreground hover:text-surface-foreground">
                ← Back to Home
              </Link>
            </div>
          </div>
        </div>

        {/* Details Section */}
        <div className="flex flex-col justify-start space-y-4">
          <h1 className="text-md md:text-2xl font-bold text-surface-foreground">{title}</h1>
          <p className="text-sm md:text-base text-foreground">{description}</p>

          {features.length > 0 && (
            <ul className="list-disc list-inside text-[#CC9A55]">
              {features.map((feature, idx) => (
                <li key={idx}>{feature}</li>
              ))}
            </ul>
          )}

          {price && (
            <p className="text-xl font-semibold mt-4 text-surface-foreground">
              Price:  {price} SGD
            </p>
          )}
          {city && <p className="text-muted-foreground">City: {city}</p>}
          {tourtype && <p className="text-muted-foreground">Tour Type: {tourtype}</p>}
        </div>
      </div>

      {/* Mobile Buttons */}
      <div className="md:hidden mt-6 max-w-4xl mx-auto px-6">
        <button
          onClick={handleAddToCart}
          className="bg-brand-secondary px-6 py-3 rounded-xl font-medium shadow-md w-full"
        >
          Add to Cart
        </button>
        <div className="flex justify-center mt-4">
          <Link href="/" className="text-muted-foreground hover:text-surface-foreground">
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
    </Layout>
  );
}
