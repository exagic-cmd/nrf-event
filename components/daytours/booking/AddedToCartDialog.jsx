import React from "react";
import { useTranslation } from "next-i18next";
import { CheckCircle, ShoppingCart, ArrowRight } from "lucide-react";
import Loader2Svg from "@/components/common/Loader2Svg";

const AddedToCartDialog = ({
  onContinueShopping,
  onProceedToCheckout,
  isLoading,
}) => {
  const { t } = useTranslation("daytour","transfer");
  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-surface rounded shadow-lg p-6 sm:p-8 max-w-sm w-full text-center transition-all">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2Svg />
            <p className="mt-4 text-muted-foreground text-sm font-medium">
              {t("pleaseWait")}
            </p>
          </div>
        ) : (
          <>
            <div className="flex justify-center mb-4">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vg5ld1wrkipqk9y8vy33.svg`}
                alt={t("addedToCartAlt")}
                className="w-16 h-16 rounded-full bg-orange-50 p-2 shadow-sm"
              />
            </div>
            <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
              {t("addedToCart")}
            </h2>
            <p className="text-sm text-muted-foreground mb-6">
              {t("whatNext")}
            </p>

            <div className="space-y-3">
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-secondary hover:text-muted-foreground text-white text-sm font-semibold py-3 px-4 rounded flex items-center justify-center gap-2 transition-all"
              >
                {t("proceedToCheckout")}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={onContinueShopping}
                className="w-full bg-muted hover:bg-secondary text-muted-foreground text-sm font-semibold py-3 px-4 rounded flex items-center justify-center gap-2 transition-all"
              >
                <ShoppingCart size={18} />
                {t("continueShopping")}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default AddedToCartDialog;
