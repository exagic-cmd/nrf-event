"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useVirtualTourStore } from "@/store/useVirtualTourStore";
import TourAudioSection from "@/components/daytours/tourroute/TourAudioSection";
import TourLocationDetails from "@/components/daytours/tourroute/TourLocationDetails";
import { ArrowLeft } from "lucide-react";

export default function TourLocationPage() {
  const router = useRouter();
  const { id, locationId } = router.query; // ✅ get params correctly here

  const { fetchVirtualTour, locations, product } = useVirtualTourStore();
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [loading, setLoading] = useState(true);

  // 🔹 Step 1: Fetch the tour using product ID
  useEffect(() => {
    if (id) {
      fetchVirtualTour(id, "2");
    }
  }, [id]);

  // 🔹 Step 2: Once data is ready, match location ID
  useEffect(() => {
    if (locations?.length > 0 && locationId) {
      const match = locations.find(
        (loc) => String(loc.id) === String(locationId)
      );
      setSelectedLocation(match || null);
      setLoading(false);
    }
  }, [locations, locationId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen text-white">
        Loading location details...
      </div>
    );
  }

  if (!selectedLocation) {
    return (
      <div className="flex justify-center items-center min-h-screen text-gray-300">
        No matching location found for this tour.
      </div>
    );
  }

  const translation = selectedLocation?.translations?.EN || {};
  const details = Object.fromEntries(
    Object.entries(selectedLocation.details || {}).filter(
      ([key, value]) =>
        !["lat", "lng", "travel_mode"].includes(key) &&
        String(value).trim() !== ""
    )
  );

  const audioUrl = selectedLocation.audio?.EN || "";
  const image =
    selectedLocation.images?.length > 0
      ? selectedLocation.images[0].startsWith("http")
        ? selectedLocation.images[0]
        : `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${selectedLocation.images[0]}`
      : "/abstract-location.png";

  return (
    <main className="flex-1 w-full bg-black min-h-screen pt-2 space-y-6">
      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="flex md:pt-12 pt-16 items-center gap-2 text-gray-50 mt-4 md:mt-8 ml-6 md:ml-12 hover:text-[#CC9A55] mb-0 transition-colors"
      >
        <ArrowLeft size={20} /> Go Back
      </button>

      <div className="flex justify-center bg-black text-white min-h-screen mt-6 md:mt-12">
        <div className="w-full max-w-7xl flex flex-col px-6 md:px-8">
          {/* Header */}
          <div className="pb-6">
            <h1 className="text-[#CC9A55] md:text-2xl mt-3 text-xl py-2 font-semibold">
              {product?.translations?.EN?.title}
            </h1>
            <p className="text-white py-4 text-md md:text-xl">
              {product?.translations?.EN?.short_desc ||
                "Explore this stop of your journey in detail."}
            </p>
          </div>

          {/* 🔸 Image + Audio + Info */}
          <TourAudioSection
            image={image}
            title={translation.title || "Location"}
            audioUrl={audioUrl}
          />

          <TourLocationDetails translation={translation} details={details} />
        </div>
      </div>
    </main>
  );
}
