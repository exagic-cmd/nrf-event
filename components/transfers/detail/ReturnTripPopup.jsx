"use client"

import { X } from "lucide-react"
import { useTranslation } from "next-i18next"

const ReturnTripPopup = ({ isOpen, onClose, onConfirm, onDecline, priceDifference, isLoading }) => {
  const { t } = useTranslation("transfer")

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 px-4">
      <div className="bg-white max-w-md w-full mx-4 rounded-xl p-4 sm:p-6 shadow-lg text-center space-y-4">
        <div className="flex justify-end items-center">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition p-1"
            aria-label={t("close")}
          >
            <X size={20} />
          </button>
        </div>

        <h3 className="text-lg sm:text-xl font-bold text-[#CC9A55]">
          {t("booking.addReturnTransfer")}
        </h3>
        <p className="text-gray-700 text-sm">
          {t("booking.addReturnTransferText")}
          <span className="font-bold text-lg"> ${priceDifference}</span>?
        </p>

        <div className="space-y-3 mt-6">
          <button
            className="w-full py-3 bg-[#CC9A55] text-white rounded-md hover:bg-[#cb913f] font-semibold flex items-center justify-center gap-2 transition"
            onClick={onConfirm}
            disabled={isLoading}
          >
            {isLoading ? t("loading") : t("yes")}
          </button>

          <button
            className="w-full py-3 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 font-medium flex items-center justify-center gap-2 transition"
            onClick={onDecline}
          >
            {t("no")}
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReturnTripPopup
