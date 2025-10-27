"use client"

import { useState } from "react"
import BookingForm from "@/components/custom/booking-form"
import { VehicleResults } from "@/components/custom/vehicle-results"
import Layout from "@/components/layout/Layout"
export default function HomePage() {
  const [searchData, setSearchData] = useState(null);

  const handleSearchVehicles = (data) => {
    setSearchData(data);
  };
console.log(searchData)
  return (
    <Layout>
      <main className="min-h-screen mb-12 bg-background">
        <BookingForm className="mt-4 md:mt-12" onSearchVehicles={handleSearchVehicles} />

        {searchData && (
          <div id="vehicle-results">
            <VehicleResults
              pickupLocation={searchData?.pickupLocation}
              dropoffLocation={searchData?.dropoffLocation}
              date={searchData.date}
              time={searchData.time}
              vehicles={searchData.fares?.fares} 
            />
          </div>
        )}
      </main>
    </Layout>
  );
}