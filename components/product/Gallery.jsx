import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";

const Gallery = ({ images = [] }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  const openModal = (index) => {
    setCurrentIndex(index);
     setIsOpen(true);
  };

  const closeModal = () => setIsOpen(false);
  const prevImage = () => setCurrentIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  const nextImage = () => setCurrentIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));

  if (!images.length) return <div className="text-gray-500">No images available</div>;

  return (
    <div className="relative grid grid-cols-2 md:grid-cols-4 gap-1">
      <div className="col-span-2">
        <img
          src={images[0]}
          alt="Main"
          onClick={() => openModal(0)}
          className="w-full h-[200px] md:h-[391px] object-cover rounded-l-xl cursor-pointer"
        />
      </div>
      {images[1] && (
        <div className="col-span-1">
          <img
            src={images[1]}
            alt="Second"
            onClick={() => openModal(1)}
            className="w-full h-[200px] md:h-[391px] object-cover cursor-pointer"
          />
        </div>
      )}
      <div className="col-span-1">
        <div className="grid grid-rows-2 gap-1">
          {images.slice(2, 4).map((img, index) => (
            <img
              key={index}
              src={img}
              alt={`Gallery ${index + 2}`}
              onClick={() => openModal(index + 2)}
              className="w-full h-[100px] md:h-[195px] object-cover rounded-r-xl cursor-pointer"
            />
          ))}
        </div>

        <div className="absolute bottom-0 bg-white m-2 p-1 cursor-pointer rounded right-0">
          
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744017946/External%20Links/icons/svvajkpaqnzkppzwhwuj.svg`}
            alt="gallery"
            onClick={() => openModal(0)}
          />
        </div>
      </div>

      {isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-80 z-50 flex items-center justify-center">
          <button onClick={closeModal} className="absolute top-6 right-6 text-white">
            <X size={30} />
          </button>
          <button onClick={prevImage} className="absolute left-6 text-white hover:scale-110 transition">
            <ChevronLeft size={40} />
          </button>
          <img
            src={images[currentIndex]}
            alt={`Gallery ${currentIndex}`}
            className="max-h-[80vh] max-w-[90vw] w-auto h-auto rounded-xl shadow-lg object-contain"
          />
          <button onClick={nextImage} className="absolute right-6 text-white hover:scale-110 transition">
            <ChevronRight size={40} />
          </button>
        </div>
      )}
    </div>
  );
};


export default Gallery;