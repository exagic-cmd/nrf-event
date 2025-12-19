import React, { useEffect, useRef } from "react";

const getFullImageUrl = (relativePath) => {
  if (!relativePath) return "/images/placeholder-hotel.jpg"; // Use local placeholder
  if (relativePath.startsWith("http")) return relativePath;

  const base = (window.$helpers?.getEnv("CLOUDINARY_BASE_URL") || "").replace(/\/$/, "");
  return `${base}/${relativePath.replace(/^\//, "")}`;
};

const AccommodationMapSection = ({ hotelData }) => {
  const mapRef = useRef(null);

  // ✅ Extract coordinates from hotelData
  const latitude = hotelData?.latitude ? parseFloat(hotelData.latitude) : null;
  const longitude = hotelData?.longitude ? parseFloat(hotelData.longitude) : null;
  const hotelName = hotelData?.title || hotelData?.name || "Accommodation";
  const imageUrl = getFullImageUrl(hotelData?.image);
  const rating = parseFloat(hotelData?.stars || hotelData?.star_rating || 0);

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

        const marker = new window.google.maps.Marker({
          position: { lat: latitude, lng: longitude },
          map,
          title: hotelName,
        });

        const infoWindow = new window.google.maps.InfoWindow();

        let starsHtml = '';
        if (rating > 0) {
          for (let i = 0; i < 5; i++) {
            starsHtml += `<span style="color: ${i < rating ? '#FFD700' : '#d3d3d3'};">★</span>`;
          }
        }

        const contentString = `
         
     <div style="
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    font-size: 14px;
    color: #333;
    padding: 5px;
    display: flex;
    align-items: center;
    gap: 15px;
  ">
    <img 
      src="${imageUrl}" 
      alt="${hotelName}" 
      style="
        width: 100px; 
        height: 70px; 
        object-fit: cover; 
        border-radius: 2px; 
        box-shadow: 0 2px 4px rgba(0,0,0,0.1);
      " 
    />

    <div style="display: flex; flex-direction: column; justify-content: center;">
      <div style="
        font-weight: 600; 
        font-size: 13px; 
        max-width: 160px; 
        line-height: 1.3; 
        margin-bottom: 5px;
      ">
        ${hotelName}
      </div>
      ${starsHtml ? `<div style="font-size: 12px; line-height: 1;">${starsHtml}</div>` : ""}
    </div>
  </div>
`;
        marker.addListener("click", () => {
          infoWindow.setContent(contentString);
          infoWindow.open(map, marker);
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
  }, [latitude, longitude, hotelName, imageUrl, rating]);

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