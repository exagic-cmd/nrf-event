"use client";

import { useEffect } from 'react';
import { getFullImageUrl } from "@/utils/imageService";
export default function SelectGroup({ guides = [], languages = [], selectedGuide, setSelectedGuide, selectedLanguage, setSelectedLanguage, onReview, reviewDisabled, onGuideSelect ,colortext,colorheading}) {
  useEffect(() => {
    if (!selectedLanguage && languages.length > 0) {
      setSelectedLanguage(languages[0].code);
    }
  }, [selectedLanguage, languages, setSelectedLanguage]);

  useEffect(() => {
    if (guides.length > 0 && !selectedGuide) {
      const defaultGuide = guides[0];
      setSelectedGuide(defaultGuide.id);
      if (onGuideSelect) {
        onGuideSelect(defaultGuide);
      }
    }
  }, [guides, selectedGuide, setSelectedGuide, onGuideSelect]);

  return (
    <div className="mt-10  rounded-2xl pt-4 pb-2 shadow-inner border border-gray-800 space-y-2">
      <h3 class="text-md px-2 md:text-lg font-semibold  mb-2 text-start" style={{ color: colorheading }}>
        What is the Tour About
      </h3>

      <div class="lg:flex lg:justify-between lg:items-end">
        {/* Guide Selection */}
        <div className="lg:w-2/3">
          <p class=" text-sm md:text-base mb-2 px-2"style={{ color: colorheading }}>Select Your Guide</p>
          <div class="flex gap-4 overflow-x-auto px-2 md:px-4 py-2">
            {guides.map((guide) => {
              const isSelected = guide.id === selectedGuide;
              return (
                <div
                  key={guide.id}
                  onClick={() => {
                    setSelectedGuide(guide.id);
                    if (onGuideSelect) {
                      onGuideSelect(guide);
                    }
                  }}
                  className={`flex flex-col items-center cursor-pointer min-w-[80px] md:min-w-[100px] transition-all ${
                    isSelected ? "opacity-100 scale-105" : "opacity-60"
                  }`}
                >
                  <div
    className={`w-16 h-16 md:w-20 md:h-20 rounded-full overflow-hidden border-4 
      ${isSelected ? "border-[#CC9A55] shadow-[0_0_10px_#CC9A55]" : "border-gray-600"} 
      flex items-center justify-center transition-all duration-300`}
  >
                    <img
                      src={getFullImageUrl(guide?.image )|| "placeholder.svg"}
                      alt={guide.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <p style={{ color: colorheading }} class=" text-sm md:text-base mt-2 text-center truncate w-20 md:w-24">
                    {guide.name}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="lg:w-1/4 md:flex-col flex justify-between">
          {/* Language Selection */}
          <div class="mt-2 px-2 md:px-4">
            <label class="text-xs md:text-sm text-black mb-2 block">
              Language
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value)}
             style={{ backgroundColor: colortext, color: colorheading}} className="w-full  border border-gray-700 rounded-lg px-1.5 py-2 focus:outline-none focus:ring-2 focus:ring-[#CC9A55] appearance-none transition-all"
            >
              <option value="">Select language</option>
              {languages.map((lang) => (
                <option key={lang.code} value={lang.code}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          {/* Review Button */}
          <div class="text-end  mt-2 ">
            <button
              onClick={onReview}
              disabled={!selectedGuide || !selectedLanguage || reviewDisabled}
              style={{ color: colortext }}
              className="md:px-8 mt-6 px-4 py-2 mr-2 md:py-3 bg-[#CC9A55] hover:bg-[#e1b97b] font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Review Tour
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
