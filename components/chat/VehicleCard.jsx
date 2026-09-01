"use client";

export default function VehicleCard({ vehicle, onSelect }) {
  const imageUrl =
    vehicle.image || "/placeholder.svg?height=200&width=300";

  const promoPrice = vehicle.display_promo_price
    ? Math.round(vehicle.display_promo_price)
    : null;
  const basePrice = vehicle.display_price
    ? Math.round(vehicle.display_price)
    : null;

  return (
    <div
      onClick={() => onSelect?.(vehicle.vehicle_id)}
      className="
        cursor-pointer 
        rounded-xl 
        overflow-hidden 
        bg-black 
        border border-[#2a2a2a]
        hover:border-[#CC9A55]
        transition-all 
        duration-300 
        hover:shadow-[0_0_15px_rgba(204,154,85,0.3)]
        flex 
        flex-col
        h-full
      "
    >
      {/* Image */}
      <div className="relative w-full h-48 overflow-hidden bg-[#1a1a1a]">
        <img
          src={imageUrl}
          alt={vehicle.vehicle_name}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />

        {/* Price Tag */}
        <div className="absolute top-2 right-2 bg-brand-secondary/90 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
          {promoPrice
            ? `$${promoPrice}`
            : basePrice
            ? `$${basePrice}`
            : "N/A"}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow justify-between text-white">
        <div>
          <h3 className="font-semibold text-lg text-[#CC9A55] line-clamp-1 mb-1">
            {vehicle.vehicle_name}
          </h3>

          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {vehicle.description}
          </p>

          {/* Capacity Info */}
          <div className="flex flex-wrap gap-x-4 text-xs text-muted-foreground mt-2">
            <span>
               {vehicle.min_capacity}–{vehicle.max_capacity} pax
            </span>
            <span>{vehicle.capacity_with_luggage} luggage</span>
          </div>
        </div>

        {/* Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onSelect?.(vehicle.vehicle_id);
          }}
          className="
            mt-3
            w-full
            bg-brand-secondary
            text-white
            font-medium
            py-2
            rounded-md
            hover:bg-[#e3b871]
            hover:text-surface-foreground
            transition-colors
            shadow-md
          "
        >
          Select
        </button>
      </div>
    </div>
  );
}
