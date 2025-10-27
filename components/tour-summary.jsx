"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import LocationCard from "./location-card";
import TourMap from "./tour-map";
import { useVirtualTourStore } from "@/store/useVirtualTourStore";
import AudioNote from "@/components/AudioNotePlayer";
import {useSearchParams } from "next/navigation";
import { ChenvronDown, ChenvronUp } from 'lucide-react';
import SelectGroup from "@/components/daytours/tourroute/SelectGroup";


export default function TourSummary({
  id,
  product,
  locations = [],
  totals,
  selectedLang,
  colortext,
  colorheading
}) {
  const [selectedGuide, setSelectedGuide] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [showReviewDetails, setShowReviewDetails] = useState(false);
  const [loading, setLoading] = useState(false);
  const reviewSectionRef = useRef(null);
  const router = useRouter();
const [selectedAudio, setSelectedAudio] = useState(null);
  const { tour, languages } = useVirtualTourStore();
  const availableLanguages = tour?.languages || [];
  const availableGuides = tour?.guides || [];
const [fromOrderScreen, setFromOrderScreen] = useState(false);

  useEffect(() => {
    setShowReviewDetails(false);
  }, [selectedGuide, selectedLanguage]);
useEffect(() => {
  const flag = sessionStorage.getItem("fromOrder") === "true";
  setFromOrderScreen(flag);

  // optional: remove it if you only want it once
  //sessionStorage.removeItem("fromOrder");
}, []);
  const handleStartTour = async () => {
    if (!locations.length) return console.warn("⚠️ No locations available");
    const first = locations[0];
    if (!first?.id) return console.warn("⚠️ No valid location ID");
    try {
      setLoading(true);
      await new Promise((res) => setTimeout(res, 1000));
      router.push(`/location-detail/${id}`);
    } finally {
      setLoading(false);
    }
  };

 const handleReviewTour = () => {
  if (!selectedGuide || !selectedLanguage) return;
  const audio = tour?.product_audios?.find(
    (a) =>
      a.guide_id === Number(selectedGuide) && a.locale === selectedLanguage
  );

  setSelectedAudio(audio || null); 
  setShowReviewDetails(true);       
};


  return (
    <div className="flex-1  py-6 md:py-8 space-y-6">
      {/* Totals Card */}
      <div className="bg-[#CC9A55] rounded-2xl p-4">
        <p className="mb-2 text-[12px] md:text-sm">
          Airport Transfer by our luxury cars
        </p>
        <div className="grid grid-cols-4 divide-x divide-white text-center">
          <div>
            <div className="text-sm md:text-3xl font-bold text-white">
              {totals.stop_time}
            </div>
            <div className="text-[10px] md:text-sm text-amber-100 mt-1">
              Stop Time
            </div>
          </div>
          <div>
            <div className="text-sm md:text-3xl font-bold text-white">
              {totals.travel_time}
            </div>
            <div className="text-[10px] md:text-sm text-amber-100 mt-1">
              Travel Time
            </div>
          </div>
          <div>
            <div className="text-sm md:text-3xl font-bold text-white">
              {totals.distance?.toFixed
                ? totals.distance.toFixed(1)
                : totals.distance}{" "}
              km
            </div>
            <div className="text-[10px] md:text-sm text-amber-100 mt-1">
              Distance
            </div>
          </div>
          <div>
            <div className="text-sm md:text-3xl font-bold text-white">
              {totals.duration}
            </div>
            <div className="text-[10px] md:text-sm text-amber-100 mt-1">
              Total Duration
            </div>
          </div>
        </div>
      </div>

      {/* Locations Section */}
      <div>
        <h3 className="text-md md:text-2xl font-bold text-white mb-4">
          Visited Locations ({locations.length})
        </h3>

        {/* Map */}
        <div className="mb-8 rounded-xl overflow-hidden border border-gray-700">
          <TourMap locations={locations} />
        </div>

        {fromOrderScreen && (
          <div className="mt-8">
            <div className="space-y-0">
              {locations.map((location, idx) => (
                <LocationCard
                  key={location.id}
                  location={location}
                  index={idx}
                  isLast={idx === locations.length - 1}
                  selectedLang={selectedLang}
                />
                
              ))}
            </div>

         
          </div>
        )}


<SelectGroup
  guides={availableGuides} // from your store or API
  languages={availableLanguages}
  selectedGuide={selectedGuide}
  setSelectedGuide={setSelectedGuide}
  selectedLanguage={selectedLanguage}
  setSelectedLanguage={setSelectedLanguage}
  onReview={handleReviewTour}
  reviewDisabled={showReviewDetails}
  colortext={colortext}
  colorheading={colorheading}
/>


        {showReviewDetails && (
          <div  style={{ color: colorheading }} className="mt-6 rounded-2xl p-4 transition-all">
            {/* <h4 className="text-xl font-bold mb-3">Your Tour Review</h4> */}
            <p className="text-sm mb-4">
              You have selected{" "}
              <strong>{availableGuides.find((g) => g.id === Number(selectedGuide))?.name || ""}</strong>{" "}
              in{" "}
              <strong>{availableLanguages.find((l) => l.code === selectedLanguage)?.name || ""}</strong>{" "}
              language.
            </p>

            
            {selectedAudio ? (
              <>
                {/* <p className="text-base mb-4 whitespace-pre-line">{selectedAudio.tts_text}</p> */}
                  <AudioNote audioUrl={selectedAudio.url} autoPlay />
                  
              </>
            ) : (
              <p  style={{ color: colortext }} className="text-sm font font-semibold">No audio found for this guide & language.</p>
            )}
          </div>
        )}
      </div>
       {fromOrderScreen && (  
            <div className="flex justify-end pt-6">
              <button
                onClick={handleStartTour}
                disabled={loading}
                className="px-2 py-3 bg-[#CC9A55] hover:bg-[#e1b97b] text-black font-semibold rounded-lg shadow-md transition-all duration-300 disabled:opacity-50"
              >
                {loading ? "Starting..." : "Start Tour"}
              </button>
            </div>
       )}
    </div>
  );
}