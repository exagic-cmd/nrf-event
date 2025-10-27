import React, { useState } from "react";
import {
  Car,
  Users,
  Clock,
  MapPin,
  Star,
  Zap,
  Crown,
  Shield,
} from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";

export function VehicleResults({
  pickupLocation,
  dropoffLocation,
  date,
  time,
  vehicles,
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // Vehicle type icons mapping
  const getVehicleIcon = (vehicleType) => {
    const type = vehicleType.toLowerCase();
    if (type.includes("luxury")) return Crown;
    if (type.includes("premium")) return Star;
    if (type.includes("electric")) return Zap;
    return Car;
  };


  const formatPrice = (price) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "SGD",
      minimumFractionDigits: 0,
    }).format(price);
  };

  const handleSelectVehicle = (vehicle) => {
    setSelectedVehicle(vehicle);
    console.log("Selected vehicle:", vehicle);
  };

  return (
    <div className="min-h-screen mt-8 md:mt-24 px-4">
      <div className="max-w-6xl mx-auto">
     {/* Header Section */}
<div className="text-center mb-8">
  <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
    Choose Your <span className="text-[#FE6F4F]">Ride</span>
  </h1>
  <div className="bg-white rounded-2xl shadow-lg p-4 max-w-7xl mx-auto">
    {/* Pickup → Dropoff */}
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between text-sm md:text-base gap-2">
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-4 h-4 text-[#FE6F4F]" />
        <span className="truncate">{pickupLocation}</span>
      </div>
      <div className="flex items-center justify-center text-[#FE6F4F]">
        <span className="hidden sm:inline">→</span>
        <span className="sm:hidden">to</span>
      </div>
      <div className="flex items-center gap-2 text-gray-600">
        <MapPin className="w-4 h-4 text-green-500" />
        <span className="truncate">{dropoffLocation}</span>
      </div>
    </div>

    {/* Date + Time */}
    <div className="flex flex-wrap items-center justify-center gap-2 mt-3 text-sm text-gray-500">
      <span>{date}</span>
      <Clock className="w-4 h-4" />
      <span>{time}</span>
    </div>
  </div>
</div>


        {/* Vehicle Cards Grid */}
        <div
          className={`grid gap-6 ${
            vehicles.length === 1
              ? "max-w-md mx-auto"
              : "md:grid-cols-2 lg:grid-cols-3"
          }`}
        >
          {vehicles.map((vehicle, index) => {
            const VehicleIcon = getVehicleIcon(vehicle.vehicle);
            const isSelected =
              selectedVehicle?.vehicle_no === vehicle.vehicle_no;

            return (
              <div
                key={vehicle.vehicle_no || index}
                className={`cursor-pointer transform transition-all duration-300 ${
                  isSelected ? "scale-105" : ""
                }`}
                onClick={() => handleSelectVehicle(vehicle)}
              >
                {/* Main Card */}
                <div
                  className={`relative bg-white rounded-3xl shadow-xl overflow-hidden border-2 transition-colors ${
                    isSelected
                      ? "border-[#FE6F4F]"
                      : "border-transparent hover:border-gray-200"
                  }`}
                >
                  {/* Title + Image Row */}
                  <div className="flex-col items-top justify-between p-6">
                    <h3 className="text-xl font-bold text-gray-800 line-clamp-1 mb-2 ">
                      {vehicle.vehicle}
                    </h3>
                    <img
                      src={getFullImageUrl(vehicle.vehicle_image)}
                      alt={vehicle.vehicle}
                      className="min-w-full h-44 object-contain rounded-lg"
                    />
                  </div>

                  {/* Content */}
                  <div className="px-6 pb-4">
                    {/* Description */}
                    <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                      {vehicle.vehicle_description}
                    </p>

                    {/* Capacity Info */}
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 text-[#FE6F4F]" />
                        <span className="text-sm text-gray-600">
                          {vehicle.vehicle_min_capacity}-
                          {vehicle.vehicle_max_capacity} passengers
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Shield className="w-4 h-4 text-green-500" />
                        <span className="text-xs text-green-600 font-medium">
                          Safe
                        </span>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="grid grid-cols-2 gap-4 mb-6 text-sm">
                      <div className="bg-gray-50 rounded-xl text-xs p-2 flex">
                        <div className="text-gray-500 text-xs mr-2">Distance: </div>
                        <div className=" text-gray-800">
                          {vehicle.distance_km} km
                        </div>
                      </div>
                      <div className="bg-gray-50 rounded-xl p-2 flex">
                        <div className="text-gray-500 text-xs mr-2">Duration: </div>
                        <div className=" text-gray-800 text-xs">
                          {Math.round(vehicle.duration_minutes)} min
                        </div>
                      </div>
                    </div>

                    {/* Fare Breakdown */}
                     {/*   <div className="border-t pt-4 mb-6">
                   <div className="text-xs text-gray-500 mb-2">
                        Fare Breakdown
                      </div>
                      <div className="space-y-1 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Base Fare</span>
                          <span>{formatPrice(vehicle.base_fare)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Distance Fare</span>
                          <span>{formatPrice(vehicle.fare_by_distance)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Time Fare</span>
                          <span>{formatPrice(vehicle.fare_by_duration)}</span>
                        </div> */}
                        <div className="border-t pt-1 flex justify-between font-semibold">
                          <span>Total</span>
                          <span className="text-[#FE6F4F]">
                            {formatPrice(vehicle.total_estimate)}
                          </span>
                        </div>
                     
                    </div>

                    {/* Select Button */}
                    <button
                      className={`w-full py-3 rounded-xl font-semibold transition-all duration-300 ${
                        isSelected
                          ? "bg-[#FE6F4F] text-white shadow-lg"
                          : "bg-gray-100 text-gray-700 hover:bg-[#FE6F4F] hover:text-white"
                      } transform hover:scale-105 active:scale-95`}
                    >
                      {isSelected ? "Selected!" : "Select This Vehicle"}
                    </button>
                  </div>
                </div>
              //   </div>
              // </div>
            );
          })}
        </div>

      </div>
    </div>
  );
}
