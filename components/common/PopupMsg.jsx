import React from 'react';
import { X } from 'lucide-react';
import { useProductStore } from "@/store/useProductStore";
import { useCartStore } from "@/store/useCartStore";
const PopupMsg = ({ closePopup }) => {
  const bookingData = useProductStore(state => state.bookingData);
  console.log("Booking Data:", bookingData);
const onclose = () =>{
      useCartStore.getState().clearCart();
closePopup()
}

  return (
    <div className="fixed inset-0 bg-surface bg-opacity-100 flex justify-center items-center z-50">
      <div className="bg-surface rounded-lg p-6 shadow-lg text-center max-w-2xl relative">
        {/* Close Icon Top Right */}
        <button
          onClick={onclose}
          className="absolute top-3 right-3 text-muted-foreground hover:text-red-500"
          aria-label="Close popup"
        >
          <X className="w-6 h-6" />
        </button>

        {/* Images */}
        <div className="flex relative justify-center mb-4">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vg5ld1wrkipqk9y8vy33.svg`}
            alt="Success"
            className="h-24 object-cover opacity-30"
          />
          
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/yrgzbjyvjvyziduap2zr.svg`}
            alt="Tour"
            className="rounded-lg h-16 object-cover absolute right-0 opacity-30 w-20"
          />
        </div>

        {/* Text and Booking Details */}
        <h2 className="text-xl font-semibold mb-2">Booking Confirmed</h2>
        <p className="text-muted-foreground mb-4">
          Your booking has been successfully confirmed.
        </p>

        {/* Dynamic Booking Info */}
        <div className="text-left mb-4 space-y-1 text-sm">
          <p><strong>Booking Ref#:</strong> 325676323</p>
          {bookingData?.product?.name && <p><strong>Tour:</strong> {bookingData.product.name}</p>}
          {bookingData?.details?.date && <p><strong>Date:</strong> {bookingData.details.date}</p>}
          {bookingData?.personal?.fullName && <p><strong>Guest:</strong> {bookingData.personal.fullName}</p>}
        </div>

        {/* Action Button */}
        {/* <button
          className="bg-secondary text-[#FE6F4F] hover:bg-[#FE6F4F] hover:text-white transition-colors font-medium py-2 px-4 rounded-full"
          onClick={closePopup}
        >
          View Itinerary
        </button> */}
      </div>
    </div>
  );
};

export default PopupMsg;
