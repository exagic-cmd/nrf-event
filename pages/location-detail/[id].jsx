"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/router";
import { ArrowLeft, ChevronLeft, ChevronRight, Car,Footprints} from "lucide-react";
import { useVirtualTourStore } from "@/store/useVirtualTourStore";
import { useOrderStore } from "@/store/useOrderStore";
import useUserStore from "@/store/useAuthStore";
import AudioNotePlayer from "@/components/AudioNotePlayer";
import TourLocationDetails from "@/components/daytours/tourroute/TourLocationDetails";
import SelectGroup from "@/components/daytours/tourroute/SelectGroup";
import LocationTransition from "@/components/LocationTransition";

export default function TourDetailPage() {
  const router = useRouter();
  const { id } = router.query;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedGuide, setSelectedGuide] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");

  const tabsRef = useRef(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const { locations, fetchVirtualTour, product, tour } = useVirtualTourStore();
  const availableLanguages = tour?.languages || [];
  const availableGuides = tour?.guides || [];

  const selectedOrder = useOrderStore((state) => state.selectedOrder);
  const itinerary = selectedOrder?.itineraries?.[0] || null;
  const itineraryId = itinerary?.id;
  const user = useUserStore((state) => state.user);
  const qrCode = useUserStore((state) => state.qrCode);

  // Fetch tour
  useEffect(() => {
    if (id) fetchVirtualTour(id, "2");
  }, [id]);

  useEffect(() => {
    if (router.query.lang) setSelectedLanguage(router.query.lang);
    if (router.query.guide) setSelectedGuide(router.query.guide);
  }, [router.query]);

  const [journey, setJourney] = useState([]);
  const journeyRefs = useRef([]);

  useEffect(() => {
    if (locations && locations.length > 0) {
      const newJourney = [];
      locations.forEach((location, index) => {
        if (index === 0) {
          const firstLocationTitle =
            location.translations?.[selectedLanguage]?.title ||
            location.translations?.EN?.title ||
            "First Stop";

          newJourney.push({
            type: "start",
            data: location,
            title: firstLocationTitle,
          });
        } else {
          const prevLocation = locations[index - 1];
          const prevLocationTitle =
            prevLocation.translations?.[selectedLanguage]?.title ||
            prevLocation.translations?.EN?.title ||
            `Stop ${index}`;
          const currentLocationTitle =
            location.translations?.[selectedLanguage]?.title ||
            location.translations?.EN?.title ||
            `Stop ${index + 1}`;
          const travelTitle =
            location.translations?.[selectedLanguage]?.travel_title ??
            location.translations?.EN?.travel_title ??
            "";
          newJourney.push({
            type: "travel",
            from: prevLocation,
            to: location,
            title: travelTitle,
          });
          newJourney.push({
            type: "stop",
            data: location,
            title: currentLocationTitle,
          });
        }
      });
      newJourney.push({ type: "review", title: "Review" });
      setJourney(newJourney);
    }
  }, [locations, selectedLanguage]);

  const currentStep = journey[currentIndex];
  const isReviewSlide = currentStep?.type === 'review';

  
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  useEffect(() => {
   
    setCurrentImageIndex(0);
  }, [currentStep?.data?.id]);



  const getAudioForStep = (step) => {
    if (!step || !selectedLanguage) return null;

    let audioData;
    if (step.type === 'travel') {
      audioData = step.to?.travelAudio;
    } else if (step.type === 'start' || step.type === 'stop') {
      audioData = step.data?.audio;
    }

    if (!audioData) return null;

    let languageAudios = audioData[selectedLanguage];
    let isFallback = false;

    if (!languageAudios || languageAudios.length === 0) {
      languageAudios = audioData['EN'];
      isFallback = true;
    }

    if (!languageAudios || languageAudios.length === 0) return null;

    let audio = null;
    let guideFallback = false;
    if (selectedGuide) {
      audio = languageAudios.find(a => a.guide_id == selectedGuide);
      if (!audio && languageAudios.length > 0) {
        guideFallback = true;
      }
    }

    if (!audio) {
      audio = languageAudios.find(a => a.guide_id === null);
    }
    
    if (!audio) {
      audio = languageAudios[0];
    }

    return audio ? { url: audio.url, isFallback, guideFallback } : null;
  };

  const selectedAudio = getAudioForStep(currentStep);

  // Tabs scroll helpers
  useEffect(() => {
    const updateScrollButtons = () => {
      const el = tabsRef.current;
      if (!el) return;
      setCanScrollLeft(el.scrollLeft > 0);
      setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1); // small tolerance
    };

    updateScrollButtons();
    const el = tabsRef.current;
    if (!el) return;

    el.addEventListener("scroll", updateScrollButtons);
    window.addEventListener("resize", updateScrollButtons);
    return () => {
      el.removeEventListener("scroll", updateScrollButtons);
      window.removeEventListener("resize", updateScrollButtons);
    };
  }, [journey.length]);

  const handleGoToReviewRoute = () => {
    if (!qrCode || !itineraryId) {
      router.push("/review");
      return;
    }
    router.push(`/review/${qrCode}/${itineraryId}`);
  };

  const scrollTabsBy = (amount) => {
    if (!tabsRef.current) return;
    tabsRef.current.scrollBy({ left: amount, behavior: "smooth" });
  };

  useEffect(() => {
    if (journeyRefs.current[currentIndex]) {
      journeyRefs.current[currentIndex].scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [currentIndex]);
  if (!locations) {
    return (
      <div className="text-center text-white min-h-screen flex items-center justify-center">
        Loading tour...
      </div>
    );
  }

  if (!locations.length) {
    return (
      <div className="text-center text-white min-h-screen flex items-center justify-center">
        No locations found.
      </div>
    );
  }

  const RenderContent = ({ step }) => {
    if (!step) return null;
  
      switch (step.type) {
        case 'start':
        case 'stop':
          const location = step.data;
          const translation = location?.translations?.[selectedLanguage] || location?.translations?.EN || {};
          const images = location?.images || [];
          const displayImage = images.length > 0
              ? images[currentImageIndex].startsWith("http")
                ? images[currentImageIndex]
                :`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${images[currentImageIndex]}` : "/placeholder.svg";
  
          const details = Object.fromEntries(
            Object.entries(location?.details || {}).filter(
              ([key, value]) =>
                !["lat", "lng", "travel_mode"].includes(key) && String(value).trim() !== ""
            )
          );
  
          return (
            <div className="flex flex-col gap-3 lg:gap-6 ">
              <h2 className="text-lg md:text-2xl font-bold text-black">{step.title}</h2>
              <div className="relative w-full h-44 lg:h-96 bg-gray-800 rounded-xl overflow-hidden">
                <img src={displayImage} alt={translation.title || "Location"} className="w-full h-full object-cover" />
                {images.length > 1 && (
                  <>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length)}
                      className="absolute left-2 top-1/2 -translate-y-1/2 bg-[#f4f4f4]/50 hover:bg-[#f4f4f4]/70 text-white p-2 rounded-full z-10"
                      aria-label="Previous image"
                    >
                      <ChevronLeft size={20} />
                    </button>
                    <button
                      onClick={() => setCurrentImageIndex((prev) => (prev + 1) % images.length)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 bg-[#f4f4f4]/50 hover:bg-[#f4f4f4]/70 text-white p-2 rounded-full z-10"
                      aria-label="Next image"
                    >
                      <ChevronRight size={20} />
                    </button>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2 z-10">
                      {images.map((_, idx) => (
                        <button
                          key={idx}
                          className={`w-2 h-2 rounded-full ${idx === currentImageIndex ? 'bg-white' : 'bg-gray-400'}`}
                          onClick={() => setCurrentImageIndex(idx)}
                          aria-label={`View image ${idx + 1}`}
                        />
                      ))}
                    </div>
                  </>
                )}
              </div>
              {selectedAudio && (
                <div className=" px-2 rounded-xl py-4">
                  {selectedAudio.isFallback && (
                  <p className="text-sm text-gray-900 mb-2">Audio not available in the selected language. Playing in English.</p>
                  )}
                  {selectedAudio.guideFallback && (
                    <p className="text-sm text-gray-800 mb-2">
                      Audio for the selected guide is not available. Playing another guide.
                    </p>
                  )}
                  <AudioNotePlayer audioUrl={selectedAudio.url} />
                </div>
              )}
              <TourLocationDetails translation={translation} details={details} />
            </div>
          );
        case 'travel':
          const location2 = step.to;
          const translation2 = location2?.translations?.[selectedLanguage] || location2?.translations?.EN || {};
          const details2 = Object.fromEntries(
            Object.entries(location2?.details || {}).filter(
              ([key, value]) =>
                !["lat", "lng", "travel_mode"].includes(key) && String(value).trim() !== ""
            )
          ); 
          const fromLocation = step.from?.translations?.[selectedLanguage]?.title || step.from?.translations?.EN?.travel_title || '';
          const toLocation = step.to ? (step.to.translations?.[selectedLanguage]?.title || step.to.translations?.EN?.title || '') : 'your hotel';
          return (
              <LocationTransition
                  prevLocation={fromLocation}
                  nextLocation={toLocation}
                  travelInfo={selectedAudio ? [selectedAudio] : []}
                  onNext={() => setCurrentIndex(i => i + 1)}
                  title={step.title}
                  translation={translation2}
                  details={details2}
              />
          );
        case 'review':
          return (
            <div className="flex flex-col items-center justify-center h-full px-6 py-12 rounded-2xl bg-white border border-gray-800 text-white">
              <h2 className="text-lg lg:text-3xl font-bold text-[#D3202D] mb-4"> Heading back to your hotel </h2>
               <h2 className="text-xl font-bold text-[#D3202D] mb-4"> We would love your feedback. </h2>
              <p className="text-gray-800 max-w-xl text-center mb-6">
                Please share your feedback. It helps us improve and guide future travelers.
              </p>
              <div className="flex gap-3">
                <button
                  onClick={handleGoToReviewRoute}
                  className="px-6 py-3 rounded-xl bg-[#D3202D] font-semibold text-white "
                >
                  Submit Review
                </button>
              </div>
            </div>
          );
        default:
          return null;
      }
    };

  return (
    <main className="flex-1 w-full pb-10 md:pb-16 bg-[#f4f4f4] min-h-screen pt-2 mt-12 md:mt-16">
      <div className="flex items-start justify-between md:items-center px-4 md:px-12 pt-4 pb-2">
        <div className="flex items-center gap-3 mb-1 mt-1 lg:mb-4">
          <button
            onClick={router.back}
            className="flex items-center gap-2 text-gray-800 hover:text-[#D3202D]"
            aria-label="Go back"
          >
            <ArrowLeft size={20} /> Go Back
          </button>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-12 bg-[#f4f4f4] ">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-[#D3202D] md:text-2xl text-xl font-semibold">
              {product?.translations?.[selectedLanguage]?.title || product?.translations?.EN?.title}
            </h1>
            <p className="text-black py-2 md:py-3 text-sm md:text-base max-w-3xl">
                Explore each stop of your journey in detail.
            </p>
          </div>
        </div>
        {!isReviewSlide && ( 
          <div className="my-0">
            <SelectGroup
              guides={availableGuides}
              languages={availableLanguages}
              locations={locations}
              selectedGuide={selectedGuide}
              setSelectedGuide={setSelectedGuide}
              selectedLanguage={selectedLanguage}
              setSelectedLanguage={setSelectedLanguage}
              product={product}
              noButton
              noTour
            />
          </div> 
        )}
        
        <div>
<div className="mt-0 relative">
    {canScrollLeft && (
        <div className="absolute left-0 top-0 bottom-0 w-16  z-10 pointer-events-none" />
    )}
    {canScrollLeft && (
        <button
        onClick={() => {
            scrollTabsBy(-240);
            setCurrentIndex(prev => Math.max(0, prev - 1));
        }}
        className="absolute left-0 bottom-16 -translate-y-1/2 z-20 bg-[#D3202D] text-white rounded-full p-2 shadow-lg transition-all"
        >
        <ChevronLeft className="w-5 h-5" />
        </button>
    )}

    <div 
        ref={tabsRef}
        className="flex gap-4 overflow-x-auto py-4 px-2 scroll-smooth no-scrollbar"
    >
        {journey.map((step, index) => { 
            const journeyIndex = index; 
            const isActive = journeyIndex === currentIndex;
            
            let stopCounter = 0;
            for(let i = 0; i <= journeyIndex; i++) {
                if(journey[i].type !== 'travel' && journey[i].type !== 'review') {
                    stopCounter++;
                }
            }

            return (
                <div
                    key={index}
                    ref={(el) => (journeyRefs.current[journeyIndex] = el)}
                    onClick={() => {
                       
                        if (isActive && journeyIndex < journey.length - 1) {
                            setCurrentIndex(journeyIndex + 1);
                        } else setCurrentIndex(journeyIndex)
                    }}
                    className={`flex-shrink-0 cursor-pointer transition-all duration-300 ${
                        isActive ? 'scale-100' : 'scale-90 opacity-50'
                    }`}
                    style={{ width: '180px' }}
                >
                    <div className={`relative rounded-xl overflow-hidden ${
                        step.type === 'travel'
                            ? 'bg-[#ffffff] border text-black border-[#D3202D]'
                            : isActive
                            ? 'bg-gradient-to-br from-[#D3202D] via-[#e05b5b] to-[#ff105c] shadow-lg shadow-[#D3202D]/50'
                            : 'bg-gray-200 border text-black border-gray-700'
                    } transition-all duration-300`}>
                        
                        {step.type !== 'travel' && ( 
                            <div className={`absolute top-2 left-2 w-8 h-8 rounded-full flex items-center justify-center text-base font-bold shadow-lg ${
                            isActive 
                                ? 'bg-white text-[#D3202D] border-2 border-[#D3202D]' 
                                : 'bg-gray-200 text-black border border-gray-700'
                            }`}>
                                {step.type === 'review' ? 'R' : stopCounter}
                            </div>
                        )}
                        
                        {isActive && (
                        <div className="absolute top-3 right-3">
                            <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                        </div>
                        )}

                        {step.type === 'travel' && (
                          <div className="absolute top-3 left-3 text-[#D3202D]">
                            {step.to.details.travel_mode?.toLowerCase().includes('driv') ? (
                              <Car size={18} />
                            ) : step.to.details.travel_mode?.toLowerCase().includes('walk') ? (
                              <Footprints size={18} />
                            ) : (
                              <Car size={18} />
                            )}
                          </div>
                        )}
                        
                        <div className="p-3 pt-12">
                            <p className={`text-[10px] uppercase tracking-wide mb-1 ${
                                isActive && step.type !== 'travel' ? 'text-black/70' : 'text-gray-800'
                            } min-h-[16px]`}>
                                {step.type === 'travel' ? 'Travel' : (step.type === 'review' ? 'Final Step' : `Stop ${stopCounter}`)}
                            </p>
                            <p className={`text-xs font-bold leading-tight truncate ${
                                isActive && step.type !== 'travel' ? 'text-black' : 'text-black'
                            }`}>
                                {step.title}
                            </p>
                            {step.type === 'travel' && (
                                <p className={`text-[11px] mt-1 ${isActive && step.type !== 'travel' ? 'text-black/70' : 'text-gray-800'}`}>
                                    {step.to.details.travel_time && (
                                        <span>{step.to.details.travel_time}</span>
                                    )}
                                    {step.to.details.travel_mode && (
                                        <span> ({step.to.details.travel_mode})</span>
                                    )}
                                </p>
                            )}
                        </div>
                    </div>
                </div>
            )
        })}
    </div>

    {canScrollRight && (
        <div className="absolute right-0 top-0 bottom-0 w-16 to-transparent z-10 pointer-events-none" />
    )}
    {canScrollRight && (
        <button
        onClick={() => {
            scrollTabsBy(240);
            setCurrentIndex(prev => Math.min(journey.length - 1, prev + 1));
        }}
        className="absolute right-0  bottom-16 -translate-y-1/2 z-20 bg-[#D3202D]  text-black rounded-full p-2 shadow-lg transition-all"
        >
        <ChevronRight className="w-5 h-5" />
        </button>
    )}

    {/* <div className="flex justify-center gap-2 mt-4">
        {(journey.filter(step => step.type !== 'travel')).map((step, index) => {
            const journeyIndex = journey.findIndex(j => j === step);
            const isActive = journeyIndex === currentIndex;
            return (
                <button
                    key={index}
                    onClick={() => setCurrentIndex(journeyIndex)}
                    className={`transition-all duration-300 rounded-full ${
                        isActive
                        ? 'bg-[#D3202D] w-8 h-2' 
                        : 'bg-gray-700 w-2 h-2 hover:bg-gray-600'
                    }`}
                    aria-label={`Go to stop ${step.title}`}
                />
            )
        })}
    </div> */}
</div>

          </div>
        <div className="mt-2"><RenderContent step={currentStep} /></div>
        
       
      </div>

      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </main>
  );
}