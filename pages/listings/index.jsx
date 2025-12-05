"use client";

import { useState, useEffect, useCallback, useRef } from "react";
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
import { useTransferStore } from "@/store/useTransferStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useSearchValuesStore } from "@/store/searchValues.store.js";
import { useRouter } from "next/navigation";
import SearchFilterCard from "@/components/hotels/SearchFilterCard";
import AccommodationFilterSidebar from "@/components/accommodations/AccommodationFilterSidebar";
import { Filter, X, ChevronDown } from "lucide-react";
import GoogleMap from "@/components/daytours/GoogleMap";

function ListingsPage() {
  const [hasSearched, setHasSearched] = useState(false);
  const [showFilterModal, setShowFilterModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [isInitialSearch, setIsInitialSearch] = useState(true);
  const [isSearchFilterVisible, setIsSearchFilterVisible] = useState(false);
  const [searchCategory, setSearchCategory] = useState("transfer");
  const [searchParams, setSearchParams] = useState({});
  const { t } = useTranslation("common", "transfer");
  const urlSearchParams = useSearchParams();
  const resultsRef = useRef(null);
  const router = useRouter();

  const [cardRooms, setCardRooms] = useState([{ adult: 2, children: [] }]);
  const [cardStars, setCardStars] = useState("0");
  const [cardCheckin, setCardCheckin] = useState(null);
  const [cardCheckout, setCardCheckout] = useState(null);
  const [cardSearchQuery, setCardSearchQuery] = useState(""); // For daytours
  const [cardAccommodationText, setCardAccommodationText] = useState(""); // For accommodations
  const [filterActiveTab, setFilterActiveTab] = useState(() => {
    const t = urlSearchParams.get("type");
    if (t === "accommodation" || t === "hotels") return 4;
    if (t === "daytour" || t === "day-tours") return 3;
    if (t === "transfer") return 2;
    return 4;
  });

  const filterTabs = [
    { id: 4, label: "hotels", name: "Accommodations" },
    { id: 3, label: "day-tours", name: "DayTours" },
    { id: 2, label: "transfer", name: "Transfers" },
    { id: 1, label: "coming-soon", name: "Coming Soon" },
    { id: 5, label: "search", name: "Search Text" },
    { id: 8, label: "packages", name: "Package Tours" },
  ];

  const handleFilterFromCard = (payload) => {
    if (filterActiveTab === 2) {
      setTransferSearchParams({
        pickup: payload.pickup,
        dropoff: payload.dropoff,
        tripType: payload.isTwoWay ? "round-trip" : "one-way",
        returnDate: payload.returnDate || null,
      });
      router.push(`/listings?searched=true&type=transfer`);
      setHasSearched(true);
      setSearchCategory("transfer");
      return;
    }

    if (filterActiveTab === 3) {
      setSelectedCountry(payload.country);
      setSelectedCity(payload.city);
      setDaytourSearchQuery(payload.search);
      router.push(`/listings?searched=true&type=daytour`);
      setHasSearched(true);
      setSearchCategory("daytour");
      return;
    }

    if (filterActiveTab === 4) {
      setAccommodationSearchParams(payload); // This will also trigger fetchAccommodations
      router.push(`/listings?searched=true&type=accommodation`);
      setHasSearched(true);
      setSearchCategory("accommodation");
      return;
    }
  };

  // Zustand stores
  const {
    transferParams: searchTransferParams,
    daytourParams: searchDaytourParams,
    accommodationParams: searchAccommodationParams,
    setTransferParams: setSearchTransferParams,
    setDaytourParams: setSearchDaytourParams,
    setAccommodationParams: setSearchAccommodationParams,
  } = useSearchValuesStore();

  const {
    setSelectedCountry: setDaytourSelectedCountry,
    setSelectedCity: setDaytourSelectedCity,
    searchQuery: daytourSearchQuery,
    setSearchQuery: setDaytourSearchQuery,
    selectedCountry: daytourSelectedCountry,
    selectedCity: daytourSelectedCity,
  } = useDaytoursStore();

  const {
    searchResults,
    isLoading,
  } = useDaytoursStore();

  const { setSelectedCountry, setSelectedCity } = useDaytoursStore();

  const {
    searchParams: accommodationPayload,
    accommodations,
    filteredResults,
    isLoading: accommodationLoading,
    accommodationFilters,
    fetchAccommodations,
    applyAccommodationFilter,
    setSearchParams: setAccommodationSearchParams,
  } = useAccommodationsStore();
  
  const {
    setSelectedPickup, setSelectedDropoff, setTripType,
    searchParams: transferSearchParams, setSearchParams: setTransferSearchParams
  } = useTransferStore();


  const handleFilterChange = useCallback((activeFilters) => {
    applyAccommodationFilter((accommodation) => {
      const hasSelectedAmenities = activeFilters.amenities && activeFilters.amenities.length > 0;
      const hasSelectedRatings = activeFilters.ratings && activeFilters.ratings.length > 0;
      const hasSelectedMealPlans = activeFilters.meal_plans && activeFilters.meal_plans.length > 0;

      const hotelData = accommodation.Hotel_Data || accommodation.normalizedHotelData || accommodation;

      const amenityMatch = !hasSelectedAmenities || activeFilters.amenities.every((selectedAmenity) =>
        hotelData.amenities?.includes(selectedAmenity)
      );
const ratingMatch = !hasSelectedRatings || activeFilters.ratings.includes(
        Math.floor(parseFloat(hotelData.star_rating))
      );

      const mealPlanMatch = !hasSelectedMealPlans || activeFilters.meal_plans.includes(
        accommodation.room?.rate_plan?.meal?.title
      );

      return amenityMatch && ratingMatch && mealPlanMatch;
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

  useEffect(() => {
    const type = urlSearchParams.get("type");
    if (!type) return;

    if (type === "transfer") {
      setSelectedPickup(searchTransferParams.pickup);
      setSelectedDropoff(searchTransferParams.dropoff);
      setTripType(searchTransferParams.tripType);
    }

    if (type === "daytour") {
      setDaytourSelectedCountry(searchDaytourParams.country);
      setDaytourSelectedCity(searchDaytourParams.city);
      setCardSearchQuery(searchDaytourParams.searchQuery);
    }

    if (type === "accommodation") {
      if (searchAccommodationParams.checkin) setCardCheckin(searchAccommodationParams.checkin);
      else setCardCheckin(null);

      if (searchAccommodationParams.checkout) setCardCheckout(searchAccommodationParams.checkout);
      else setCardCheckout(null);

      if (searchAccommodationParams.text) setCardAccommodationText(searchAccommodationParams.text);
      else setCardAccommodationText("");

      if (searchAccommodationParams.stars) setCardStars(searchAccommodationParams.stars);
      else setCardStars("0");

      if (searchAccommodationParams.rooms) {
        try {
         setCardRooms(searchAccommodationParams.rooms);
        } catch (e) {
          console.error("Error setting rooms from store:", e);
          setCardRooms([{ adult: 2, children: [] }]); 
        }
      } else {
        setCardRooms([{ adult: 2, children: [] }]); 
      }
    }
  }, [
    urlSearchParams,
    setSelectedPickup, setSelectedDropoff, setTripType,
    setDaytourSelectedCountry, setDaytourSelectedCity,
    searchTransferParams, searchDaytourParams, searchAccommodationParams,
  ]);

  useEffect(() => {
    if (
      (searchCategory === "accommodation" || searchCategory === "hotels") &&
      accommodationPayload
    ) {
      fetchAccommodations(accommodationPayload);
      applyAccommodationFilter(() => true); 

     
      if (accommodationPayload.ids && accommodationPayload.ids.length > 0) {
        const targetHotelId = accommodationPayload.ids[0]; 
        applyAccommodationFilter((accommodation) => {
          return accommodation.id === targetHotelId;
        });
      } else {
        applyAccommodationFilter(() => true); 
      }
    }
  }, [searchCategory, accommodationPayload, fetchAccommodations]);

  // Scroll to results on search completion
  useEffect(() => {
    if (hasSearched && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // We listen to changes in hasSearched and the main result lists
  }, [hasSearched, searchResults, filteredResults]);

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
            accommodations={filteredResults} 
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
        <div className="px-6 mt-4">
          {/* Collapsible Search Filter Toggle for Mobile */}
          <div className="lg:hidden mb-2">
            <button
              onClick={() => setIsSearchFilterVisible(!isSearchFilterVisible)}
              className="w-full flex items-center justify-between p-4 bg-white rounded-lg shadow-md text-left"
            >
              <span className="font-semibold text-lg text-gray-800">Modify Search</span>
              <ChevronDown
                className={`h-6 w-6 text-gray-600 transition-transform duration-300 ${
                  isSearchFilterVisible ? "rotate-180" : ""
                }`}
              />
            </button>
          </div>

          {/* Search Filter Card Container */}
          <div className={`lg:block ${isSearchFilterVisible ? "block" : "hidden"}`}>
          <div className="min-h-[200px]">
              <SearchFilterCard
              filterActiveTab={filterActiveTab}
              filterTabs={filterTabs}
              onSetTab={(id) => setFilterActiveTab(id)}
              onFilterTransfer={handleFilterFromCard}
              rooms={cardRooms}
              initialRooms={cardRooms}
              onUpdateRooms={setCardRooms}
              stars={cardStars}
              onUpdateStars={setCardStars}
              initialCheckinDate={cardCheckin}
              initialCheckoutDate={cardCheckout}
              initialSearchQuery={cardSearchQuery} // For daytours
              initialAccommodationText={cardAccommodationText} // This is correct now
              onUpdateSearchQuery={setCardSearchQuery}
              onDatesUpdated={({ startDate, endDate }) => {
                setCardCheckin(startDate);
                setCardCheckout(endDate);
              }}
              items={[]} all_hotels={[]} regions={[]} onGetTerms={() => {}} onItemSelected={() => {}} onFilterSubmitted={handleFilterFromCard} toast={{ error: (msg) => alert(msg) }}
            />
          </div>
          </div>
        </div>
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

          {(searchCategory === "daytour" || searchCategory === "day-tours") && (
            <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-56">
              {!isLoading && searchResults.length > 0 && (
                <FilterSidebar />
              )}
            </div>
          )}


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
            <div className="lg:hidden w-full mb-2 mt-4 "ref={resultsRef}>
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
          <div className="flex-1" >
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
