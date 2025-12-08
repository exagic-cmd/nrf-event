"use client";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  ArrowRightLeft,
  ArrowRight,
  Search,
  Users,
  Zap,
  Luggage,
  X,
  Building2,
  Plane,
  Ship,
  Train,
} from "lucide-react";
import { useState, useEffect, useCallback } from "react";
import Head from "next/head";
import { useTransferStore } from "@/store/useTransferStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore"; // ✅ new import
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useSearchValuesStore } from "@/store/searchValues.store.js";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/utils/imageService";
import { useTranslation } from "next-i18next";
import SearchFilterCard from "@/components/hotels/SearchFilterCard"; // ✅ your existing multi-tab component

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  // ---- Zustand stores ----
  const {
    pickupOptions,
    dropoffOptions,
    fetchPickupOptions,
    fetchDropoffOptions,
    setSelectedPickup,
    setSelectedDropoff,
    selectedPickup,
    selectedDropoff,
    tripType,
    setTripType,
    setSearchParams,
   // fetchVehicles,
    resetTransferStore,
    fetchTransfers,
  } = useTransferStore();

  const { setSearchParams: setAccommodationSearchParams, setSearchParamsAndSearch } = useAccommodationsStore();
  const { fetchSearchResults } = useDaytoursStore();
  const {
    setTransferParams: setSearchTransferParams,
    setDaytourParams: setSearchDaytourParams,
    setAccommodationParams: setSearchAccommodationParams,
    clearAllSearchParams,
  } = useSearchValuesStore();

  // useEffect(() => {
  //   resetTransferStore();
  //   fetchVehicles();
  // }, [resetTransferStore, fetchVehicles]);

 const [event, setEvent] = useState(null);

  // Clear all persisted search values on initial load of the homepage
  useEffect(() => {
    clearAllSearchParams();
  }, [clearAllSearchParams]);

  useEffect(() => {
    async function loadEvent() {
      const data = await $helpers.getEventData();
      console.log("EVENT FROM herosection:", data);
      setEvent(data);
    }

    loadEvent();
  }, []);

  // Tabs
  const [filterActiveTab, setFilterActiveTab] = useState(4);
  const filterTabs = [
    
    { id: 4, label: "hotels", name: "Accommodations" },
    { id: 3, label: "day-tours", name: "DayTours" },
    { id: 2, label: "transfer", name: "Transfers" },
    { id: 1, label: "coming-soon", name: "Coming Soon" },
    { id: 5, label: "search", name: "Search Text" },
    { id: 8, label: "packages", name: "Package Tours" },
  ];

  // Hotels tab state
  const [rooms, setRooms] = useState([{ adult: 2, children: [] }]);
  const [stars, setStars] = useState("0");
  const [typeaheadItems, setTypeaheadItems] = useState([]);
  const toast = { error: (msg) => alert(msg) };

  // ---- handlers ----
  const handleSetTab = (id) => setFilterActiveTab(id);
  const handleDatesUpdated = ({ startDate, endDate }) => {};
  const handleUpdateRooms = (updated) => setRooms(updated);
  const handleUpdateSearchQuery = (query) => {}; 
  const handleGetTerms = async (query) => {};
  const handleItemSelected = (item) => {};
  const handleFilterSubmitted = (payload) => {};

  const handleFilterTransfer = useCallback(async (payload) => {
  // TRANSFERS TAB
  if (payload.category === "transfer") {
    const { pickup, dropoff, isTwoWay } = payload;

    if (!pickup?.id || !dropoff?.id) {
      alert("Please select valid pickup and dropoff locations");
      return;
    }

    // Save to persistent search store
    setSearchTransferParams({
      pickup,
      dropoff,
      tripType: isTwoWay ? "round-trip" : "one-way",
    });

    // CORRECT: Use Zustand action properly — DO NOT await raw IDs!
    useTransferStore.getState().fetchTransfers({
      pickup,
      dropoff,
      tripType: isTwoWay ? "round-trip" : "one-way",
      returnDate: null, // or get from date picker later
    });

    router.push(`/listings?searched=true&type=transfer`);
    return;
  }

  // DAYTOURS
  if (payload.category === "daytour") {
    const { country, city, search, results } = payload;

    setSearchDaytourParams({
      country,
      city,
      searchQuery: search || "",
    });

    router.push(`/listings?searched=true&type=daytour`);
    return;
  }

  // ACCOMMODATION
  if (payload.category === "accommodation") {
    try {
      await setSearchParamsAndSearch(payload);

      setSearchAccommodationParams({
        checkin: payload.checkin,
        checkout: payload.checkout,
        rooms: payload.rooms,
        text: payload.search_query || "",
        hotel_id: payload.hotel_id,
        region_id: payload.region_id,
      });

      router.push(`/listings?searched=true&type=accommodation`);
    } catch (err) {
      console.error("Accommodation search failed", err);
    }
  }
}, [router, setSearchTransferParams, setSearchDaytourParams, setSearchAccommodationParams, setSearchParamsAndSearch]);

  const [noResults, setNoResults] = useState(null);

  const handleUpdateStars = (value) => setStars(value);
  const handleUpdateRefund = (value) => {};
  const handleNationalitySelected = (code) => {};

  return (
    <div className="bg-background">
      <section className="relative pb-24 md:pb-32">
      

        <div className="absolute -top-12 lg:-top-16 min-w-full z-10">
          {/* Set favicon to event banner when available */}
          {event?.event?.banner && (
            <Head>
              <link
                rel="icon"
                href={`https://res.cloudinary.com/www-travelpakistani-com/${event?.event?.logo}`}
              />
            </Head>
          )}
          <div className="grid lg:grid-cols-1 md:gap-6 gap-8 lg:gap-0 max-w-full ">
            <div className="flex w-full lg:mx-0 justify-center">
              <Card className="min-h-[200px] w-full max-w-7xl flex justify-center items-center p-0 bg-transparent border-0 shadow-none">
                <SearchFilterCard
                isHomepage={true}
                  filterActiveTab={filterActiveTab}
                  filterTabs={filterTabs}
                  onSetTab={handleSetTab}
                  items={typeaheadItems}
                  all_hotels={[]}
                  regions={[]}
                  onGetTerms={handleGetTerms}
                  onItemSelected={handleItemSelected}
                  rooms={rooms}
                  onUpdateRooms={handleUpdateRooms}
                  stars={stars}
                  onUpdateStars={handleUpdateStars}
                  onUpdateRefund={handleUpdateRefund}
                  onUpdateSearchQuery={handleUpdateSearchQuery} // Pass placeholder handler
                  onNationalitySelected={handleNationalitySelected}
                  onDatesUpdated={handleDatesUpdated}
                  onSearch={() => {}}
                  onFilterSubmitted={handleFilterSubmitted}
                  onFilterTransfer={handleFilterTransfer}
                  toast={toast}
                />
              </Card>
            </div>
            {noResults && (
              <div className="w-full flex justify-center mt-4">
                <div className="max-w-7xl w-full bg-yellow-50 border border-yellow-200 rounded p-4">
                  <p className="text-sm text-yellow-800">{noResults.message}</p>
                  <div className="mt-3 flex gap-2">
                    <Button onClick={() => setNoResults(null)}>Adjust filters</Button>
                    <Button
                      variant="outline"
                      onClick={() => {
                        const cat = noResults.category;
                        if (cat === "accommodation") {
                          router.push(`/listings?searched=true&type=accommodation`);
                        } else if (cat === "daytour") {
                          router.push(`/listings?searched=true&type=daytour`);
                        } else {
                          router.push(`/listings?searched=true&type=transfer`);
                        }
                      }}
                    >
                      See listings anyway
                    </Button>
                  </div>
                </div>
              </div>
            )}
            </div>
        </div>
      </section>
    </div>
  );
}
