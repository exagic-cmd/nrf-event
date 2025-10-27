"use client"

import { useTranslation } from "next-i18next"
import { Star } from "lucide-react"
import { useState, useEffect } from "react"

export function ReviewsSection() {
  const { t } = useTranslation("common")

  const reviews = [
    {
      name: t("reviews.list.0.name"),
      rating: 5,
      comment: t("reviews.list.0.comment"),
    },
    {
      name: t("reviews.list.1.name"),
      rating: 5,
      comment: t("reviews.list.1.comment"),
    },
    {
      name: t("reviews.list.2.name"),
      rating: 5,
      comment: t("reviews.list.2.comment"),
    },
  ]

  const [current, setCurrent] = useState(0)
  const [isMobile, setIsMobile] = useState(false)

  // Detect mobile screen
  useEffect(() => {
    const checkScreen = () => setIsMobile(window.innerWidth < 768)
    checkScreen()
    window.addEventListener("resize", checkScreen)
    return () => window.removeEventListener("resize", checkScreen)
  }, [])

  useEffect(() => {
    if (!isMobile) return
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % reviews.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [isMobile, reviews.length])

  return (
    <section className="w-full py-12 md:py-24 lg:py-24 px-4 bg-black text-[#CC9A55]">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl">
        {/* Heading */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="font-bold tracking-tighter text-3xl md:text-4xl text-white">
              {t("reviews.heading")}{" "}
              <span className="text-[#CC9A55]">{t("reviews.highlight")}</span>
            </h2>
            <p className="max-w-[900px] text-white md:text-xl/relaxed text-md/relaxed">
              {t("reviews.subtitle")}
            </p>
          </div>
        </div>

        {/* Desktop Grid */}
        {!isMobile && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews.map((review, index) => (
              <div key={index} className="bg-[#CC9A55] text-white p-6 rounded-lg">
                <div className="flex items-center mb-4">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-white fill-current" />
                  ))}
                </div>
                <p className="text-white mb-4">"{review.comment}"</p>
                <p className="font-semibold text-gray-900">- {review.name}</p>
              </div>
            ))}
          </div>
        )}

        {/* Mobile Slider */}
        {isMobile && (
          <div className="relative w-full overflow-hidden">
            <div
              className="flex transition-transform duration-700 ease-in-out"
              style={{ transform: `translateX(-${current * 100}%)` }}
            >
              {reviews.map((review, index) => (
                <div
                  key={index}
                  className="w-full flex-shrink-0 flex flex-col bg-[#CC9A55] text-white p-6 rounded-lg"
                >
                  <div className="flex items-center mb-4">
                    {[...Array(review.rating)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 text-white fill-current" />
                    ))}
                  </div>
                  <p className="text-white mb-4 line-clamp-4">"{review.comment}"</p>
                  <p className="font-semibold text-gray-900">- {review.name}</p>
                </div>
              ))}
            </div>

            <div className="flex justify-center mt-4 space-x-2">
              {reviews.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrent(i)}
                  className={`w-3 h-3 rounded-full transition-all ${
                    current === i ? "bg-[#CC9A55]" : "bg-gray-500"
                  }`}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
