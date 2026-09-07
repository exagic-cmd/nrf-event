import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";

/**
 * AmenitiesCarousel
 * - No scrollbars
 * - Left / Right buttons only
 * - Smooth animation
 * - Responsive
 */
const AmenitiesCarousel = ({ items = [] }) => {
  const containerRef = useRef(null);
  const ITEM_WIDTH = 120; // width of one amenity chip (px)

  const [index, setIndex] = useState(0);
  const [visibleCount, setVisibleCount] = useState(1);

  useEffect(() => {
    const calculateVisible = () => {
      if (!containerRef.current) return;
      const width = containerRef.current.offsetWidth;
      setVisibleCount(Math.max(1, Math.floor(width / ITEM_WIDTH)));
    };

    calculateVisible();
    window.addEventListener("resize", calculateVisible);
    return () => window.removeEventListener("resize", calculateVisible);
  }, []);

  if (!items || items.length === 0) return null;

  const maxIndex = Math.max(0, items.length - visibleCount);

  const moveLeft = () => setIndex(i => Math.max(i - 1, 0));
  const moveRight = () => setIndex(i => Math.min(i + 1, maxIndex));

  return (
    <div className="relative w-full">
      {/* Left Arrow */}
      {index > 0 && (
        <button
          onClick={moveLeft}
          aria-label="Scroll amenities left"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border shadow-md rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronLeft size={16} />
        </button>
      )}

      {/* Viewport */}
      <div ref={containerRef} className="overflow-hidden px-8">
        <div
          className="flex gap-2 transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${index * ITEM_WIDTH}px)`
          }}
        >
          {items.map((amenity) => (
            <div
              key={amenity.id || amenity.name}
              title={amenity.name}
              className="min-w-[110px] bg-primary text-primary-foreground text-xs font-medium px-2.5 py-1 rounded-lg flex items-center gap-1.5 whitespace-nowrap"
            >
              {amenity.icon ? (
                <img
                  src={getFullImageUrl(
                    (amenity.icon || "").replace(/\\/g, "/")
                  )}
                  alt={amenity.name}
                  className="w-4 h-4 object-contain "
                />
              ) : (
                <span className="w-4 h-4 rounded bg-secondary/40" />
              )}
              <span className="truncate">{amenity.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right Arrow */}
      {index < maxIndex && (
        <button
          onClick={moveRight}
          aria-label="Scroll amenities right"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-surface border border-border shadow-md rounded-full p-1.5 hover:bg-muted"
        >
          <ChevronRight size={16} />
        </button>
      )}
    </div>
  );
};

export default AmenitiesCarousel;
