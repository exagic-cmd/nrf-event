"use client"

import { X, RefreshCw, ShoppingCart } from "lucide-react"
import { useTranslation } from "next-i18next"

const BookingModal = ({ isOpen, onClose, onUpdate, onGoToCart }) => {
  const { t } = useTranslation("daytour") 

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-surface max-w-md w-full mx-4 rounded-xl p-4 sm:p-6 shadow-lg text-center space-y-4">
        <div className="flex justify-between items-center">
          <div></div>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-muted-foreground transition p-1"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-primary">
          {t("tourInCart")}
        </h3>
        <p className="text-muted-foreground text-sm">
          {t("updateBookingText")}
        </p>

        <div className="space-y-3 mt-6">
          <button
            className="w-full py-3 bg-primary text-white rounded-md  font-semibold flex items-center justify-center gap-2 transition"
            onClick={onUpdate}
          >
            <RefreshCw size={18} />
            {t("updateBooking")}
          </button>

          <p className="text-sm text-muted-foreground">{t("or")}</p>

          <button
            className="w-full py-3 bg-muted text-muted-foreground rounded-md hover:bg-secondary font-medium flex items-center justify-center gap-2 transition"
            onClick={onGoToCart}
          >
            <ShoppingCart size={18} />
            {t("goToCart")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default BookingModal
