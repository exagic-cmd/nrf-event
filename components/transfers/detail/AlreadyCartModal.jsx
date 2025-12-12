"use client"

import { X, RefreshCw, ShoppingCart } from "lucide-react"
import { useTranslation } from "next-i18next"

const alreadyModal = ({ isOpen, onClose, onUpdate, onGoToCart }) => {
  const { t } = useTranslation("transfer") 

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white max-w-md w-full mx-4 rounded-xl p-4 sm:p-6 shadow-lg text-center space-y-4">
        {/* <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div> */}
<div className="flex justify-center mb-4">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center">
            <RefreshCw className="w-8 h-8 text-red-500" />
          </div>
        </div>
        <h3 className="text-xl font-bold text-gray-900 mb-2">
          {t("booking.transferInCart")}
        </h3>
        <p className="text-gray-700 text-sm">
          {t("booking.updateBookingText")}
        </p>

        <div className="flex gap-4">
          
          <button
            className="w-full py-3 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition"
            onClick={onGoToCart}
          >
            No, Keep Existing
          </button>
          <button
            className="w-full py-3 bg-[#D3202D] text-white rounded-md font-semibold flex items-center justify-center gap-2 transition"
            onClick={onUpdate}
          >
            Yes, Replace
          </button>

        </div>
      </div>
    </div>
  )
}

export default alreadyModal
