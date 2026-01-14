"use client";

import { useEffect, useState } from "react";
import { getFullImageUrl } from "@/utils/imageService";
import { useRouter } from "next/navigation";
import { Globe } from "lucide-react"
export default function SelectGroup({
  guides = [],
  languages = [],
  selectedGuide,
  setSelectedGuide,
  selectedLanguage,
  setSelectedLanguage,
  onReview, 
  onStartTour, 
  reviewDisabled,
  onGuideSelect,
  colortext,
  colorheading,
  locations,
  product,
  noButton,
  noTour,
  fromOrderScreen, 
}) {
  const [fromOrderScreenState, setFromOrderScreenState] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (!selectedLanguage && languages.length > 0) {
      setSelectedLanguage(languages[0].code);
    }
  }, [selectedLanguage, languages, setSelectedLanguage]);
  useEffect(() => {
    // prefer explicit prop from parent; if undefined fallback to sessionStorage
    if (typeof fromOrderScreen !== "undefined") {
      setFromOrderScreenState(!!fromOrderScreen);
    } else if (typeof window !== "undefined") {
      setFromOrderScreenState(sessionStorage.getItem("fromOrder") === "true");
    }
  }, [fromOrderScreen]);

  useEffect(() => {
    if (guides.length > 0 && !selectedGuide) {
      const defaultGuide = guides[0];
      setSelectedGuide(defaultGuide.id);
      if (onGuideSelect) onGuideSelect(defaultGuide);
    }
  }, [guides, selectedGuide, setSelectedGuide, onGuideSelect]);

  const handleStartTour = async () => {
    if (!locations || !locations.length)
      return console.warn("⚠️ No locations available");
    const first = locations[0];
    if (!first?.id) return console.warn("⚠️ No valid location ID");

    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 500));
      router.push(`/location-detail/${product?.id}?lang=${selectedLanguage}&guide=${selectedGuide}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mt-2 rounded-2xl pt-4 pb-4 shadow-inner space-y-4">
      <div className="px-2 md:px-4">
        <div className="flex justify-between w-full mb-2 gap-1">
          <p
            className=" text-sm text-[#D3202D] font-semibold lg:text-lg"
            style={{ color: colorheading }}
          >
            Select Your Guide & Language
          </p>
    <div className="relative inline-block w-fit">
  {/* Globe Icon */}
  <Globe
    size={18}
    className="absolute left-2 top-4 -translate-y-1/2 text-[#D3202D] pointer-events-none"
  />

  {/* Language Select */}
  <select
    value={selectedLanguage}
    onChange={(e) => setSelectedLanguage(e.target.value)}
    style={{ backgroundColor: colortext, color: colorheading }}
    className="border border-gray-700 rounded-lg pl-8 pr-2 py-1 appearance-none focus:outline-none focus:ring-2 focus:ring-[#D3202D] transition-all"
  >
    <option value="">Select language</option>
    {languages.map((lang) => (
      <option key={lang.code} value={lang.code}>
        {lang.name}
      </option>
    ))}
  </select>
</div>
        </div>

        <div className="flex gap-4 overflow-x-auto py-2">
          {guides.map((guide) => {
            const isSelected = guide.id === selectedGuide;
            return (
              <div
                key={guide.id}
                onClick={() => {
                  setSelectedGuide(guide.id);
                  if (onGuideSelect) onGuideSelect(guide);
                }}
                className={`flex flex-col items-center cursor-pointer min-w-[80px] md:min-w-[100px] transition-all ${
                  isSelected ? "opacity-100 scale-105" : "opacity-60"
                }`}
              >
                <div
                  className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 ${
                    isSelected
                      ? "border-[#D3202D] shadow-[0_0_10px_#D3202D]"
                      : "border-gray-600"
                  } flex items-center justify-center transition-all duration-300`}
                >
                  <img
                    src={getFullImageUrl(guide?.image || "") || "placeholder.svg"}
                    alt={guide.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <p
                  style={{ color: colorheading }}
                  className="text-white text-sm md:text-base mt-2 text-center truncate w-20 md:w-24"
                >
                  {guide.name}
                </p>
              </div>
            );
          })}
        </div>
      </div>

      {/* Buttons */}
      {!noButton && (
        <div className="flex justify-end px-2 md:px-4">
          {fromOrderScreenState && !noTour ? (
            <button
              onClick={handleStartTour}
              disabled={loading}
              className="w-full sm:w-auto px-4 py-2 bg-[#D3202D]   text-white font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
            >
              {loading ? "Starting..." : "Start Tour"}
            </button>
          ) : (
            <button
              onClick={onReview}
              disabled={!selectedGuide || !selectedLanguage || reviewDisabled}
              className="w-full sm:w-auto px-4 py-2 bg-[#D3202D]   text-black font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
            >
              Preview
            </button>
          )}
        </div>
      )}
    </div>
  );
}
