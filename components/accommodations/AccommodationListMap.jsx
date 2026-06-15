import React, { useEffect, useRef } from "react";
const getFullImageUrl = (relativePath) => {
  if (!relativePath) return '';
  return  `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1746530123/${relativePath}`;
};
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
        const rating = parseFloat(a?.star_rating) || 0;
        const imageUrl = a?.photo?.image ? getFullImageUrl(a.photo.image) : 'https://placehold.co/100x75?text=No+Image';

        console.log('Hotel:', a.name, 'Raw Image Path:', a?.photo?.image, 'Constructed Image URL:', imageUrl);

        if (!isFinite(lat) || !isFinite(lng)) return null;

        return { lat, lng, title, imageUrl, rating };
      })
      .filter(Boolean);

    if (markersData.length === 0) return;

    const initMap = () => {
      if (!mapRef.current) return;
      try {
        const first = markersData[0];
        const map = new window.google.maps.Map(mapRef.current, {
          center: { lat: first.lat, lng: first.lng },
          zoom: 12,
          gestureHandling: "auto",
        });

        const bounds = new window.google.maps.LatLngBounds();
        const infoWindow = new window.google.maps.InfoWindow();

        const markers = markersData.map((m) => {
          const marker = new window.google.maps.Marker({
            position: { lat: m.lat, lng: m.lng },
            map,
            title: m.title,
          });
          bounds.extend(marker.getPosition());

          let starsHtml = '';
          if (m.rating > 0) {
            for (let i = 0; i < 5; i++) {
              starsHtml += `<span style="color: ${i < m.rating ? '#FFD700' : '#d3d3d3'};">★</span>`;
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
      src="${m.imageUrl}" 
      alt="${m.title}" 
      style="
        width: 90px; 
        height: 70px; 
        object-fit: cover; 
        border-radius: 8px; 
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
        ${m.title || "Location"}
      </div>

      ${starsHtml ? `<div style="font-size: 12px; line-height: 1;">${starsHtml}</div>` : ""}
    </div>
  </div>
`;


          const openInfoWindow = () => {
            infoWindow.setContent(contentString);
            infoWindow.open(map, marker);
          };

          marker.addListener("mouseover", openInfoWindow);
          marker.addListener("click", openInfoWindow);

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
    <div style={{ height: '550px' }} className="rounded-lg shadow-lg overflow-hidden">
      <div ref={mapRef} className="w-full h-full" />
    </div>
  );
};

export default AccommodationListMap;
