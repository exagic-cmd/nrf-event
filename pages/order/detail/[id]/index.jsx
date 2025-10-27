"use client"
import {CarFront, Phone,Mail,ArrowLeft,MonitorPlay } from "lucide-react"
import { useEffect, useMemo } from "react"
import { useRouter } from "next/router"
import { useOrderStore } from "@/store/useOrderStore"
import { useState } from "react"
import CancelModal from "@/components/order/ItinearyInfo/CancelModal"
import { formatInTimeZone } from "date-fns-tz"
import useUserStore from "@/store/useAuthStore"
import ProtectedRoute from "@/components/order/ProtectedRoute"
import LoadingSvg2 from "@/components/common/Loader2Svg"
import { getFullImageUrl } from "@/utils/imageService"
import Image from "next/image"
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import TourRoute from "@/components/daytours/tour-detail/TourRoute.jsx";

const Field = ({ label, value }) => {
  if (value === null || value === undefined || value === "" || value === "-") return null
  return (
    <div className="w-full">
      <label className="block text-xs font-medium text-gray-500">{label}</label>
      <input
        className="mt-1 w-full rounded-lg border bg-gray-50 px-3 py-2 text-sm text-gray-900"
        value={value}
        readOnly1
        disabled
      />
    </div>
  )
}
 const formatPrice = (price, locale = "en") => {
  if (price == null || isNaN(price)) return "—";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: "SGD", 
    minimumFractionDigits: 0,
  }).format(price);
};


const SectionCard = ({ title, children, className = "" }) => (
  <div className={`bg-white rounded-2xl shadow-sm p-6 ${className}`}>
    <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
    {children}
  </div>
)

const LocationCard = ({ title, point_title, address, image }) => (
  <div className="bg-white rounded-2xl shadow-sm md:p-4 p-2">
    <h4 className="font-semibold text-gray-900 mb-2">{title}</h4>
    <div className="relative w-full md:w-2/3 h-36 rounded-xl overflow-hidden mb-3">
      <Image src={getFullImageUrl(image) || "/placeholder.svg"} alt={title} fill className="object-cover " />
    </div>
    <p className="text-md text-gray-700">{point_title}</p>
    <p className="text-sm text-gray-700 mt-2">{address}</p>

  </div>
)

// Driver info card
const DriverCard = ({ driver, status }) => {
  if (!driver) return null;
  return (
    <div className="relative bg-white rounded-2xl shadow-sm md:p-4 p-4 flex flex-col gap-4">
      {status && (
        <span className="absolute top-0 right-3 bg-gray-100 text-black-700 text-xs font-medium px-3 py-1 rounded-full shadow-sm">
          {status}
        </span>
      )}
      <div className="flex items-center gap-4">
        {driver.profile_photo ? (
          <Image
            src={getFullImageUrl(driver.profile_photo)}
            alt={driver.name}
            width={60}
            height={60}
            className="rounded-full object-cover"
          />
        ) : (
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
            👤
          </div>
        )}
        <div>
          <p className="font-medium">{driver.name}</p>
          <div className="flex items-center gap-5 text-sm my-2 text-gray-600">
            {driver.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#CC9A55]" /> {driver.email}
              </span>
            )}
            {driver.contact_number && (
              <span className="flex items-center gap-1">
                <Phone className="w-4 h-4 text-[#CC9A55]" /> {driver.contact_number}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function OrderDetailPage() {
  const router = useRouter();
  const { t } = useTranslation("order","common");
  const isReady = router.isReady;
  const { id, itineraryId } = router.query;

  const { selectedOrder, fetchOrderDetail, loading, error } = useOrderStore()
  const { token, logout } = useUserStore()
const [cancelModalOpen, setCancelModalOpen] = useState(false)
const [selectedItineraryId, setSelectedItineraryId] = useState(null)

const handleCancelClick = (itineraryId) => {
  setSelectedItineraryId(itineraryId)
  setCancelModalOpen(true)
}

const canCancel = (itinerary) => {
  const pickupTime = itinerary?.pickup_time;
  const tourDate = itinerary?.date;
  if (!pickupTime || !tourDate) return false;

  let hours = 0, minutes = 0;

  if (pickupTime.includes("AM") || pickupTime.includes("PM")) {
    const [h, m] = pickupTime.split(/[: ]/);
    hours = parseInt(h, 10);
    minutes = parseInt(m, 10);
    if (pickupTime.includes("PM") && hours !== 12) hours += 12;
    if (pickupTime.includes("AM") && hours === 12) hours = 0;
  } else {
    [hours, minutes] = pickupTime.split(":").map(Number);
  }

  const pickupDateTimeStr = `${tourDate}T${hours.toString().padStart(2, "0")}:${minutes
    .toString()
    .padStart(2, "0")}:00`;

  const pickupDateTime = new Date(
    formatInTimeZone(pickupDateTimeStr, "Asia/Singapore", "yyyy-MM-dd'T'HH:mm:ssXXX")
  );
  const nowSGT = new Date(
    formatInTimeZone(new Date(), "Asia/Singapore", "yyyy-MM-dd'T'HH:mm:ssXXX")
  );

  const diffHours = (pickupDateTime - nowSGT) / (1000 * 60 * 60);

  //  witin 24 hours
  return diffHours >= 24 && diffHours >= 0;
};

const confirmCancel = (id, reason) => {
  console.log("Cancelling itinerary:", id, "Reason:", reason)
}
  const formatDateForDisplay = (dateStr) => {
    if (!dateStr) return null;
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) {
        return dateStr;
      }
      const month = String(date.getMonth() + 1).padStart(2, '0');
      const day = String(date.getDate()).padStart(2, '0');
      const year = date.getFullYear();
      return `${month} ${day} ${year}`;
    } catch (e) {
      return dateStr;
    }
  };

  useEffect(() => {
    if (error === "Invalid or unknown access token.") {
      logout();
      router.push('/login');
    }
  }, [error, logout, router]);

  useEffect(() => {
    if (!isReady) return
    if (token && id) {
      fetchOrderDetail(token, id, itineraryId)
    }
  }, [token, id, isReady, fetchOrderDetail])

  const order = selectedOrder

  const displayItineraries = useMemo(() => {
    if (!order?.itineraries) return []
    if (itineraryId) {
      return order.itineraries.filter((it) => it.id.toString() === itineraryId.toString())
    }
    return order.itineraries
  }, [order?.itineraries, itineraryId])

  const topTitle = useMemo(() => {
    const first = displayItineraries?.[0]
    return first?.product_name || first?.title || "Tour Package"
  }, [displayItineraries])

  const topDesc = useMemo(() => {
    const first = displayItineraries?.[0]
    return first?.product_description || ""
  }, [displayItineraries])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSvg2 />
      </div>
    )
  }

  if (!loading && isReady && !order && !error) {
    return (
      <ProtectedRoute>
        
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">
              {t("orderNotFound")}
            </h2>
            <p className="text-gray-600 mb-4">
              {t("noOrderFoundForId")} <b>{id}</b>.
            </p>
            <button onClick={() => router.back()} className="bg-gray-900 text-white px-4 py-2 rounded-lg">
              {t("goBack")}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  if (error) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <div className="text-red-500 text-xl mb-4">⚠️</div>
            <h2 className="text-xl text-gray-700 mb-2">{t("errorLoadingOrder")}</h2>
            <p className="text-gray-600 mb-4">{error}</p>
            <button onClick={() => router.back()} className="bg-[#CC9A55] text-white px-4 py-2 rounded-lg">
              {t("goBack")}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      
      <div className="min-h-screen bg-black">
        {displayItineraries.map((it) => (
  <div key={it.id} className="relative">

    {it.category_id === 3 ||it.category_id === 1 && (
      <button
        onClick={() => {
          sessionStorage.setItem("fromOrder", "true");
          router.push({
            pathname: `/day-tours/detail/${it.product_id}`,
            query: { order: "true" },
          });
        }}
        className="fixed bottom-6 right-6 bg-[#CC9A55] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#b3843f] transition-colors z-50"
      >
     
         <span className="inline-flex items-center gap-1">
  <MonitorPlay size={18} />
  Virtual Tour
</span>
      </button>
    )}
  </div>
))}

       <div className="md:pt-24 pt-20">
         <button
 onClick={() => router.push("/order")}
                  className="flex items-center gap-2 text-gray-100 hover:text-[#CC9A55]  ml-3 md:ml-6 mb-6 transition-colors"
                >
                  <ArrowLeft size={20} /> {t("button.backToTrips")}
                </button>
       </div>
        <div className="max-w-6xl mx-auto px-2 pb-6">
          
  {/* Itineraries */}
{displayItineraries?.length > 0 && (
  <SectionCard title="Itinerary Details" className="mt-0">
    <div className="space-y-8">
      
      {displayItineraries.map((it, idx) => (
        <div key={`${it.id}-${idx}`} className="pt-1 space-y-6">
          <h1>{it?.title}</h1>
          {/* Driver Section */}
        
         <div>
            {it.category_id === 2 && (
              <>
                {it.driver && it.driver.name ? (
                  <DriverCard driver={it.driver} vehicle={it.vehicle} status={it.driver_status} />
                ) : (
                  <div className="flex justify-center text-gray-500 py-6 border rounded-xl bg-gray-50">
                    <CarFront/> <span className="ml-4">{t('driverNotAssigned')}</span>
                  </div>
                )}
              </>
            )}
          </div>
        

                    {/* Pickup & Dropoff */}
                    {(it.pickup_point || it.dropoff_point) && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <LocationCard
                          title={t("pickupDetails")}
                          point_title={it.pickup_point}
                          address={it.pickup_point_address}
                          image={it.pickup_point_image}
                        />
                        <LocationCard
                          title={t("dropoffDetails")}
                          point_title={it.dropoff_point}
                          address={it.dropoff_point_address}
                          image={it.dropoff_point_image}
                        />
                      </div>
                    )}

                              {/* Vehicle Info & Features */}
                    {(it.vehicle || it.features?.length > 0) && (
                      <div className="bg-white rounded-2xl shadow-sm p-4 border">
                        {it.vehicle && (
                              <>
        
        <div className="flex flex-col lg:flex-row justify-between items-start">
         <div className="flex justify-between w-full">
           <div className="flex-col">
            <h3 className="md:text-lg text-md font-semibold text-gray-900">
              {it.vehicle.vehicle_type}
            </h3>
            <p className="text-sm font-normal text-gray-600">
              {t("vehicleNumber")}: {it.vehicle.vehicle_no || "N/A"}
            </p>

           
            <div className="hidden lg:block mt-4">
              <p className="text-sm text-gray-700 leading-relaxed">
                {it.vehicle.description || t("NoVehicleDescriptionAvailable")}
              </p>
            </div>
          </div>
         
            {/* Image */}
          <div className="relative w-32 h-24 rounded-xl overflow-hidden ">
            <Image
              src={getFullImageUrl(it.vehicle.image) || "/placeholder.svg"}
              alt={it.vehicle.vehicle_type}
              fill
              className="object-contain "
            />
          </div>
         </div>

        
        </div>
        {it.vehicle.description && (
          <div className="mt-4 lg:hidden">
            <p className="text-sm text-gray-700 leading-relaxed">
              {it.vehicle.description || t("NoVehicleDescriptionAvailable")}
            </p>
          </div>
        )}
      </>
                        )}

                        {it.features?.length > 0 && (
                          <>
                            
                            {it.vehicle && (
                                <div className="border-t border-dashed my-4"></div>
                            )}

                            {/* Amenities */}
                            <h3 className="md:text-lg text-md font-semibold text-gray-800 mb-3">
                              {t('vehicleAmenities')}
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-3 list-disc list-inside text-sm text-gray-800">
                              {it.features.map((feature, i) => (
                                <li key={i} className="leading-snug">
                                  <span className="font-medium">{feature.title}</span>
                                  {/* {feature.flag && (
                                    <p className="text-xs text-[#CC9A55] ml-5 mt-0.5">{feature.flag}</p>
                                  )} */}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}


         {/* Itinerary Information */}
<div className="p-0">
  <h4 className="text-md font-semibold text-gray-900 mb-4">
    {t("itineraryInformation")}
  </h4>
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
    <Field label={t("date")} value={formatDateForDisplay(it.date)} />
    <Field label={t("pickupTime")} value={it.pickup_time} />
    <Field label={t("dropoffTime")} value={it.dropoff_time} />
    <Field label={t("totalPax")} value={it.total_adult} />
    <Field label={t("baggageInfo")} value={it.baggage_info} />
    <Field label={t("flightNo")} value={it.flight_number} />
    <Field label={t("bookingStatus")} value={order?.booking_status} />
    <Field label={t("paymentStatus")} value={order?.payment_status} />
    {/* <Field
      label={t("total")}
      value={formatPrice(
        itineraryId ? displayItineraries[0]?.total_price : order?.total_price
      )}
    /> */}
    <Field label={t("createdAt")} value={formatDateForDisplay(order?.created_at)} />
  </div>
</div>        
                   {/* ✅ Special Requests Section */}
    {it.special_request?.length > 0 && (
      <div className="bg-white rounded-2xl shadow-sm p-4 border">
        <h3 className="text-lg font-semibold text-gray-900 mb-3">
          {t('specialRequests')}
        </h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-gray-700">
          {it.special_request.map((req, i) => (
            <li key={i}>{req}</li>
          ))}
        </ul>
      </div>
    )}  
      {(it?.category_id === 1 || it?.category_id === 3 ) && (
  <TourRoute
  prod_id={it?.product_id}
  lang_id={2}
  colortext="#ffff"
  colorheading="#000000"
/>
)}
{/* Remarks Section */}
 {(it?.category_id === 2 || it?.category_id === 11) && (
<div className="bg-white p-2 md:p-0">
  <h4 className="text-md font-semibold text-gray-900 mb-4">{t('pickupNotes')}</h4>

  {it.pickup_point_remarks ? (
    <details className="group">
      <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-[#CC9A55]">
       {t('viewNotes')}
        <span className="ml-2 text-gray-500 group-open:rotate-180 transition-transform">▼</span>
      </summary>
      <div className="mt-2 space-y-1 text-sm text-gray-700 leading-relaxed">
        {it.pickup_point_remarks
          .split(/[\n.]/) 
          .map((line, idx) => {
            const trimmed = line.trim();
            if (!trimmed) return null;
            if (trimmed.startsWith("Changi Airport") || trimmed.endsWith(":")) {
              return (
                <p key={idx} className="font-semibold text-gray-900 mt-2">
                  {trimmed}
                </p>
              );
            }


            if (/^(\+|-|→)/.test(trimmed)) {
              return (
                <li key={idx} className="ml-5 list-disc">
                  {trimmed.replace(/^(\+|-|→)/, "").trim()}
                </li>
              );
            }

            // Links
            if (trimmed.includes("http")) {
              return (
                <a
                  key={idx}
                  href={trimmed}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 underline break-all"
                >
                  {trimmed}
                </a>
              );
            }

         
            return (
              <li key={idx} className="ml-5 list-disc">
                {trimmed}
              </li>
            );
          })}
      </div>
    </details>
  ) : (
    <p className="text-sm text-gray-500 ">{t("noPickupNotesAvailable")}</p>
  )}
</div>
 )}
    <div className="border-t border-dashed "></div>
<div className="flex rounded">
{order?.booking_status === "Confirmed" && canCancel(it) && (
  <div className=" w-full rounded-xl">
   <div className="flex justify-between">
   
     <h4 className="text-base font-semibold text-gray-900 mb-1">
      {t("cancelServiceTitle", "Change in Plans")}
    </h4>
    <div>
  <div className=" rounded  justify-end flex">
      {/* <button
      
      className="bg-gray-600 text-white font-medium py-1 px-2 rounded-lg text-sm hover:bg-gray-800 transition-colors"
    >
      {t("cancelNow","Cancel")}
    </button> */}
    </div>
   </div>
   </div>

    <p className="text-sm text-gray-600 mb-1 leading-snug">
        You can <span  onClick={() => {
        setSelectedItineraryId(it.id);
        setCancelModalOpen(true);
      }} className="font-semibold text-[#CC9A55] cursor-pointer">cancel your service </span> without incurring any charges 24 hours before the pickup time.
      
    </p>

  
  </div>
)}


  {/* {!canCancel(it) && (
    <span className="text-gray-400 text-sm">Cannot cancel within 24 hours of pickup</span>
  )} */}
</div>

          {idx < displayItineraries.length - 1 && <div className="mt-6 border-t" />}
        </div>
      ))}
    </div>
  </SectionCard>
)}
       
        </div>
      </div>
         <CancelModal
  isOpen={cancelModalOpen}
  onClose={() => setCancelModalOpen(false)}
  onConfirm={confirmCancel}
  itineraryId={selectedItineraryId}
/>

    </ProtectedRoute>
  );
}
export async function getServerSideProps({ locale }) {
  console.log("Current locale:", locale);
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "order"])),
    },
  };
}
