const BookingModal = ({ isOpen, onClose, onUpdate, onGoToCart, type = "accommodation" }) => {
  if (!isOpen) return null;

  const productType = type === "accommodation" ? "accommodation" : "tour";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {productType === "accommodation" ? "Accommodation Already in Cart" : "Tour Already in Cart"}
        </h3>
        <p className="text-gray-600 mb-6">
          This {productType} is already in your cart. Would you like to update your selection or proceed to checkout?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onUpdate}
            className="bg-[#CC9A55] text-white px-4 py-2 rounded font-semibold hover:bg-[#b88a45] transition-colors"
          >
            Update Selection
          </button>
          <button
            onClick={onGoToCart}
            className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
          >
            Go to Cart
          </button>
          <button
            onClick={onClose}
            className="text-gray-600 px-4 py-2 rounded font-semibold hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;