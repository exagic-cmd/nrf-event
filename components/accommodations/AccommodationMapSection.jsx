import React, { useEffect, useRef } from "react";

const getFullImageUrl = (relativePath) => {
  if (!relativePath) return "/images/placeholder-hotel.jpg";
  if (relativePath.startsWith("http")) return relativePath;
  
  const base = (window.$helpers?.getEnv("CLOUDINARY_BASE_URL") || "").replace(/\/$/, "");
  return `${base}/${relativePath.replace(/^\//, "")}`;
};

const AccommodationMapSection = ({ hotelData, landmarks = [] }) => {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // ✅ Extract coordinates from hotelData
  const latitude = hotelData?.latitude ? parseFloat(hotelData.latitude) : null;
  const longitude = hotelData?.longitude ? parseFloat(hotelData.longitude) : null;
  const hotelName = hotelData?.title || hotelData?.name || "Accommodation";
  const imageUrl = getFullImageUrl(hotelData?.image);
  const rating = parseFloat(hotelData?.stars || hotelData?.star_rating || 0);

  // Clear all markers from map
  const clearMarkers = () => {
    markersRef.current.forEach(marker => {
      if (marker && marker.setMap) {
        marker.setMap(null);
      }
    });
    markersRef.current = [];
  };

  // Add hotel marker
  const addHotelMarker = (map) => {
    if (!latitude || !longitude) return null;

    const hotelMarker = new window.google.maps.Marker({
      position: { lat: latitude, lng: longitude },
      map,
      title: hotelName,
      icon: {
        url: "http://maps.google.com/mapfiles/ms/icons/red-dot.png", // Red marker for hotel
        scaledSize: new window.google.maps.Size(32, 32)
      }
    });

    // Hotel info window content
    let starsHtml = '';
    if (rating > 0) {
      for (let i = 0; i < 5; i++) {
        starsHtml += `<span style="color: ${i < rating ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))'};">★</span>`;
      }
    }

    const hotelContentString = `
      <div style="
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
        font-size: 14px;
        color: hsl(var(--foreground));
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

    const hotelInfoWindow = new window.google.maps.InfoWindow({
      content: hotelContentString
    });

    hotelMarker.addListener("click", () => {
      hotelInfoWindow.open(map, hotelMarker);
    });

    markersRef.current.push(hotelMarker);
    return hotelMarker;
  };

  // Add landmark markers
  const addLandmarkMarkers = (map) => {
    if (!landmarks || !Array.isArray(landmarks) || landmarks.length === 0) return;

    landmarks.forEach((landmark, index) => {
      // Check if landmark has valid coordinates
      const lat = parseFloat(landmark.latitude || landmark.lat);
      const lng = parseFloat(landmark.longitude || landmark.lng);
      
      if (!lat || !lng || isNaN(lat) || isNaN(lng)) return;

      const landmarkMarker = new window.google.maps.Marker({
        position: { lat, lng },
        map,
        title: landmark.title || landmark.name || `Landmark ${index + 1}`,
        icon: {
          url: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png", // Blue marker for landmarks
          scaledSize: new window.google.maps.Size(28, 28)
        },
        label: {
          text: `${index + 1}`,
          color: "white",
          fontSize: "12px",
          fontWeight: "bold"
        }
      });

      // Landmark info window content
      const distanceText = landmark.distance_km 
        ? `${landmark.distance_km.toFixed(1)} km away`
        : '';
      
      const landmarkContentString = `
        <div style="
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          font-size: 14px;
          color: hsl(var(--foreground));
          padding: 10px;
          max-width: 200px;
        ">
          <div style="font-weight: 600; font-size: 14px; margin-bottom: 5px; color: hsl(var(--primary));">
            ${landmark.title || landmark.name}
          </div>
          ${distanceText ? `<div style="font-size: 12px; color: hsl(var(--muted-foreground)); margin-bottom: 8px;">${distanceText}</div>` : ''}
          ${landmark.description ? `<div style="font-size: 12px; color: hsl(var(--muted-foreground)); line-height: 1.4;">${landmark.description}</div>` : ''}
        </div>
      `;

      
      const landmarkInfoWindow = new window.google.maps.InfoWindow({
        content: landmarkContentString
      });

      landmarkMarker.addListener("click", () => {
        landmarkInfoWindow.open(map, landmarkMarker);
      });

      markersRef.current.push(landmarkMarker);
    });
  };

  // Fit map bounds to show all markers
  const fitMapBounds = (map, hotelMarker) => {
    const bounds = new window.google.maps.LatLngBounds();
    
    // Add hotel position
    if (hotelMarker && hotelMarker.getPosition()) {
      bounds.extend(hotelMarker.getPosition());
    }
    
    // Add all landmark positions
    markersRef.current.forEach(marker => {
      if (marker && marker.getPosition && marker !== hotelMarker) {
        bounds.extend(marker.getPosition());
      }
    });
    
    // If we have at least one valid position, fit bounds
    if (!bounds.isEmpty()) {
      map.fitBounds(bounds);
      
      // Add padding to bounds
      const padding = 0.02; // 2% padding
      const ne = bounds.getNorthEast();
      const sw = bounds.getSouthWest();
      
      bounds.extend({
        lat: ne.lat() + padding,
        lng: ne.lng() + padding
      });
      bounds.extend({
        lat: sw.lat() - padding,
        lng: sw.lng() - padding
      });
      
      map.fitBounds(bounds);
      
      // If only one marker, set a reasonable zoom
      if (markersRef.current.length === 1) {
        setTimeout(() => {
          map.setZoom(15);
        }, 100);
      }
    }
  };

  useEffect(() => {
    // Cleanup function
    return () => {
      clearMarkers();
      if (mapInstanceRef.current) {
        // You might want to remove map instance
        mapInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    // Don't run on server or without valid hotel coordinates
    if (typeof window === "undefined") return;
    if (!latitude || !longitude) return;

    const initMap = () => {
      try {
        clearMarkers(); // Clear any existing markers
        
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: latitude, lng: longitude },
          zoom: 15,
          gestureHandling: "auto",
          mapTypeControl: true,
          streetViewControl: true,
          fullscreenControl: true,
        });

        mapInstanceRef.current = map;

        // Add hotel marker
        const hotelMarker = addHotelMarker(map);
        
        // Add landmark markers
        addLandmarkMarkers(map);
        
        // Fit bounds to show all markers
        fitMapBounds(map, hotelMarker);

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
    script.src = `https://maps.googleapis.com/maps/api/js?key=${key}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.setAttribute("data-google-maps", "true");
    script.onload = initMap;
    document.head.appendChild(script);
  }, [latitude, longitude, hotelName, imageUrl, rating, landmarks]); // Added landmarks to dependencies

  if (!latitude || !longitude) {
    return null;
  }

  return (
    <div className="mt-8">
      <h2 className="text-2xl font-bold text-primary mb-4">Location</h2>
      
      <div className="bg-secondary rounded-xl overflow-hidden">
        <div className="aspect-[8/3] bg-muted">
          <div ref={mapRef} className="w-full h-full" />
        </div>
      </div>
    </div>
  );
};

export default AccommodationMapSection;