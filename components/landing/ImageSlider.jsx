"use client"
import React, { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"

const ImageSlider = () => {
  // --- Desktop Slider ---
  const [emblaRefDesktop, emblaDesktop] = useEmblaCarousel({ loop: true })
  const [selectedIndexDesktop, setSelectedIndexDesktop] = useState(0)

  // --- Mobile Slider ---
  const [emblaRefMobile, emblaMobile] = useEmblaCarousel({ loop: true })
  const [selectedIndexMobile, setSelectedIndexMobile] = useState(0)

  // Desktop images
  const desktopImages = [
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763653780/External%20Links/3.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763653778/External%20Links/1.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763616321/External%20Links/3.jpg",
  ]

  // Mobile images you provided
  const mobileImages = [
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763653779/External%20Links/2.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763653865/External%20Links/6.jpg",
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763653793/External%20Links/4.jpg",
  ]

  // Auto-scroll for desktop
  useEffect(() => {
    if (!emblaDesktop) return
    const interval = setInterval(() => {
      emblaDesktop.scrollNext()
    }, 3000)
    return () => clearInterval(interval)
  }, [emblaDesktop])

  // Auto-scroll for mobile
  useEffect(() => {
    if (!emblaMobile) return
    const interval = setInterval(() => {
      emblaMobile.scrollNext()
    }, 3000)
    return () => clearInterval(interval)
  }, [emblaMobile])

  // Desktop Dot Indicator Sync
  useEffect(() => {
    if (!emblaDesktop) return
    const onSelect = () => setSelectedIndexDesktop(emblaDesktop.selectedScrollSnap())
    emblaDesktop.on("select", onSelect)
    onSelect()
  }, [emblaDesktop])

  // Mobile Dot Indicator Sync
  useEffect(() => {
    if (!emblaMobile) return
    const onSelect = () => setSelectedIndexMobile(emblaMobile.selectedScrollSnap())
    emblaMobile.on("select", onSelect)
    onSelect()
  }, [emblaMobile])

  return (
    <div>
      {/* DESKTOP SLIDER */}
      <div className="hidden md:block">
        <div className="embla overflow-x-hidden" ref={emblaRefDesktop}>
          <div className="embla__container flex">
            {desktopImages.map((src, i) => (
              <div key={i} className="embla__slide flex-[0_0_100%]">
                <img src={src} className="w-full h-auto object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Dots */}
        <div className="flex justify-center mt-2 gap-2">
          {desktopImages.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedIndexDesktop === i ? "bg-red-600" : "bg-gray-400"
              }`}
            ></div>
          ))}
        </div>
      </div>

      {/* MOBILE SLIDER */}
      <div className="block md:hidden">
        <div className="embla overflow-x-hidden" ref={emblaRefMobile}>
          <div className="embla__container flex">
            {mobileImages.map((src, i) => (
              <div key={i} className="embla__slide flex-[0_0_100%]">
                <img src={src}className="w-full h-[300px] object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dots */}
        <div className="flex justify-center p-2 gap-2">
          {mobileImages.map((_, i) => (
            <div
              key={i}
              className={`w-3 h-3 rounded-full transition-all ${
                selectedIndexMobile === i ? "bg-red-600" : "bg-gray-400"
              }`}
            ></div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageSlider
