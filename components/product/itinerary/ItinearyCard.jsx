import React, { useState } from "react";
import ItineraryDetailsModal from "./ItineraryDetails"; 

const ItineraryCard = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      {/* Hotel Card */}
      <div className="flex flex-col md:flex-row gap-4 bg-white p-1 mb-5">
        <img
          src="https://cdn.pixabay.com/photo/2018/01/12/14/24/night-3078326_640.jpg"
          alt="Hotel"
          className="w-full md:w-[224px] h-[227px] object-cover rounded-l-lg"
        />

        <div className="flex-1 flex flex-col my-4 md:my-8 justify-between">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black text-white text-xs px-2 w-14 py-1 rounded-full">Day 1</span>
            <h3 className="font-semibold text-[15px]">Intercontinental Robertson Quay</h3>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <img
              src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744017947/External%20Links/icons/hvkgizeaibo75aogptaa.svg"
              alt="hotel icon"
              className="w-4 h-4 mr-1"
            />
            <span className="mr-3">Hotel</span>
            <span>6:00 PM</span>
          </div>

          <p className="text-sm text-gray-700 mb-2  break-words whitespace-normal truncate line-clamp-3">
            Enjoy sophisticated riverfront living at InterContinental Singapore Robertson Quay the way you can with the travel guide 
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
         className="text-black mt-2 text-start underline"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Activity Card */}
      <div className="flex flex-col md:flex-row gap-4 bg-white rounded-lg p-1">
        <img
          src="https://cdn.pixabay.com/photo/2022/02/05/12/42/sea-of-clouds-6994730_640.jpg"
          alt="Tour"
          className="w-full md:w-[224px] h-[227px] object-cover rounded-l-lg"
        />

        <div className="flex-1 flex flex-col my-4 md:my-8 justify-between">
          <div className="flex items-center gap-2 mb-1">
            <span className="bg-black text-white text-xs px-2 w-14 py-1 rounded-full">Day 2</span>
            <h3 className="font-semibold text-[15px]">Visit Night Safari</h3>
          </div>

          <div className="flex items-center text-sm text-gray-600 mb-2">
            <img
              src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744017946/External%20Links/icons/svvajkpaqnzkppzwhwuj.svg"
              alt="hotel icon"
              className="w-4 h-4 mr-1"
            />
            <span className="mr-3">Activity</span>
            <span>12:45 PM</span>
          </div>

          <p className="text-sm text-gray-700 mb-2">
            Night Safari is the world's first nocturnal zoo
          </p>

          <button
            onClick={() => setIsModalOpen(true)}
          className="text-black mt-2  text-start underline"
          >
            View Details
          </button>
        </div>
      </div>

      {/* Modal Component */}
      {isModalOpen && (
        <ItineraryDetailsModal onClose={() => setIsModalOpen(false)} />
      )}
    </div>
  );
};

export default ItineraryCard;
