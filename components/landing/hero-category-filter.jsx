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
import { useState, useEffect, useCallback,useRef, useMemo } from "react";
import Head from "next/head";
import { useTransferStore } from "@/store/useTransferStore";
import { useAccommodationsStore } from "@/store/useAccommodationsStore"; // ✅ new import
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useSearchValuesStore } from "@/store/searchValues.store.js";
import { useEventStore } from "@/store/useEventStore";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/utils/imageService";
import { useTranslation } from "next-i18next";
import SearchFilterCard from "@/components/hotels/SearchFilterCard"; // ✅ your existing multi-tab component

export default function HeroFilter({ layout = 2 }) {
  const router = useRouter();
  const { t } = useTranslation("common");
  const { event, FetchEvent } = useEventStore();

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
  //  clearAllSearchParams,
  } = useSearchValuesStore();

  // useEffect(() => {
  //   resetTransferStore();
  //   fetchVehicles();
  // }, [resetTransferStore, fetchVehicles]);

  useEffect(() => {
    if (!event) {
      FetchEvent(router);
    }
  }, [event, FetchEvent, router]);

  // Tabs
  const filterTabs = useMemo(() => [
    { id: 4, label: "hotels", name: "Accommodations" },
    { id: 3, label: "day-tours", name: "DayTours" },
    { id: 2, label: "transfer", name: "Transfers" },
    { id: 8, label: "packages", name: "Package Tours" },
    { id: 12, label: "attractions", name: "Attractions" },
    { id: 1, label: "admission", name: "Admissions" },
  //  { id: 5, label: "search", name: "Search Text" },
  ], []);

  const visibleTabs = useMemo(() => {
    const eventDetails = event?.event;
    if (!eventDetails || (!eventDetails.categories && !eventDetails.category_ids)) return filterTabs;

    const categoryIds = eventDetails.category_ids 
      ? eventDetails.category_ids.map(Number)
      : (eventDetails.categories ? eventDetails.categories.map((c) => Number(c.id)) : []);

    return filterTabs.filter((tab) => {
      if (tab.id === 4) return categoryIds.includes(4); // Accommodations
      if (tab.id === 3) return categoryIds.includes(3); // DayTours
      if (tab.id === 2) return categoryIds.includes(2); // Transfers (API ID 2)
      if (tab.id === 8) return categoryIds.includes(8); // Package Tours (API ID 8)
      if (tab.id === 12) return categoryIds.includes(12); // Attractions (API ID 12)
      if (tab.id === 5) return categoryIds.includes(5); // Search Text (API ID 5)
      if (tab.id === 1) return categoryIds.includes(1); // Admissions (API ID 1)
      return false; });
  }, [event, filterTabs]);

  const [filterActiveTab, setFilterActiveTab] = useState(4);

  useEffect(() => {
    if (visibleTabs.length > 0 && !visibleTabs.some(t => t.id === filterActiveTab)) {
      setFilterActiveTab(visibleTabs[0].id);
    }
  }, [visibleTabs, filterActiveTab]);

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

    // ✅ CORRECT: Use the destructured function from hook
    fetchTransfers({
      pickup,
      dropoff,
      tripType: isTwoWay ? "round-trip" : "one-way",
      returnDate: null, // or get from date picker later
    });

    router.push(`/listings?searched=true&type=transfer`);
    return;
  }

  // DAYTOURS / PACKAGES / ATTRACTIONS
  if (["day-tours", "admission", "package-tours", "attractions", "daytour"].includes(payload.category)) {
    const { country, city, search, results } = payload;
    const categoryIdByType = {
      daytour: 3,
      "day-tours": 3,
      admission: 1,
      "package-tours": 8,
      attractions: 12,
    };
    const categoryId = Number(payload.category_id || categoryIdByType[payload.category]);

    setSearchDaytourParams({
      country,
      city,
      searchQuery: search || "",
      category_id: categoryId,
    });

    const listingType = payload.category === "daytour" ? "day-tours" : payload.category;
    router.push(`/listings?searched=true&type=${listingType}&category=${categoryId}`);
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
}, [router, setSearchTransferParams, setSearchDaytourParams, setSearchAccommodationParams, setSearchParamsAndSearch, fetchTransfers]);

  const [noResults, setNoResults] = useState(null);

  const handleUpdateStars = (value) => setStars(value);
  const handleUpdateRefund = (value) => {};
  const handleNationalitySelected = (code) => {};

  return (
    <div className={layout === 1 ? "bg-transparent" : "bg-background"}>
      <section
        className={
          layout === 1
            ? "relative z-10 -mt-16 px-4 pb-8 sm:-mt-20 sm:px-6 md:-mt-24 lg:px-8"
            : "relative mt-24 pb-24 md:pb-40"
        }
      >

        <div
          className={
            layout === 1
              ? "relative mx-auto max-w-7xl"
              : "absolute -top-12 z-10 min-w-full lg:-top-16 lg:px-8"
          }
        >
          {/* Set favicon to event banner when available */}
          {event?.event?.banner && (
            <Head>
              <link
                rel="icon"
                href={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${event?.event?.logo}`}
              />
            </Head>
          )}
          <div className={layout === 1 ? "w-full" : "mx-4 grid max-w-full gap-8 md:gap-6 lg:grid-cols-1 lg:gap-0"}>
            <div
              className={
                layout === 1
                  ? "w-full rounded-2xl border border-border/70 bg-card p-3 shadow-[0_16px_45px_rgba(15,23,42,0.16)] sm:p-4 md:p-5"
                  : "flex w-full justify-center rounded-lg bg-muted lg:mx-0"
              }
            >
              <Card
                className={
                  layout === 1
                    ? "flex min-h-0 w-full items-center justify-center border-0 bg-transparent p-0 shadow-none"
                    : "flex min-h-[200px] w-full max-w-7xl items-center justify-center border-0 bg-transparent p-0 shadow-none"
                }
              >
                <SearchFilterCard
                isHomepage={true}
                  layout={layout}
                  filterActiveTab={filterActiveTab}
                  filterTabs={visibleTabs}
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
              <div className="w-full flex justify-center mt-">
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
                        } else if (["day-tours", "admission", "package-tours", "attractions", "daytour"].includes(cat)) {
                          const categoryId = cat === "admission"
                            ? 1
                            : ([3, 8, 12].includes(filterActiveTab) ? filterActiveTab : 3);
                          const listingType = cat === "daytour" ? "day-tours" : cat;
                          router.push(`/listings?searched=true&type=${listingType}&category=${categoryId}`);
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