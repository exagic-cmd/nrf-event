const BookingButton = ({ onClick }) => (
  <div className="mt-6 mx-2 md:mx-8">
    <button
      onClick={onClick}
      className="w-full md:w-auto bg-brand-secondary text-white font-medium px-8 py-2 rounded-full transition"
    >
      Book Now
    </button>
  </div>
);

export default BookingButton;
