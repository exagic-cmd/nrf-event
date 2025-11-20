"use client"

import { X } from "lucide-react"
import { useState, useEffect } from "react"
import { useOrderStore } from "@/store/useOrderStore"
import useUserStore from "@/store/useAuthStore"
import { apiRequest } from "@/lib/clientApi"
import { useTranslation } from "next-i18next"

const CancelModal = ({ isOpen, onClose, itineraryId }) => {
  const { t } = useTranslation("order")
  const [reason, setReason] = useState("")
  const [message, setMessage] = useState(null)
  const { fetchUpcomingBookings } = useOrderStore()
  const { qrCode } = useUserStore()
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(1)

  useEffect(() => {
    if (isOpen) {
      setReason("")
      setMessage(null)
      setLoading(false)
      setStep(1)
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleConfirm = async () => {
    if (!reason.trim()) {
      setMessage({ type: "error", text: t("cancel.reason_required") })
      return
    }

    setLoading(true)
    setMessage(null)

    try {
      const res = await apiRequest({
        endpoint: "cancelOrder",
        method: "POST",
        data: { itineraryId, reason, accessCode: qrCode },
      })

      if (res?.message === "success" && res?.data?.status) {
        setMessage({ type: "success", text: res.data.status })
        setReason("")
        const token = localStorage.getItem("access_token")
        if (token) await fetchUpcomingBookings(token)
      } else if (res?.Status === "success" && res?.Message) {
        setMessage({ type: "success", text: res.Message })
        setReason("")
        const token = localStorage.getItem("access_token")
        if (token) await fetchUpcomingBookings(token)
      } else if (res?.message === "success" && res?.error) {
        setMessage({ type: "error", text: res.error })
      } else if (res?.Status === "failed" || res?.Message) {
        setMessage({ type: "error", text: res.Message || t("cancel.failed") })
      } else {
        setMessage({ type: "error", text: t("cancel.try_again") })
      }
    } catch (err) {
      setMessage({ type: "error", text: t("cancel.try_again") })
    } finally {
      setLoading(false)
    }
  }

  const renderStepOne = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("cancel.are_you_sure")}</h2>
      <p className="text-sm text-gray-600 mb-6">{t("cancel.warning_text")}</p>
      <div className="flex justify-end gap-3">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
        >
          {t("common.no")}
        </button>
        <button
          onClick={() => setStep(2)}
          className="px-4 py-2 rounded-md bg-gray-600 text-white "
        >
          {t("common.yes")}
        </button>
      </div>
    </>
  )

  const renderStepTwo = () => (
    <>
      <h2 className="text-xl font-semibold text-gray-800 mb-4">{t("cancel.title")}</h2>
      <p className="text-sm text-gray-600 mb-4">{t("cancel.reason_label")}</p>

      {message && (
        <div
          className={`mb-4 text-sm p-2 rounded-md ${
            message.type === "success"
              ? "bg-[#cfc1ae] text-[#D3202D]"
              : "bg-gray-100 text-gray-600"
          }`}
        >
          {message.text}
        </div>
      )}

      {message?.type !== "success" && (
        <>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            className="w-full border border-gray-300 rounded-md p-2 text-sm mb-4"
            placeholder={t("cancel.reason_placeholder")}
          />
          <div className="flex justify-end gap-3">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
            >
              {t("common.back")}
            </button>
            <button
              onClick={handleConfirm}
              className="px-4 py-2 rounded-md bg-gray-600 text-white"
              disabled={loading}
            >
              {loading ? t("cancel.processing") : t("cancel.confirm")}
            </button>
          </div>
        </>
      )}

      {message?.type === "success" && (
        <div className="flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100"
          >
            {t("common.close")}
          </button>
        </div>
      )}
    </>
  )

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-lg w-full max-w-md p-6 relative">
        <button
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700"
          onClick={onClose}
        >
          <X className="w-5 h-5" />
        </button>

        {step === 1 ? renderStepOne() : renderStepTwo()}
      </div>
    </div>
  )
}

export default CancelModal
