import React, { useState } from "react";
import {
  MapPin,
  ChevronDown,
  ChevronUp,
  Info,
  CheckCircle,
  AlertCircle,
  Bed,
  Accessibility,
  Utensils,
  Wifi,
  Plane,
  Languages,
  Briefcase,
  Dumbbell,
  Sparkles,
  Baby,
  Flame,
  Image as ImageIcon,
} from "lucide-react";

const AccommodationHotelDetail = ({ hotelData }) => {
  const FALLBACKS = {
    description:
      "Welcome to our hotel. We are currently updating our detailed description to bring you the most accurate information. Rest assured, we offer premium services and a comfortable stay located conveniently near major city attractions. Please check back soon for full details.",
    address: "Singapore",
    socket: "Type G",
    voltage: "230 V",
    amenityCategory: "General Amenities",
    amenityItem: "Standard hotel amenity",
  };

  const getFullImageUrl = (path) => {
    if (!path || typeof path !== 'string') return null;
    if (path.startsWith("http")) return path;
    const base = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}upload/`;
    return `${base}${path.replace(/^\//, "")}`;
  };
  // --- Iconshere ---
  const amenityIcons = {
    Popular: <Flame size={20} className="text-primary" />,
    Rooms: <Bed size={20} className="text-muted-foreground" />,
    General: <Info size={20} className="text-muted-foreground" />,
    Accessibility: <Accessibility size={20} className="text-muted-foreground" />,
    Meals: <Utensils size={20} className="text-muted-foreground" />,
    Internet: <Wifi size={20} className="text-muted-foreground" />,
    Transfer: <Plane size={20} className="text-muted-foreground" />,
    "Languages Spoken": <Languages size={20} className="text-muted-foreground" />,
    Business: <Briefcase size={20} className="text-muted-foreground" />,
    Sports: <Dumbbell size={20} className="text-muted-foreground" />,
    "Beauty and wellness": <Sparkles size={20} className="text-muted-foreground" />,
    Kids: <Baby size={20} className="text-muted-foreground" />,
    default: <CheckCircle size={20} className="text-muted-foreground" />,
  };

  const getAmenityIcon = (category) => {
    const iconUrl = getFullImageUrl(category?.icon);
    if (iconUrl) {
      return <img src={iconUrl} alt={category.name} className="w-5 h-5 object-contain" />;
    }
    // Fallback to mapped icons if no URL
    return amenityIcons[category?.name] || <ImageIcon size={20} className="text-muted-foreground" />;
  };
  const product = hotelData?.normalizedHotelData || {}; // Use normalized data directly
  const hasData = Object.keys(product).length > 0;

  const [isDescExpanded, setIsExpanded] = useState(false);

  if (!hasData)
    return (
      <div className="p-8 text-center text-muted-foreground">
        Loading hotel information...
      </div>
    );

  return (
    <div>
      <div className="space-y-6 mt-12 font-sans text-foreground  ">
        {/* desc*/}
        <div className="p-4 bg-surface rounded-xl shadow-sm border border-border">
          <h2 className="text-xl font-bold mb-5">The hotel's description</h2>

          <div className="flex flex-col lg:flex-row gap-10">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-3 text-foreground text-sm font-semibold uppercase tracking-wide">
                <MapPin size={16} className="text-muted-foreground" />
                <span>{product?.address || FALLBACKS.address}</span>
              </div>

              <div className="relative">
                {/* {product.short_desc && (
                  <p className="text-foreground text-[15px] font-medium leading-relaxed mb-4 italic bg-muted p-3 rounded-md border-l-4 border-border">
                    {product.short_desc}
                  </p>
                )} */}
                <div
                  className={`text-foreground text-[15px] leading-relaxed transition-all duration-300 ${!isDescExpanded
                      ? "line-clamp-4 max-h-[6em] overflow-hidden"
                      : ""
                    }`}
                >
                  <p
                    className="whitespace-pre-line text-muted-foreground"
                    dangerouslySetInnerHTML={{
                      __html:
                        product?.long_desc && product.long_desc.trim().length > 0
                          ? product.long_desc
                          : FALLBACKS.description,
                    }}
                  />
                </div>

                <button
                  onClick={() => setIsExpanded(!isDescExpanded)}
                  className="flex items-center gap-1 text-primary text-sm font-semibold mt-3 hover:text-primary-hover transition-colors"
                >
                  {isDescExpanded
                    ? "Hide the description"
                    : "Show the description"}
                  {isDescExpanded ? (
                    <ChevronUp size={16} />
                  ) : (
                    <ChevronDown size={16} />
                  )}
                </button>
              </div>
            </div>

            {/* <div className="w-full lg:w-72 shrink-0">
      <div className="bg-muted p-5 rounded-lg border border-border">
        <h3 className="text-sm font-bold text-foreground mb-4">Facts about the hotel</h3>

        <div className="mb-4">
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">
            Socket type
          </span>
          <div className="flex items-center justify-between">
            <span className="text-sm text-foreground font-semibold">
              {hotelFacts.socket} (grounded)
            </span>
            <Info size={14} className="text-muted-foreground cursor-help" />
          </div>
        </div>

        <div>
          <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider block mb-1">
            Voltage
          </span>
          <div className="text-sm text-foreground font-semibold">
            {hotelFacts.voltage} / 50 Hz
          </div>
        </div>
      </div>
    </div> */}
          </div>
        </div>

        {/*Amenties*/}
        {(() => {
          // Correctly access amenities from the normalized data
          const amenities = product?.amenities || [];
          let sortedAmenities = amenities;
          if (amenities.length > 0) {
            const popular = amenities.filter(
              (a) => a?.name === "Popular"
            );
            const general = amenities.filter(
              (a) => a?.name === "General"
            );
            const others = amenities.filter(
              (a) => a?.name !== "Popular" && a?.name !== "General"
            );

            sortedAmenities = [...popular, ...general, ...others];
          }
          if (sortedAmenities.length === 0) return null;
          return (
            <div className="bg-surface p-6 rounded-xl shadow-sm border border-border">
              <h2 className="text-xl font-bold mb-8">Services and amenities</h2>

              <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
                {sortedAmenities.map((category, index) => {
                  let subItems = category?.descriptions || [];
                  if (!Array.isArray(subItems) || subItems.length === 0)
                    subItems = [FALLBACKS.amenityItem];
                  const isPopular = category?.name === "Popular";

                  return (
                    <div
                      key={category?.id || `category-${index}`}
                      className={`break-inside-avoid mb-6 flex flex-col rounded-xl ${isPopular
                          ? "bg-primary/10 border border-primary/20 p-4"
                          : ""
                        }`}
                    >
                      <div className="flex items-center gap-3 mb-4">
                        {getAmenityIcon(category)}
                        <h3
                          className={`font-bold text-[16px] ${isPopular ? "text-primary" : "text-foreground"
                            }`}
                        >
                          {category?.name || FALLBACKS.amenityCategory}
                        </h3>
                      </div>

                      <ul className="space-y-2.5">
                        {subItems.map((item, subIndex) => (
                          <li
                            key={item?.id || subIndex}
                            className="flex items-start text-[14px] text-muted-foreground pl-1 group"
                          >
                              <span className="mr-2 text-muted-foreground text-[10px] mt-1 group-hover:text-primary transition-colors">
                              ●
                            </span>
                            <span className="leading-snug">{item?.text || item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })()}
      </div>
    </div>
  );
};

export default AccommodationHotelDetail;
