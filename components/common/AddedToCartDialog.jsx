import React from "react";
import { useTranslation } from "next-i18next";
import { CheckCircle, ShoppingCart, ArrowRight, Home, MapPin } from "lucide-react";
import Loader2Svg from "@/components/common/Loader2Svg";

const AddedToCartDialog = ({
  onContinueShopping,
  onProceedToCheckout,
  isLoading,
  productType = "daytour", // "daytour" or "accommodation"
  productTitle = "",
}) => {
  const { t } = useTranslation(["daytour", "transfer", "accommodation"]);
  
  // Get appropriate translations based on product type
  const getTranslation = (key) => {
    if (productType === "accommodation") {
      return t(`accommodation:${key}`, { defaultValue: t(`daytour:${key}`, t(`transfer:${key}`)) });
    }
    return t(`daytour:${key}`, t(`transfer:${key}`));
  };

  // Get appropriate icons and messages based on product type
  const getProductConfig = () => {
    switch (productType) {
      case "accommodation":
        return {
          icon: <Home className="w-8 h-8 text-green-500" />,
          successMessage: getTranslation("accommodationAddedToCart") || "Your accommodation has been added to cart!",
          altText: getTranslation("accommodationAddedToCartAlt") || "Accommodation added to cart",
          continueButtonText: getTranslation("browseMoreHotels") || "Browse More Hotels",
          iconUrl: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vg5ld1wrkipqk9y8vy33.svg`
        };
      case "transfer":
        return {
          icon: <MapPin className="w-8 h-8 text-blue-500" />,
          successMessage: getTranslation("transferAddedToCart") || "Your transfer has been added to cart!",
          altText: getTranslation("transferAddedToCartAlt") || "Transfer added to cart",
          continueButtonText: getTranslation("browseMoreTransfers") || "Browse More Transfers",
          iconUrl: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vg5ld1wrkipqk9y8vy33.svg`
        };
      default: // daytour
        return {
          icon: <CheckCircle className="w-8 h-8 text-green-500" />,
          successMessage: getTranslation("addedToCart") || "Added to Cart!",
          altText: getTranslation("addedToCartAlt") || "Tour added to cart",
          continueButtonText: getTranslation("continueShopping") || "Continue Shopping",
          iconUrl: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vg5ld1wrkipqk9y8vy33.svg`
        };
    }
  };

  const productConfig = getProductConfig();

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-xl shadow-lg p-6 sm:p-8 max-w-sm w-full text-center transition-all transform hover:scale-105 duration-200">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center">
            <Loader2Svg />
            <p className="mt-4 text-gray-500 text-sm font-medium">
              {getTranslation("pleaseWait") || "Please wait..."}
            </p>
          </div>
        ) : (
          <>
            {/* Success Icon/Image */}
            <div className="flex justify-center mb-4">
              <div className="relative">
                <img
                  src={productConfig.iconUrl}
                  alt={productConfig.altText}
                  className="w-16 h-16 rounded-full bg-orange-50 p-2 shadow-sm border-2 border-orange-100"
                />
                <div className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md">
                  {productConfig.icon}
                </div>
              </div>
            </div>

            {/* Success Message */}
            <h2 className="text-xl sm:text-2xl font-semibold text-gray-800 mb-2">
              {productConfig.successMessage}
            </h2>

            {/* Product Title (if provided) */}
            {productTitle && (
              <p className="text-sm text-gray-700 font-medium mb-2 bg-gray-50 py-2 px-3 rounded-lg">
                {productTitle}
              </p>
            )}

            <p className="text-sm text-gray-600 mb-6">
              {getTranslation("whatNext") || "What would you like to do next?"}
            </p>

            {/* Action Buttons */}
            <div className="space-y-3">
              <button
                onClick={onProceedToCheckout}
                className="w-full bg-[#CC9A55] hover:bg-[#b88a45] text-white text-sm font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 transform hover:scale-105 shadow-md"
              >
                {getTranslation("proceedToCheckout") || "Proceed to Checkout"}
                <ArrowRight size={18} />
              </button>
              <button
                onClick={onContinueShopping}
                className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-sm font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 transition-all duration-200 border border-gray-300"
              >
                <ShoppingCart size={18} />
                {productConfig.continueButtonText}
              </button>
            </div>

            {/* Additional Info */}
            <p className="text-xs text-gray-500 mt-4">
              {getTranslation("secureCheckout") || "Secure checkout • Best price guarantee"}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

export default AddedToCartDialog;