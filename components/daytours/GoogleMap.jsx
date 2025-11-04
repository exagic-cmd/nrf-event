import React from "react";

const GoogleMap = ({
  center = { lat: -34.397, lng: 150.644 },
  zoom = 12,
  width = "100%",
  height = "400px",
  className = "",
}) => {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  
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

  const src = `https://www.google.com/maps/embed/v1/view?key=${apiKey}&center=${center.lat},${center.lng}&zoom=${zoom}`;

  return (
    <div className={className}>
      <iframe
        width={width}
        height={height}
        src={src}
        style={{ border: 0, borderRadius: "8px" }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title="Google Map"
      />
    </div>
  );
};

export default GoogleMap;