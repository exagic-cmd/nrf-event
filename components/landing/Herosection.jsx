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
import { useState, useEffect } from "react";
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
    searchTransfers,
  } = useTransferStore();

  const { setSearchParams: setAccommodationSearchParams, setSearchParamsAndSearch } = useAccommodationsStore();
  const { fetchSearchResults } = useDaytoursStore();
  const {
    setTransferParams: setSearchTransferParams,
    setDaytourParams: setSearchDaytourParams,
    setAccommodationParams: setSearchAccommodationParams,
  } = useSearchValuesStore();

  // useEffect(() => {
  //   resetTransferStore();
  //   fetchVehicles();
  // }, [resetTransferStore, fetchVehicles]);

 const [event, setEvent] = useState(null);

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
  const [rooms, setRooms] = useState([{ adult: 1, children: [] }]);
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

  const handleFilterTransfer = async (payload) => {
    // 🚗 TRANSFERS
    if (filterActiveTab === 2) {
      if (!payload?.pickup || !payload?.dropoff) {
        alert("Please select both pickup and dropoff locations");
        return;
      }

      
      try {
        const transferResults = await searchTransfers({
          pickup_point_id: payload.pickup?.id,
          dropoff_point_id: payload.dropoff?.id,
          is_two_way: payload.isTwoWay ? "round-trip" : "one-way",
         
        });

      } catch (err) {
        console.error("transfer quick search failed", err);
      }

     
      setSearchTransferParams({
        pickup: payload.pickup,
        dropoff: payload.dropoff,
        tripType: payload.isTwoWay ? "round-trip" : "one-way",
        returnDate: payload.returnDate || null,
      });
      router.push(`/listings?searched=true&type=transfer`);
      return;
    }

    if (filterActiveTab === 3) {
      const { country, city, search } = payload;

      try {
        const results = await fetchSearchResults({
          category_id: 3,
          country_id: country?.id,
          city_id: city?.id,
          name: search,
        });

        
        const finalSearchQuery = (results && results.length > 0) ? search : "";

        
        setSearchDaytourParams({
          country,
          city,
          searchQuery: finalSearchQuery,
        });

      } catch (err) {
        console.error("daytour quick search failed", err);
        
        setSearchDaytourParams({ country, city, searchQuery: search });
      }

      router.push(`/listings?searched=true&type=daytour`);
      return;
    }

    if (filterActiveTab === 4) {
      try {
  
        const results = await setSearchParamsAndSearch(payload);
        if (!results || (Array.isArray(results) && results.length === 0)) {
          setNoResults({
            category: "accommodation",
            message: "No accommodations found for the selected filters and dates. Try changing the date range or room configuration.",
            payload,
          });
          return;
        }
      } catch (err) {
        console.error("accommodation quick search failed", err);
      }

      setSearchAccommodationParams({
        checkin: payload.start_date || payload.checkin || null,
        checkout: payload.end_date || payload.checkout || null,
        rooms: payload.rooms || [{ adult: 1, children: [] }],
        text: payload.search_query || payload.search || payload.text || "",
        hotel_id: payload.hotel_id,
        region_id: payload.region_id,
        ids: payload.ids,
      });
    
      router.push(`/listings?searched=true&type=accommodation`);
      return;
    }
  };

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
