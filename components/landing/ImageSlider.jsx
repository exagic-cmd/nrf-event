"use client"
import React, { useEffect } from 'react'
import useEmblaCarousel from 'embla-carousel-react'

const ImageSlider = () => {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })

  useEffect(() => {
    if (!emblaApi) return

    const interval = setInterval(() => {
      if (emblaApi.canScrollNext()) {
        emblaApi.scrollNext()
      } else {
        emblaApi.scrollTo(0)
      }
    }, 3000) // Change slide every 3 seconds

    return () => clearInterval(interval)
  }, [emblaApi])

  const placeholderImages = [
    'https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763616321/External%20Links/2.jpg',
    'https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763616321/External%20Links/1.jpg',
    'https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763616321/External%20Links/3.jpg',
  ]

  return (
    <div className="embla overflow-x-hidden" ref={emblaRef}>
      <div className="embla__container flex">
        {placeholderImages.map((src, index) => (
          <div className="embla__slide flex-[0_0_100%]" key={index}>
            <img
              src={src}
              alt={`Placeholder image ${index + 1}`}
              className="w-full h-auto object-cover"
            />
          </div>
        ))}
      </div>
    </div>
  )
}

export default ImageSlider
