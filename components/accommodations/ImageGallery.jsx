import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ hotelData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Extract and normalize images from hotelData
  const getImages = () => {
    let images = [];

    // Try to get images from media field (parsed JSON array)
    if (hotelData?.images && Array.isArray(hotelData.images)) {
      images = hotelData.images.map(media => ({
        url: getFullImageUrl(media.url),
        thumb: media.thumb ? getFullImageUrl(media.thumb) : getFullImageUrl(media.url),
        type: media.type || "Image"
      }));
    }
    
    // If no images from media, try the main image field
    if (images.length === 0 && hotelData?.image) {
      images = [{
        url: getFullImageUrl(hotelData.image),
        thumb: getFullImageUrl(hotelData.image),
        type: "Main"
      }];
    }

    // Fallback if no images at all
    if (images.length === 0) {
      images = [{
        url: "/images/placeholder-hotel.jpg",
        thumb: "/images/placeholder-hotel.jpg",
        type: "Placeholder"
      }];
    }

    return images;
  };

  // ✅ Helper function to construct full image URLs
  const getFullImageUrl = (imagePath) => {
    if (!imagePath) return "/images/placeholder-hotel.jpg";
    
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // If it starts with /, it's probably a relative path from your server
    if (imagePath.startsWith('/')) {
      return `${process.env.NEXT_PUBLIC_API_BASE_URL || ''}${imagePath}`;
    }
    
    // Default fallback
    return imagePath;
  };

  const images = getImages();

  const nextImage = () => {
    setCurrentImageIndex((prev) => (prev + 1) % images.length);
  };

  const prevImage = () => {
    setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  // ✅ Reset to first image when hotelData changes
  useEffect(() => {
    setCurrentImageIndex(0);
  }, [hotelData]);

  // ✅ Get image alt text
  const getImageAlt = (image, index) => {
    const hotelName = hotelData?.title || hotelData?.name || "Accommodation";
    const imageType = image.type || "image";
    return `${hotelName} - ${imageType} ${index + 1}`;
  };

  return (
    <div className="lg:col-span-4">
      {/* Main Image Display */}
      <div className="relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-800">
        <img
          src={images[currentImageIndex]?.url}
          alt={getImageAlt(images[currentImageIndex], currentImageIndex)}
          className="w-full h-full object-cover"
          onError={(e) => {
            // Fallback if image fails to load
            e.target.src = "/images/placeholder-hotel.jpg";
          }}
        />
        
        {/* Navigation Arrows */}
        {images.length > 1 && (
          <>
            <button
              onClick={prevImage}
              className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              aria-label="Previous image"
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={nextImage}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors z-10"
              aria-label="Next image"
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}
        
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm z-10">
            {currentImageIndex + 1} / {images.length}
          </div>
        )}
        
        {/* Image Dots Indicator */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
            {images.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`w-2 h-2 rounded-full transition-colors ${
                  index === currentImageIndex ? "bg-white" : "bg-white/50"
                }`}
                aria-label={`Go to image ${index + 1}`}
              />
            ))}
          </div>
        )}
      </div>
      
      {/* Thumbnails Gallery */}
      {images.length > 1 && (
        <div className="mt-4">
          <h4 className="text-white text-sm font-medium mb-2">Gallery ({images.length} images)</h4>
          <div className="flex gap-2 overflow-x-auto pb-2">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-20 h-16 rounded-lg overflow-hidden border-2 transition-all ${
                  index === currentImageIndex 
                    ? "border-[#CC9A55] ring-2 ring-[#CC9A55]/30" 
                    : "border-transparent hover:border-white/50"
                }`}
                aria-label={`View ${image.type} image ${index + 1}`}
              >
                <img
                  src={image.thumb || image.url}
                  alt={getImageAlt(image, index)}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/images/placeholder-hotel.jpg";
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Image Type Indicator */}
      {images[currentImageIndex]?.type && images.length > 1 && (
        <div className="mt-2 text-center">
          <span className="text-gray-400 text-sm capitalize">
            {images[currentImageIndex].type.replace(/([A-Z])/g, ' $1').trim()}
          </span>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;