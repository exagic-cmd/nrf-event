import { useEffect } from "react";
import { PlaneLanding, PlaneTakeoff } from "lucide-react";
import { useTransferStore } from "@/store/useTransferStore";
import { useTranslation } from "next-i18next";
import { getFullImageUrl } from "@/utils/imageService";
import formatPrice from "@/lib/formatPrice";
function VehicleSummary({ vehicleInfo = {}, pricing = {}, onPriceChange, pickupLocation }) {
  const { t } = useTranslation("transfer");
  const { surchargePickup, surchargeReturn, addonsTotal, productFeature, tripType } = useTransferStore();

  const activeFeatures = productFeature?.length ? productFeature : [];

  const normalizedVehicle = {
    name: vehicleInfo.name || vehicleInfo.vehicle_name || "Vehicle",
    description: vehicleInfo.description || "",
    passengers: vehicleInfo.passengers || vehicleInfo.max_capacity || 0,
    luggage: vehicleInfo.capacity_with_luggage || vehicleInfo.luggage_capacity || 0,
    transferType: tripType === "round-trip" ? "Round Trip" : "One Way",
    image: getFullImageUrl(vehicleInfo.image) || vehicleInfo.image || "/no-image.jpg",
  };

  const baseTotal = parseFloat(pricing.total || vehicleInfo.display_price || 0);
  const pickupAmount = parseFloat(surchargePickup?.data?.amount || 0);
  const returnAmount = parseFloat(surchargeReturn?.data?.amount || 0);
  const totalSurcharge = pickupAmount + returnAmount;
  const finalTotal = baseTotal + totalSurcharge + addonsTotal;


  useEffect(() => {
    if (onPriceChange) onPriceChange(finalTotal);
  }, [finalTotal]);

  return (
    <div className="mt-8">
      <div className="bg-surface rounded-lg p-3 shadow-sm">

       {/* Vehicle Image + Info Section (image left, name beside, description below both) */}
<div className="flex flex-col">
  <div className="flex justify-between gap-1">
     <h3 className="md:text-xl text-md font-bold text-surface-foreground">{normalizedVehicle.name}</h3>
    <img
      src={normalizedVehicle.image}
      className="w-32 h-16 object-contain rounded-lg shadow-sm"
      alt="vehicle"
    />
   
  </div>

  {normalizedVehicle.description && (
    <p className="text-sm text-muted-foreground mt-2">
      {normalizedVehicle.description}
    </p>
  )}
</div>


        <div className="border-t border-dashed my-1"></div>

        {activeFeatures.length > 0 && (
          <div className="mb-2 space-y-4">

            {/* Arrival Features */}
            {activeFeatures.some((f) => f.service_flag === "Arrival") && (
              <div>
                <h4 className="flex items-center font-semibold text-primary mb-2">
                  <PlaneLanding className="w-4 h-4 mr-2 text-primary" /> {t("Pickup")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {activeFeatures
                    .filter((f) => f.service_flag === "Arrival")
                    .map((feature) => (
                      <li
                        key={feature.id}
                        className="text-muted-foreground"
                      >
                        {feature.title || feature.desc}
                      </li>
                    ))}
                </ul>
              </div>
            )}

            {/* Departure Features */}
            {activeFeatures.some((f) => f.service_flag === "Departure") && (
              <div>
                <h4 className="flex items-center font-semibold text-primary mb-2">
                  <PlaneTakeoff className="w-4 h-4 mr-2 text-primary" /> {t("Return")}
                </h4>
                <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                  {activeFeatures
                    .filter((f) => f.service_flag === "Departure")
                    .map((feature) => (
                      <li
                        key={feature.id}
                        className="text-surface-foreground"
                      >
                        {feature.title || feature.desc}
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>
        )}

        <div className="border-t border-dashed my-1"></div>

        <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t("vehiclePrice", "Vehicle Price")}</span>
            <span className="text-sm font-medium text-muted-foreground">
             {vehicleInfo?.currency} {formatPrice(baseTotal)} 
            </span>
        </div>

        {/* Surcharges + Total */}
        {pickupAmount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t("pickupSurcharge")}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {vehicleInfo?.currency} +{formatPrice(pickupAmount)} 
            </span>
          </div>
        )}
        {returnAmount > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t("returnSurcharge")}</span>
            <span className="text-sm font-medium text-muted-foreground">
              {vehicleInfo?.currency} +{formatPrice(returnAmount)} 
            </span>
          </div>
        )}
        {addonsTotal > 0 && (
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-muted-foreground">{t("addons_total")}</span>
            <span className="text-sm font-medium text-muted-foreground">
             {vehicleInfo?.currency} +{formatPrice(addonsTotal)} 
            </span>
          </div>
        )}

        <div className="flex justify-between items-center mt-4">
          <span className="md:text-xl text-md font-bold">{t("total")}</span>
          <span className="md:text-xl text-md font-bold">{vehicleInfo?.currency} {formatPrice(finalTotal)}</span>
        </div>
      </div>
    </div>
  );
}

export default VehicleSummary;
