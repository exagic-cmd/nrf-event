// components/product/BookingPreviewSlider.js
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { getFullImageUrl } from "@/utils/imageService";
import { ChevronLeft, ChevronRight, Luggage, User, ChevronDown, ChevronUp, BedDouble, Moon, Calendar } from "lucide-react";
import { format } from "date-fns";
import { formatPrice } from "@/utils/priceUtils";
const BookingPreviewSlider = ({ items = [], bookingDetailsMap = {} }) => {
  const { t } = useTranslation(["daytour", "common", "accommodation"]);
  const [current, setCurrent] = useState(0);
  const [showAllAddons, setShowAllAddons] = useState(false);

  useEffect(() => {
    setShowAllAddons(false);
  }, [current]);

  if (!items.length) return null;

  const handlePrev = () => setCurrent((prev) => (prev - 1 + items.length) % items.length);
  const handleNext = () => setCurrent((prev) => (prev + 1) % items.length);

  const item = items[current];
  const details = bookingDetailsMap[item.key] || {};
  const isTransfer = !!item.vehicle;
  const isAccommodation = item.type === "accommodation";

  const normalizeSurcharge = (data) => {
    if (Array.isArray(data)) {
      return data.reduce((sum, s) => sum + Number(s?.total ?? s?.amount ?? 0), 0);
    }
    return Number(data ?? 0) || 0;
  };

  const normalizeAddons = (...groups) => {
    const flat = groups.flatMap((g) => (Array.isArray(g) ? g : g ? [g] : [])).filter(Boolean);
    const map = flat.reduce((acc, addon) => {
      const id = addon.addon_id ?? addon.title ?? JSON.stringify(addon);
      const qty = Number(addon.quantity ?? 1) || 1;
      const singlePrice = Number(addon.price ?? addon.rate ?? addon.unit_price ?? 0) || 0;
      const addonTotal = Number(addon.total ?? singlePrice * qty) || 0;

      if (!acc[id]) {
        acc[id] = {
          ...addon,
          addon_id: addon.addon_id ?? id,
          title: addon.title ?? "",
          quantity: 0,
          total: 0,
        };
      }

      acc[id].quantity += qty;
      acc[id].total += addonTotal;
      return acc;
    }, {});
    return Object.values(map);
  };

  // Surcharges (only for transfers)
  const pickupSurcharge = isTransfer ? normalizeSurcharge(item?.pickupSurcharge) : 0;
  const returnSurcharge = isTransfer ? normalizeSurcharge(item?.returnSurcharge) : 0;
  const totalSurcharge = pickupSurcharge + returnSurcharge;
  const hasPickupSurcharge = pickupSurcharge > 0;
  const hasReturnSurcharge = returnSurcharge > 0;

  let surchargeScope = "";
  if (hasPickupSurcharge && hasReturnSurcharge) surchargeScope = `(${t("roundtrip")})`;
  else if (hasReturnSurcharge) surchargeScope = `(${t("return")})`;
  else if (hasPickupSurcharge) surchargeScope = `(${t("pickup")})`;

  // Price logic
  const basePrice = isAccommodation
    ? Number(item.total) || 0  // Use item.total which includes all rooms × nights
    : isTransfer
    ? Number(item.vehicle?.final_promo_price) ||
      Number(item.vehicle?.promo_price) ||
      Number(item.vehicle?.price) ||
      0
    : typeof item.pricing === "object"
    ? Number(item.pricing?.total) || 0
    : Number(item.pricing) || 0;

  const uniqueAddons = isAccommodation ? [] : normalizeAddons(item?.addons ?? [], item?.addons_round ?? []);
  const addonsTotal = uniqueAddons.reduce((s, a) => s + (Number(a.total) || 0), 0);

  const total = basePrice + addonsTotal + totalSurcharge;

  const adultCount = item?.adults || item?.pax || 0;
  const childCount = item?.child || 0;
  const totalGuests = isAccommodation ? (item.adult_count + item.child_count) : (adultCount + childCount);
  const date = details.date || item.selectedDate;

  // Overall total
  const overallTotal = items.reduce((sum, i) => {
    const isAcc = i.type === "accommodation";
    const isTrans = !!i.vehicle;

    const itemBasePrice = isAcc
      ? Number(i.total) || 0  // Use item.total which includes all rooms × nights
      : isTrans
      ? Number(i.vehicle?.final_promo_price) ||
        Number(i.vehicle?.promo_price) ||
        Number(i.vehicle?.price) ||
        0
      : typeof i.pricing === "object"
      ? Number(i.pricing?.total) || 0
      : Number(i.pricing) || 0;

    const itemAddons = isAcc ? [] : normalizeAddons(i?.addons ?? [], i?.addons_round ?? []);
    const itemAddonsTotal = itemAddons.reduce((s, a) => s + (Number(a.total) || 0), 0);

    const itemPickupSurcharge = isTrans ? normalizeSurcharge(i?.pickupSurcharge) : 0;
    const itemReturnSurcharge = isTrans ? normalizeSurcharge(i?.returnSurcharge) : 0;
    const itemTotalSurcharge = itemPickupSurcharge + itemReturnSurcharge;

    return sum + itemBasePrice + itemAddonsTotal + itemTotalSurcharge;
  }, 0);

  const title = isAccommodation
    ? item.productTitle
    : isTransfer
    ? item.vehicle?.name
    : item.title;

  const image = isAccommodation
    ? getFullImageUrl(item.image)
    : isTransfer
    ? item.vehicle?.image?.startsWith("http")
      ? item.vehicle.image
      : getFullImageUrl(item.vehicle?.image)
    : item.image?.startsWith("http")
    ? item.image
    : getFullImageUrl(item.image);

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd MMM");
    } catch {
      return dateStr || "";
    }
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-2">
        <button
          onClick={handlePrev}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition"
          title={t("previous")}
        >
          <ChevronLeft size={16} className="text-slate-500" />
        </button>

        <span className="text-sm text-slate-500 font-medium">
          {t("product")} {current + 1} {t("of")} {items.length}
        </span>

        <button
          onClick={handleNext}
          className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition"
          title={t("next")}
        >
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* ACCOMMODATION PREVIEW */}
      {isAccommodation ? (
        <div className="flex flex-col gap-2">
          <div className="bg-gray-50 p-2 rounded-lg">
            <img
              src={image || "/default-hotel.png"}
              alt={title}
              className="w-80 h-36 object-cover rounded-md"
            />
          </div>

          <div className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
              <span className="font-medium text-gray-600 flex items-center gap-1.5">
                <BedDouble size={14} /> {item.roomType}
              </span>
              <span className="text-sm text-gray-800 font-medium text-right">
                x{item.hotel_info?.roomsDetails?.length || 1} {t("room", { ns: "accommodation" })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
              <span className="font-medium text-gray-600 flex items-center gap-1.5">
                <Moon size={14} /> {item.nights} {t("nights", { ns: "accommodation" })}
              </span>
              <span className="font-medium text-gray-600 flex items-center gap-1.5">
                <User size={14} /> {totalGuests} {t("guests", { ns: "accommodation" })}
              </span>
            </div>
            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
              <span className="font-medium text-gray-600 flex items-center gap-1.5"><Calendar size={14} /> {t("Dates", { ns: "accommodation" })}</span>
              <span className="text-sm text-gray-800 font-medium text-right">{formatDate(item.check_in)} → {formatDate(item.check_out)}</span>
            </div>
            {/* <div className="flex justify-between items-center bg-white p-1.5 rounded">
              <span className="font-medium text-gray-600">{t("Bed Type", { ns: "accommodation" })}</span>
              <span className="font-semibold text-gray-800 text-right">{item.mealType}</span>
            </div> */}

            {/* {item.special_request && (
              <p className="italic text-gray-500">
                {t("specialRequests", { ns: "accommodation" })}: {item.specialRequests}
              </p>
            )} */}
          </div>

          <div className="flex justify-between items-center border-t pt-2 mt-2 text-sm">
            <span>{t("price")}</span>
            <span className="text-[#D3202D] font-semibold">SGD {formatPrice(basePrice)}</span>
          </div>
        </div>
      ) : isTransfer ? (
        /* TRANSFER PREVIEW (unchanged) */
        <div className="flex flex-col gap-2">
          <img src={image} alt={title} className="w-80 h-36 object-cover rounded-lg" />
          <div className="space-y-1.5 text-xs">
            <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
                <span className="flex items-end justify-end gap-1 text-sm text-gray-700">
                  <User className="w-4 h-4" /> {item?.passengers}
                   <Luggage className="w-4 h-4" /> {item?.baggage}
               
                </span>
                <span>
                  {item?.vehicle?.price && (
                  <span className="text-[#D3202D] font-medium">SGD {formatPrice(item.vehicle.price)}</span>
                )}
                </span>
              </div>
            {date && <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded"><span className="font-medium text-gray-600 flex items-center gap-1.5"><Calendar size={14} /> Date</span><span className="text-sm text-gray-800 font-medium">{date}</span></div>}
          </div>

           {(uniqueAddons.length > 0 || totalSurcharge > 0) && (
            <div className="mt-2">
              <ul className="space-y-1">
                {(showAllAddons ? uniqueAddons : uniqueAddons.slice(0, 2)).map((addon, index) => (
                  <li
                    key={addon.addon_id ?? index}
                    className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-2 py-2"
                  >
                    <span className="text-gray-700 text-xs flex items-center gap-2">
                      {addon.image && (
                        <img
                          src={getFullImageUrl(addon.image)}
                          alt={addon.title}
                          className="w-6 h-6 rounded object-cover"
                        />
                      )}
                      {addon.title}
                      <span className="text-gray-400 text-xs">(x{addon.quantity})</span>
                    </span> 
                    <span className="text-sm text-gray-800 font-medium">SGD {addon.total} </span>
                  </li>
                ))}
                {showAllAddons && totalSurcharge > 0 && (
                  <li className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-2 py-2">
                    <span className="text-[#D3202D] text-xs font-medium flex items-center gap-2">
                      {t("Surcharges")} {surchargeScope}
                    </span>
                    <span className="text-sm  font-medium">
                      SGD {formatPrice(totalSurcharge)}
                    </span>
                  </li>
                )}
              </ul>
              <div className="text-right">
                {(uniqueAddons.length > 2 || (uniqueAddons.length > 0 && totalSurcharge > 0)) && (
                  <>
                    {!showAllAddons ? (
                      <button
                        onClick={() => setShowAllAddons(true)}
                        className="text-xs text-[#D3202D] mt-2 inline-flex items-center"
                      >
                        {t("load_more", "Load More")}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button
                        onClick={() => setShowAllAddons(false)}
                        className="text-xs text-[#D3202D] mt-2 inline-flex items-center"
                      >
                        {t("load_less", "Load Less")}
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          <div className="flex justify-between items-center border-t pt-2 mt-2 text-sm">
            <span>{t("price")}</span>
            <span className="text-[#D3202D] font-semibold">SGD {formatPrice(total)}</span>
          </div>
        </div>
      ) : (
        /* DAY TOUR PREVIEW (unchanged) */
        <div className="flex flex-col gap-2">
          <img
            src={image}
            alt={title}
            className="w-80 h-36 object-cover rounded-lg"
          />
          <div className="space-y-1.5 text-xs">
            {date && (
              <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><Calendar size={14} /> Date</span>
                <span className="text-sm text-gray-800 font-medium">{date}</span>
              </div>
            )}
            {adultCount > 0 && (
              <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><User size={14} /> {t("adult")}</span>
                <span className="text-sm text-gray-800 font-medium">x{adultCount}</span>
              </div>
            )}
            {childCount > 0 && (
              <div className="flex justify-between items-center bg-gray-50 p-1.5 rounded">
                <span className="font-medium text-gray-600 flex items-center gap-1.5"><User size={14} /> {t("child")}</span>
                <span className="text-sm text-gray-800 font-medium">x{childCount}</span>
              </div>
            )}
          </div>

          <div className="flex justify-between items-center border-t pt-2 mt-3 text-sm">
            <span>{t("price")}</span>
            <span className="text-[#D3202D]">SGD {formatPrice(basePrice) || "0"}</span>
          </div>
        </div>
      )}

      {/* Overall Total */}
      <div className="pt-2 flex flex-col justify-between text-md font-normal">
        <div className="flex border-t mt-2 pt-2 justify-between text-lg font-semibold">
          <span>{t("total_all_items")}</span>
          <span className="text-[#D3202D]">SGD {formatPrice(overallTotal)}</span>
        </div>
      </div>
    </div>
  );
};

export default BookingPreviewSlider;