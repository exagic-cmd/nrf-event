import React, { useState } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { MapPin, Star, Wifi, Car, Utensils, Bed, Bath, Tv, Coffee,CircleParking ,ParkingCircle, Baby, SwimmingPool } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import SvgLoader2 from "@/components/common/Loader2Svg";

function AccommodationCard({ accommodation, category = "accommodation" }) {

   const hotelData = accommodation.Hotel_Data;
  const results = accommodation?.Result
    ? (Array.isArray(accommodation.Result) ? accommodation.Result : [accommodation.Result])
    : [];
    
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("accommodation");
  const { items } = useCartStore();
  const { searchParams } = useAccommodationsStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Get the "Popular" amenity
  const popularAmenity = Array.isArray(hotelData?.amenities)
    ? hotelData.amenities.find((a) => a.name === "Popular")
    : null;

  // Parse descriptions safely and normalize to array of strings
  let descriptions = [];
  const rawDescriptions = popularAmenity?.pivot?.descriptions;
  if (rawDescriptions) {
    if (Array.isArray(rawDescriptions)) {
      descriptions = rawDescriptions.map((d) => (typeof d === "string" ? d : String(d)));
    } else if (typeof rawDescriptions === "string") {
      try {
        const parsed = JSON.parse(rawDescriptions);
        if (Array.isArray(parsed)) descriptions = parsed.map((d) => (typeof d === "string" ? d : String(d)));
        else if (typeof parsed === "string") descriptions = parsed.split(",").map((s) => s.trim()).filter(Boolean);
        else if (parsed && typeof parsed === "object") descriptions = Object.values(parsed).map((v) => String(v));
      } catch (e) {
        // Not a JSON string, try comma-split
        descriptions = rawDescriptions.split(",").map((s) => s.trim()).filter(Boolean);
      }
    } else if (typeof rawDescriptions === "object") {
      descriptions = Object.values(rawDescriptions).map((v) => String(v));
    }
  }

  const iconComponentMap = {
    "Free Internet": Wifi,
    "Transfer": Car,
    "Parking": ParkingCircle,
    "Suitable for children": Baby,
    "Swimming Pool": SwimmingPool,
  };

  const iconComponentMapLower = Object.keys(iconComponentMap).reduce((acc, key) => {
    acc[key.toLowerCase()] = iconComponentMap[key];
    return acc;
  }, {});

  // Helper to normalize description strings (remove brackets/quotes/extra spaces)
  const normalizeDesc = (d) => {
    if (!d && d !== 0) return "";
    if (typeof d === "object") {
      // pick a reasonable string from object
      return String(d.name ?? d.label ?? d.text ?? Object.values(d).join(" ")).trim();
    }
    let s = String(d).trim();
    // remove wrapping brackets and quotes and extra whitespace
    s = s.replace(/^[\[\]\s"']+|[\[\]\s"']+$/g, "");
    return s;
  };

  // Safe icon renderer: if the icon component exists, render it, otherwise render a small dot placeholder
  const renderIconSafe = (IconComp, props = {}) => {
    if (IconComp && typeof IconComp === "function") return <IconComp {...props} />;
    return <span className={`inline-block ${props.className || "w-3 h-3"} bg-gray-500 rounded-full mr-2`} />;
  };

  const roomsArr = Array.isArray(searchParams?.rooms) ? searchParams.rooms : (typeof searchParams?.rooms === 'number' ? new Array(Number(searchParams.rooms)).fill({}) : [{ adult: 1, children: [] }]);
      const roomsCount = Array.isArray(searchParams?.rooms) ? searchParams.rooms.length : (Number(searchParams?.rooms) || roomsArr.length);
      const totalAdults = roomsArr.reduce((sum, r) => sum + (Number(r?.adult) || 0), 0) || 0;
      const totalChildren = roomsArr.reduce((sum, r) => {
        if (Array.isArray(r?.children)) return sum + r.children.length;
        return sum + (Number(r?.children) || 0);
      }, 0) || 0;

  const allRoomPrices = [];
  // Filter out any falsy result entries and iterate safely
  const validResults = results.filter(Boolean);
  validResults.forEach((res) => {
    const rooms = res?.Room ? (Array.isArray(res.Room) ? res.Room : [res.Room]) : [];
    rooms.forEach((room) => {
      // Price may be nested under Room.Price['@attributes'].amt or Room.Price. Handle defensively.
      const amt = room?.Price?.["@attributes"]?.amt ?? room?.Price?.amt ?? room?.Price;
      const num = amt != null ? parseFloat(amt) : NaN;
      if (!Number.isNaN(num)) allRoomPrices.push(num);
    });
  });
  const lowestPrice = allRoomPrices.length > 0 ? Math.min(...allRoomPrices) : hotelData?.starting_price || 0;

  // Parse address if available
  // const address = hotelData.address ? JSON.parse(hotelData.address) : {};
  const address = hotelData?.address;
  
  // Parse rating if available
  const rating = hotelData.rating ? JSON.parse(hotelData.rating) : null;
  
  // Parse amenities and convert to array
 // const amenities = hotelData?.amenities ? hotelData.amenities.split(',').map(s => s.trim()).filter(Boolean).slice(0, 3) : [];

  // Parse media to get images
  const media = Array.isArray(hotelData?.media) ? hotelData.media : [];
  const mainImage = hotelData.image ?? "";

  const formatPrice = (value) => {
    const num = Number(value);
    return Number.isInteger(num) ? num.toString() : num.toFixed(2);
  };

  const handleCardClick = async () => {
    setIsLoading(true);
    try {
      // Check if already in cart
      const alreadyExists = items.some(
      (item) => item.tourId === hotelData.stuba_id && item.category === "accommodation"
      );

      if (alreadyExists) {
      setShowModal(true);
      } else {
      // Navigate to accommodation details page
      const detailId = hotelData.link_type_id !== 9 ? hotelData?.id : hotelData.stuba_id;
      localizedPush({
      pathname: `/accommodation/detail/${detailId}`,
      query: { link_type_id: hotelData.link_type_id }
        });
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4">{t("card.modal.alreadyInCart")}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#CC9A55] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Card */}
      <div
        className="relative border rounded-xl shadow-sm bg-white w-full mx-auto overflow-hidden flex flex-col md:flex-row gap-3"
      >
        {isLoading && (
          <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
            <SvgLoader2 />
          </div>
        )}

        {/* Image */}
        <div className="relative w-full md:w-[300px] flex-shrink-0 flex justify-center items-center">
          <img
           src={$helpers.getEnv('CLOUDINARY_BASE_URL') + mainImage}
            alt={hotelData.title}
            className="object-cover h-[235px] w-full md:w-[300px]"
          />

          {/* Star Rating Badge */}
          {hotelData.stars && (
            <span className="absolute top-1 left-1 flex items-center gap-1 px-2 py-1 text-xs font-semibold text-white rounded-md bg-yellow-500">
              <Star size={10} />
              <span>{hotelData.stars} ★</span>
            </span>
          )}
        </div>

        {/* Info Section */}
        <div className="flex-1 flex flex-col justify-between pr-2.5 pl-2.5">
          <div>
           <div className="flex flex-col justify-between my-1">
             <h2 className="font-bold text-md lg:text-md line-clamp-1 text-[#D3202D]">{hotelData.title || hotelData.product_title}</h2>
            
            {/* Location and Rating */}
            <div className="flex md:flex-wrap gap-x-4 gap-y-1 text-xs text-gray-600">
              {(address || hotelData.country_name) && (
                <div className="flex items-center gap-1">
                  <MapPin className="" size={12} />
                  <span className="">{hotelData.country_name}</span>
                </div>
              )}
            </div>
            <div className="flex items-center justify-between gap-1 mt-2">
              <ul>
                <li className="text-[12px]">1 km from the Singapore center</li>
                <li className="text-[12px]">196 m from Telok Ayer</li>
              </ul>
              <div className="flex gap-1 text-gray-700">
    <Bed className="w-5 h-5" />
    <Bath className="w-5 h-5" />
    <Wifi className="w-5 h-5" />
    <Tv className="w-5 h-5" />
    <Coffee className="w-5 h-5" />
  </div>
            </div>
           </div>
            {/* Room Info Section */}
<div className="hidden md:grid grid-cols-1 md:grid-cols-3 gap-4 mt-2 text-sm bg-[#f5f5f5] p-2 rounded">

  {/* First Column: Guests */}
  <div>
    {(() => {
      // derive counts from searchParams
      

      return (
        <>
          <p className="font-semibold">{roomsCount} room{roomsCount !== 1 ? 's' : ''}</p>
          <p className="text-gray-700 text-[12px]">For {totalAdults} adult{totalAdults !== 1 ? 's' : ''} and {totalChildren} child{totalChildren !== 1 ? 'ren' : ''}</p>
        </>
      );
    })()}
  </div>

  {/* Second Column: Policies */}
<div>
  <ul className="space-y-1 text-gray-700 text-[12px]">
  {(() => {
    const descArray = Array.isArray(descriptions) 
      ? descriptions 
      : (descriptions ? [descriptions] : []);

    const visible = descArray.slice(0, 2);
    const hiddenCount = descArray.length - 2;

    return (
      <>
      {visible.map((rawDesc, i) => {
        const desc = normalizeDesc(rawDesc);
        const IconComp = iconComponentMapLower[desc.toLowerCase()];

        return (
        <li key={i} className="flex items-center">
          {renderIconSafe(IconComp, { className: "w-2 h-2 text-gray-600 mr-2" })}
          {desc}
        </li>
        );
      })}

      {/* Show "+X more" if there are hidden items */}
      {hiddenCount > 0 && (
        <li 
        className="flex items-center text-gray-500 text-xs cursor-help"
        title={descArray.slice(2).map(d => normalizeDesc(d)).join(', ')}
        >
        <span className="inline-block w-2 h-2 bg-gray-400 rounded-full mr-2" />
        +{hiddenCount} more
        </li>
      )}
      </>
    );
  })()}
</ul>
</div>

  {/* Third Column: Price */}
  <div className="text-right">
    <p className="text-lg font-bold text-primary"> {formatPrice(lowestPrice)} {hotelData?.currency || accommodation.currency || 'USD'}</p>
    {/* <p className="text-gray-700 text-[12px]">for a night for {totalAdults}  adults and {totalChildren} children</p> */}
  </div>

</div>


            {/* Room Types Preview */}
                  {validResults.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-1">
                    {validResults.slice(0, 2).map((result, idx) => {
                      const roomsArr = result?.Room ? (Array.isArray(result.Room) ? result.Room : [result.Room]) : [];
                      const roomTypeTexts = roomsArr
                        .map((r) => r?.RoomType?.["@attributes"]?.text)
                        .filter(Boolean);
                      const displayText = roomTypeTexts.length > 0 ? roomTypeTexts[0] : "Room";
                      return (
                        <span
                          key={idx}
                          className="px-2 py-0.5 bg-blue-100 text-blue-700 text-[10px] rounded-full"
                        >
                          {displayText}
                        </span>
                      );
                    })}
                    {validResults.length > 2 && (
                      <span
                        className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] rounded-full hover:bg-gray-200 cursor-help"
                        title={results
                          .slice(2)
                          .map((result) => {
                            const roomsArr = result?.Room ? (Array.isArray(result.Room) ? result.Room : [result.Room]) : [];
                            return roomsArr
                              .map((r) => r?.RoomType?.["@attributes"]?.text)
                              .filter(Boolean)
                              .join(', ');
                          })
                          .filter(Boolean)
                          .join(', ')}
                      >
                        +{results.length - 2} more
                      </span>
                    )}
                    </div>
                  )}

                  {/* Amenities */}
            {/* {amenities.length > 0 && (
              <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
                {amenities.map((amenity, idx) => (
                  <li key={idx}>{amenity}</li>
                ))}
              </ul>
            )} */}
          </div>

          {/* Bottom Section */}
<div className="flex items-end mt-1">
  {/* Left side: price (mobile only) */}
  <div className="block md:hidden mr-auto">
    <p className="text-lg font-bold text-primary">
      {formatPrice(lowestPrice)}{" "}
      {hotelData?.currency || accommodation.currency || "USD"}
    </p>
    <p className="text-[11px] md:text-[12px] text-gray-700 mb-2">
      for a night for {totalAdults} adults and {totalChildren} children
    </p>
  </div>

  {/* Right side button */}
  <button
    type="button"
    onClick={handleCardClick}
    className="rounded-lg mb-2.5 bg-[#D3202D] text-white px-4 py-2 active:bg-[#b71c1c] transition touch-manipulation cursor-pointer ml-auto"
  >
    {isLoading ? (
      <span className="flex items-center gap-2">
        <SvgLoader2 className="w-4 h-4" />
        {t("common.loading")}
      </span>
    ) : (
      "Book Now"
    )}
  </button>
</div>




        </div>
      </div>
    </>
  );
}

export default AccommodationCard;