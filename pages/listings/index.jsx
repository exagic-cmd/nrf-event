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
import AccommodationListMap from "@/components/accommodations/AccommodationListMap";
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
  const [accommodationSortBy, setAccommodationSortBy] = useState("default"); // New state for accommodation sorting
  const [daytourSearchTerm, setDaytourSearchTerm] = useState("");
  const [daytourSortBy, setDaytourSortBy] = useState("price_asc");
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
      const newTransferParams = {
        pickup: payload.pickup,
        dropoff: payload.dropoff,
        tripType: payload.isTwoWay ? "round-trip" : "one-way",
        returnDate: payload.returnDate || null,
      };
      setSearchTransferParams(newTransferParams); 
      setTransferSearchParams(newTransferParams); 
      router.push(`/listings?searched=true&type=transfer`);
      setHasSearched(true);
      setSearchCategory("transfer");
      return;
    }

    if (filterActiveTab === 3) {
      setSelectedCountry(payload.country);
      setSelectedCity(payload.city);
      setDaytourSearchQuery(payload.search);
      setSearchDaytourParams({ country: payload.country, city: payload.city, search: payload.search });
      router.push(`/listings?searched=true&type=daytour`);
      setHasSearched(true);
      setSearchCategory("daytour");
      return;
    }

    if (filterActiveTab === 4) {
      const updatedPayload = {
        ...payload,
        checkin: cardCheckin,
        checkout: cardCheckout,
      };
      setAccommodationSearchParams(updatedPayload); // This will also trigger fetchAccommodations
      router.push(`/listings?searched=true&type=accommodation`);
      setHasSearched(true);
      setSearchCategory("accommodation");
      return;
    }

    console.log("handleFilterFromCard payload:", payload);
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
    fetchDaytours,
    filteredResults: daytoursFilteredResults,
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
    searchResults: transferSearchResults,
    searchParams: transferSearchParams, setSearchParams: setTransferSearchParams,
    fetchTransfers,
  } = useTransferStore();


  const handleFilterChange = useCallback((activeFilters) => {
    applyAccommodationFilter((accommodation) => {
      const hasSelectedAmenities = activeFilters.amenities && activeFilters.amenities.length > 0;
      const hasSelectedRatings = activeFilters.ratings && activeFilters.ratings.length > 0;
      const hasSelectedMealPlans = activeFilters.meal_plans && activeFilters.meal_plans.length > 0;
      const hasSelectedPaymentTypes = activeFilters.payment_types && activeFilters.payment_types.length > 0;
      const hasSelectedCancellation = activeFilters.cancellation_policies && activeFilters.cancellation_policies.length > 0;
      const hasSelectedRoomAmenities = activeFilters.room_amenities && activeFilters.room_amenities.length > 0;
      const hasPriceRange = activeFilters.priceRange && activeFilters.priceRange.max > 0;
      const hasSearchText = activeFilters.searchText && activeFilters.searchText.trim().length > 1;

      const hotelData = accommodation.Hotel_Data || accommodation.normalizedHotelData || accommodation;

      // Create lookup maps for performance
      const generalAmenitiesMap = new Map((accommodationFilters?.general_amenities || []).map(a => [a.id, a.label]));
      const cancellationPolicyMap = new Map((accommodationFilters?.cancellation_policies || []).map(p => [p.id, p.name]));

       const hotelAmenitiesSet = new Set(hotelData.amenities || []);

      const searchTextMatch = !hasSearchText || (
        (hotelData.title || hotelData.name || "").toLowerCase().includes(activeFilters.searchText.toLowerCase())
      );

      const amenityMatch = !hasSelectedAmenities || activeFilters.amenities.every(id => {
        const amenityName = generalAmenitiesMap.get(id);
        return amenityName && hotelAmenitiesSet.has(amenityName);
      });

      const ratingMatch = !hasSelectedRatings || activeFilters.ratings.includes(Math.floor(parseFloat(hotelData.star_rating)));

      const mealPlanMatch = !hasSelectedMealPlans || activeFilters.meal_plans.includes(accommodation.room?.rate_plan?.meal?.id);

      const paymentTypeMatch = !hasSelectedPaymentTypes || activeFilters.payment_types.includes(accommodation.room?.rate_plan?.payment_type);
      
      const cancellationPolicyMatch = !hasSelectedCancellation || activeFilters.cancellation_policies.includes(accommodation.room?.rate_plan?.cancellation_policy?.id);

      const priceMatch = !hasPriceRange || (
        ( // Use total_promo or total first, then fallback to per_room or base_price
          accommodation.room?.rate_plan?.pricing?.total_promo ||
          accommodation.room?.rate_plan?.pricing?.total ||
          accommodation.room?.rate_plan?.pricing?.per_room_total_promo ||
          accommodation.room?.rate_plan?.pricing?.per_room_total ||
          accommodation.room?.base_price ||
          accommodation.price || 0
        ) >= activeFilters.priceRange.min &&
        ( // Use total_promo or total first, then fallback to per_room or base_price
          accommodation.room?.rate_plan?.pricing?.total_promo ||
          accommodation.room?.rate_plan?.pricing?.total ||
          accommodation.room?.rate_plan?.pricing?.per_room_total_promo ||
          accommodation.room?.rate_plan?.pricing?.per_room_total ||
          accommodation.room?.base_price || accommodation.price || 0
        ) <= activeFilters.priceRange.max
      );

      return searchTextMatch && amenityMatch && ratingMatch && mealPlanMatch && paymentTypeMatch && cancellationPolicyMatch && priceMatch;
    });
  }, [applyAccommodationFilter, accommodationFilters]); 
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
    if (window.innerWidth < 1024) { 
        setIsSearchFilterVisible(true);
      }
      setShowSearchModal(true);
    }
  }, [urlSearchParams]);

 useEffect(() => {
    const type = urlSearchParams.get("type");
    if (type === "transfer") {
      setSelectedPickup(searchTransferParams.pickup);
      setSelectedDropoff(searchTransferParams.dropoff);
      setTripType(searchTransferParams.tripType);
      setTransferSearchParams(searchTransferParams); // <-- This is the fix
    }
  }, [urlSearchParams, searchTransferParams]);

  useEffect(() => {
    const type = urlSearchParams.get("type");
    if (type === "daytour") {
      setDaytourSelectedCountry(searchDaytourParams.country);
      setDaytourSelectedCity(searchDaytourParams.city);
      setCardSearchQuery(searchDaytourParams.searchQuery);

      // Trigger a fetch on page load if we have meaningful params
      const hasDaytourPayload = searchDaytourParams && (searchDaytourParams.country || searchDaytourParams.city || searchDaytourParams.searchQuery);
      if (hasDaytourPayload) {
        fetchDaytours({ country: searchDaytourParams.country, city: searchDaytourParams.city, name: searchDaytourParams.searchQuery });
      }
    }
  }, [urlSearchParams, searchDaytourParams, setSearchDaytourParams, fetchDaytours]);

  useEffect(() => {
    const type = urlSearchParams.get("type");
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
        setCardRooms(searchAccommodationParams.rooms);
      } else {
        setCardRooms([{ adult: 2, children: [] }]); 
      }

      // Trigger fetch on page load if payload exists
      if (searchAccommodationParams && Object.keys(searchAccommodationParams).length > 0) {
        fetchAccommodations(searchAccommodationParams);
      }
    }
  }, [urlSearchParams, searchAccommodationParams, setAccommodationSearchParams, fetchAccommodations]);

  useEffect(() => {
    if (
      (searchCategory === "accommodation" || searchCategory === "hotels") &&
      accommodationPayload
    ) {
      fetchAccommodations(accommodationPayload);
      // Filters will be applied by handleFilterChange when activeFilters state changes in sidebar
      if (accommodationPayload.ids && accommodationPayload.ids.length > 0) {
        const targetHotelId = accommodationPayload.ids[0]; 
        applyAccommodationFilter((accommodation) => {
          return accommodation.id === targetHotelId;
        });
      }
    }
  }, [searchCategory, accommodationPayload, fetchAccommodations, applyAccommodationFilter]);

  useEffect(() => {
    // Only trigger transfer search if a search has been performed AND both pickup and dropoff are set.
    if (hasSearched && searchCategory === "transfer" && transferSearchParams?.pickup && transferSearchParams?.dropoff) {
      fetchTransfers(transferSearchParams);
    }
  }, [searchCategory, transferSearchParams, fetchTransfers, hasSearched]);

// useEffect(() => {
//     const daytourParams = { country: daytourSelectedCountry, city: daytourSelectedCity, search: daytourSearchQuery };
//     if ((searchCategory === "daytour" || searchCategory === "day-tours") && (daytourParams.city || daytourParams.search)) {
//       fetchDaytours(daytourParams);
//     }
//   }, [searchCategory, daytourSelectedCountry, daytourSelectedCity, daytourSearchQuery]);

useEffect(() => {
    const type = urlSearchParams.get("type");
   if (!hasSearched || isInitialSearch) return;

    if (
      (filterActiveTab === 4 && (type === "accommodation" || type === "hotels")) ||
      (filterActiveTab === 3 && (type === "daytour" || type === "day-tours")) ||
      (filterActiveTab === 2 && type === "transfer")
    ) {
      return;
    }

    if (filterActiveTab === 4 && Object.keys(searchAccommodationParams).length > 0) {
      handleFilterFromCard(searchAccommodationParams);
    } else if (filterActiveTab === 3 && Object.keys(searchDaytourParams).length > 0) {
      handleFilterFromCard(searchDaytourParams);
    } else if (filterActiveTab === 2 && Object.keys(searchTransferParams).length > 0) {
      handleFilterFromCard(searchTransferParams);
    }
 }, [filterActiveTab, hasSearched, isInitialSearch]);

  useEffect(() => {
    if (hasSearched && resultsRef.current) {
      resultsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
    // We listen to changes in hasSearched and the main result lists
  }, [hasSearched, searchResults, filteredResults]);
 const hasValidTransferSearch = hasSearched && searchTransferParams?.pickup && searchTransferParams?.dropoff;
  const renderListComponent = () => {
   

    switch (searchCategory) { 
      case "transfer":
        // Pass searchPerformed to show the correct placeholder
        return <TransfersList searchParams={searchParams} searchPerformed={hasValidTransferSearch} />;
      case "daytour":
      case "day-tours":
        return (
          <DaytoursList
            searchTerm={daytourSearchTerm}
            sortBy={daytourSortBy}
          />
        );
      case "accommodation":
      case "hotels":
        return (
          <AccommodationList
            accommodations={filteredResults} 
            isLoading={accommodationLoading}
            searchPerformed={hasSearched}
            sortBy={accommodationSortBy}
            setSortBy={setAccommodationSortBy}
          />
        );
      default:
        return <TransfersList searchParams={searchParams} />;
    }
  };

  // Placeholders
  const renderPlaceholder = () => {
    const hasValidTransferSearch = hasSearched && searchTransferParams?.pickup && searchTransferParams?.dropoff;

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
      case "transfer":
        if (hasValidTransferSearch) return renderListComponent(); // A search was attempted but had no results
        // fallthrough for initial placeholder
      default:
//         return  (<div className="text-center py-16 bg-white rounded-xl shadow-md">
//           {/* <h3 className="text-xl font-semibold text-gray-800">
//             { t('results.noTransfersFound') || "Please search for a transfer"}
//           </h3> */}
//           <p className="text-gray-500 mt-2">
//  Use the search filter above to find available transfers.
//           </p>
//         </div>);
    }
  };
  
  const showFaqs = hasSearched && searchCategory === "transfer" && transferSearchResults.length > 0;
  const isAccommodationCategory = searchCategory === "accommodation" || searchCategory === "hotels";

  const daytoursForMap = (daytoursFilteredResults && daytoursFilteredResults.length > 0) 
    ? daytoursFilteredResults 
    : searchResults;

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
          <div className={`lg:block relative z-30 ${isSearchFilterVisible ? "block" : "hidden"}`}>
          <div className="min-h-[200px] mb-3">
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
          {searchCategory === "transfer" && hasValidTransferSearch && (
            <div className="h-fit md:sticky top-24 self-start z-20 w-full lg:w-56">
              <TransferSearchFilter
                onSearch={() => {}}
                //showModal={showSearchModal}
               // setShowModal={setShowSearchModal}
                forceSearch={isInitialSearch}
                initialCategory={searchCategory}
              />
            </div>
          )}

          {(searchCategory === "daytour" || searchCategory === "day-tours") && (
            <div className="h-fit md:sticky z-30 top-24 self-start w-full lg:w-56">
              {!isLoading && searchResults.length > 0 && (
                <FilterSidebar
                  searchTerm={daytourSearchTerm}
                  setSearchTerm={setDaytourSearchTerm}
                  sortBy={daytourSortBy}
                  setSortBy={setDaytourSortBy}
                />
              )}
            </div>
          )}


          {isAccommodationCategory && (
            <div className="hidden lg:block max-h-[calc(100vh-7rem)] overflow-y-auto md:sticky top-24 self-start z-20 w-full lg:w-56">
              {!accommodationLoading && accommodations && accommodations.length > 0 && (
                <AccommodationFilterSidebar
                  filters={accommodationFilters}
                  onFilterChange={handleFilterChange}
                  sortBy={accommodationSortBy}
                  onSortChange={setAccommodationSortBy}
                />
              )}
            </div>
          )}

        
          {isAccommodationCategory && hasSearched && !accommodationLoading && accommodations?.length > 0 && (
            <div className="lg:hidden w-full mb-2 mt-4 "ref={resultsRef}>
              <button
                onClick={() => setShowFilterModal(true)}
                className="w-full border text-[#D3202D] bg-white font-semibold text-base px-6 py-3 rounded-lg shadow-md hover:bg-[#b71c1c] active:bg-[#a31919] transition-colors duration-300 flex items-center justify-center gap-2"
              >
                <Filter size={20} />
                <span>Filters</span>
              </button>
            </div>
          )}

          {/* Center: List Content */}
          <div className="flex-1" ref={resultsRef}>
            {hasSearched ? renderListComponent() : renderPlaceholder()}
          </div>

          {/* Right: Map or FAQs */}
          <div className="lg:w-1/4 h-fit sticky top-24 self-start z-10">
            {(searchCategory === "daytour" || searchCategory === "day-tours") && (
              <GoogleMap
                center={{ lat: 1.3521, lng: 103.8198 }}
                zoom={12}
                width="100%"
                height="550px"
                className="rounded-lg shadow-lg"
                markers={(daytoursForMap || []).map((r) => ({
                  lat: r.latitude || r.lat || r?.location?.lat,
                  lng: r.longitude || r.lng || r?.location?.lng,
                  title: r.title || r.name || r.location_name || r.hotel_name || "",
                }))}
              />
            )}
            {isAccommodationCategory && filteredResults.length > 0 && (
              <AccommodationListMap
                accommodations={filteredResults}
              />
            )}
            {searchCategory === "transfer" && hasValidTransferSearch &&  showFaqs && <Faqs />}
          </div>
        </div>

        {/* Filter Modal for Small Screens */}
        {showFilterModal && (
          <div className="fixed inset-0 z-[100] bg-white overflow-y-auto">
            <div className="flex justify-between items-center p-4 border-b">
              <h2 className="text-xl font-bold">Filters</h2>
              <button onClick={() => setShowFilterModal(false)} className="text-gray-600 hover:text-gray-900">
                <X size={24} />
              </button>
            </div>
            <div className="p-4">
              {isAccommodationCategory ? (
                <AccommodationFilterSidebar
                  filters={accommodationFilters}
                  onFilterChange={handleFilterChange}
                  sortBy={accommodationSortBy}
                  onSortChange={setAccommodationSortBy}
                />
              ) : (
                <FilterSidebar />
              )}
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
