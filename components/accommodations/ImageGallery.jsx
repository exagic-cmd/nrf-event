import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, X } from "lucide-react";

const ImageGallery = ({ hotelData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showPreview, setShowPreview] = useState(false);

  const getImages = () => {
    let images = [];
    let rawImages = hotelData?.media;

    if (typeof rawImages === "string") {
      try {
        rawImages = JSON.parse(rawImages);
      } catch {
        rawImages = null;
      }
    }

    if (Array.isArray(rawImages)) {
      images = rawImages.map((m) => ({
        url: getFullImageUrl(m.image),
        thumb: getFullImageUrl(m.image),
      }));
    }

    if (images.length === 0 && hotelData?.image) {
      images = [
        {
          url: getFullImageUrl(hotelData.image),
          thumb: getFullImageUrl(hotelData.image),
        },
      ];
    }

    if (images.length === 0) {
      images = [
        { url: "/images/placeholder-hotel.jpg", thumb: "/images/placeholder-hotel.jpg" },
      ];
    }

    return images;
  };

  const getFullImageUrl = (path) => {
    if (!path) return "/images/placeholder-hotel.jpg";
    if (path.startsWith("http")) return path;

    const base = ($helpers.getEnv("CLOUDINARY_BASE_URL") || "").replace(/\/$/, "");
    return `${base}/${path.replace(/^\//, "")}`;
  };

  const images = getImages();
  const extra = Math.max(0, images.length - 4);

  const openPreview = (index) => {
    setCurrentImageIndex(index);
    setShowPreview(true);
  };

  const next = () => setCurrentImageIndex((p) => (p + 1) % images.length);
  const prev = () => setCurrentImageIndex((p) => (p - 1 + images.length) % images.length);

  useEffect(() => {
    const handleKey = (e) => {
      if (!showPreview) return;
      if (e.key === "Escape") setShowPreview(false);
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [showPreview]);

  return (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-2">
        <div className="col-span-1 lg:col-span-2 relative rounded-2xl lg:rounded-r-none overflow-hidden">
          <div
            className="cursor-pointer"
            onClick={() => openPreview(currentImageIndex)}
          >
            <img
              src={images[currentImageIndex].url}
              className="w-full h-[280px] sm:h-[340px] md:h-[420px] object-cover"
              alt={`Image ${currentImageIndex + 1}`}
            />
          </div>

          <div className="lg:hidden">
            {/* Left Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                prev();
              }}
              className="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              <ChevronLeft size={24} />
            </button>
            {/* Right Arrow */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                next();
              }}
              className="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-2 rounded-full"
            >
              <ChevronRight size={24} />
            </button>

            <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2">
              {images.map((_, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation();
                    setCurrentImageIndex(index);
                  }}
                  className={`w-2 h-2 rounded-full ${
                    currentImageIndex === index ? "bg-white" : "bg-white/50"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="hidden lg:grid grid-cols-2 gap-2">

          {images[1] && (
            <div
              className="col-span-2 rounded-tr-2xl overflow-hidden h-[150px] md:h-[210px] cursor-pointer"
              onClick={() => openPreview(1)}
            >
              <img
                src={images[1].thumb}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {images[2] && (
            <div
              className=" overflow-hidden h-[150px] md:h-[200px] cursor-pointer"
              onClick={() => openPreview(2)}
            >
              <img
                src={images[2].thumb}
                className="w-full h-full object-cover"
              />
            </div>
          )}

          {images[3] && (
            <div
              className=" relative rounded-br-2xl overflow-hidden h-[150px] md:h-[200px] cursor-pointer"
              onClick={() => openPreview(3)}
            >
              <img
                src={images[3].thumb}
                className="w-full h-full object-cover"
              />
                {extra > 0 && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center text-white text-2xl font-semibold">
                  +{extra}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {showPreview && (
        <div className="fixed inset-0 bg-black/90 z-[9999] flex items-center justify-center p-4">
          <button
            className="absolute top-6 right-6 text-white p-2 bg-black/40 rounded-full"
            onClick={() => setShowPreview(false)}
          >
            <X size={24} />
          </button>

          <button
            className="absolute left-4 md:left-10 text-white bg-black/30 p-3 rounded-full"
            onClick={prev}
          >
            <ChevronLeft size={28} />
          </button>

          <img
            src={images[currentImageIndex].url}
            className="max-h-[90vh] max-w-[90vw] object-contain rounded-lg"
          />

          <button
            className="absolute right-4 md:right-10 text-white bg-black/30 p-3 rounded-full"
            onClick={next}
          >
            <ChevronRight size={28} />
          </button>
        </div>
      )}
    </>
  );
};
export default ImageGallery;
