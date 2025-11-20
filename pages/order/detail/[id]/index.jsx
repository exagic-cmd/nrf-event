"use client"
import {CarFront, Mail,ArrowLeft,MonitorPlay, Expand,Hotel } from "lucide-react"
import WhatsappIcon from "@/components/common/whatsapp-icon";
import { useEffect, useMemo, useState } from "react"
import { useRouter } from "next/router"
import { useOrderStore } from "@/store/useOrderStore"
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
import VouchersAndQRSection from "@/components/order/ItinearyInfo/VouchersAndQRSection.jsx";
import { formatDateForDisplay } from "@/utils/dateTimeUtils.js";
import ImageGallery from "@/components/order/ItinearyInfo/ImageGallery";
const Field = ({ label, value }) => {
  if (value === null || value === undefined || value === "" || value === "-") return null
  return (
    <div className="w-full">
      <h4 className="text-sm font-semibold text-black">{label}</h4>
      <p className="text-base text-gray-900 mt-1 p-2 rounded bg-gray-50">{value}</p>

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
    <h3 className="text-lg font-semibold text-black mb-4">{title}</h3>
    {children}
  </div>
)

const LocationCard = ({ title, point_title, address, image }) => (
  <div className="bg-white rounded-2xl shadow-sm md:p-4 p-2">
    <h4 className="font-semibold text-black mb-2">{title}</h4>
    <div className="relative w-full md:w-2/3 h-36 rounded-xl overflow-hidden mb-3">
      <Image src={getFullImageUrl(image) || "/placeholder.svg"} alt={title} fill className="object-cover " />
    </div>
    <p className="text-md text-black">{point_title}</p>
    <p className="text-sm text-black mt-2">{address}</p>

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
          <div className="w-14 h-14 rounded-full bg-gray-200 flex items-center justify-center text-black">
            👤
          </div>
        )}
        <div>
          <p className="font-medium">{driver.name}</p>
          <div className="flex items-center gap-5 text-sm my-2 text-gray-900">
            {/* {driver.email && (
              <span className="flex items-center gap-1">
                <Mail className="w-4 h-4 text-[#D3202D]" /> {driver.email}
              </span>
            )} */}
            {driver.contact_number && (
              <span className="flex items-center gap-1">
                <WhatsappIcon className="w-4 h-4 text-[#D3202D]" /> {driver.contact_number}
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
const [fullscreenImage, setFullscreenImage] = useState(null)

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
            <h2 className="text-xl font-semibold text-black mb-2">
              {t("orderNotFound")}
            </h2>
            <p className="text-gray-900 mb-4">
              {t("noOrderFoundForId")} <b>{id}</b>.
            </p>
            <button onClick={() => router.back()} className="bg-black text-white px-4 py-2 rounded-lg">
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
            <h2 className="text-xl text-black mb-2">{t("errorLoadingOrder")}</h2>
            <p className="text-gray-900 mb-4">{error}</p>
            <button onClick={() => router.back()} className="bg-[#D3202D] text-white px-4 py-2 rounded-lg">
              {t("goBack")}
            </button>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
      
      <div className="min-h-screen text-black  font-normal bg-[#D0E9FF]">
        {displayItineraries.map((it) => (
  <div key={it.id} className="relative">

    {(it.category_id === 3 || it.category_id === 1) && (
      <button
        onClick={() => {
          sessionStorage.setItem("fromOrder", "true");
          router.push({
            pathname: `/day-tours/detail/${it.product_id}`,
            query: { post: "true" },
          });
        }}
        className="fixed bottom-6 right-6 bg-[#D3202D] text-white px-4 py-3 rounded-full shadow-lg hover:bg-[#b3843f] transition-colors z-50"
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
                  className="flex items-center gap-2 text-gray-100 hover:text-[#D3202D]  ml-3 md:ml-6 mb-6 transition-colors"
                >
                  <ArrowLeft size={20} /> {t("button.back")}
                </button>
       </div>
        <div className="max-w-6xl mx-auto px-2 pb-6">
          
  {/* Itineraries */}
{displayItineraries?.length > 0 && (
  <SectionCard title="" className="mt-0">
    <div className="space-y-8">
      {displayItineraries.map((it, idx) => (
        <div key={`${it.id}-${idx}`} className="pt-1 space-y-6 md:space-y-8 ">
        <p className="font-semibold"> Itinerary Details - <span>{it?.title}</span></p>
      {it.category_id !== 4 && (
                    <>    
    <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                  
                     <Field label={t("date", "Date")} value={formatDateForDisplay(it?.date)} />
        <Field label={t("pickupTime", "Pickup Time")} value={it?.pickup_time} />
         <Field label={t("bookingStatus", "Booking Status")} value={order?.booking_status} />          
    </div>  
    </>
       )}
        {/* Hotel Information */}
        {it.hotel_info && (
          <div className="">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <Field label={t("bookingStatus", "Booking Status")} value={order?.booking_status} />
              <Field label={t("hotelAddress", "Hotel Address")} value={it.hotel_info.hotel_address} />
              <Field label={t("checkInDate", "Check-in Date")} value={formatDateForDisplay(it.hotel_info.checkin_date)} />
              <Field label={t("checkOutDate", "Check-out Date")} value={formatDateForDisplay(it.hotel_info.checkout_date)} />
              <Field label={t("nights", "Nights")} value={it.hotel_info.nights} />
            </div>

           {it.hotel_info.rooms && it.hotel_info.rooms.length > 0 && (
  <div className="space-y-6 mt-6">

    {it.hotel_info.rooms.map((room, roomIdx) => (
      <div
        key={roomIdx}
        className="bg-white relative rounded-xl shadow-sm p-1 border border-gray-200"
      >
        <div className="flex absolute right-2 top-1 items-center gap-3">
          <Hotel className="w-4 h-4 text-[#D3202D]" />
          <h4 className="text-xs md:text-sm font-semibold text-black">
            {t("room", "Room")} {roomIdx + 1}
          </h4>
        </div>
        <div className="flex flex-col md:flex-row gap-6 mt-4 md:mt-6">

         
          <div className="flex-grow space-y-4">

           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            
            <div>
              <p className="text-sm md:text-md font-semibold text-black">
                {t("roomType", "Room Type")}
              </p>
              <p className="text-sm text-black font-medium">
                {room.room_type}
              </p>
            </div>
            <div>
              <p className="text-sm md:text-md font-semibold text-black">
                {t("mealPlan", "Meal Plan")}
              </p>
              <p className="text-sm text-black">
                {room.meal_plan} 
              </p>
            </div>
           </div>
            {/* Guests */}
            {room.guests && room.guests.length > 0 && (
              <div>
                <p className="text-sm md:text-md font-semibold text-black mb-2">
                  {t("guests", "Guests")}
                </p>
                
                {(() => {
                  const adults = room.guests.filter(g => g.type === 'Adult');
                  const children = room.guests.filter(g => g.type === 'Child');

                  return (
                    <div className="space-y-2">
                      {adults.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold  text-[#D3202D] tracking-wider">{t("adults", "Adults")}</p>
                          <p className="text-sm text-black">
                            {adults.map((g) => `${g.title} ${g.first} ${g.last}`).join(", ")}
                          </p>
                        </div>
                      )}
                      {children.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold  text-[#D3202D] tracking-wider">{t("children", "Children")}</p>
                          <p className="text-sm text-black">
                            {children.map((g) => `${g.first} ${g.last}`).join(", ")}
                          </p>
                        </div>
                      )}
                    </div>
                  )
                })()}
              </div>
            )}
            
          </div>

          {/* RIGHT — IMAGE GALLERY */}
          <div className="md:w-80 w-full flex-shrink-0">
            <ImageGallery
              images={
                it.product_images ||
                it.hotel_info?.pictures ||
                it.hotel_info?.product_images ||
                []
              }
              onImageClick={(img) => setFullscreenImage(getFullImageUrl(img))}
              autoPlay={true}
              interval={3000}
              compact={true}
            />
          </div>
        </div>
      </div>
    ))}

  </div>
)}

          </div>
        )}

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
                     {it.flight_info && (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-2  p-1 rounded-lg">
                            <Field label="Flight No" value={it.flight_info.flight_no} />
                            <Field label="Terminal" value={it.flight_info.terminal} />
                            <Field label="Gate" value={it.flight_info.gate} />
                            <Field label="Belt" value={it.flight_info.belt} />
                            {it.flight_info.flight_monitoring && (
  <div>
    <h4 className="text-sm font-semibold text-black">Flight Monitoring</h4>
    <div className="flex items-center mt-1">
      <span className="relative flex h-3 w-3">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
        <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
      </span>
      <span className="ml-2 text-base text-gray-900">Active</span>
    </div>
  </div>
)}
                         </div>
                     )}
                    
 {/* Driver Section */}
        
         <div>
            {it.category_id === 2 && (
              <>
                {it.driver && it.driver.name ? (
                  <DriverCard driver={it.driver} vehicle={it.vehicle} status={it.driver_status} />
                ) : (
                  <div className="flex justify-center text-black py-6 border mb-2 rounded-xl bg-gray-50">
                    <CarFront/> <span className="ml-4">{t('driverNotAssigned')}</span>
                  </div>
                )}
              </>
            )}
                         {/* Vehicle Info & Features */}
                    {(it.vehicle || it.features?.length > 0) && (
                      <div className="bg-white rounded-2xl shadow-sm p-4 border">
                        {it.vehicle && (
                              <>
        
        <div className="flex flex-col lg:flex-row justify-between items-start">
         <div className="flex justify-between w-full">
           <div className="flex-col">
            <h3 className="md:text-lg text-md font-semibold text-black">
              {it.vehicle.vehicle_type}
            </h3>
            <p className="text-sm font-normal text-gray-900">
              {t("vehicleNumber")}: {it.vehicle.vehicle_no || "N/A"}
            </p>

           
            <div className="hidden lg:block mt-2">
              <p className="text-sm text-black leading-relaxed">
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
      
      </>
                        )}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
   
    <Field label={t("totalPax")} value={it.total_adult} />
    <Field label={t("baggageInfo")} value={it.baggage_info} />
  </div>
                        {it.features?.length > 0 && (
                          <>
                            
                            {it.vehicle && (
                                <div className="border-t border-dashed my-4"></div>
                            )}

                            {/* Amenities */}
                            <h3 className="md:text-lg text-md font-semibold text-black mb-3">
                              {t('vehicleAmenities')}
                            </h3>
                            <ul className="grid grid-cols-1 md:grid-cols-3 gap-x-4 gap-y-3 list-disc list-inside text-sm text-black">
                              {it.features.map((feature, i) => (
                                <li key={i} className="leading-snug">
                                  <span className="font-medium">{feature.title}</span>
                                  {/* {feature.flag && (
                                    <p className="text-xs text-[#D3202D] ml-5 mt-0.5">{feature.flag}</p>
                                  )} */}
                                </li>
                              ))}
                            </ul>
                          </>
                        )}
                      </div>
                    )}
          </div>
           
      

          {/* Vouchers & QR Codes Section */}
          {it.vouchers && it.vouchers.length > 0 && (
            <VouchersAndQRSection vouchers={it.vouchers} />
          )}

          
                   {/* ✅ Special Requests Section */}
    {it.special_request?.length > 0 && (
      <div className="bg-white rounded-2xl shadow-sm p-4 border">
        <h3 className="text-lg font-semibold text-black mb-3">
          {t('specialRequests')}
        </h3>
        <ul className="list-disc pl-6 space-y-1 text-sm text-black">
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
  noTour={true}
/>
)}
{it.arrival_map_image && (
  <div>
    <h3 className="text-lg font-semibold text-black mb-4">Arrival Map</h3>

    <div className="relative w-full h-44 lg:h-64 rounded-xl">
      <Image
        src={getFullImageUrl(it.arrival_map_image)}
        alt="Arrival Map"
        layout="fill"
        className="object-contain object-left-top" 
      />

      <button
        onClick={() => setFullscreenImage(getFullImageUrl(it.arrival_map_image))}
        className="absolute -top-8 right-2 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-75 transition"
        aria-label="Enlarge image"
      >
        <Expand size={16} />
      </button>
    </div>
  </div>
)}

{/* Remarks Section */}
{(it?.category_id === 2 || it?.category_id === 11) && (
  <div className="bg-white p-2 md:p-0">
    <h4 className="text-md font-semibold text-gray-900 mb-4">{t('pickupNotes', 'Pickup Notes')}</h4>

    {it.pickup_point_remarks ? (
      <details className="group">
        <summary className="flex justify-between items-center cursor-pointer text-sm font-semibold text-[#D3202D]">
          {t('viewNotes')}
          <span className="ml-2 text-black group-open:rotate-180 transition-transform">▼</span>
        </summary>

        <div className="mt-2 space-y-1 text-sm text-gray-700 leading-relaxed">
          {(() => {
    const urls = [];
    const remarkWithPlaceholders = it.pickup_point_remarks.replace(
      /(https?:\/\/[^\s]+)/g,
      (url) => {
        urls.push(url);
        return `__URL_${urls.length - 1}__`;
      }
    );

    return remarkWithPlaceholders.split(/[\n.]/).map((line, idx) => {
      const trimmed = line.trim();
      if (!trimmed) return null;

      const renderLine = (text) => {
        const parts = text.split(/(__URL_\d+__)/g);
        return parts.map((part, i) => {
          const match = part.match(/__URL_(\d+)__/);
          if (match) {
            const urlIndex = parseInt(match[1], 10);
            const url = urls[urlIndex];
            return (
              <a
                key={i}
                href={url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 underline break-all"
              >
                {url}
              </a>
            );
          }
          return part;
        });
      };

      if (trimmed.startsWith("Changi Airport") || trimmed.endsWith(":")) {
        return <p key={idx} className="font-semibold text-black mt-2">{renderLine(trimmed)}</p>;
      }

      if (/^(\\+|-|→)/.test(trimmed)) {
        return (
          <li key={idx} className="ml-5 list-disc">
            {renderLine(trimmed.replace(/^(\\+|-|→)/, "").trim())}
          </li>
        );
      }
      
      return <li key={idx} className="ml-5 list-disc">{renderLine(trimmed)}</li>;
    });
  })()}
        </div>
      </details>
    ) : (
      <p className="text-sm text-black">{t("noBookingNotesAvailable", "No Booking notes available.")}</p>
    )}
  </div>
)}

    <div className="border-t border-dashed "></div>
<div className="flex rounded">
{order?.booking_status === "Confirmed" && canCancel(it) && (
  <div className=" w-full rounded-xl">
   <div className="flex justify-between">
   
     <h4 className="text-base font-semibold text-black mb-1">
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

    <p className="text-sm text-gray-900 mb-1 leading-snug">
        You can <span  onClick={() => {
        setSelectedItineraryId(it.id);
        setCancelModalOpen(true);
      }} className="font-semibold text-[#D3202D] cursor-pointer">cancel your service </span> without incurring any charges 24 hours before the pickup time.
      
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

{fullscreenImage && (
    <div
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-[9999]"
        onClick={() => setFullscreenImage(null)}
    >
        <div className=" max-w-4xl max-h-full w-full h-full p-4" onClick={(e) => e.stopPropagation()}>
            <div className="relative w-full h-full">
                <Image src={fullscreenImage} alt="Arrival Map" layout="fill" className="object-contain" />
            <button
                onClick={() => setFullscreenImage(null)}
                className="absolute top-0 right-1 bg-white text-black px-2 rounded-full hover:bg-opacity-75 transition"
                aria-label="Close image"
            >
                &times;
            </button>
            </div>
            
        </div>
    </div>
)}

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