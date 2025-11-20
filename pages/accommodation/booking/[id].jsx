// pages/accommodation/booking/[id].js
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { useLocalizedRouter } from "@/components/localizedRouter";
import Layout from "@/components/layout/Layout";
import LoaderSvg from "@/components/common/LoaderSvg";
import AccommodationBookNow from "@/components/accommodations/booking/AccommodationBookNow";

export default function AccommodationBookingPage() {
  const router = useRouter();
  const { id } = router.query;
  const { localizedReplace } = useLocalizedRouter();

  const [allowed, setAllowed] = useState(false);
  const [checkingAccess, setCheckingAccess] = useState(true);
  const [isNonStuba, setIsNonStuba] = useState(false);

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

      setIsNonStuba(nonStuba);

      if (nonStuba) {
        // NON-STUBA: Allow access without validation
        setAllowed(true);
      } else {
        // STUBA: Require proper flow
        setAllowed(!!data.hotelData && !!data.selectedRoom);
      }
    } catch (err) {
      console.error("Invalid booking data:", err);
      setAllowed(false);
    }

    setCheckingAccess(false);
  }, []);

  // Redirect only for Stuba if not allowed
  useEffect(() => {
    if (!allowed && !checkingAccess && !isNonStuba) {
      const timer = setTimeout(() => {
        localizedReplace("/accommodation");
      }, 1200);
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
          Redirecting...
        </div>
      </Layout>
    );
  }

  // Parse booking data
  const bookingData = JSON.parse(sessionStorage.getItem("accommodationBookingData") || "{}");
  const hotel = bookingData.hotelData || {};
  const selectedRoom = bookingData.selectedRoom || {};

  return (
    <Layout>
      <div className="min-h-screen bg-[#D0E9FF] text-black pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Book {hotel?.title || "Hotel"}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Booking Form */}
            <div className="lg:col-span-2">
              <AccommodationBookNow 
  isNonStuba={isNonStuba}
  bookingData={bookingData}
/>
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-[#D3202D] text-white rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Hotel:</strong> {hotel?.title}</div>
                  <div><strong>Room:</strong> {selectedRoom.roomType || "Not selected"}</div>
                  <div><strong>Meal:</strong> {selectedRoom.mealType || "Room Only"}</div>
                  <div><strong>Dates:</strong> {bookingData.checkIn} to {bookingData.checkOut}</div>
                  <div><strong>Nights:</strong> {bookingData.nights}</div>
                  {/* {isNonStuba && (
                    <div className="text-xs text-green-400 mt-2">
                      Direct booking (no validation)
                    </div>
                  )} */}
                  <div className="pt-3 border-t border-gray-50">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="text-md lg:text-lg font-bold text-[#D3202D]">
                        USD {Number(selectedRoom.price || 0).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}