import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

const ImageGallery = ({ hotelData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // ✅ Extract and normalize images from hotelData
  const getImages = () => {
    let images = [];
    let rawImages = hotelData?.media; 
console.log("imggg",hotelData)
    if (typeof rawImages === 'string') {
      try {
        rawImages = JSON.parse(rawImages);
      } catch (error) {
        console.error("Failed to parse images JSON:", error);
        rawImages = null; 
      }
    }
    if (rawImages && Array.isArray(rawImages) && rawImages.length > 0) {
      images = rawImages.map(media => ({
        url: getFullImageUrl(media.image),
        thumb: getFullImageUrl(media.image),
        type: media.name || "Image"
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
    if (!imagePath) {
      return "/images/placeholder-hotel.jpg";
    }
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    const baseUrl = ($helpers.getEnv('CLOUDINARY_BASE_URL') || '').replace(/\/$/, ''); // Get base URL and remove trailing slash
    
    return `${baseUrl}/${imagePath.replace(/^\//, '')}`;  };

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
    <div className="flex flex-col lg:flex-row gap-6">

      {/* Main Display */}
      <div className="w-full lg:flex-[2]">
        <div className="relative rounded-2xl overflow-hidden bg-black/10 shadow-xl backdrop-blur">

          <img
            src={images[currentImageIndex]?.url}
            alt={getImageAlt(images[currentImageIndex], currentImageIndex)}
            className="w-full h-[280px] md:h-[320px] lg:h-[420px] object-cover rounded-2xl"
            onError={(e) => (e.target.src = "/images/placeholder-hotel.jpg")}
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent pointer-events-none" />

          {/* Navigation Buttons */}
          {images.length > 1 && (
            <>
              <button
                onClick={prevImage}
                className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-lg text-white p-3 rounded-full shadow-lg transition"
              >
                <ChevronLeft size={22} />
              </button>

              <button
                onClick={nextImage}
                className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/20 hover:bg-white/40 backdrop-blur-lg text-white p-3 rounded-full shadow-lg transition"
              >
                <ChevronRight size={22} />
              </button>
            </>
          )}

          {/* Counter */}
          {images.length > 1 && (
            <div className="absolute bottom-4 right-4 text-white bg-black/40 px-3 py-1 rounded-full text-xs shadow">
              {currentImageIndex + 1} / {images.length}
            </div>
          )}
        </div>

        {/* Image Type Label */}
        {/* {images[currentImageIndex]?.type && (
          <div className="mt-3 text-center text-gray-300 font-light text-sm">
            {images[currentImageIndex].type.replace(/([A-Z])/g, " $1").trim()}
          </div>
        )} */}
      </div>

      {/* Thumbnail Panel */}
      {images.length > 1 && (
        <div className="lg:flex-[]">
          {/* <h4 className="text-gray-300 text-sm mb-2 font-semibold">
            Gallery ({images.length})
          </h4> */}

          <div className="flex lg:flex-col gap-3 overflow-x-auto lg:overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent pr-1">
            {images.map((image, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index)}
                className={`flex-shrink-0 w-24 lg:w-full h-24 rounded-xl overflow-hidden shadow-md transition border-2 ${
                  index === currentImageIndex
                    ? "border-[#D3202D] shadow-lg"
                    : "border-transparent hover:border-white/40"
                }`}
              >
                <img
                  src={image.thumb}
                  alt={getImageAlt(image, index)}
                  className="w-full h-full object-contain"
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  </div>
);

};

export default ImageGallery;