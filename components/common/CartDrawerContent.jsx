// components/cart/CartDrawerContent.jsx
import { useState, useEffect } from "react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import { getFullImageUrl } from "@/utils/imageService";
import { Trash2, Clock } from "lucide-react";
import { useDrawerStore } from "@/store/useDrawerStore";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import ConfirmExtendModal from "@/components/common/ExpireHoldModal";
import { useProductStore } from "@/store/useProductStore";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from "next/router";
import { format } from "date-fns";
import { formatPrice } from "@/utils/priceUtils";
import { toast } from 'react-toastify';
const CartDrawerContent = () => {
  const { t } = useTranslation(["common", "accommodation", "transfer"]);
  const { localizedPush } = useLocalizedRouter();
  const router = useRouter();

  const isOnPaynowPage = router.pathname === "/checkout";
  const { bookProduct } = useProductStore();
  const { items, removeItem, setItemToEdit, extendHoldForItem, validateHoldsBeforeCheckout } = useCartStore();
  const { setDrawerContent, openDrawer, closeDrawer, setJustAdded } = useDrawerStore();

  const [itemToDelete, setItemToDelete] = useState(null);
  const [itemToExtend, setItemToExtend] = useState(null);
  const [timeNow, setTimeNow] = useState(Date.now());

  useEffect(() => {
    const t = setInterval(() => setTimeNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);
  useEffect(() => {
    const expiredItems = items.filter(
      (item) =>
        item.type === "accommodation" &&
        item.holdExpiresAt &&
        timeNow > item.holdExpiresAt + 600000
    );

    if (expiredItems.length > 0) {
      expiredItems.forEach((item) => {
        console.log(`Reserve for ${item.productTitle} expired and grace period passed. Removing from cart.`);
        removeItem(item.key);
        //  toast.warn(`The hold for "${item.productTitle}" expired and it has been removed from your cart.`);
      });
    }
  }, [timeNow, items, removeItem]);
  // Total price
  const total = items.reduce((sum, item) => {
    let itemPrice = 0;
    if (item.type === "accommodation") {
      itemPrice = Number(item.price) || 0;
    } else if (typeof item.pricing === "object") {
      itemPrice = Number(item.pricing?.total) || 0;
    } else {
      itemPrice = Number(item.pricing || item?.price) || 0;
    }
    return sum + itemPrice;
  }, 0);

  const handleContinue = () => {
    closeDrawer();
    const isTourListPage = router.pathname === "/";
    const isTourDetailPage = router.pathname === "/";
    if (!isTourListPage && !isTourDetailPage) {
      localizedPush("/");
    }
  };

  const handleEdit = async (item) => {
    setJustAdded(false);
    closeDrawer();
    localizedPush(`/`);
  };

  const confirmDelete = () => {
    if (itemToDelete) {
      removeItem(itemToDelete.key);
      setItemToDelete(null);
    }
  };

  const handleProceed = () => {
    (async () => {
      // Validate holds before proceeding to checkout
      const res = await validateHoldsBeforeCheckout();
      if (!res.success) {
        toast.error("This accommodation allotment is no longer available.");
        return;
      }
      sessionStorage.setItem("fromBooking", "true");
      closeDrawer();
      localizedPush(`/checkout`);
    })();
  };

  const cancelDelete = () => {
    setItemToDelete(null);
  };

  const formatDate = (dateStr) => {
    try {
      return format(new Date(dateStr), "dd MMM");
    } catch {
      return dateStr || "N/A";
    }
  };

  return (
    <div className="p-4 text-sm text-foreground">
      {items.length === 0 ? (
        <p className="text-center text-muted-foreground mt-10">{t("emptyCart", "Cart Empty")}</p>
      ) : (
        <>
          <ul className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
            {items.map((item, idx) => {
              const isAccommodation = item.type === "accommodation";

              return (
                <li key={idx} className="flex gap-4 items-center border-b pb-3 relative">
                  {/* Image */}
                  <img
                    src={
                      isAccommodation
                        ? getFullImageUrl(item.image) || "/default-hotel.png"
                        : item.image
                          ? getFullImageUrl(item.image)
                          : getFullImageUrl(item.vehicle?.image || item.vehicle?.vehicle_image) || "/default-vehicle.png"
                    }
                    alt={
                      isAccommodation
                        ? item.productTitle
                        : item.vehicle?.vehicle_name || item.vehicle?.name || item.title || t("transfer")
                    }
                    className="w-16 h-16 rounded-lg object-cover border"
                  />

                  <div className="flex-1">
                    {isAccommodation ? (
                      <>
                        {/* Accommodation Title */}
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {item.productTitle}
                        </h4>

                        {/* Accommodation Details */}
                        <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                          <p>
                            {item.nights} {item.nights === 1 ? 'Night' : 'Nights'} |&nbsp;
                             {item.adult_count + item.child_count} {(item.adult_count + item.child_count) === 1 ? 'Guest' : 'Guests'}
                          </p>

                        </div>

                        {/* Price */}

                        <p className="text-sm text-primary font-semibold mt-1">
                          {item?.hotel_info?.roomsDetails?.[0]?.pricing?.currency}  {formatPrice(item.price)}
                        </p>
                        {/* Hold timer UI */}
                        {item.holdExpiresAt ? (
                          (() => {
                            const remaining = item.holdExpiresAt - timeNow;
                            if (remaining > 0) {
                              const mins = Math.floor(remaining / 60000);
                              const secs = Math.floor((remaining % 60000) / 1000)
                                .toString()
                                .padStart(2, "0");
                              return (
                                <div className="text-xs text-orange-700 bg-orange-100 rounded-full px-2 py-0.5 mt-2 inline-flex items-center font-small">
                                  <Clock size={12} className="mr-1" />
                                  <span>{item?.hotel_info?.roomsDetails?.length} {item?.hotel_info?.roomsDetails?.length === 1 ? 'room' : 'rooms'} reserved — expires in <strong>{mins}:{secs}.</strong></span>
                                </div>
                              );
                            }
                            // expired -> show Extend Time button
                            return (
                              <div className="mt-2">
                                <button
                                  onClick={() => setItemToExtend(item)}
                                  className="text-sm bg-muted text-primary py-1 px-3 rounded transition-colors"
                                >
                                  Extend Time
                                </button>
                              </div>
                            );
                          })()
                        ) : null}
                      </>
                    ) : item.vehicle ? (
                      <>
                        {/* Transfer */}
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {item.vehicle.vehicle_name || item.vehicle.name}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                          <div className="flex gap-2"> <p className="capitalize flex gap-2">
                            {item.tripType === 'round-trip' ? t('roundTrip', { ns: 'transfer' }) : t('oneWay', { ns: 'transfer' })}
                          </p>
                            <p >
                              | {t("", { ns: "common" })} {formatDate(item.selectedDate)}
                              {item.tripType === 'round-trip' && item.returnDate && ` - ${formatDate(item.returnDate)}`}
                            </p></div>
                          <p>
                            {item.passengers} {t("passengers")}|  {item.baggage} {t("baggage")}
                          </p>
                        </div>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {item?.currency}  {item?.pricing || item?.price}
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Day Tour / Default */}
                        <h4 className="font-medium text-foreground line-clamp-1">
                          {item.title}
                        </h4>
                        <div className="text-xs text-muted-foreground mt-0.5 space-y-0.5">
                          <p>
                             {formatDate(item.selectedDate)}
                          </p>
                          <p>
                            {item?.adults || item?.pax} {t("adult")} |  {item?.child || 0} {t("child")}
                          </p>
                        </div>
                        <p className="text-sm text-primary font-semibold mt-1">
                          {item[0]?.currency || "SGD"} {formatPrice(item.pricing?.total || item?.price || "0")}
                        </p>
                      </>
                    )}
                  </div>

                  {/* Addons (only for Day Tours) */}
                  {(() => {
                    const allAddons = [...(item.addons || []), ...(item.addons_round || [])];
                    const uniqueAddons = allAddons.filter(
                      (addon, index, self) =>
                        index === self.findIndex((a) => a.title?.toLowerCase() === addon.title?.toLowerCase())
                    );

                    if (uniqueAddons.length > 0 && !isAccommodation) {
                      return (
                        <div className="mb-6 flex gap-1 overflow-x-auto scrollbar-hide">
                          {uniqueAddons.map((addon) => {
                            const addonImage = addon.image || "/images/addon-placeholder.png";
                            const addonTitle = addon.title || `Addon ${addon.addon_id}`;
                            return (
                              <div
                                key={addon.addon_id}
                                className="relative flex-shrink-0 w-6 h-6 rounded-lg overflow-hidden border border-border cursor-pointer group"
                              >
                                <img
                                  src={getFullImageUrl(addonImage)}
                                  alt={addonTitle}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            );
                          })}
                        </div>
                      );
                    }
                    return null;
                  })()}

                  {/* Delete Button */}
                  <div className="absolute bottom-0 mb-1 right-0 flex space-x-2">
                    <button
                      onClick={() => setItemToDelete(item)}
                      className="p-1 text-foreground bg-muted rounded hover:text-primary"
                      title={t("remove")}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>

          {/* Total & Buttons */}
          {items.length > 0 && (
            <div className="pt-5 border-t mt-5 space-y-3">
              <div className="flex justify-between font-semibold text-base">
                <span>{t("total", "Total")}</span>
                <span>
                  {items?.[0]?.hotel_info?.roomsDetails?.[0]?.pricing?.currency || items?.[0]?.currency} {formatPrice(total)}
                </span>
              </div>

              {!isOnPaynowPage && (
                <button
                  onClick={handleProceed}
                  className="w-full bg-secondary text-foreground border border-1 py-2.5 rounded-lg text-sm font-semibold hover:text-white hover:bg-muted0 transition"
                >
                 Checkout
                </button>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-primary text-white py-2.5 rounded-lg text-sm font-semibold transition"
              >
                {t("continueShopping", "Continue Shopping")}
              </button>
            </div>
          )}
        </>
      )}

      {/* Delete Modal */}
      {itemToDelete && (
        <ConfirmDeleteModal
          itemTitle={
            itemToDelete.productTitle ||
            itemToDelete.title ||
            itemToDelete.vehicle?.vehicle_name ||
            itemToDelete.vehicle?.name ||
            t("item")
          }
          onCancel={cancelDelete}
          onConfirm={confirmDelete}
        />
      )}
      {/* Extend Modal */}
      {itemToExtend && (
        <ConfirmExtendModal
          open={!!itemToExtend}
          item={itemToExtend}
          onClose={() => setItemToExtend(null)}
          onConfirm={async () => {
            const res = await extendHoldForItem(itemToExtend.key);
            if (res.success) {
              toast.success("Reservation extended successfully for 7 minutes!");
            } else {
              toast.error(`Failed to extend hold: ${res.message || 'Unknown error'}`);
            }
            setItemToExtend(null);
          }}
          onRelease={() => {
            setItemToExtend(null);
          }}
        />
      )}
    </div>
  );
};

export default CartDrawerContent;