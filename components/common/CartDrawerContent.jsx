// components/cart/CartDrawerContent.jsx
import { useState } from "react";
import { useTranslation } from "next-i18next";
import { useCartStore } from "@/store/useCartStore";
import { getFullImageUrl } from "@/utils/imageService";
import { Trash2 } from "lucide-react";
import { useDrawerStore } from "@/store/useDrawerStore";
import ConfirmDeleteModal from "@/components/common/ConfirmDeleteModal";
import { useProductStore } from "@/store/useProductStore";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from "next/router";
import { format } from "date-fns";

const CartDrawerContent = () => {
  const { t } = useTranslation(["common", "accommodation"]);
  const { localizedPush } = useLocalizedRouter();
  const router = useRouter();

  const isOnPaynowPage = router.pathname === "/checkout";
  const { bookProduct } = useProductStore();
  const { items, removeItem, setItemToEdit } = useCartStore();
  const { setDrawerContent, openDrawer, closeDrawer, setJustAdded } = useDrawerStore();

  const [itemToDelete, setItemToDelete] = useState(null);

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
    sessionStorage.setItem("fromBooking", "true");
    closeDrawer();
    localizedPush(`/checkout`);
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
    <div className="p-4 text-sm text-gray-800">
      {items.length === 0 ? (
        <p className="text-center text-gray-500 mt-10">{t("emptyCart")}</p>
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
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.productTitle}
                        </h4>

                        {/* Accommodation Details */}
                        <div className="text-xs text-gray-500 mt-0.5 space-y-0.5">
                          <p>
                            <strong>{t("Room", { ns: "accommodation" })}:</strong> {item.roomType} | <strong>{t("Bed", { ns: "accommodation" })}:</strong> {item.mealType} | <strong>{t("Nights", { ns: "accommodation" })}:</strong> {item.nights} |  <strong>{t("Guests", { ns: "accommodation" })}:</strong> {item.adult_count + item.child_count}
                          </p>
                        </div>

                        {/* Price */}
                      
                        <p className="text-sm text-[#D3202D] font-semibold mt-1">
                           {Number(item.price).toFixed(2)} SGD
                        </p>
                      </>
                    ) : item.vehicle ? (
                      <>
                        {/* Transfer */}
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.vehicle.vehicle_name || item.vehicle.name}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t("passengers")}: {item.passengers} | {t("baggage")}: {item.baggage}
                        </p>
                        <p className="text-sm text-[#D3202D] font-semibold mt-1">
                          {item?.pricing || item?.price} SGD
                        </p>
                      </>
                    ) : (
                      <>
                        {/* Day Tour / Default */}
                        <h4 className="font-medium text-gray-900 line-clamp-1">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {t("adult")}: {item?.adults || item?.pax} | {t("child")}: {item?.child || 0}
                        </p>
                        <p className="text-sm text-[#D3202D] font-semibold mt-1">
                          {item.pricing?.total || item?.price || "0"} {item.currency || "SGD"}
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
                                className="relative flex-shrink-0 w-6 h-6 rounded-lg overflow-hidden border border-gray-200 cursor-pointer group"
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
                      className="p-1 text-gray-400 bg-red-50 rounded hover:text-red-600"
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
                <span>{t("total")}</span>
                <span>
                  {total.toFixed(2)} {items[0]?.currency || "SGD"}
                </span>
              </div>

              {!isOnPaynowPage && (
                <button
                  onClick={handleProceed}
                  className="w-full bg-slate-200 text-gray-800 border border-1 py-2.5 rounded-lg text-sm font-semibold hover:text-white hover:bg-gray-500 transition"
                >
                  {t("proceedToCheckout")}
                </button>
              )}

              <button
                onClick={handleContinue}
                className="w-full bg-[#D3202D] text-white py-2.5 rounded-lg text-sm font-semibold transition"
              >
                {t("continueShopping")}
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
    </div>
  );
};

export default CartDrawerContent;