const BookingModal = ({ isOpen, onClose, onUpdate, onGoToCart, type = "accommodation" }) => {
  if (!isOpen) return null;

  const productType = type === "accommodation" ? "accommodation" : "tour";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-surface p-6 rounded-lg shadow-xl text-center max-w-sm mx-4">
        <h3 className="text-lg font-semibold text-foreground mb-4">
          {productType === "accommodation" ? "Accommodation Already in Cart" : "Tour Already in Cart"}
        </h3>
        <p className="text-muted-foreground mb-6">
          This {productType} is already in your cart, Would you like to update your selection or proceed to checkout?
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={onUpdate}
            className="bg-primary text-primary-foreground px-4 py-2 rounded font-semibold hover:bg-primary-hover transition-colors"
          >
            Update Selection
          </button>
          <button
            onClick={onGoToCart}
            className="bg-secondary text-foreground px-4 py-2 rounded font-semibold hover:bg-secondary transition-colors"
          >
            Go to Cart
          </button>
          <button
            onClick={onClose}
            className="text-muted-foreground px-4 py-2 rounded font-semibold hover:text-foreground transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default BookingModal;