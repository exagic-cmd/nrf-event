import React, { useEffect, useRef } from "react";

const AccommodationMapSection = ({ hotelData }) => {
  const mapRef = useRef(null);

  // ✅ Extract coordinates from hotelData
  const latitude = hotelData?.latitude ? parseFloat(hotelData.latitude) : null;
  const longitude = hotelData?.longitude ? parseFloat(hotelData.longitude) : null;
  const hotelName = hotelData?.title || hotelData?.name || "Accommodation";

  useEffect(() => {
    // Don't run on server or without valid coordinates
    if (typeof window === "undefined") return;
    if (!latitude || !longitude) return;

    const initMap = () => {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          gestureHandling: "auto",
        });

        new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: hotelName,
        });
      } catch (err) {
        console.error("AccommodationMapSection: failed to initialize map", err);
      }
    };

    // If Google Maps is already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // Inject script if not already present
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn("AccommodationMapSection: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    document.head.appendChild(script);
  }, [latitude, longitude, hotelName]);

  if (!latitude || !longitude) {
    return null; // Don't render anything if no coordinates
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-[#D3202D] mb-4">Location</h2>
      <div className="bg-gray-800 rounded-xl overflow-hidden ">
        <div className="aspect-[8/3] bg-gray-700">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default AccommodationMapSection;