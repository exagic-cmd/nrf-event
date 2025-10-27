"use client";

import { useState } from "react";
import { useTransferStore } from "@/store/useTransferStore";
import { Button } from "@/components/ui/button";
import VehicleCard from "./VehicleCard";
import SvgLoader2 from "@/components/common/Loader2Svg"; 

export default function VehicleList({ vehicles = [], transferInfo, onSelect }) {
  const [loading, setLoading] = useState(false);

  const {
    setSelectedTransfer,
    setSearchParams,
    setSelectedPickup,
    setSelectedDropoff,
    setTripType,
  } = useTransferStore();

  const handleVehicleSelect = (vehicle) => {
    if (!transferInfo) return;

    setLoading(true); 

    const pickup = {
      id:
        transferInfo?.pickup?.id ||
        transferInfo?.pickup?.pickup_point_id ||
        transferInfo?.pickup_point_id ||
        "",
      name:
        transferInfo?.pickup?.name ||
        transferInfo?.pickup?.pickup_point_name ||
        transferInfo?.pickup_point_name ||
        "",
      type: "pickup",
    };

    const dropoff = {
      id:
        transferInfo?.dropoff?.id ||
        transferInfo?.dropoff?.dropoff_point_id ||
        transferInfo?.dropoff_point_id ||
        "",
      name:
        transferInfo?.dropoff?.name ||
        transferInfo?.dropoff?.dropoff_point_name ||
        transferInfo?.dropoff_point_name ||
        "",
      type: "dropoff",
    };

    const rawTripType = transferInfo?.trip_type || transferInfo?.tripType || "one_way";
    const tripType = rawTripType.replace("_", "-");

    const transferType = {
      value: tripType,
      label: tripType === "round-trip" ? "Round Trip" : "One Way",
    };

    setSearchParams({ pickup, dropoff, tripType });
    setSelectedPickup(pickup);
    setSelectedDropoff(dropoff);
    setTripType(tripType);

    const formattedTransfer = {
      ...vehicle,
      pickup_point_id: pickup.id,
      dropoff_point_id: dropoff.id,
      tripType,
      transferType,
      product_id: vehicle.product_id || vehicle.id,
      price: vehicle.display_promo_price || vehicle.display_price,
      originalPrice: vehicle.display_price,
      capacity_with_luggage: vehicle.capacity_with_luggage,
      max_capacity: vehicle.max_capacity,
      vehicle_name: vehicle.vehicle_name,
      vehicle_type: vehicle.vehicle_type,
      vehicle_image: vehicle.image,
    };

    setSelectedTransfer(formattedTransfer);

  
    setTimeout(() => {
      window.location.href = "/transfers/booking";
    }, 100);
  };

  if (!vehicles.length) return <span></span>;

  return (
    <div className="relative">

      {loading && (
        <div className="absolute inset-0 z-50 flex justify-center items-center bg-black/60 backdrop-blur-sm">
          <SvgLoader2 />
        </div>
      )}

  
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {vehicles.map((v) => (
          <VehicleCard
            key={v.vehicle_id}
            vehicle={v}
            onSelect={() => handleVehicleSelect(v)}
          />
        ))}
      </div>
    </div>
  );
}
