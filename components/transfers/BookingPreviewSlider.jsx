// components/product/BookingPreviewSlider.js
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { getFullImageUrl } from "@/utils/imageService";
import { ChevronLeft, ChevronRight, Luggage, User,ChevronDown, ChevronUp} from "lucide-react";

const BookingPreviewSlider = ({ items = [], bookingDetailsMap = {} }) => {
  const { t } = useTranslation("daytour", "common");
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
      const addonTotal = Number(addon.total ?? addonTotal ?? singlePrice * qty) || Number(addon.total ?? 0) || singlePrice * qty;

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
      acc[id].total += Number(addon.total ?? addonTotal ?? singlePrice * qty) || 0;
      return acc;
    }, {});
    return Object.values(map);
  };

  //  surcharges & addons 
  const pickupSurcharge = normalizeSurcharge(item?.pickupSurcharge);
  const returnSurcharge = normalizeSurcharge(item?.returnSurcharge);
  const totalSurcharge = pickupSurcharge + returnSurcharge;
  const hasPickupSurcharge = pickupSurcharge > 0;
  const hasReturnSurcharge = returnSurcharge > 0;

  let surchargeScope = "";
  if (hasPickupSurcharge && hasReturnSurcharge) surchargeScope = `(${t("roundtrip")})`;
  else if (hasReturnSurcharge) surchargeScope = `(${t("return")})`;
  else if (hasPickupSurcharge) surchargeScope = `(${t("pickup")})`;

  // --- Price logic ---
  const tourPrice =
    typeof item.pricing === "object"
      ? Number(item.pricing?.total) || 0
      : Number(item.pricing) || 0;

  const basePrice = isTransfer
    ? Number(item.vehicle?.final_promo_price) ||
      Number(item.vehicle?.promo_price) ||
      Number(item.vehicle?.price) ||
      0
    : tourPrice;
  const uniqueAddons = normalizeAddons(item?.addons ?? [], item?.addons_round ?? []);
  const addonsTotal = uniqueAddons.reduce((s, a) => s + (Number(a.total) || 0), 0);

  //  Total per item 
  const total = basePrice + addonsTotal + totalSurcharge;

  const adultCount = item?.adults || item?.pax || 0;
  const childCount = item?.child || 0;
  const date = details.date || item.selectedDate;

  //  Overall total  
  const overallTotal = items.reduce((sum, i) => {
    const isTransferItem = !!i.vehicle;
    const itemBasePrice = isTransferItem
      ? Number(i.vehicle?.final_promo_price) ||
        Number(i.vehicle?.promo_price) ||
        Number(i.vehicle?.price) ||
        0
      : typeof i.pricing === "object"
      ? Number(i.pricing?.total) || 0
      : Number(i.pricing) || 0;

    const normalizedAddons = normalizeAddons(i?.addons ?? [], i?.addons_round ?? []);
    const itemAddonsTotal = normalizedAddons.reduce((s, a) => s + (Number(a.total) || 0), 0);

    const itemPickupSurcharge = normalizeSurcharge(i?.pickupSurcharge);
    const itemReturnSurcharge = normalizeSurcharge(i?.returnSurcharge);
    const itemTotalSurcharge = itemPickupSurcharge + itemReturnSurcharge;

    const itemTotal = itemBasePrice + itemAddonsTotal + itemTotalSurcharge;
    return sum + itemTotal;
  }, 0);

  const title = isTransfer ? item.vehicle?.name : item.title;
  const image = isTransfer
    ? item.vehicle?.image?.startsWith("http")
      ? item.vehicle.image
      : getFullImageUrl(item.vehicle?.image)
    : item.image?.startsWith("http")
    ? item.image
    : getFullImageUrl(item.image);

  return (
    <div className="bg-white p-4 rounded-lg shadow-md">
      {/* Navigation */}
      <div className="flex justify-between items-center mb-2">
        <button onClick={handlePrev} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition" title={t("previous")}>
          <ChevronLeft size={16} className="text-slate-500" />
        </button>

        <span className="text-sm text-slate-500 font-medium">
          {t("product")} {current + 1} {t("of")} {items.length}
        </span>

        <button onClick={handleNext} className="w-6 h-6 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-300 transition" title={t("next")}>
          <ChevronRight size={16} className="text-slate-500" />
        </button>
      </div>

      {/* TRANSFER PREVIEW */}
      {isTransfer ? (
        <>
          <div className="flex gap-0 items-start rounded bg-gray-50 p-1 px-3">
            <div className="w-[70%]">
              <img src={image} alt={title} className="w-full h-32 object-contain rounded-lg" />
            </div>

            <div className="w-[30%] flex flex-col justify-between h-32">
              <div className="flex flex-col gap-2 pt-2">
                <span className="flex items-end justify-end gap-1 text-sm text-gray-700">
                  <User className="w-4 h-4" /> {item?.passengers}
                </span>
                <span className="flex items-end justify-end gap-1 text-sm text-gray-700">
                  <Luggage className="w-4 h-4" /> {item?.baggage}
                </span>
              </div>

              <div className="flex flex-col items-end justify-end text-xs text-gray-500">
                {item?.vehicle?.price && (
                  <span className="text-[#CC9A55] font-medium">{item.vehicle.price} SGD</span>
                )}
                {date && <span>{date}</span>}
              </div>
            </div>
          </div>

          {uniqueAddons.length > 0 && (
            <div className="mt-2">
              <ul className="space-y-1">
                {(showAllAddons ? uniqueAddons : uniqueAddons.slice(0, 2)).map((addon, index) => (
                  <li key={addon.addon_id ?? index} className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-2 py-2">
                    <span className="text-gray-700 text-xs flex items-center gap-2">
                      {addon.image && (
                        <img src={getFullImageUrl(addon.image)} alt={addon.title} className="w-6 h-6 rounded object-cover" />
                      )}
                      {addon.title}
                      <span className="text-gray-400 text-xs">(x{addon.quantity})</span>
                    </span>
                    <span className="text-sm text-gray-800 font-medium">{addon.total} SGD</span>
                  </li>
                ))}
              </ul>
              <div className="text-right">
                {uniqueAddons.length > 3 && (
                  <>
                    {!showAllAddons ? (
                      <button onClick={() => setShowAllAddons(true)} className="text-xs text-[#CC9A55] mt-2 inline-flex items-center">
                        {t('load_more', 'Load More')}
                        <ChevronDown className="w-4 h-4 ml-1" />
                      </button>
                    ) : (
                      <button onClick={() => setShowAllAddons(false)} className="text-xs text-[#CC9A55] mt-2 inline-flex items-center">
                        {t('load_less', 'Load Less')}
                        <ChevronUp className="w-4 h-4 ml-1" />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {totalSurcharge > 0 && (
            <p className="text-xs text-[#CC9A55] font-medium bg-gray-50 rounded-lg px-3 py-2 mt-1 flex justify-between items-center">
              <span>
                {t("Surcharges")} {surchargeScope}
              </span>
              <span>
                {pickupSurcharge > 0 && `${pickupSurcharge} `}{pickupSurcharge > 0 && returnSurcharge > 0 && " + "}{returnSurcharge > 0 && `${returnSurcharge} `} SGD
              </span>
            </p>
          )}
        </>
      ) : (
        /* DAY TOUR PREVIEW */
        <div className="rounded-lg bg-gray-50 p-3">
          <div className="flex gap-3">
            <div className="w-[70%]">
              <img src={image} alt={title} className="w-full h-32 object-cover rounded-lg" />
            </div>
            <div className="w-[30%] flex flex-col justify-between h-32">
              <div></div>
              <div className="text-xs text-gray-600 flex flex-col gap-1 justify-end items-end">
                {date && <span className="flex items-center gap-1">{date}</span>}
              </div>
            </div>
          </div>

          <div className="mt-2">
            <ul className="space-y-1">
              {adultCount > 0 && (
                <li className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-2 py-2">
                  <span className="text-gray-700 text-xs flex items-center gap-2">
                    <User size={12} /> {t("adult")}
                  </span>
                  <span className="text-sm text-gray-800 font-medium">x{adultCount}</span>
                </li>
              )}
              {childCount > 0 && (
                <li className="flex justify-between items-center text-sm bg-gray-50 rounded-lg px-2 py-2">
                  <span className="text-gray-700 text-xs flex items-center gap-2">
                    <User size={12} /> {t("child")}
                  </span>
                  <span className="text-sm text-gray-800 font-medium">x{childCount}</span>
                </li>
              )}
            </ul>
          </div>

          <div className="flex justify-between items-center border-t pt-2 mt-3 text-sm">
            <span>{t("price")}</span>
            <span className="text-[#CC9A55]">{tourPrice || "0"} SGD</span>
          </div>
        </div>
      )}

      {/* Overall Total */}
      <div className="pt-2 flex flex-col justify-between text-md font-normal">
        <div className="flex border-t mt-2 pt-2 justify-between text-lg font-semibold">
          <span>{t("total_all_items")}</span>
          <span className="text-[#CC9A55]">{overallTotal} SGD</span>
        </div>
      </div>
    </div>
  );
};

export default BookingPreviewSlider;
