"use client"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { getFullImageUrl } from "@/utils/imageService"

const ImageGallery = ({ apiData, currentImageIndex, setCurrentImageIndex }) => {
  const allImages = apiData.images?.map((img) => getFullImageUrl(img.image)) || []
  const tourName = apiData.product_description?.title || ""

  const nextImage = () => {
    setCurrentImageIndex(currentImageIndex === allImages.length - 1 ? 0 : currentImageIndex + 1)
  }

  const prevImage = () => {
    setCurrentImageIndex(currentImageIndex === 0 ? allImages.length - 1 : currentImageIndex - 1)
  }

  return (
    <div className="lg:col-span-4">
      <div className="relative group">
        <div className="relative h-64 sm:h-80 lg:h-96 rounded-2xl overflow-hidden border border-primary border-solid">
          <img
            src={allImages[currentImageIndex] || "/placeholder.svg?height=400&width=600"}
            alt={tourName}
            className="w-full h-full object-cover transition-all duration-700 transform hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/30 to-transparent"></div>
          <button
            onClick={prevImage}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-foreground p-2 sm:p-3 rounded-full transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={nextImage}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 bg-background/20 backdrop-blur-sm hover:bg-background/30 text-foreground p-2 sm:p-3 rounded-full transition-all duration-300 opacity-100 sm:opacity-0 sm:group-hover:opacity-100"
          >
            <ChevronRight size={20} />
          </button>
          {/* Counter */}
          <div className="absolute bottom-2 sm:bottom-4 right-2 sm:right-4 bg-background/50 backdrop-blur-sm text-foreground px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm">
            {currentImageIndex + 1} / {allImages.length}
          </div>
        </div>
        {/* Thumbnail Gallery - Responsive */}
        <div className="flex gap-2 sm:gap-3 mt-3 p-2 sm:mt-4 overflow-x-auto pb-2">
          {allImages.map((img, i) => (
            <button
              key={i}
              onClick={() => setCurrentImageIndex(i)}
              className={`flex-shrink-0 w-16 h-12 sm:w-20 sm:h-16 rounded-lg overflow-hidden transition-all duration-300 ${
                currentImageIndex === i
                  ? "ring-2 sm:ring-3 ring-primary ring-offset-1 sm:ring-offset-2 scale-105"
                  : "opacity-70 hover:opacity-100"
              }`}
            >
              <img
                src={img || "/placeholder.svg?height=80&width=100"}
                alt={`Thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

export default ImageGallery
