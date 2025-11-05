import React, { useEffect, useRef } from "react";

const AccommodationMapSection = ({ latitude, longitude, hotelName, address }) => {
  const mapRef = useRef(null);

  useEffect(() => {
    // Don't run on server or without coords
    if (typeof window === "undefined") return;
    if (!latitude || !longitude) return;

    const lat = Number(latitude);
    const lng = Number(longitude);

    const initMap = () => {
      try {
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat, lng },
          zoom: 15,
          gestureHandling: "auto",
        });

        new window.google.maps.Marker({
          position: { lat, lng },
          map,
          title: hotelName || "Location",
        });
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error("AccommodationMapSection: failed to initialize map", err);
      }
    };

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
      // eslint-disable-next-line no-console
      console.warn("AccommodationMapSection: NEXT_PUBLIC_GOOGLE_MAPS_API_KEY is not set");
      return;
    }

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    script.onerror = () => {
      // eslint-disable-next-line no-console
      console.error("AccommodationMapSection: failed to load Google Maps script");
    };
    document.head.appendChild(script);

    return () => {
      // do not remove the script (other components may use it), but cleanup listeners if any
    };
  }, [latitude, longitude, hotelName]);

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-white mb-4">Location</h2>
      <div className="bg-gray-800 rounded-xl overflow-hidden">
        <div className="aspect-[8/3] bg-gray-700 relative">
          <div ref={mapRef} className="w-full h-full" />
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-white mb-2">{hotelName}</h3>
          {address && (
            <p className="text-gray-300 text-sm">
              {address.address1}
              {address.address2 && `, ${address.address2}`}
              {address.address3 && `, ${address.address3}`}
              <br />
              {address.city}, {address.country}
              {address.zip && `, ${address.zip}`}
            </p>
          )}
          {address && address.tel && (
            <p className="text-gray-400 text-sm mt-1">Tel: {address.tel}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AccommodationMapSection;