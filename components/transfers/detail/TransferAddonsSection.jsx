import { useEffect, useState, useCallback } from "react";
import useBookingStore from "@/store/userBookingStore";
import Loading2Svg from "@/components/common/Loader2Svg";
import Image from "next/image";
import { getFullImageUrl } from "@/utils/imageService";
import { Check, ChevronDown, ChevronUp, Plus, Minus, Calendar, X } from "lucide-react";
import { useTransferStore } from "@/store/useTransferStore";
import { useTranslation } from "next-i18next";
import useCurrencyStore from "@/store/useCurrencyStore";

const TransferAddonsSection = ({ onAddonsChange, tripPart, disabled = false }) => {
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [addonDetail, setAddonDetail] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const { t } = useTranslation(["transfer", "common"]);

  const {
    transferAddons,
    loadingTransferAddons,
    errorTransferAddons,
    fetchTransferAddons,
  } = useBookingStore();

  const storeCurrencyId = useCurrencyStore((state) => state.currencyId);
  const { setAddons, selectedPickupDate, selectedReturnDate, selectedTransfer } = useTransferStore();

const pickupDate = selectedPickupDate;
const returnDate = selectedReturnDate;
const formatDate = (dateString) => {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return "";
  // Format to MM DD YYYY
  return date
    .toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
    .replaceAll("/", " ");
};


  const dateToShow =
    tripPart === "pickup" ? formatDate(pickupDate) : formatDate(returnDate);

  useEffect(() => {
    if (selectedTransfer?.product_id) {
      fetchTransferAddons({
        language_id: 1,
        product_id: selectedTransfer.product_id,
        pickup_id: selectedTransfer.pickup_point_id,
        dropoff_id: selectedTransfer.dropoff_point_id,
        currency_id: storeCurrencyId,
      });
    }
  }, [fetchTransferAddons, selectedTransfer?.product_id, selectedTransfer?.pickup_point_id, selectedTransfer?.dropoff_point_id, storeCurrencyId]);

  useEffect(() => {
    const addonsWithTotal = selectedAddons.map((a) => ({
      ...a,
      total: a.rate * a.quantity,
    }));

    setAddons(tripPart, addonsWithTotal);

    if (typeof onAddonsChange === "function") {
      onAddonsChange(addonsWithTotal);
    }
  }, [selectedAddons, onAddonsChange, setAddons, tripPart]);

  const toggleAddon = useCallback(
    (addon) => {
      if (disabled) return;
      setSelectedAddons((prev) => {
        const exists = prev.find((s) => s.addon_id === addon.id);
        if (exists) return prev.filter((s) => s.addon_id !== addon.id);

        return [
          ...prev,
          {
            addon_id: addon.id,
            rate: addon.price,
            quantity: 1,
            type: addon.type,
            title: addon.title || addon.name,
            image: addon.image || null,
            description:
              addon.description || addon.desc || addon.short_description || "",
          },
        ];
      });
    },
    [disabled]
  );

  const handleQuantityChange = (addon, change) => {
    if (disabled) return;
    setSelectedAddons((prev) =>
      prev.map((s) =>
        s.addon_id === addon.id
          ? { ...s, quantity: Math.max(1, s.quantity + change) }
          : s
      )
    );
  };

  if (loadingTransferAddons)
    return (
      <div className="bg-surface rounded-lg p-6 shadow-sm mb-4">
        <Loading2Svg />
      </div>
    );

  if (errorTransferAddons)
    return (
      <div className="bg-surface rounded-lg p-6 shadow-sm mb-4 text-red-500">
        <p>{t("error_loading_addons")}: {errorTransferAddons}</p>
      </div>
    );

  if (!transferAddons || transferAddons.length === 0)
    return (
      <div className="bg-surface rounded-lg p-6 shadow-sm mb-4 text-muted-foreground">
        {t("no_addons_available")}
      </div>
    );

  const filteredAddons = transferAddons.filter((addon) => {
    if (tripPart === "pickup") return addon.flag === "arrival" || addon.flag === "two_way";
    if (tripPart === "return") return addon.flag === "departure" || addon.flag === "two_way";
    return true;
  });

  const handleAddonClick = (addon) => {
    setAddonDetail(addon);
  };

  const visibleAddons = showAll ? filteredAddons : filteredAddons.slice(0, 3);

  const renderCard = (addon) => {
    const selected = selectedAddons.find((s) => s.addon_id === addon.id);
    const isSelected = Boolean(selected);
    const displayPrice = isSelected ? selected.rate * selected.quantity : addon.price;
    const addonDescription = addon.description || addon.desc || addon.short_description || "";

    return (
      <div
        key={addon.id}
        className={`relative rounded-xl overflow-hidden shadow-md transition-all duration-300 bg-surface
          ${isSelected ? "ring-2 ring-primary shadow-lg" : "hover:shadow-lg"}
          ${disabled ? "opacity-70 cursor-not-allowed" : "cursor-pointer"}`}
        onClick={(e) => {
          if (e.target.closest('button, a')) return;
          handleAddonClick(addon);
        }}
      >
        {/* --- Mobile --- */}
        <div className="md:hidden flex gap-3 p-3">
          <div className="relative flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden bg-muted">
            {addon.image ? (
              <Image
                src={getFullImageUrl(addon.image)}
                alt={addon.name || addon.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {t("no_image")}
              </div>
            )}
            {isSelected && (
              <div className="absolute top-1 left-1 bg-primary text-primary-foreground p-1 rounded-full">
                <Check size={12} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="flex-1 flex flex-col justify-between min-w-0">
            <div>
              <h3 className="font-bold text-sm text-foreground mb-1 line-clamp-2">
                {addon.title || addon.name}
              </h3>
              {addonDescription && (
                <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                  {addonDescription}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-bold text-primary">
              {addon?.currency||""} {displayPrice} 
              </span>

              {!isSelected ? (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleAddonClick(addon);
                  }}
                  disabled={disabled}
                  className="px-4 py-1.5 bg-primary text-primary-foreground text-xs font-semibold rounded-lg transition-colors hover:bg-primary-hover disabled:opacity-50"
                >
                  {t("add", "Add")}
                </button>
              ) : (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAddon(addon);
                  }}
                  disabled={disabled}
                  className="px-3 py-1.5 text-muted-foreground text-white text-xs font-semibold rounded-lg transition-colors disabled:opacity-50"
                >
                  {t("remove")}
                </button>
              )}
            </div>

            {isSelected && addon.type === "per_pax" && !disabled && (
              <div className="flex items-center gap-2 mt-2 bg-muted rounded-lg p-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(addon, -1);
                  }}
                  className="w-5 h-5 bg-surface rounded-md shadow-sm hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <Minus size={14} />
                </button>
                <span className="flex-1 text-center font-bold text-sm">
                  {selected?.quantity || 1}
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleQuantityChange(addon, 1);
                  }}
                  className="w-5 h-5 bg-surface rounded-md shadow-sm hover:bg-muted transition-colors flex items-center justify-center"
                >
                  <Plus size={14} />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* --- Desktop --- */}
        <div className="hidden md:block">
          <div className="relative h-36 bg-muted">
            {addon.image ? (
              <Image
                src={getFullImageUrl(addon.image)}
                alt={addon.name || addon.title}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
                {t("no_image")}
              </div>
            )}
            <div className="absolute top-1 right-1 bg-black/70 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-sm font-bold shadow-lg">
            {addon?.currency||""} {displayPrice} 
            </div>

            {isSelected && (
              <div className="absolute top-3 left-3 bg-primary text-primary-foreground p-2 rounded-full shadow-lg">
                <Check size={16} strokeWidth={3} />
              </div>
            )}
          </div>

          <div className="p-4">
            <h3 className="font-bold text-md text-foreground mb-2 line-clamp-2">
              {addon.title || addon.name}
            </h3>

            {addonDescription && (
              <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                {addonDescription}
              </p>
            )}

            {!isSelected ? (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleAddonClick(addon);
                }}
                disabled={disabled}
                className="w-full bg-primary text-primary-foreground py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:bg-primary-hover hover:shadow-lg disabled:opacity-50"
              >
                {t("add", "Add")}
              </button>
            ) : (
              <div className="space-y-2">
                {addon.type === "per_pax" && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center justify-between bg-muted rounded-lg p-2"
                  >
                    <button
                      onClick={() => handleQuantityChange(addon, -1)}
                      disabled={disabled}
                      className="w-7 h-7 bg-surface rounded-md shadow hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Minus size={12} />
                    </button>
                    <span className="font-bold text-foreground px-4">
                      {selected?.quantity || 1}
                    </span>
                    <button
                      onClick={() => handleQuantityChange(addon, 1)}
                      disabled={disabled}
                      className="w-7 h-7 bg-surface rounded-md shadow hover:bg-muted transition-colors flex items-center justify-center disabled:opacity-50"
                    >
                      <Plus size={12} />
                    </button>
                  </div>
                )}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleAddon(addon);
                  }}
                  disabled={disabled}
                  className="w-full bg-muted0 hover:text-muted-foreground text-white py-2.5 rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg disabled:opacity-50"
                >
                  {t("remove")}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div className="bg-surface rounded-2xl p-4 md:p-6 shadow-sm mb-6">
        <div className="mb-4 flex flex-wrap justify-between items-center gap-2">
          <h2 className="text-lg md:text-xl font-semibold text-foreground">
            {tripPart === "pickup"
              ? t("pickup_addons", "Pickup Addons")
              : t("return_addons", "Return Addons")}
          </h2>
          <span className="text-sm text-muted-foreground flex items-center gap-1">
            <Calendar size={16} className="text-primary" />
            {dateToShow || t("no_date_selected", "No date selected")}
          </span>
        </div>

        <div className="space-y-3 md:grid md:grid-cols-3 md:gap-4 md:space-y-0">
          {visibleAddons.map(renderCard)}
        </div>

        {filteredAddons.length > 3 && (
          <div className="flex justify-center mt-6">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="flex items-center gap-2 px-6 py-2.5 bg-surface hover:bg-primary/10 text-primary font-semibold rounded-full shadow-md hover:shadow-lg transition-all duration-300"
            >
              {showAll ? (
                <>
                  {t("show_less", "Show Less")} <ChevronUp size={18} />
                </>
              ) : (
                <>
                  {t("load_more", "Load More")} ({filteredAddons.length - 3}){" "}
                  <ChevronDown size={18} />
                </>
              )}
            </button>
          </div>
        )}
      </div>
      <AddonDetailModal
        addon={addonDetail}
        onClose={() => setAddonDetail(null)}
        isSelected={addonDetail && selectedAddons.some((s) => s.addon_id === addonDetail.id)}
        onToggle={toggleAddon}
      />
    </>
  );
};

const AddonDetailModal = ({ addon, onClose, isSelected, onToggle }) => {
  const { t } = useTranslation(["transfer", "common"]);
  if (!addon) return null;

  const addonDescription = (addon.long_desc || addon.long_description || addon.desc || addon.short_description || "").replace(/\\n/g, ' ').replace(/\s+/g, ' ').trim();
  
  const parseList = (str) => {
    if (!str) return [];
    return str.split('\n').map(item => item.trim()).filter(Boolean);
  };
  const inclusions = parseList(addon.inclusion);
  const exclusions = parseList(addon.exclusion);


  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-surface rounded-2xl shadow-xl w-full max-w-md m-auto relative overflow-hidden flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="relative h-48 bg-muted flex-shrink-0">
          {addon.image ? (
            <Image
              src={getFullImageUrl(addon.image)}
              alt={addon.name || addon.title}
              fill
              className="object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-sm text-muted-foreground">
              {t("no_image")}
            </div>
          )}
        </div>
        <div className="p-6 lg:max-h-[calc(100vh-22rem)] max-h-[calc(80vh-11rem)] overflow-y-auto flex-1">
          <h3 className="font-bold text-xl text-foreground mb-2">
            {addon.title || addon.name}
          </h3>
          {addonDescription && (
            <p className="text-sm text-muted-foreground mb-4 text-justify">
              {addonDescription}
            </p>
          )}

          {inclusions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-md text-foreground mb-2">{t("whats_included", "What's Included")}</h4>
              <ul className="space-y-1.5">
                {inclusions.map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    <Check size={16} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {exclusions.length > 0 && (
            <div className="mb-4">
              <h4 className="font-semibold text-md text-foreground mb-2">{t("whats_not_included", "What's Not Included")}</h4>
              <ul className="space-y-1.5">
                {exclusions.map((item, index) => (
                  <li key={index} className="flex items-start text-sm text-muted-foreground">
                    {/* <X size={16} className="text-red-500 mr-2 mt-0.5 flex-shrink-0" /> */}
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
        <div className="p-4 border-t border-border flex gap-3 bg-surface z-10">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 text-sm rounded-xl font-bold text-muted-foreground bg-muted hover:bg-secondary transition-colors"
          >
            {t("cancel", "Cancel")}
          </button>
          <button
            onClick={() => {
              if (!isSelected) onToggle(addon);
              onClose();
            }}
            className="flex-1 py-2.5 text-sm rounded-xl font-bold text-primary-foreground bg-primary hover:bg-primary-hover transition-colors shadow-lg shadow-primary/20"
          >
            {t("accept_continue", "Accept & Continue")}
          </button>
        </div>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 bg-surface/80 backdrop-blur-sm rounded-full p-2 hover:bg-surface transition-all z-20"
          >
            <X size={20} className="text-muted-foreground" />
          </button>
        </div>
    </div>
  );
};

export default TransferAddonsSection;
