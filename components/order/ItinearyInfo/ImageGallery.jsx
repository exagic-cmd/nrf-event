import { useState, useEffect } from 'react';
import Image from 'next/image';
import { getFullImageUrl } from '@/utils/imageService';
import { Expand, ChevronLeft, ChevronRight } from 'lucide-react';

const ImageGallery = ({ images, onImageClick, autoPlay = false, interval = 3000, compact = false }) => {
  if (!images || images.length === 0) {
    return (
      <div className="relative w-full h-64 bg-gray-200 rounded-xl flex items-center justify-center">
        <p className="text-gray-500">No images available</p>
      </div>
    );
  }

  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (!autoPlay || !images || images.length <= 1) return;
    const id = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
    }, interval);
    return () => clearInterval(id);
  }, [autoPlay, images, interval]);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) => (prevIndex === 0 ? images.length - 1 : prevIndex - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex === images.length - 1 ? 0 : prevIndex + 1));
  };

  const mainImage = images[currentIndex];

  return (
    <div className="relative w-full">
      <div className={`relative w-full ${compact ? 'h-36 md:h-40' : 'h-64 md:h-96'} rounded-xl overflow-hidden group`}>
        <Image
          src={getFullImageUrl(mainImage.image)}
          alt={mainImage.name || 'Hotel Image'}
          fill
          className="object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 bg-black bg-opacity-20 group-hover:bg-opacity-10 transition-all"></div>
        <button
          onClick={() => onImageClick && onImageClick(getFullImageUrl(mainImage.image))}
          className="absolute top-2 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
          aria-label="Enlarge image"
        >
          <Expand size={16} />
        </button>
        {images.length > 1 && (
          <>
            <button
              onClick={handlePrev}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              aria-label="Previous image"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
              aria-label="Next image"
            >
              <ChevronRight size={20} />
            </button>
          </>
        )}
      </div>
      {images.length > 1 && (
        <div className="flex space-x-2 mt-2">
          {images.slice(0, 5).map((img, index) => (
            <div
              key={img.id}
              className={`relative ${compact ? 'w-1/4 h-12' : 'w-1/5 h-16'} rounded-md overflow-hidden cursor-pointer border-2 ${
                currentIndex === index ? 'border-[#CC9A55]' : 'border-transparent'
              }`}
              onClick={() => setCurrentIndex(index)}
            >
              <Image
                src={getFullImageUrl(img.image)}
                alt={img.name || 'Thumbnail'}
                fill
                className="object-cover"
              />
              {index === 4 && images.length > 5 && (
                <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center text-white font-bold">
                  +{images.length - 5}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
