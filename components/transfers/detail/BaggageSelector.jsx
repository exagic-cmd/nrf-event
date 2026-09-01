import React, { useState } from "react";
import { Luggage, User, X } from "lucide-react";
import { useTranslation } from "next-i18next";

function BaggagePassengerSelector({ 
  cabinBags = 0,
  setCabinBags,
  largeBags = 0,
  setLargeBags,
  passengers = 1, 
  setPassengers, 
  baggageDetail,
  errors = {},
  disabled = false,  
    hideBaggage = false,

}) {
  const { t } = useTranslation("transfer");
  const [modalBaggageInfo, setModalBaggageInfo] = useState(null);

   const hasBaggageOptions = Array.isArray(baggageDetail?.baggages) && baggageDetail.baggages.length > 0;
  const maxPassengers = hasBaggageOptions
    ? (baggageDetail?.capacity_with_luggage || baggageDetail?.pax_capacity || 0)
    : (baggageDetail?.capacity_without_luggage || baggageDetail?.pax_capacity || 0);

    const maxBaggage = baggageDetail?.suitcases || baggageDetail?.capacity_with_luggage || 0;
  // Robustly find baggage info by name, with a fallback to array index.
  const cabinBaggageInfo = baggageDetail?.baggages?.find(b => b.name === 'Cabin') || baggageDetail?.baggages?.[0];
  const largeBaggageInfo = baggageDetail?.baggages?.find(b => b.name === 'Large') || baggageDetail?.baggages?.[1];

  const cabinObj = baggageDetail?.baggages?.find(b => b.name === 'Cabin');
  const largeObj = baggageDetail?.baggages?.find(b => b.name === 'Large');
   const baggageInfoForModal = cabinObj?.description ? cabinObj : (largeObj?.description ? largeObj : baggageDetail?.baggages?.[0]);

  const cabinLimit = cabinBaggageInfo?.quantity ?? maxBaggage;
  const largeLimit = largeBaggageInfo?.quantity ?? maxBaggage;
  return (
    <div className="bg-surface rounded-lg p-6 shadow-sm">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Passenger Section */}
        <div>
          <div className="text-sm text-muted-foreground mb-2">
            {t("maxPassengersAre")}: {maxPassengers}
          </div>
          <div
            className={`border border-primary/20 rounded-md p-4 ${
              disabled ? "bg-muted cursor-not-allowed opacity-70" : "bg-primary/10"
            }`}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="w-4 h-4 text-foreground mr-2" />
                <span className="text-sm md:text-base font-medium">{t("totalPassengers")}</span>
              </div>
              <div className="flex items-center">
                <button
                  onClick={() => !disabled && typeof setPassengers === 'function' && setPassengers(Math.max(1, passengers - 1))}
                  className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={disabled || passengers <= 1}
                >
                  -
                </button>
                <span className="mx-4 text-sm md:text-base font-medium">{passengers}</span>
                <button
                  onClick={() => !disabled && typeof setPassengers === 'function' && setPassengers(Math.min(maxPassengers, passengers + 1))}
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
          {!hideBaggage && (
          
        <div className="relative">
             <div className="flex justify-between mb-2">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              {/* <Luggage className="w-4 h-4" /> */}
              {largeBaggageInfo && cabinBaggageInfo && largeBaggageInfo !== cabinBaggageInfo ? (
                <span>{t("maxLuggageCapacityrrr","Max Baggage")}: {largeLimit} {largeBaggageInfo.name || "Large"} + {cabinLimit} {cabinBaggageInfo.name || "Cabin"}</span>
              ) : (
                <span>{t("maxLuggageCapacity")}: {maxBaggage}</span>
              )}
            </div>
            {baggageInfoForModal && (
              <div className="flex items-center justify-end">
               
                <span 
                  className="text-sm text-primary cursor-pointer underline"
                  onClick={() => setModalBaggageInfo(baggageInfoForModal)}
                >
                  {t("seeBaggageDetails", "See baggage details")}
                </span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
            {/* Large Baggage */}
            <div
              className={`border border-primary/20 rounded-md p-4 flex flex-col justify-between ${
                disabled ? "bg-muted cursor-not-allowed opacity-70" : "bg-primary/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium">{largeBaggageInfo?.name || t("largeBaggage", "Large")}</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => !disabled && typeof setLargeBags === 'function' && setLargeBags(Math.max(0, largeBags - 1))}
                      className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={disabled || largeBags <= 0}
                    >
                      -
                    </button>
                    <span className="mx-1 w-8 text-center text-sm md:text-base font-medium">{largeBags}</span>
                    <button
                      onClick={() => {
                        if (!disabled && typeof setLargeBags === 'function' && largeBags < largeLimit) {
                          setLargeBags(largeBags + 1);
                        }
                      }}
                      className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={disabled || largeBags >= largeLimit}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Cabin Baggage */}
            <div
              className={`border border-primary/20 rounded-md p-4 flex flex-col justify-between ${
                disabled ? "bg-muted cursor-not-allowed opacity-70" : "bg-primary/10"
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-sm md:text-base font-medium">{cabinBaggageInfo?.name || t("cabinBaggage", "Cabin")}</span>
                  <div className="flex items-center">
                    <button
                      onClick={() => !disabled && typeof setCabinBags === 'function' && setCabinBags(Math.max(0, cabinBags - 1))}
                      className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={disabled || cabinBags <= 0}
                    >
                      -
                    </button>
                    <span className="mx-1 w-8 text-center text-sm md:text-base font-medium">{cabinBags}</span>
                    <button
                      onClick={() => {
                        if (!disabled && typeof setCabinBags === 'function' && cabinBags < cabinLimit) {
                          setCabinBags(cabinBags + 1);
                        }
                      }}
                      className="w-8 h-8 rounded-full border disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled={disabled || cabinBags >= cabinLimit}
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          {errors.baggage && (
            <p className="mt-2 text-red-500 text-sm">{errors.baggage}</p>
          )}
        </div>
          )}
      </div>
      {hideBaggage && (
        <p className="text-sm text-muted-foreground pt-2">
            {t("attractionLuggageDisclaimer", "We do not expect customers to be carrying any Large or Cabin size luggage to the attraction.")}
          </p>
      
      )}
      {modalBaggageInfo && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50"
          onClick={() => setModalBaggageInfo(null)}
        >
          <div className="relative bg-surface p-6 rounded-lg max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setModalBaggageInfo(null)}
              className="absolute top-2 right-2 text-muted-foreground hover:text-muted-foreground"
            >
              <X className="w-6 h-6" />
            </button>
            
            <h3 className="text-lg font-bold mb-4">
              {/* {modalBaggageInfo.name} ({modalBaggageInfo.size}) */}
              Baggage Details
              </h3>
            
            {modalBaggageInfo.image && (
              <img 
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${modalBaggageInfo.image}`} 
                alt={modalBaggageInfo.name}
                className="w-full h-48 object-contain mb-4"
              />
            )}
            <p className="text-sm text-muted-foreground whitespace-pre-line">{modalBaggageInfo.description}</p>
          </div>
        </div>
      )}
    </div>
  );
}

export default BaggagePassengerSelector;
