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
  } = useTransferStore();

  const { setSearchParams: setAccommodationSearchParams } = useAccommodationsStore(); // ✅

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
  const [filterActiveTab, setFilterActiveTab] = useState(2);
  const filterTabs = [
    { id: 1, label: "coming-soon", name: "Coming Soon" },
    { id: 2, label: "transfer", name: "Transfers" },
    { id: 3, label: "day-tours", name: "DayTours" },
    { id: 4, label: "hotels", name: "Accommodations" },
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

      setSelectedPickup(payload.pickup);
      setSelectedDropoff(payload.dropoff);
      setTripType(payload.isTwoWay ? "round-trip" : "one-way");
      setSearchParams({
        pickup: payload.pickup,
        dropoff: payload.dropoff,
        tripType: payload.isTwoWay ? "round-trip" : "one-way",
        returnDate: payload.returnDate || null,
      });

      router.push("/listings?searched=true&type=transfer");
      return;
    }

    // 🏖️ DAY TOURS
    if (filterActiveTab === 3) {
      const { country, city, search } = payload;

      if (!country || !city) {
        alert("Please select both country and city");
        return;
      }

      const params = new URLSearchParams({
        searched: "true",
        type: "daytour",
        category_id: String(filterActiveTab),
        country_id: String(country?.id),
        city_id: String(city?.id),
      });
      if (search) params.append("name", search);

      router.push(`/listings?${params.toString()}`);
      return;
    }

    // 🏨 ACCOMMODATIONS
    if (filterActiveTab === 4) {
    router.push(`/listings?searched=true&type=accommodation`);
  }
  };

  const handleUpdateStars = (value) => setStars(value);
  const handleUpdateRefund = (value) => {};
  const handleNationalitySelected = (code) => {};

  return (
    <div className="bg-background">
      <section className="relative min-h-[85vh] h-[60vh] lg:h-[50vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 z-0">
          {event?.event?.title}
          <div
            className="absolute inset-0 bg-cover min-w-full"
            style={{
              backgroundImage: `url('https://res.cloudinary.com/www-travelpakistani-com/${event?.event?.banner}')`,
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>
          <div className="absolute inset-0 bg-black/10" />
        </div>

        <div className="relative z-10 w-full px-4 lg:px-8 mt-[13rem] lg:mt-0">
          {/* Set favicon to event banner when available */}
          {event?.event?.banner && (
            <Head>
              <link
                rel="icon"
                href={`https://res.cloudinary.com/www-travelpakistani-com/${event?.event?.logo}`}
              />
            </Head>
          )}
          <div className="grid lg:grid-cols-1 md:gap-6 gap-8 lg:gap-0 lg:items-start max-w-full">
            <div className="flex w-full lg:mx-0 justify-center lg:justify-end">
              <Card className="w-full max-w-full p-0 bg-transparent border-0 shadow-none">
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
                  onNationalitySelected={handleNationalitySelected}
                  onDatesUpdated={handleDatesUpdated}
                  onSearch={() => {}}
                  onFilterSubmitted={handleFilterSubmitted}
                  onFilterTransfer={handleFilterTransfer}
                  toast={toast}
                />
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
