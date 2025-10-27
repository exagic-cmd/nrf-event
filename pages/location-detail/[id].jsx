"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft } from "lucide-react";
import { useVirtualTourStore } from "@/store/useVirtualTourStore";
import ReviewForm from "@/components/review-form";
import { useOrderStore } from "@/store/useOrderStore";
import useUserStore from "@/store/useAuthStore";
import TourAudioSection from "@/components/daytours/tourroute/TourAudioSection";
import TourLocationDetails from "@/components/daytours/tourroute/TourLocationDetails";
export default function TourDetailPage() {
  const router = useRouter();
  const { id } = router.query;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const reviewSectionRef = useRef(null);

  const { locations, fetchVirtualTour, product } = useVirtualTourStore();
  const isLastSlide = currentIndex === locations.length - 1;
  const selectedOrder = useOrderStore((state) => state.selectedOrder);
  const itinerary = selectedOrder?.itineraries?.[0] || null;
  const user = useUserStore((state) => state.user);
  const qrCode = useUserStore((state) => state.qrCode);
  const itineraryId = itinerary?.id;

  useEffect(() => {
    if (id) {
      fetchVirtualTour(id, "2");
    }
  }, [id]);

  if (!locations) {
    return (
      <div className="text-center text-white min-h-screen flex items-center justify-center">
        Loading tour details...
      </div>
    );
  }

  if (locations.length === 0) {
    return (
      <div className="text-center text-white min-h-screen flex items-center justify-center">
        No locations found for this tour.
      </div>
    );
  }

  const location = locations[currentIndex];
  const translation = location?.translations?.EN || {};
  const details = Object.fromEntries(
    Object.entries(location.details || {}).filter(
      ([key, value]) =>
        !["lat", "lng", "travel_mode"].includes(key) &&
        String(value).trim() !== ""
    )
  );

  const audioUrl = location.audio?.EN || "";
  const image =
    location.images?.length > 0
      ? location.images[0].startsWith("http")
        ? location.images[0]
        : `https://res.cloudinary.com/www-travelpakistani-com/image/upload/${location.images[0]}`
      : "/abstract-location.png";

  const handleNext = () => {
    if (currentIndex < locations.length - 1) {
      setCurrentIndex((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
    }
  };

  const handleGoToReview = () => {
    if (!qrCode || !itineraryId) return;
    router.push(`/review/${qrCode}/${itineraryId}`);
  };

  const handleShowReviewForm = () => {
    setShowReviewForm(true);
    handleGoToReview();
    setTimeout(() => {
      reviewSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }, 100);
  };

  return (
    <main className="flex-1 w-full bg-black min-h-screen pt-2 space-y-6">
      {/* Back Button */}
      <button
        onClick={router.back}
        className="flex md:pt-12 pt-16 items-center gap-2 text-gray-50 mt-4 md:mt-8 ml-6 md:ml-12 hover:text-[#CC9A55] mb-0 transition-colors"
      >
        <ArrowLeft size={20} /> Go Back
      </button>

      {isLastSlide ? (
        // ✅ Review Section
        <div className="flex items-center justify-center h-full bg-black text-white px-6">
          <div className="max-w-xl w-full text-center bg-[#CC9A55]/15 border border-[#CC9A55]/30 rounded-3xl px-12 py-8 shadow-lg">
            <h2 className="text-lg md:text-3xl font-bold text-[#CC9A55] mb-4">
              We’d love to hear from you!
            </h2>
            <p className="text-gray-300 mb-8 text-sm md:text-lg">
              Your feedback helps us make your tour experience even better.
            </p>
            <button
              onClick={handleShowReviewForm}
              className="px-4 py-3 bg-[#CC9A55] hover:bg-[#e1b97b] text-black font-semibold rounded-xl shadow-md transition-all duration-300"
            >
              Submit a Review
            </button>
          </div>
        </div>
      ) : showReviewForm ? (
        <div ref={reviewSectionRef}>
          <ReviewForm />
        </div>
      ) : (
        <div className="flex justify-center bg-black text-white min-h-screen mt-12 md:mt-20">
          <div className="w-full max-w-7xl flex flex-col px-6 md:px-8">
            {/* Header Section */}
            <div className="pb-6">
              <h1 className="text-[#CC9A55] md:text-2xl mt-3 text-xl py-2 font-semibold">
                {product?.translations?.EN?.title}
              </h1>
              <p className="text-white py-4 text-md md:text-xl">
                {product?.translations?.EN?.short_desc ||
                  "Explore each stop of your journey in detail."}
              </p>
            </div>

            {/* ✅ Use your new components */}
            <TourAudioSection
              image={image}
              title={translation.title || ""}
              audioUrl={audioUrl}
            />

            <TourLocationDetails
              translation={translation}
              details={details}
            />

            {/* ✅ Navigation Buttons */}
            <div className="flex justify-between gap-4 pt-6">
              <button
                onClick={handlePrev}
                disabled={currentIndex === 0}
                className={`px-6 py-3 rounded-lg text-sm md:text-md font-semibold transition-colors ${
                  currentIndex > 0
                    ? "bg-gray-500 hover:bg-gray-400 text-white"
                    : "bg-gray-700 text-gray-100 cursor-not-allowed"
                }`}
              >
                Previous
              </button>

              <button
                onClick={
                  currentIndex < locations.length - 1 ? handleNext : undefined
                }
                disabled={currentIndex >= locations.length - 1}
                className={`px-6 py-3 text-sm md:text-md rounded-lg font-semibold transition-colors ${
                  currentIndex < locations.length - 1
                    ? "bg-[#CC9A55] text-white hover:bg-[#e1b97b]"
                    : "bg-gray-700 text-gray-300 cursor-not-allowed"
                }`}
              >
                {currentIndex < locations.length - 1
                  ? "Next"
                  : "Next (End of Tour)"}
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
