"use client"

import { useRef, useState } from "react"
import { useTranslation } from "next-i18next"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import SvgLoader2 from "@/components/common/Loader2Svg"
import { useLocalizedRouter } from "@/components/localizedRouter"

export function TransferTypeServices() {
  const { t } = useTranslation("common")
  const { localizedPush } = useLocalizedRouter()
  const scrollContainerRef = useRef(null)
  const [loadingCardId, setLoadingCardId] = useState(null)

  const rawTypes = t("transferType.types", { returnObjects: true })
  const transferTypes = Array.isArray(rawTypes)
    ? rawTypes.map((type, index) => ({
        ...type,
        id: index + 1,
        image:
          [
             `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1756795512/External%20Links/download_2.jpg`,
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1756795512/External%20Links/download.jpg`,
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1756795512/External%20Links/images_1.jpg`,
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1756795512/External%20Links/images_2.jpg`,
            `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1756795512/External%20Links/images.jpg`,
          ][index] || "/singapore-transfer-service.png",
      }))
    : []

  console.log("Transfer Types from i18n:", transferTypes)

  const scroll = (direction) => {
    if (scrollContainerRef.current) {
      const scrollAmount = 350
      scrollContainerRef.current.scrollBy({
        left: direction === "left" ? -scrollAmount : scrollAmount,
        behavior: "smooth",
      })
    }
  }

  const handleCardClick = (id) => {
    setLoadingCardId(id)
    localizedPush(`/transfers`)
  }

  return (
    <section className="w-full py-12 md:py-24 lg:py-32 bg-gradient-to-br from-orange-50 to-red-50 text-gray-900">
      <div className="container px-4 md:px-6 mx-auto max-w-7xl p-12">
        <div className="flex flex-col items-center justify-center space-y-4 text-center mb-12">
          <div className="space-y-2">
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl text-gray-900">
              {t("transferType.title")}
            </h2>
            <p className="max-w-[900px] text-gray-700 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              {t("transferType.description")}
            </p>
          </div>
        </div>

        <div className="relative">
          <div ref={scrollContainerRef} className="flex overflow-x-auto pb-4 scrollbar-hide gap-6 px-2 md:px-0">
            {Array.isArray(transferTypes) &&
              transferTypes.map((type, index) => (
                <div
                  key={type.id}
                  onClick={() => handleCardClick(type.id)}
                  className="cursor-pointer relative flex-shrink-0 w-[240px] h-[320px] rounded-xl overflow-hidden shadow-lg group transition hover:scale-[1.02]"
                >
                  {loadingCardId === type.id && (
                    <div className="absolute inset-0 z-20 bg-white/80 flex justify-center items-center">
                      <SvgLoader2 />
                    </div>
                  )}

                  <img
                    src={type.image || "/placeholder.svg?height=320&width=240&query=singapore transfer service"}
                    alt={type.name}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent via-black/20 flex flex-col justify-between p-4 z-10">
                    <div className="self-start bg-white/20 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1 rounded-full">
                      {type.label}
                    </div>
                    <div className="text-white">
                      <p className="text-sm font-medium uppercase opacity-80">{type.description}</p>
                      <h3 className="text-2xl font-bold leading-tight">{type.name}</h3>
                    </div>
                  </div>
                </div>
              ))}
          </div>

          {/* Navigation Buttons */}
          <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 flex justify-between px-4 pointer-events-none">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("left")}
              className="bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-md pointer-events-auto"
            >
              <ChevronLeft className="w-6 h-6" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => scroll("right")}
              className="bg-white/70 hover:bg-white text-gray-800 rounded-full shadow-md pointer-events-auto"
            >
              <ChevronRight className="w-6 h-6" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
