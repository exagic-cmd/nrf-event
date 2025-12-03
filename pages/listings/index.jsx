"use client";

import { useState, useEffect, useCallback } from "react";
import "@/styles/globals.css";
import Layout from "@/components/layout/Layout";
import TransfersList from "@/components/transfers/TransfersList";
import DaytoursList from "@/components/daytours/DaytoursList";
import AccommodationList from "@/components/accommodations/AccommodationList";
import Faqs from "@/components/transfers/Faqs";
import TransferSearchFilter from "@/components/transfers/FilterBar";
import FilterSidebar from "@/components/daytours/FilterSidebar";
import TransferBookingPlaceholder from "@/components/transfers/TransferBookingPlaceholder";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useSearchParams } from "next/navigation";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import AccommodationFilterSidebar from "@/components/accommodations/AccommodationFilterSidebar";
import { Filter, X } from "lucide-react";
import GoogleMap from "@/components/daytours/GoogleMap";

function ListingsPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [searchCategory, setSearchCategory] = useState("transfer");
  const [searchParams, setSearchParams] = useState({});
  const { t } = useTranslation("common", "transfer");
  const urlSearchParams = useSearchParams();

  // Zustand stores
  const {
    searchResults,
    isLoading,
  } = useDaytoursStore();

  const {
    searchParams: accommodationPayload,
    accommodations,
    filteredResults,
    isLoading: accommodationLoading,
    accommodationFilters,
    fetchAccommodations,
    applyAccommodationFilter,
  } = useAccommodationsStore();


  const handleFilterChange = useCallback((activeFilters) => {
    applyAccommodationFilter((accommodation) => {
      const hasSelectedAmenities = activeFilters.amenities && activeFilters.amenities.length > 0;
      const amenityMatch = !hasSelectedAmenities || activeFilters.amenities.every(
        (selectedAmenity) => accommodation.amenities?.includes(selectedAmenity)
      );


      return amenityMatch;
    });
  }, [applyAccommodationFilter]); 
  useEffect(() => {
    const searched = urlSearchParams.get("searched");
    const type = urlSearchParams.get("type");
    const category = urlSearchParams.get("category");

    if (searched) {
      setHasSearched(true);
      setIsInitialSearch(false);
      if (category) {
        setSearchCategory(category.toLowerCase());
      } else if (type) {
        setSearchCategory(type.toLowerCase());
      }
      const params = {};
      for (const [key, value] of urlSearchParams.entries()) {
        params[key] = value;
      }
      setSearchParams(params);
    } else {
      setShowSearchModal(true);
    }
  }, [urlSearchParams]);

  // Fetch accommodations when payload is available
  useEffect(() => {
    if (
      (searchCategory === "accommodation" || searchCategory === "hotels") &&
      accommodationPayload
    ) {
      fetchAccommodations(accommodationPayload);
      applyAccommodationFilter(() => true); // Reset filters to show all results initially

      // Apply filter based on the payload if a specific hotel was searched
      if (accommodationPayload.ids && accommodationPayload.ids.length > 0) {
        const targetHotelId = accommodationPayload.ids[0]; // Assuming only one hotel ID is passed for specific search
        applyAccommodationFilter((accommodation) => {
          return accommodation.id === targetHotelId;
        });
      } else {
        applyAccommodationFilter(() => true); // If no specific hotel ID in payload, reset to show all fetched results
      }
    }
  }, [searchCategory, accommodationPayload, fetchAccommodations]);

  // Render the correct list
  const renderListComponent = () => {
    switch (searchCategory) {
      case "transfer":
        return <TransfersList searchParams={searchParams} />;
      case "daytour":
      case "day-tours":
        return <DaytoursList searchParams={searchParams} />;
      case "accommodation":
      case "hotels":
        return (
          <AccommodationList
            accommodations={filteredResults} // Use filteredResults here
            isLoading={accommodationLoading}
          />
        );
      default:
        return <TransfersList searchParams={searchParams} />;
    }
  };

  // Placeholders
  const renderPlaceholder = () => {
    switch (searchCategory) {
      case "daytour":
      case "day-tours":
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Search for Day Tours</h2>
            <p className="text-gray-400">Enter your destination to find amazing day tours</p>
          </div>
        );
      case "accommodation":
      case "hotels":
        return (
          <div className="text-white text-center py-12">
            <h2 className="text-2xl font-bold mb-4">Search for Accommodations</h2>
            <p className="text-gray-400">Enter your destination to find the perfect stay</p>
          </div>
        );
      default:
        return <TransferBookingPlaceholder />;
    }
  };

  const showFaqs = hasSearched && searchCategory === "transfer";
  const isAccommodationCategory = searchCategory === "accommodation" || searchCategory === "hotels";

  return (
    <Layout>
      <div className="relative mt-12 md:mt-20 pt-6 pb-44 bg-[#f4f4f4]">
        <div className="flex flex-col lg:flex-row gap-3 px-6">
          {searchCategory === "transfer" && (
            <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-56">
              <TransferSearchFilter
                onSearch={() => {}}
                showModal={showSearchModal}
                setShowModal={setShowSearchModal}
                forceSearch={isInitialSearch}
                initialCategory={searchCategory}
              />
            </div>
          )}
			 {/* Day Tours: Filter Sidebar + List */}
          {(searchCategory === "daytour" || searchCategory === "day-tours") && (
            <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-56">
              {!isLoading && searchResults.length > 0 && (
                <FilterSidebar />
              )}
            </div>
          )}

          {/* Accommodation: Filter Sidebar (Large Screens) */}
          {isAccommodationCategory && (
            <div className="hidden lg:block max-h-[calc(100vh-7rem)] overflow-y-auto md:sticky top-24 self-start z-20 w-full lg:w-56">
              {!accommodationLoading && accommodations && accommodations.length > 0 && (
                <AccommodationFilterSidebar
                  filters={accommodationFilters}
                  onFilterChange={handleFilterChange}
                />
              )}
            </div>
          )}

        
          {isAccommodationCategory && (
            <div className="lg:hidden w-full mb-2 mt-4">
              <button
                onClick={() => setShowFilterModal(true)}
                className="w-full border text-[#D3202D] bg-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:bg-[#b71c1c] active:bg-[#a31919] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Filter size={20} />
                Filter
              </button>
            </div>
          )}

          {/* Center: List Content */}
          <div className="flex-1">
            {hasSearched ? renderListComponent() : renderPlaceholder()}
          </div>

          {/* Right: Map or FAQs */}
          <div className="lg:w-1/4 h-fit sticky top-24 self-start z-10">
            {(searchCategory === "daytour" || searchCategory === "day-tours" || searchCategory === "accommodation" || searchCategory === "hotels") && (
              <GoogleMap
                center={{ lat: 1.3521, lng: 103.8198 }}
                zoom={12}
                width="100%"
                height="550px"
                className="rounded-lg shadow-lg"
                markers={
                  (searchCategory === "daytour" || searchCategory === "day-tours")
                    ? (searchResults || []).map((r) => ({
                        lat: r.latitude || r.lat || r?.location?.lat,
                        lng: r.longitude || r.lng || r?.location?.lng,
                        title: r.title || r.name || r.location_name || r.hotel_name || "",
                      }))
                    : (filteredResults || []).map((a) => ({
                        lat: a?.Hotel_Data?.latitude || a?.latitude || a?.normalizedHotelData?.latitude,
                        lng: a?.Hotel_Data?.longitude || a?.longitude || a?.normalizedHotelData?.longitude,
                        title: a?.Hotel_Data?.title || a?.name || a?.title || a?.hotel_name || "",
                      }))
                }
              />
            )}
            {searchCategory === "transfer" && showFaqs && <Faqs />}
          </div>
        </div>

        {/* Filter Modal for Small Screens */}
        {showFilterModal && isAccommodationCategory && (
          <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              <AccommodationFilterSidebar
                filters={accommodationFilters}
                onFilterChange={handleFilterChange}
              />
            </div>
            <div className="sticky bottom-0 bg-white p-4 border-t shadow-lg">
              <button
                onClick={() => setShowFilterModal(false)} 
                className="w-full bg-[#D3202D] text-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:bg-[#b71c1c] active:bg-[#a31919] transition-colors duration-300"
              >
                Show Results
              </button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "transfer"])),
    },
  };
}

export default ListingsPage;
