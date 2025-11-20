import React from "react";
import { Luggage, User } from "lucide-react";
import { useTranslation } from "next-i18next";

function BaggagePassengerSelector({ 
  baggage = 0, 
  setBaggage, 
  maxBaggage = 0, 
  passengers = 1, 
  setPassengers, 
  maxPassengers = 0, 
  errors = {},
  disabled = false,  
}) {
  const { t } = useTranslation("transfer");

  return (
    <div className="bg-white rounded-lg p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Passenger Section */}
        <div>
          <div className="text-sm text-gray-600 mb-2">
            {t("maxPassengersAre")}: {maxPassengers}
          </div>
          <div
            className={`border border-[#D3202D] rounded-md p-4 ${
              disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 text-[#D3202D] mr-2" />
                <span className="text-sm md:text-base font-medium">{t("totalPassengers")}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => !disabled && setPassengers(Math.max(1, passengers - 1))}
                  className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || passengers <= 1}
                >
                  -
                </button>
                <span className="mx-4 text-sm md:text-base font-medium">{passengers}</span>
                <button
                  onClick={() => !disabled && setPassengers(Math.min(maxPassengers, passengers + 1))}
                  className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || passengers >= maxPassengers}
                >
                  +
                </button>
              </div>
            </div>
            {errors.passengers && (
              <p className="mt-2 text-red-500 text-sm">{errors.passengers}</p>
            )}
          </div>
        </div>

        {/* Baggage Section */}
        <div>
          <div className="text-sm text-gray-600 mb-2">
            {t("maxLuggageCapacity")}: {maxBaggage}
          </div>
          <div
            className={`border border-[#D3202D] rounded-md p-4 ${
              disabled ? "bg-gray-100 cursor-not-allowed opacity-70" : "bg-blue-100"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Luggage className="w-4 h-4 text-gray-800 mr-2" />
                <span className="text-sm md:text-base font-medium">{t("standardBaggage")}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => !disabled && setBaggage(Math.max(0, baggage - 1))}
                  className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || baggage <= 0}
                >
                  -
                </button>
                <span className="mx-4 text-sm md:text-base font-medium">{baggage}</span>
                <button
                  onClick={() => !disabled && setBaggage(Math.min(maxBaggage, baggage + 1))}
                  className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || baggage >= maxBaggage}
                >
                  +
                </button>
              </div>
            </div>
            {errors.baggage && (
              <p className="mt-2 text-red-500 text-sm">{errors.baggage}</p>
            )}
          </div>
        </div>

     

      </div>
    </div>
  );
}

export default BaggagePassengerSelector;
