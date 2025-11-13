import React, { useEffect, useRef } from "react";

const AccommodationListMap = ({ accommodations = [] }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    // collect valid marker coords
    const markersData = (accommodations || [])
      .map((a) => {
        const lat = parseFloat(a?.Hotel_Data?.latitude || a?.latitude || a?.normalizedHotelData?.latitude || NaN);
        const lng = parseFloat(a?.Hotel_Data?.longitude || a?.longitude || a?.normalizedHotelData?.longitude || NaN);
        const title = a?.Hotel_Data?.title || a?.name || a?.title || a?.hotel_name || '';
        if (!isFinite(lat) || !isFinite(lng)) return null;
        return { lat, lng, title };
      })
      .filter(Boolean);

    if (markersData.length === 0) return;

    const initMap = () => {
      try {
        const first = markersData[0];
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: first.lat, lng: first.lng },
          zoom: 12,
          gestureHandling: "auto",
        });

        const bounds = new window.google.maps.LatLngBounds();

        const markers = markersData.map((m) => {
          const marker = new window.google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            title: m.title,
          });
          bounds.extend(marker.getPosition());

          const info = new window.google.maps.InfoWindow({
            content: `<div style="color:#000">${m.title || "Location"}</div>`,
          });

          marker.addListener("click", () => {
            info.open(map, marker);
          });

          return marker;
        });

        if (markers.length > 1) {
          map.fitBounds(bounds, 80);
        } else {
          map.setCenter({ lat: first.lat, lng: first.lng });
          map.setZoom(13);
        }
      } catch (err) {
        console.error("AccommodationListMap: failed to init map", err);
      }
    };

    // If script already loaded
    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    // If script tag exists, wait for load
    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const key = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!key) {
      console.warn("AccommodationListMap: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY not set");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    document.head.appendChild(script);
  }, [accommodations]);

  return (
    <div className="mb-6">
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="aspect-[16/6] bg-gray-700">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default AccommodationListMap;
