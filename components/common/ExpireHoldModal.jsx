import React from "react";
import { X } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
const ExpireHoldModal = ({ open, onClose, onExtend, onRelease, item }) => {
  if (!open || !item) return null;

  const imgSrc = getFullImageUrl(item?.image) || getFullImageUrl(item?.vehicle?.image) || "/default-hotel.png";
  const title = item?.productTitle || item?.title || item?.vehicle?.vehicle_name || "Accommodation";

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-xl sm:rounded-xl p-4 sm:p-6 max-w-md w-full mx-4 shadow-lg">
        <div className="flex justify-between items-start">
          <h3 className="text-lg font-semibold">Time's up for this reserved room.</h3>
          {/* <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X />
          </button> */}
        </div>

        <div className="mt-4 flex items-center gap-3">
          <img src={imgSrc} alt={title} className="w-16 h-16 rounded-md object-cover border" />
          <div className="flex-1">
            <div className="font-medium">{title}</div>
            <div className="text-sm text-gray-500">The room reservation expired. Would you like to reserve again?</div>
          </div>
        </div>

        <div className="mt-5 flex gap-3">
          <button
            onClick={onExtend}
            className="flex-1 bg-[#D3202D] text-white py-2 rounded-lg font-semibold"
          >
            Yes reserve
          </button>
          <button onClick={onRelease} className="flex-1 bg-gray-100 py-2 rounded-lg font-medium">
            No need
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExpireHoldModal;
