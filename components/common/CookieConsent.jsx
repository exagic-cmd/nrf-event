"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { useTranslation } from "next-i18next"

export default function CookieConsent({ onAccept }) {
  const { t } = useTranslation(["common", "privacy"])
  const [isVisible, setIsVisible] = useState(false)

  // Fallback texts in English
  const fallbackText = {
    text: 'We use cookies to enhance your browsing experience and analyze our traffic. By clicking "Accept", you consent to our use of cookies.',
    link: "Privacy Policy",
    accept: "Accept",
    decline: "Decline",
  }

  useEffect(() => {
    const consent = localStorage.getItem("cookieConsent")
    if (!consent) setIsVisible(true)
  }, [])

  const handleAccept = () => {
    localStorage.setItem("cookieConsent", "accepted")
    setIsVisible(false)
    if (onAccept) onAccept()
  }

  const handleDecline = () => {
    localStorage.setItem("cookieConsent", "declined")
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[#D3202D] bg-white/95 backdrop-blur-sm p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.5)] md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
        <div className="text-sm text-gray-00">
          <p>
            {t("cookieConsent.text", fallbackText.text)}{" "}
          </p>
        </div>

        <div className="flex gap-3">
          <button
            onClick={handleDecline}
            className="rounded-md border border-gray-600 bg-transparent px-4 py-2 text-gray-800 text-sm "
          >
            {t("cookieConsent.decline", fallbackText.decline)}
          </button>

          <button
            onClick={handleAccept}
            className="rounded-md bg-[#D3202D] px-4 py-2 text-sm font-medium text-white shadow-lg shadow-orange-900/20"
          >
            {t("cookieConsent.accept", fallbackText.accept)}
          </button>
        </div>
      </div>
    </div>
  )
}
