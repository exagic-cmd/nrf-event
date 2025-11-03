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
import { useState, useEffect, useRef, useCallback } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import { useRouter } from "next/navigation";
import debounce from "lodash.debounce";
import { getFullImageUrl } from "@/utils/imageService";
import Link from "next/link";
import { useTranslation } from "next-i18next";
import SearchFilterCard from "@/components/hotels/SearchFilterCard"; // ⬅️ NEW

export default function HomePage() {
  const router = useRouter();
  const { t } = useTranslation("common");

  // ---- Zustand store (your existing logic) ----
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
    isLoading,
    categoryOptions,
    vehicles,
    fetchVehicles,
    resetTransferStore,
  } = useTransferStore();

  useEffect(() => {
    resetTransferStore();
    fetchVehicles();
  }, [resetTransferStore, fetchVehicles]);

  // ---- Local state for the child component props ----
  // Tabs to mirror your Vue IDs (1,2,3,4,5,8)
  const [filterActiveTab, setFilterActiveTab] = useState(2); // showing the Transfer tab by default
  const filterTabs = [
    { id: 1, label: "coming-soon", name: "Coming Soon" },
    { id: 2, label: "transfer", name: "Transfers" },
    { id: 3, label: "day-tours", name: "DayTours" },
    { id: 4, label: "hotels", name: "Accommodations" },
    { id: 5, label: "search", name: "Search Text" },
    { id: 8, label: "packages", name: "Package Tours" },
  ];

  // Rooms are controlled by parent (like Vue)
  const [rooms, setRooms] = useState([{ adult: 1, children: [] }]);
  const [stars, setStars] = useState("0");

  // Typeahead “items” for Hotels tab (tab 4). Plug your actual lists here.
  const [typeaheadItems, setTypeaheadItems] = useState([]); // [{id, type: 'hotel'|'region', title, region_name}, ...]

  // Optional: toast adapter (SearchFilterCard accepts a toast with error())
  const toast = { error: (msg) => alert(msg) };

  // ---- Handlers wired into SearchFilterCard (map emits → store) ----
  const handleSetTab = (id) => setFilterActiveTab(id);

  const handleDatesUpdated = ({ startDate, endDate }) => {
    // You can forward to store if you need dates globally
    // For now, we keep it local to the child’s form (Hotels tab)
    // console.log({ startDate, endDate });
  };

  const handleUpdateRooms = (updated) => setRooms(updated);

  const handleGetTerms = async (query) => {
    // Fetch terms for Hotels tab’s typeahead. Replace with your endpoint.
    // Example: const res = await axios.get(`/api/hotels/typeahead?q=${encodeURIComponent(query)}`);
    // setTypeaheadItems(res.data.items);
  };

  const handleItemSelected = (item) => {
    // Item selected from Hotels typeahead
    // console.log("Selected item", item);
  };

  const handleFilterSubmitted = (payload) => {
    // Payload from tabs 3, 5, 8 (country/city/search/category_id)
    // Route or fetch based on your product flow
    // console.log("Filter Submitted", payload);
  };
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

    // Add category parameter
    router.push("/listings?searched=true");
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
     // category: "daytour", // Add category
      country_id: String(country?.id),
      city_id: String(city?.id),
    });
    if (search) params.append("name", search);

    router.push(`/listings?${params.toString()}`);
    return;
  }

  // 🏨 ACCOMMODATIONS
  if (filterActiveTab === 4) {
    const { country, city, search } = payload;

    if (!country || !city) {
      alert("Please select both country and city");
      return;
    }

    const params = new URLSearchParams({
      searched: "true",
      type: "accommodation",
      category_id: String(filterActiveTab),
      //category: "accommodation", // Add category
      country_id: String(country?.id),
      city_id: String(city?.id),
    });
    if (search) params.append("name", search);

    router.push(`/listings?${params.toString()}`);
  }
};



  // Stars / Refund / Nationality callbacks from Hotels tab
  const handleUpdateStars = (value) => setStars(value);
  const handleUpdateRefund = (value) => {
    // console.log("refund:", value);
  };
  const handleNationalitySelected = (code) => {
    // console.log("nationality:", code);
  };

  // For the Transfers tab inside SearchFilterCard:
  // we pass the store’s pickup/dropoff fetch/select via the callbacks inside the child.
  // The child already calls /transfer/pickup-options for its own local dropdowns.
  // If you want to use your store’s endpoints instead, you can fork the child to read from the store.
  // For now, we keep the child self-contained for pickup/dropoff UI and simply consume its payload on submit.

  return (
    <div className=" bg-background">
      {/* Hero */}
      <section className=" relative min-h-[75vh] h-[50vh] lg:h-[40vh] flex items-center justify-center">
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 bg-cover min-w-full"
            style={{
              backgroundImage:
                "url('https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1761738497/External%20Links/NRF_Singapore.jpg')",
            }}
          />
          <div className="absolute inset-0 bg-black/10" />
        </div>

        {/* Make content span full width */}
          <div className="relative z-10 w-full px-4 lg:px-8">
            <div className="grid lg:grid-cols-1 md:gap-6 gap-8 lg:gap-0 lg:items-start max-w-full">
          

          {/* RIGHT: Replace with SearchFilterCard */}
            <div className="flex w-full mx-4 lg:mx-0 justify-center lg:justify-end">
              <Card className="w-full max-w-full p-0 bg-transparent border-0 shadow-none">
                <SearchFilterCard
                  // Tabs + active tab
                  filterActiveTab={filterActiveTab}
                  filterTabs={filterTabs}
                  onSetTab={handleSetTab}

                  // Hotels tab (typeahead)
                  items={typeaheadItems}
                  all_hotels={[]} // keep parity
                  regions={[]}
                  onGetTerms={handleGetTerms}
                  onItemSelected={handleItemSelected}

                  // Rooms & stars
                  rooms={rooms}
                  onUpdateRooms={handleUpdateRooms}
                  stars={stars}
                  onUpdateStars={handleUpdateStars}
                  onUpdateRefund={handleUpdateRefund}
                  onNationalitySelected={handleNationalitySelected}

                  // Dates
                  onDatesUpdated={handleDatesUpdated}

                  // Submit actions
                  onSearch={() => {
                    // Hotels tab "Search" submit
                    // e.g., router.push("/hotels?...");
                  }}
                  onFilterSubmitted={handleFilterSubmitted}
                  onFilterTransfer={handleFilterTransfer}

                  // optional toast
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
