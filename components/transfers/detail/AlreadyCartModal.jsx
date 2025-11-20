"use client"

import { X, RefreshCw, ShoppingCart } from "lucide-react"
import { useTranslation } from "next-i18next"

const alreadyModal = ({ isOpen, onClose, onUpdate, onGoToCart }) => {
  const { t } = useTranslation("transfer") 

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white max-w-md w-full mx-4 rounded-xl p-4 sm:p-6 shadow-lg text-center space-y-4">
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#D3202D]">
          {t("booking.transferInCart")}
        </h3>
        <p className="text-gray-700 text-sm">
          {t("booking.updateBookingText")}
        </p>

        <div className="space-y-3 mt-6">
          <button
            className="w-full py-3 bg-[#D3202D] text-white rounded-md font-semibold flex items-center justify-center gap-2 transition"
            onClick={onUpdate}
          >
            <RefreshCw size={18} />
            {t("booking.updateBooking")}
          </button>

          <p className="text-sm text-gray-500">{t("booking.or")}</p>

          <button
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition"
            onClick={onGoToCart}
          >
            <ShoppingCart size={18} />
            {t("booking.goToCart")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default alreadyModal
