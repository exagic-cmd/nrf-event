import React, { useEffect, useRef } from 'react';

const GoogleMap = ({ center, zoom, markers, width, height, className }) => {
  const mapRef = useRef(null);
  const mapInstance = useRef(null); // To hold the map instance

  useEffect(() => {
    const initMap = () => {
      // Ensure mapRef is attached to a DOM element before initializing
      if (mapRef.current && window.google && window.google.maps) {
        try {
          mapInstance.current = new window.google.maps.Map(mapRef.current, {
            center: { lat: center.lat, lng: center.lng },
            zoom,
            gestureHandling: "auto",
            // Add other map options here if needed
          });
        } catch (error) {
          console.error("Error initializing Google Map:", error);
        }
      }
    };

    initMap();

  }, [center, zoom]); // Re-initialize map only if center or zoom changes

  useEffect(() => {
    // Add or update markers when they change
    if (mapInstance.current && markers) {
      // Clear existing markers (optional, if markers are dynamic)
      // For simplicity, we'll just add new ones. For performance, you'd manage them.
      markers.forEach(marker => {
        if (marker.lat != null && marker.lng != null) {
          new window.google.maps.Marker({
            position: { lat: marker.lat, lng: marker.lng },
            map: mapInstance.current,
            title: marker.title,
          });
        }
      });
    }
  }, [markers]); // This effect runs when markers array changes

  return (
    <div ref={mapRef} style={{ width, height }} className={className} />
  );
};

export default GoogleMap;