import React, { useEffect, useRef } from "react";

/**
 * GoogleMap component (JS API)
 * Props:
 * - center: { lat, lng }
 * - zoom
 * - width, height, className
 * - markers: [{ lat, lng, title }]
 */
const GoogleMap = ({
  center = { lat: -34.397, lng: 150.644 },
  zoom = 12,
  width = "100%",
  height = "400px",
  className = "",
  markers = [],
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const mapRef = useRef(null);

  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!apiKey) return;

    const initMap = () => {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: center.lat, lng: center.lng },
          zoom,
          gestureHandling: "auto",
        });

        const bounds = new window.google.maps.LatLngBounds();

        const created = (markers || [])
          .map((m) => {
            if (!m || isNaN(Number(m.lat)) || isNaN(Number(m.lng))) return null;
            const marker = new window.google.maps.Marker({
              position: { lat: Number(m.lat), lng: Number(m.lng) },
              map,
              title: m.title || "",
            });

            const info = new window.google.maps.InfoWindow({
              content: `<div style="color:#000">${(m.title || "Location").replace(/</g, "&lt;")}</div>`,
            });
            marker.addListener("click", () => info.open(map, marker));

            bounds.extend(marker.getPosition());
            return marker;
          })
          .filter(Boolean);

        if (created.length === 0) {
          map.setCenter(center);
          map.setZoom(zoom);
        } else if (created.length === 1) {
          map.setCenter(created[0].getPosition());
          map.setZoom(13);
        } else {
          map.fitBounds(bounds, 80);
        }
      } catch (err) {
        console.error("GoogleMap init error", err);
      }
    };

    if (window.google && window.google.maps) {
      initMap();
      return;
    }

    const existing = document.querySelector('script[data-google-maps]');
    if (existing) {
      existing.addEventListener("load", initMap);
      return () => existing.removeEventListener("load", initMap);
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    document.head.appendChild(script);
  }, [apiKey, center, zoom, JSON.stringify(markers)]);

  if (!apiKey) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center ${className}`}
        style={{ width, height }}
      >
        <p className="text-gray-600">Google Maps API key required</p>
      </div>
    );
  }

  return (
    <div className={className}>
      <div ref={mapRef} style={{ width, height }} className="rounded-lg overflow-hidden" />
    </div>
  );
};

export default GoogleMap;