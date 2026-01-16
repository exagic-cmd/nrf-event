import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight, Filter, PlayCircle } from "lucide-react";
import { useTranslation } from "next-i18next";
import SvgLoader2 from "@/components/common/Loader2Svg";
import { getFullImageUrl } from "@/utils/imageService";
import { useRouter } from "next/router";

export default function LandmarkList({ itineraryId , customColor }) {
  const { t } = useTranslation("common");
  const scrollRef = useRef(null);
  const router = useRouter();

  const [types, setTypes] = useState([]);
  const [selectedType, setSelectedType] = useState(null);
  const [landmarks, setLandmarks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [initialLandmarkCount, setInitialLandmarkCount] = useState(-1);
  const [navigatingId, setNavigatingId] = useState(null);
  // Fetch types
  useEffect(() => {
  const fetchTypes = async () => {
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/landmark-types`);
      const data = await res.json();
      setTypes(data?.data || []);
    } catch (err) {
      console.error("Error fetching types:", err);
    } finally {
     
    }
  };
  fetchTypes();
}, []);


useEffect(() => {
  if (!itineraryId) return;

  const fetchLandmarks = async () => {

    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/itinerary/nearby-landmarks`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            itinerary_id: itineraryId,
            landmark_type: selectedType ? [selectedType] : [],
          }),
        }
      );
      const data = await res.json();
      const fetchedLandmarks = data?.data?.landmarks?.data || [];
      
      let sortedLandmarks = fetchedLandmarks;
      try {
        const viewed = JSON.parse(localStorage.getItem("viewedLandmarks") || "[]");
        const unviewedItems = fetchedLandmarks.filter((item) => !viewed.includes(item.id));
        const viewedItems = fetchedLandmarks.filter((item) => viewed.includes(item.id));
        viewedItems.sort((a, b) => viewed.indexOf(a.id) - viewed.indexOf(b.id));
        sortedLandmarks = [...unviewedItems, ...viewedItems];
      } catch (e) {}

      setLandmarks(sortedLandmarks);
      setInitialLandmarkCount((prev) =>
        prev === -1 ? fetchedLandmarks.length : prev
      );
    } catch (err) {
      console.error("Error fetching landmarks:", err);
    } finally {
    }
  };

  fetchLandmarks();
}, [selectedType, itineraryId]);

  // Scroll checking
  const checkScroll = () => {
    if (!scrollRef.current) return;
    const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (!el) return;
    el.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);
    return () => {
      el.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, [landmarks]);

  const scroll = (direction) => {
    if (!scrollRef.current) return;
    const card = scrollRef.current.querySelector("[data-card]");
    if (!card) return;
    const style = window.getComputedStyle(card);
    const gap = parseInt(style.marginRight) || 16;
    const cardWidth = card.offsetWidth + gap;

    scrollRef.current.scrollBy({
      left: direction === "left" ? -cardWidth : cardWidth,
      behavior: "smooth",
    });
  };

  if (initialLandmarkCount === 0 && !loading) {
    return null;
  }

  const handleViewLandmark = (item) => {
    setNavigatingId(item.id);
    try {
      const viewed = JSON.parse(localStorage.getItem("viewedLandmarks") || "[]");
      if (!viewed.includes(item.id)) {
        const updatedViewed = [...viewed, item.id];
        localStorage.setItem("viewedLandmarks", JSON.stringify(updatedViewed));
      }
    } catch (e) {}

    const slug = (item.title || "detail")
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .replace(/--+/g, "-") || "detail";
    router.push(`/landmark/${slug}/${item.id}`);
  };

  return (
    <section style={{ backgroundColor: customColor }} className="relative w-full py-2 md:py-3 bg-[#f4f4f4]">



      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Filter Section */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-black flex items-center gap-2">
            <Filter size={20} /> {t("nearby_landmarks", "Nearby Landmarks")}
          </h2>

          {/* Scroll Arrows */}
          <div className="flex space-x-2">
            <button
              onClick={() => scroll("left")}
              disabled={!canScrollLeft}
              className={`p-2 rounded-full border border-red-500 transition ${
                canScrollLeft ? "hover:bg-red-600 text-black" : "opacity-40 cursor-not-allowed text-gray-700"
              }`}
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll("right")}
              disabled={!canScrollRight}
              className={`p-2 rounded-full border border-red-500 transition ${
                canScrollRight ? "hover:bg-red-600 text-black" : "opacity-40 cursor-not-allowed text-gray-700"
              }`}
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

      {/* Type Filters */}
<div className="mb-4 pb-2 overflow-x-auto">
  <div className="flex gap-2 whitespace-nowrap">
    <button
      onClick={() => setSelectedType(null)}
      className={`inline-block rounded-full text-sm px-3 py-1 ${
        selectedType === null
          ? "bg-[#D3202D] text-white"
          : "text-[#D3202D] border border-[#D3202D] hover:bg-[#D3202D] hover:text-white"
      }`}
    >
      {t("all", "All")}
    </button>

    {types.map((type) => (
      <button
        key={type.id}
        onClick={() => setSelectedType(type.id)}
        className={`inline-block rounded-full text-sm px-3 py-1 ${
          selectedType === type.id
            ? "bg-[#D3202D] text-white"
            : "text-[#D3202D] border border-[#D3202D] hover:bg-[#D3202D] hover:text-white"
        }`}
      >
        {type.name}
      </button>
    ))}
  </div>
</div>

      {/* Landmark Cards */}
      {!loading && landmarks.length === 0 && (
        <div className="text-center text-white py-4 lg:py-8">
          <p>{t("no_landmarks_found", "No landmarks found for this category.")}</p>
        </div>
      )}
          <div ref={scrollRef} className="flex gap-4 overflow-x-auto scroll-smooth scrollbar-hide pb-2">
            {landmarks.map((item) => (
              <div
                key={item.id}
                data-card
               
                className="group flex flex-col flex-shrink-0 w-[180px] sm:w-[200px] md:w-[220px] lg:w-[240px] xl:w-[260px] bg-white rounded-xl shadow-sm hover:shadow-md transition-all overflow-hidden relative"
              >
                {navigatingId === item.id && (
                  <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
                    <SvgLoader2 />
                  </div>
                )}
                <div className="relative w-full h-36 sm:h-40 md:h-44 rounded-t-xl overflow-hidden">
                  <Image
                    src={getFullImageUrl(item.image) || "/placeholder.jpg"}
                    alt={item.title}
                    fill
                    className="object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  {/* {item.video && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="w-12 h-12 text-white/90" />
                    </div>
                  )} */}
                </div>
                <div className="p-3 flex flex-col flex-grow">
                  <h3 className="text-black font-medium text-xs sm:text-sm line-clamp-2 mb-1.5 h-9 sm:h-10">
                    {item.title}
                  </h3>
                  <p className="text-[11px] sm:text-xs text-gray-800 line-clamp-4 mb-2 flex-grow">
                    {item.description}
                  </p>
                   <div className="flex justify-between items-end mt-2">
                    <span className="font-semibold text-black text-xs sm:text-sm mt-auto">{item.type}</span>
                    <button  onClick={() => handleViewLandmark(item)} className="text-white text font-semibold rounded-md px-2 py-1 bg-[#D3202D] text-xs lg:text-sm">{t("details", "Details")}</button>
                  </div>
                  
                </div>
               
              </div>
            ))}
          </div>
       
      </div>

    </section>
  );
}
