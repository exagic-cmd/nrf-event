import React, { useState, useEffect, useMemo } from "react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useCartStore } from "@/store/useCartStore";
import {
  AlertTriangle,
  Info,
  Trash2,
  RotateCcw,
  X,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";

/**
 * Generate a clean URL slug from title/name
 */
export const generateSlug = (text) => {
  if (!text) return "detail";
  return String(text)
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}-]+/gu, "-")
    .replace(/--+/g, "-")
    .replace(/^-+|-+$/g, "") || "detail";
};

/**
 * Smart Navigation Route Resolver based on category, supplier, and product ID.
 *
 * Rules:
 * - RateHawk: /rh/{slug}/{productId}
 * - Own Allotment: /accommodation/{slug}/{productId}
 * - Stuba: /hotel/{slug}/{productId}
 * - Transfer: /transfers
 * - Day Tours & Package Tours: /day-tours/booking/{productId}
 */
export const resolveRebookUrl = ({ currentItem, matchingCartItem, discrepancyData }) => {
  const primaryProductId = currentItem?.product_id ?? discrepancyData?.product_id;
  const productId =
    primaryProductId ??
    matchingCartItem?.productId ??
    matchingCartItem?.product_id ??
    matchingCartItem?.tourId ??
    matchingCartItem?.id;

  const categoryId = Number(
    currentItem?.category_id ??
    discrepancyData?.category_id ??
    matchingCartItem?.category_id ??
    (matchingCartItem?.type === "accommodation"
      ? 4
      : matchingCartItem?.vehicle || matchingCartItem?.transferType
      ? 2
      : 3)
  );

  const linkTypeId = Number(
    currentItem?.link_type_id ??
    discrepancyData?.link_type_id ??
    matchingCartItem?.link_type_id ??
    matchingCartItem?.linkTypeId ??
    matchingCartItem?.product?.link_type_id ??
    (matchingCartItem?.isRateHawk ? 10 : matchingCartItem?.isStuba ? 9 : null)
  );

  const rawTitle =
    currentItem?.product_title ||
    currentItem?.title ||
    currentItem?.name ||
    matchingCartItem?.productTitle ||
    matchingCartItem?.title ||
    matchingCartItem?.name ||
    matchingCartItem?.hotel_info?.title ||
    "detail";

  const slug = generateSlug(rawTitle);

  // 1. Transfers: categoryId 2 or transfer cart item
  if (
    categoryId === 2 ||
    matchingCartItem?.vehicle !== undefined ||
    matchingCartItem?.transferType ||
    matchingCartItem?.tripType
  ) {
    return "/transfers";
  }

  // 2. Accommodations: categoryId 4, or accommodation item, or linkTypeId 9 / 10
  if (
    categoryId === 4 ||
    matchingCartItem?.type === "accommodation" ||
    linkTypeId === 9 ||
    linkTypeId === 10
  ) {
    // RateHawk
    if (linkTypeId === 10 || matchingCartItem?.isRateHawk) {
      return `/rh/${slug}/${productId}`;
    }
    // Stuba
    if (linkTypeId === 9 || matchingCartItem?.isStuba) {
      return `/hotel/${slug}/${productId}`;
    }
    // Own Allotment Hotel / Accommodation
    return `/accommodation/${slug}/${productId}`;
  }

  // 3. Day Tours & Package Tours: categoryId 3 or 8 or tour item
  if (
    categoryId === 3 ||
    categoryId === 8 ||
    matchingCartItem?.type === "daytour" ||
    !matchingCartItem?.type
  ) {
    return productId ? `/day-tours/booking/${productId}` : "/transfers";
  }

  // Fallback
  if (productId) {
    return `/day-tours/booking/${productId}`;
  }
  return "/transfers";
};

const PriceDiscrepancyModal = ({
  isOpen,
  discrepancyData,
  onClose,
  onItemRemoved,
  onRebook,
}) => {
  const { t } = useTranslation(["common", "daytour"]);
  const { localizedPush } = useLocalizedRouter();
  const router = useRouter();
  const { items: cartItems, removeProductById, removeItem } = useCartStore();

  const [currentIndex, setCurrentIndex] = useState(0);
  const [internalList, setInternalList] = useState([]);

  // Normalize discrepancies from backend payload into an array
  useEffect(() => {
    if (!discrepancyData) {
      setInternalList([]);
      setCurrentIndex(0);
      return;
    }

    let list = [];
    if (Array.isArray(discrepancyData.discrepancies)) {
      list = [...discrepancyData.discrepancies];
    } else if (
      discrepancyData.discrepancies &&
      typeof discrepancyData.discrepancies === "object"
    ) {
      list = [discrepancyData.discrepancies];
    } else if (discrepancyData.product_id) {
      list = [discrepancyData];
    } else if (cartItems.length === 1) {
      // Fallback: If backend reported discrepancy without structured product_id,
      // and cart has only 1 item, attribute the discrepancy to that item.
      const single = cartItems[0];
      list = [
        {
          product_id: single.productId || single.product_id || single.tourId || single.id,
          product_title: single.productTitle || single.title || single.name,
          category_id: single.category_id,
          link_type_id: single.link_type_id,
          type: single.type,
        },
      ];
    }

    setInternalList(list);
    setCurrentIndex(0);
  }, [discrepancyData, cartItems]);

  const currentItem = useMemo(() => {
    if (!internalList.length) return null;
    return internalList[currentIndex] || internalList[0] || null;
  }, [internalList, currentIndex]);

  // Find matching cart item from Zustand store
  const matchingCartItem = useMemo(() => {
    if (!currentItem) return cartItems[0] || null;
    const targetId = Number(currentItem.product_id ?? currentItem.productId);
    return (
      cartItems.find(
        (item) =>
          Number(item.productId) === targetId ||
          Number(item.product_id) === targetId ||
          Number(item.tourId) === targetId ||
          Number(item.id) === targetId
      ) ||
      cartItems[0] ||
      null
    );
  }, [currentItem, cartItems]);

  if (!isOpen || (!currentItem && !discrepancyData)) {
    return null;
  }

  const supplierBadge = (() => {
    const linkTypeId = Number(
      currentItem?.link_type_id ??
      matchingCartItem?.link_type_id ??
      (matchingCartItem?.isRateHawk ? 10 : matchingCartItem?.isStuba ? 9 : null)
    );
    const categoryId = Number(
      currentItem?.category_id ?? matchingCartItem?.category_id
    );

    if (linkTypeId === 10 || matchingCartItem?.isRateHawk) {
      return { label: "RateHawk", color: "bg-blue-50 text-blue-700 border-blue-200" };
    }
    if (linkTypeId === 9 || matchingCartItem?.isStuba) {
      return { label: "Stuba", color: "bg-purple-50 text-purple-700 border-purple-200" };
    }
    if (categoryId === 4 || matchingCartItem?.type === "accommodation") {
      return { label: "Accommodation", color: "bg-amber-50 text-amber-700 border-amber-200" };
    }
    if (
      categoryId === 2 ||
      matchingCartItem?.vehicle !== undefined ||
      matchingCartItem?.transferType
    ) {
      return { label: "Transfer", color: "bg-emerald-50 text-emerald-700 border-emerald-200" };
    }
    return { label: "Tour / Activity", color: "bg-orange-50 text-orange-700 border-orange-200" };
  })();

  const productTitle =
    currentItem?.product_title ||
    matchingCartItem?.productTitle ||
    matchingCartItem?.title ||
    matchingCartItem?.name ||
    `Product #${currentItem?.product_id || ""}`;

  // Price comparison when available
  const oldPrice =
    currentItem?.old_price ??
    currentItem?.previous_price ??
    matchingCartItem?.price ??
    matchingCartItem?.total ??
    null;

  const newPrice =
    currentItem?.new_price ??
    currentItem?.current_price ??
    currentItem?.updated_price ??
    null;

  const noticeMessage =
    discrepancyData?.error ||
    discrepancyData?.msg ||
    discrepancyData?.message ||
    t("price_discrepancy_message", {
      defaultValue:
        "Price discrepancy detected. The price for this product has changed. Please update or remove it.",
    });

  // Action 1: Remove discrepant item from cart & storage
  const handleRemove = () => {
    const targetId =
      currentItem?.product_id ??
      currentItem?.productId ??
      matchingCartItem?.productId ??
      matchingCartItem?.product_id ??
      matchingCartItem?.tourId ??
      matchingCartItem?.id;

    if (targetId) {
      removeProductById(targetId);
    }
    if (matchingCartItem?.key) {
      removeItem(matchingCartItem.key);
    }

    if (onItemRemoved) {
      onItemRemoved(targetId);
    }

    // Remove from local modal queue
    const updated = [...internalList];
    updated.splice(currentIndex, 1);
    setInternalList(updated);

    const remainingCart = useCartStore.getState().items;

    // If cart is now empty or no more discrepancies, close modal
    if (!remainingCart || remainingCart.length === 0) {
      onClose();
      if (localizedPush) localizedPush("/");
      else router.push("/");
      return;
    }

    if (updated.length === 0) {
      onClose();
      return;
    }

    if (currentIndex >= updated.length) {
      setCurrentIndex(0);
    }
  };

  // Action 2: Correct & Rebook with live prices
  const handleTryAgain = () => {
    const targetId =
      currentItem?.product_id ??
      currentItem?.productId ??
      matchingCartItem?.productId ??
      matchingCartItem?.product_id ??
      matchingCartItem?.tourId ??
      matchingCartItem?.id;

    const targetUrl = resolveRebookUrl({
      currentItem,
      matchingCartItem,
      discrepancyData,
    });

    if (onRebook) {
      onRebook({ targetId, targetUrl });
    }

    // Clean old price from cart and storage before redirect
    if (targetId) {
      removeProductById(targetId);
    }
    if (matchingCartItem?.key) {
      removeItem(matchingCartItem.key);
    }

    onClose();

    if (targetUrl) {
      if (localizedPush) {
        localizedPush(targetUrl);
      } else {
        router.push(targetUrl);
      }
    } else if (window.history.length > 1) {
      router.back();
    } else {
      if (localizedPush) localizedPush("/");
      else router.push("/");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-70 backdrop-blur-sm animate-fadeIn">
      <div
        className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 flex flex-col"
        role="dialog"
        aria-modal="true"
      >
        {/* Top accent line */}
        <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-orange-500 to-[#CC9A55]" />

        {/* Modal Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center flex-shrink-0 border border-amber-200">
              <AlertTriangle className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-gray-900 leading-tight">
                {t("price_discrepancy_detected", {
                  defaultValue: "Price Discrepancy Detected",
                })}
              </h3>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {internalList.length > 1 && (
              <span className="px-2.5 py-1 text-xs font-semibold rounded-full bg-gray-100 text-gray-700 border border-gray-200">
                {currentIndex + 1} {t("of", { defaultValue: "of" })}{" "}
                {internalList.length}
              </span>
            )}
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* Warning / Error Message */}
          <div className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900">
            <Info className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm leading-relaxed">{noticeMessage}</div>
          </div>

          {/* Affected Item Card */}
          {currentItem && (
            <div className="p-4 rounded-xl border border-gray-200 bg-gray-50 hover:border-gray-300 transition-colors space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 text-base leading-snug">
                    {productTitle}
                  </h4>
                </div>
                <span
                  className={`px-2.5 py-0.5 text-xs font-medium rounded-full border ${supplierBadge.color} whitespace-nowrap`}
                >
                  {supplierBadge.label}
                </span>
              </div>
            </div>
          )}

          {/* Multi-item navigation if more than 1 discrepancy */}
          {internalList.length > 1 && (
            <div className="flex items-center justify-between pt-1">
              <button
                type="button"
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-gray-100"
              >
                <ChevronLeft className="w-4 h-4" /> Previous
              </button>

              <div className="flex gap-1.5">
                {internalList.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentIndex
                        ? "bg-[#CC9A55] w-5"
                        : "bg-gray-300 hover:bg-gray-400"
                    }`}
                  />
                ))}
              </div>

              <button
                type="button"
                disabled={currentIndex === internalList.length - 1}
                onClick={() =>
                  setCurrentIndex((prev) =>
                    Math.min(internalList.length - 1, prev + 1)
                  )
                }
                className="flex items-center gap-1 text-xs text-gray-600 hover:text-gray-900 disabled:opacity-30 disabled:cursor-not-allowed px-2 py-1 rounded hover:bg-gray-100"
              >
                Next <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Modal Footer Actions */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Remove button */}
          <button
            type="button"
            onClick={handleRemove}
            className="w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
            {t("remove", { defaultValue: "Remove" })}
          </button>

          {/* Cancel & Rebook buttons */}
          <div className="w-full sm:w-auto flex items-center gap-2 justify-end">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 bg-white hover:bg-gray-100 border border-gray-300 transition-colors"
            >
              {t("cancel", { defaultValue: "Cancel" })}
            </button>
            <button
              type="button"
              onClick={handleTryAgain}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-[#CC9A55] hover:bg-[#b07d3e] shadow-md hover:shadow-lg transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              {t("correct_and_rebook", { defaultValue: "Correct & Rebook" })}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PriceDiscrepancyModal;
