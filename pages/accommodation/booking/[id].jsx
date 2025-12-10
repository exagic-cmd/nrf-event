// pages/accommodation/booking/[id].js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLocalizedRouter } from "@/components/localizedRouter";
import Layout from "@/components/layout/Layout";
import LoaderSvg from "@/components/common/LoaderSvg";
import AccommodationBookNow from "@/components/accommodations/booking/AccommodationBookNow";
import { formatPrice } from "@/utils/priceUtils";
import {
  Building,
  BedDouble,
  Utensils,
  Calendar,
  Moon,
  DoorOpen,
} from "lucide-react";

export default function AccommodationBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { localizedReplace } = useLocalizedRouter();

  const [allowed, setAllowed] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isNonStuba, setIsNonStuba] = useState(false);
  const [bookingData, setBookingData] = useState(null);

  const slugify = (text) => {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  };

  useEffect(() => {
    const stored = sessionStorage.getItem("accommodationBookingData");
    if (!stored) {
      setAllowed(false);
      setIsNonStuba(false);
      setCheckingAccess(false);
      return;
    }

    try {
      const data = JSON.parse(stored);
      const nonStuba = data.isNonStuba === true;

      setBookingData(data);
      setIsNonStuba(nonStuba);

      if (nonStuba) {
        setAllowed(true); // Non-Stuba always allowed
      } else {
        setAllowed(!!data.hotelData && !!data.selectedRoom); // Stuba requires full flow
      }
    } catch (err) {
      console.error("Invalid booking data:", err);
      setAllowed(false);
    }

    setCheckingAccess(false);
  }, []);

  useEffect(() => {
    if (!allowed && !checkingAccess && !isNonStuba) {
      const timer = setTimeout(() => localizedReplace("/accommodation"), 1200);
      return () => clearTimeout(timer);
    }
  }, [allowed, checkingAccess, isNonStuba, localizedReplace]);

  if (checkingAccess) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoaderSvg />
        </div>
      </Layout>
    );
  }

  if (!allowed) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen text-white">
           <LoaderSvg />
        </div>
      </Layout>
    );
  }

  if (!bookingData) return null; // Or a loading state
  const hotel = bookingData?.hotelData || {};
  const selectedRoom = bookingData.selectedRoom || {};

  // NEW VALUES ADDED HERE
  const nights = bookingData?.nights || 1;
  const totalRoomsRequested = (bookingData?.searchParams?.rooms || []).length || 1;

  // selectedRoom.price is already total for ALL nights for 1 room
  // Multiply by number of rooms to get final total
  const totalPrice = (selectedRoom.price || 0);

  return (
    <Layout>
      <div className="min-h-screen bg-[#f4f4f4] text-black pt-20 mt-2 lg: mt-6 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-lg font-semibold mb-8">
            Book {hotel?.title || "Hotel"}
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* --- BOOKING SUMMARY BOX (Right side on Desktop, Top on Mobile) --- */}
            <div
              className="
              bg-[white]  rounded-2xl 
              p-4 sm:p-5 
              lg:sticky lg:top-24 shadow-xl border border-white/10 
              max-h-[70vh]             /* Prevent full-screen takeover */
              overflow-y-auto          /* Scroll only inside card if needed */
              small-scrollbar
              lg:order-last            /* On large screens, move this to the end */
            "
            >
              <h3 className="text-xl text-[#D3202D] font-bold mb-4 sm:mb-5 tracking-tight">
                Booking Summary
              </h3>

  <div className="space-y-4">

    {/* HOTEL */}
    <div className="flex items-center gap-2 p-2 bg-[#f3f4f6] rounded-xl">
      <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center">
        <Building className="w-3 h-3 text-black" />
      </div>
      <div>
        <p className="text-[9px] opacity-70 leading-tight text-black">Hotel</p>
        <p className="text-sm font-semibold leading-tight text-black">{hotel?.title}</p>
      </div>
    </div>

    {/* ROOM DETAILS (Type, Count, Nights) */}
    <div className="flex items-center gap-2 p-2 bg-[#f3f4f6] rounded-xl">
      <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center">
        <BedDouble className="w-3 h-3 text-black" />
      </div>
      <div>
        <p className="text-[9px] opacity-70 leading-tight text-black">Room Details</p>
        <p className="text-sm font-semibold leading-tight text-black">
          {selectedRoom.roomType || selectedRoom.roomCat || selectedRoom.name} ({totalRoomsRequested} Room{totalRoomsRequested > 1 ? 's' : ''}, {nights} Night{nights > 1 ? 's' : ''})
        </p>
      </div>
    </div>

    {/* MEAL PLAN */}
    <div className="flex items-center gap-2 p-2 bg-[#f3f4f6] rounded-xl">
      <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center">
        <Utensils className="w-3 h-3 text-black" />
      </div>
      <div>
        <p className="text-[9px] opacity-70 leading-tight text-black">Meal Type</p>
        <p className="text-sm font-semibold leading-tight text-black">
          {selectedRoom.mealType || "Room Only"}
        </p>
      </div>
    </div>

    {/* DATES */}
    <div className="flex items-center gap-2 p-2 bg-[#f3f4f6] rounded-xl">
      <div className="w-9 h-9 bg-black/20 rounded-lg flex items-center justify-center">
        <Calendar className="w-3 h-3 text-black" />
      </div>
      <div>
        <p className="text-[9px] opacity-70 leading-tight text-black">Dates</p>
        <p className="text-sm font-semibold leading-tight text-black">
          {bookingData.checkIn} → {bookingData.checkOut}
        </p>
      </div>
    </div>

    {/* ---- TOTAL PRICE ---- */}
    <div className="pt-4 mt-2 border-t border-white/20">
      <div className="flex justify-between items-center">
        <span className="text-base font-semibold">Total</span>
        <span className="text-xl font-bold">
          SGD {formatPrice(totalPrice)}
        </span>
      </div>
      <p className="text-xs text-gray-600 mt-1 text-right">
        {totalRoomsRequested} room{totalRoomsRequested > 1 ? 's' : ''} × {nights} night{nights > 1 ? 's' : ''}
      </p>
    </div>
  </div>
            </div>

   
            <div className="lg:col-span-2">
              <AccommodationBookNow
                isNonStuba={isNonStuba}
                bookingData={bookingData}
              />
            </div>



          </div>
        </div>
      </div>
    </Layout>
  );
}
