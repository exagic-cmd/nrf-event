import React, { useState } from "react";
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api";

const ORANGE_MARKER_ICON = "https://maps.google.com/mapfiles/ms/icons/orange-dot.png";

const MapView = ({
  center,
  zoom = 15,
  height = "400px",
  className = "",
  pointers = [],
}) => {
  const [activeMarker, setActiveMarker] = useState(null);

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY,
  });

  const mapContainerStyle = {
    width: "100%",
    height: height,
    borderRadius: "1rem",
    overflow: "hidden",
  };

  if (loadError) {
    return <div>Error loading maps</div>;
  }

  if (!isLoaded) {
    return <div>Loading...</div>;
  }

  return (
    <div className={`relative w-full ${className}`}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        onClick={() => setActiveMarker(null)} // hide InfoWindow on map click
      >
        {Array.isArray(pointers) &&
          pointers.map((position, index) => {
            const lat = Number(position.lat);
            const lng = Number(position.lng || position.long);
            const name = position.Title || `Marker ${index + 1}`;

            if (isNaN(lat) || isNaN(lng)) return null;

            return (
              <Marker
                key={index}
                position={{ lat, lng }}
                icon={ORANGE_MARKER_ICON}
                onMouseOver={() => setActiveMarker(index)}
                onMouseOut={() => setActiveMarker(null)}
              >
                {activeMarker === index && (
                  <InfoWindow
                    position={{ lat, lng }}
                    options={{ closeBoxURL: '', disableAutoPan: true }}
                  >
                    <div className="text-sm font-medium">{name}</div>
                  </InfoWindow>
                )}
              </Marker>
            );
          })}
      </GoogleMap>
    </div>
  );
};

export default MapView;