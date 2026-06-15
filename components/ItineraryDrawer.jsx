import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  MapPin,
  Clock,
  ChevronRight,
  X,
  Bed,
  Bus,
  Utensils,
  Calendar,
  Image as ImageIcon,
  ChevronLeft,
  Play,
} from "lucide-react";
import { cn } from "@/lib/utils";
import DownloadItineraryButton from "./DownloadItineraryButton";

const ItineraryDrawer = ({
  isOpen,
  onClose,
  onOpen,
  isDesktop,
  selectedServices,
  itinerary, // API response grouped by version
}) => {
  // Extract service data
  const accommodations = selectedServices.accommodation || [];
  const transfers = selectedServices.transfers || [];
  const meals = selectedServices.meals || [];
  const activities = selectedServices.activities || [];
  const [selectedVersion, setSelectedVersion] = useState(null);
  const [lastItineraryData, setLastItineraryData] = useState(null);

  // Ensure itinerary is an object (grouped by version_no)
  const safeItinerary = itinerary && typeof itinerary === "object" ? itinerary : {};

  console.log("API response (itinerary):", itinerary);
  console.log("Safe itinerary object:", safeItinerary);

  // Get version numbers sorted DESC so latest version comes first
  const versionNumbers = Object.keys(safeItinerary)
    .map(Number)
    .sort((a, b) => b - a);

  console.log("Version numbers:", versionNumbers);

  // Auto-update to latest version when itinerary data changes
  useEffect(() => {
    const currentItineraryString = JSON.stringify(itinerary);
    const hasItineraryChanged = currentItineraryString !== lastItineraryData;
    
    if (versionNumbers.length > 0) {
      const latestVersion = versionNumbers[0];
      
      // Set to latest version if:
      // 1. No version is selected yet, OR
      // 2. Itinerary data has changed (new API call)
      if (!selectedVersion || hasItineraryChanged) {
        setSelectedVersion(latestVersion);
      }
    }
    
    // Update our tracking of itinerary data
    setLastItineraryData(currentItineraryString);
  }, [versionNumbers, selectedVersion, itinerary, lastItineraryData]);

  // Get itinerary for currently selected version
  const versionItinerary = selectedVersion ? safeItinerary[selectedVersion] || [] : [];

  // Group itinerary by day
  const itineraryByDay = versionItinerary.reduce((acc, item) => {
    const day = item.day || 1;
    if (!acc[day]) acc[day] = [];
    acc[day].push(item);
    return acc;
  }, {});

  // Sort days ascending
  const sortedItineraryDays = Object.keys(itineraryByDay)
    .map(Number)
    .sort((a, b) => a - b);

  // Function to handle image loading errors
  const handleImageError = (e) => {
    e.target.onerror = null; 
    e.target.src = "/placeholder.svg?height=40&width=40"; 
    e.target.classList.add("placeholder-img");
  };

  // Service type icons mapping
  const serviceIcons = {
    accommodation: <Bed className="h-4 w-4 text-[#cc9a55]" />,
    transfers: <Bus className="h-4 w-4 text-[#cc9a55]" />,
    meals: <Utensils className="h-4 w-4 text-[#cc9a55]" />,
    activities: <ImageIcon className="h-4 w-4 text-[#cc9a55]" />,
  };

  // Group services by day
  const servicesByDay = Object.keys(selectedServices).reduce((acc, serviceType) => {
    const services = selectedServices[serviceType] || [];
    services.forEach((service) => {
      const day = service.day || 1;
      if (!acc[day]) acc[day] = {};
      if (!acc[day][serviceType]) acc[day][serviceType] = [];
      acc[day][serviceType].push(service);
    });
    return acc;
  }, {});

  return (
    <div
      className={cn(
        "bg-black transition-all duration-300 overflow-hidden",
        isOpen
          ? isDesktop
            ? "w-96 border-l border-[#cc9a55] fixed right-0 top-0 h-full z-30 shadow-lg"
            : "fixed inset-0 z-[100] w-full h-screen shadow-xl"
          : "w-0",
        !isDesktop && "shadow-2xl"
      )}
    >
      {isOpen && (
        <div className="h-full flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-[#cc9a55] flex justify-between items-center bg-black">
            <h2 className="text-xl font-bold text-white">Selected Services</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 w-8 p-0 text-gray-400 hover:text-[#cc9a55]"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Services Summary */}
          <div className="p-4 bg-zinc-900 border-b border-[#cc9a55]">
            <div className="flex justify-between items-center mb-3">
              
              {activities.length > 0 && (
                <a
                  href="https://app.toureast.net/admin/3d_map_play.php?serial=userId"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group relative overflow-hidden px-3 py-1 text-sm font-medium text-black rounded-md flex items-center shadow-md hover:shadow-lg"
                  style={{
                    background:
                      "linear-gradient(90deg, #cc9a55, #d4a565, #cc9a55, #d4a565, #cc9a55)",
                    backgroundSize: "200% 100%",
                  }}
                >
                  <style jsx>{`
                    @keyframes gradientFlow {
                      0% { background-position: 100% 50%; }
                      100% { background-position: -100% 50%; }
                    }
                  `}</style>
                  <Play className="h-3 w-3 mr-1 group-hover:scale-110 transition-transform duration-300" />
                  Play Itinerary
                </a>
              )}

              {/* Version Dropdown - Made Prominent */}
              {versionNumbers.length > 1 && (
                <div className="bg-zinc-800 border border-[#cc9a55] rounded-md shadow-sm hover:shadow-md transition-shadow duration-200 w-36">
                  <select
                    value={selectedVersion}
                    onChange={(e) => setSelectedVersion(Number(e.target.value))}
                    className="w-full px-2 py-1 bg-transparent text-sm font-semibold text-[#cc9a55] focus:outline-none cursor-pointer appearance-none"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%23cc9a55' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                      backgroundPosition: 'right 8px center',
                      backgroundRepeat: 'no-repeat',
                      backgroundSize: '12px'
                    }}
                  >
                    {versionNumbers.map((v) => (
                      <option key={v} value={v} className="text-white bg-zinc-800">
                        Version {v}
                      </option>
                    ))}
                  </select>
                </div>
              )}

            </div>

            <div className="mt-3 grid grid-cols-2 gap-3">
              <div className="flex items-center text-xs bg-zinc-800 p-2 rounded-lg shadow-sm border border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mr-2">
                  <ImageIcon className="h-4 w-4 text-[#cc9a55]" />
                </div>
                <div>
                  <span className="block font-medium text-white">Activities</span>
                  <span className="text-gray-400">{activities.length} items</span>
                </div>
              </div>

              <div className="flex items-center text-xs bg-zinc-800 p-2 rounded-lg shadow-sm border border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mr-2">
                  <Bus className="h-4 w-4 text-[#cc9a55]" />
                </div>
                <div>
                  <span className="block font-medium text-white">Transfers</span>
                  <span className="text-gray-400">{transfers.length} items</span>
                </div>
              </div>

              <div className="flex items-center text-xs bg-zinc-800 p-2 rounded-lg shadow-sm border border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mr-2">
                  <Bed className="h-4 w-4 text-[#cc9a55]" />
                </div>
                <div>
                  <span className="block font-medium text-white">Accommodation</span>
                  <span className="text-gray-400">{accommodations.length > 0 ? "1" : "0"} items</span>
                </div>
              </div>

              <div className="flex items-center text-xs bg-zinc-800 p-2 rounded-lg shadow-sm border border-zinc-700">
                <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center mr-2">
                  <Utensils className="h-4 w-4 text-[#cc9a55]" />
                </div>
                <div>
                  <span className="block font-medium text-white">Meals</span>
                  <span className="text-gray-400">{meals.length} items</span>
                </div>
              </div>
            </div>
          </div>

          {/* Itinerary Scroll */}
          <ScrollArea className="flex-1 p-4 bg-black">
            <div className="space-y-6 pb-4">
              {sortedItineraryDays.length === 0 ? (
                <p className="text-gray-500">No itinerary available</p>
              ) : (
                sortedItineraryDays.map((day) => (
                  <div key={day} className="mb-6">
                    <h3 className="text-lg font-semibold mb-3 pb-2 border-b border-[#cc9a55] text-white">
                      Day {day}
                    </h3>
                    <div className="space-y-3">
                      {itineraryByDay[day].map((item, index) => (
                        <Card
                          key={index}
                          className="overflow-hidden hover:shadow-md transition-shadow duration-300 bg-zinc-900 border-zinc-800"
                        >
                          <div className="flex h-20">
                            {/* Image */}
                            <div className="relative w-24 h-full overflow-hidden flex-shrink-0">
                              <div className="w-full h-full bg-zinc-800 flex items-center justify-center">
                                <img
                                  src={
                                    item.image
                                      ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${item.image}`
                                      : "/placeholder.svg?height=40&width=40"
                                  }
                                  alt={item.title}
                                  onError={handleImageError}
                                  className="w-full h-full object-cover"
                                />
                              </div>
                            </div>

                            {/* Content */}
                            <div className="p-2 flex-1 flex flex-col justify-between min-w-0">
                              <div>
                                <h4 className="font-medium text-sm truncate text-white">{item.title}</h4>
                                {item.tag && (
                                  <p className="text-sm text-[#cc9a55]">{item.tag}</p>
                                )}
                                <p className="text-sm text-gray-400">
                                  {item.remarks
                                    ? item.remarks.length > 50
                                      ? item.remarks.substring(0, 50) + "..."
                                      : item.remarks
                                    : "No remarks available"}
                                </p>
                              </div>
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </ScrollArea>
        </div>
      )}
    </div>
  );
};

export default ItineraryDrawer;