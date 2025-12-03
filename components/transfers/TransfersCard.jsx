import React, { useState, useEffect } from "react";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { Users, Briefcase, Crown, Star } from "lucide-react";
import { useTranslation } from "next-i18next";
import { useTransferStore } from "@/store/useTransferStore";
import { useCartStore } from "@/store/useCartStore";
import SvgLoader from "@/components/common/LoaderSvg";
import { formatPrice } from "@/utils/priceUtils";
function TransfersCard({ car, category = "transfer" }) {
  const { localizedPush } = useLocalizedRouter();
  const { t } = useTranslation("transfer");
  const { setSelectedTransfer, searchParams, selectedTransfer } = useTransferStore();
  const { items } = useCartStore();

  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const hasPromo = car.originalPrice && car.price < car.originalPrice;


  // Debug: Check what's being stored
  useEffect(() => {
  }, [selectedTransfer, car]);

  const handleBookNow = async () => {
    setIsLoading(true);
    try {
      if (category === "transfer") {
        const alreadyExists = items.some(
          (item) =>
            item.tourId === car.id && // Use car.id instead of car.rawData.id
            item.searchParams?.pickup?.id === searchParams.pickup?.id &&
            item.searchParams?.dropoff?.id === searchParams.dropoff?.id &&
            item.searchParams?.isTwoWay === searchParams.isTwoWay
        );

        if (alreadyExists) {
          setShowModal(true);
        } else {
          // ✅ FIXED: Use car directly since car.rawData is undefined
          const transferData = {
            ...car,  // Spread the entire car object
            price: car.price,
            originalPrice: car.originalPrice,
            // Ensure we have all necessary fields
            id: car.id,
            name: car.name,
            subtitle: car.subtitle,
            desc: car.desc || car.description,
            image: car.image,
            features: car.features,
            feature_type_id: car.feature_type_id,
            pickup_point_id: car.pickup_point_id,
            dropoff_point_id: car.dropoff_point_id,
            pickup_point_group_id: car.pickup_point_group_id,
            dropoff_point_group_id: car.dropoff_point_group_id
          };

          console.log("🔄 Setting transfer data:", transferData);
          
          setSelectedTransfer(transferData);
          
          // Small delay to ensure state is updated before navigation
          setTimeout(() => {
            localizedPush("/listings/booking");
          }, 100);
        }
      } else {
        // For daytour & accommodation
        localizedPush(`/${category}s/${car.id}`);
      }
    } catch (err) {
      console.error("Booking failed", err);
    } finally {
      setTimeout(() => setIsLoading(false), 400);
    }
  };

  return (
    <>
      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-100">
          <div className="bg-white p-6 rounded-lg shadow-xl text-center">
            <p className="mb-4">{t("card.modal.alreadyInCart")}</p>
            <button
              onClick={() => setShowModal(false)}
              className="bg-[#D3202D] text-white px-4 py-2 rounded"
            >
              {t("common.close")}
            </button>
          </div>
        </div>
      )}

      {/* Card */}
<div
  className="relative border rounded-xl shadow-sm bg-white w-full max-w-4xl mx-auto overflow-hidden flex flex-col md:flex-row gap-4 hover:shadow-lg hover:-translate-y-0.5 transform transition-all"
>
  {isLoading && (
    <div className="absolute inset-0 bg-white/70 flex justify-center items-center z-20 rounded-xl">
      <SvgLoader />
    </div>
  )}

  {/* Image */}
  <div className="relative w-full md:w-[300px] flex-shrink-0 flex justify-center items-center">
    <img
      src={car.image}
      alt={car.name}
      className="object-cover h-[190px] w-full md:w-[300px]"
    />

    {car.feature_type_id === 1 && (
      <span className="absolute top-1 left-0 flex items-center gap-1 px-1 py-1 text-xs font-semibold text-white rounded-md bg-black">
        <Crown size={12} />
        <span>Premium</span>
      </span>
    )}
  </div>

  {/* Info Section */}
  <div className="flex-1 flex flex-col justify-between pr-2.5 pl-2.5 py-3">
    <div>
      <h2 className="font-bold text-md lg:text-md line-clamp-1 text-[#D3202D]">{car.name}</h2>
      {car.subtitle && (
        <p className="text-sm text-gray-600 mb-1">{car.subtitle}</p>
      )}
      <p className="text-sm text-gray-700 line-clamp-2 mt-2">
        {car.desc || car.description}
      </p>

      {/* Rating (for daytour / accommodation) */}
      {(category === "daytour" || category === "accommodation") &&
        car.rating && (
          <div className="flex items-center mt-2 text-yellow-500 text-sm">
            <Star size={14} className="mr-1" />
            <span>{car.rating}</span>
          </div>
        )}

      {/* Features */}
      {car.features && car.features.length > 0 && (
        <ul className="text-xs text-gray-500 mt-2 list-disc list-inside">
          {car.features.slice(0, 3).map((f, idx) => (
            <li key={idx}>{f}</li>
          ))}
        </ul>
      )}
    </div>

    {/* Bottom Section */}
    <div className="flex justify-between items-end mt-3">
      <div>
        {hasPromo && (
          <p className="text-sm text-gray-400 line-through">
           SGD {formatPrice(car.originalPrice)} 
          </p>
        )}
        <p className="text-lg font-bold text-[#D3202D]">
          SGD {formatPrice(car.price)}
        </p>
      </div>

      {/* Book Now Button */}
      <button
        type="button"
        onClick={handleBookNow}
        className="rounded-lg bg-[#D3202D] text-white px-4 py-2 active:bg-[#b71c1c] transition cursor-pointer"
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <SvgLoader className="w-4 h-4" />
            {t("common.loading")}
          </span>
        ) : (
          "Book Now"
        )}
      </button>
    </div>
  </div>
</div>

    </>
  );
}

export default TransfersCard;