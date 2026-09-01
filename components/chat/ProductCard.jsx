"use client";

export default function ProductCard({ product, onSelect }) {
  const imageUrl =
    product.images?.[0] || "/placeholder.svg?height=200&width=300";

  const roundedPrice = product.starting_price
    ? Math.round(Number(product.starting_price))
    : null;

  return (
    <div
      onClick={() => onSelect?.(product.id)}
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
          alt={product.title}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
        />
        <div className="absolute top-2 right-2 bg-brand-secondary/90 text-white text-xs font-semibold px-2 py-1 rounded-md shadow-md">
          {roundedPrice ? `$${roundedPrice}` : "N/A"}
        </div>
      </div>

      {/* Details */}
      <div className="p-4 flex flex-col flex-grow justify-between text-white">
        <div>
          <h3 className="font-semibold text-lg text-[#CC9A55] line-clamp-1 mb-1">
            {product.title}
          </h3>

          <p className="text-sm text-gray-300 line-clamp-2 mb-3">
            {product.short_desc}
          </p>
        </div>

        {/* View Details Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            window.open(`/day-tours/details/${product.id}`, "_blank");
          }}
          className="
            mt-2
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
          Book Now
        </button>
      </div>
    </div>
  );
}
