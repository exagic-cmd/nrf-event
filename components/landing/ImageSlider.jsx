"use client"
import React, { useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"

const ImageSlider = () => {
  const [emblaRefDesktop, emblaDesktop] = useEmblaCarousel({ loop: true })
  const [selectedIndexDesktop, setSelectedIndexDesktop] = useState(0)

  const [emblaRefMobile, emblaMobile] = useEmblaCarousel({ loop: true })
  const [selectedIndexMobile, setSelectedIndexMobile] = useState(0)

  const desktopSlides = [
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/1_Desktop.jpg",
     title: "Transfers Across Singapore",
      subtitle: "Your trusted partner for",
      description:
        "Enjoy smooth, reliable transfers across Singapore. Book in minutes and travel comfortably with trusted drivers and modern vehicles.",
    
     
       },
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/3_Desktop.jpg",
      title: "Luxury Hotels Await",
      subtitle: "Discover",
      description:
        "Experience premium amenities and world-class hospitality during your stay.",
    },
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/2_Desktop.jpg",
       title: "Perfect Stay in Singapore",
      subtitle: "Book your",
      description:
        "Enjoy a curated selection of top-quality hotels offering comfort and exceptional service.",
    },
  ]

  // ✅ Only mobile IMAGES now
  const mobileSlides = [
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/2_mobile.jpg",
    },
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/1_mobile.jpg",
    },
    {
      image:
        "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763980540/External%20Links/3_mobile.jpg",
    },
  ]

  useEffect(() => {
    if (!emblaDesktop) return
    const interval = setInterval(() => emblaDesktop.scrollNext(), 3000)
    return () => clearInterval(interval)
  }, [emblaDesktop])

  useEffect(() => {
    if (!emblaMobile) return
    const interval = setInterval(() => emblaMobile.scrollNext(), 3000)
    return () => clearInterval(interval)
  }, [emblaMobile])

  useEffect(() => {
    if (!emblaDesktop) return
    const onSelect = () =>
      setSelectedIndexDesktop(emblaDesktop.selectedScrollSnap())
    emblaDesktop.on("select", onSelect)
    onSelect()
  }, [emblaDesktop])

  useEffect(() => {
    if (!emblaMobile) return
    const onSelect = () =>
      setSelectedIndexMobile(emblaMobile.selectedScrollSnap())
    emblaMobile.on("select", onSelect)
    onSelect()
  }, [emblaMobile])

  return (
    <div className="relative">

      {/* DESKTOP */}
      <div className="hidden md:block relative">
        <div className="absolute inset-0 flex flex-col justify-center items-start text-white z-20 px-10">
          <h2 className="text-lg md:text-xl lg:text-xl  font-semibold mb-2">
            {desktopSlides[selectedIndexDesktop].subtitle}
          </h2>

          <h1 className="text-xl md:text-2xl lg:text-4xl font-bold mb-4 text-[#D3202D]">
            {desktopSlides[selectedIndexDesktop].title}
          </h1>

          <p className="text-sm md:text-base lg:text-lg max-w-xl">
            {desktopSlides[selectedIndexDesktop].description}
          </p>
        </div>

        <div className="embla overflow-x-hidden" ref={emblaRefDesktop}>
          <div className="embla__container flex">
            {desktopSlides.map((slide, i) => (
              <div key={i} className="embla__slide flex-[0_0_100%]">
                <img src={slide.image} className="w-full h-auto object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Desktop Dots */}
        <div className="flex justify-center mt-2 gap-2">
       <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-30">
  {desktopSlides.map((_, i) => (
    <div
      key={i}
      className={`w-3 h-3 rounded-full transition-all ${
        selectedIndexDesktop === i ? "bg-red-600" : "bg-white/50"
      }`}
    ></div>
  ))}
</div>

        </div>
      </div>

    
      <div className="block md:hidden relative">
        <div className="absolute inset-0 flex flex-col items-center justify-start text-white z-20 p-4 pt-8">
          <h2 className="text-base font-semibold mb-1 text-center">
            {desktopSlides[selectedIndexMobile].subtitle}
          </h2>

          <h1 className="text-xl font-bold mb-2 text-center text-[#D0E9FF]">
            {desktopSlides[selectedIndexMobile].title}
          </h1>

          <p className="text-xs text-center max-w-sm px-3">
            {desktopSlides[selectedIndexMobile].description}
          </p>
        </div>

        <div className="embla overflow-x-hidden" ref={emblaRefMobile}>
          <div className="embla__container flex">
            {mobileSlides.map((slide, i) => (
              <div key={i} className="embla__slide flex-[0_0_100%]">
                <img src={slide.image} className="w-full h-[370px] object-contain" />
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Dots */}
       <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-30">
  {mobileSlides.map((_, i) => (
    <div
      key={i}
      className={`w-3 h-3 rounded-full transition-all ${
        selectedIndexMobile === i ? "bg-red-600" : "bg-white/50"
      }`}
    ></div>
  ))}
</div>

      </div>
    </div>
  )
}

export default ImageSlider
