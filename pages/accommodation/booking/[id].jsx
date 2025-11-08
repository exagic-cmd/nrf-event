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
    if (stored) {
      setAllowed(true);
    } else {
      setAllowed(false);
    }
    setCheckingAccess(false);
  }, []);

  useEffect(() => {
    if (!allowed && !checkingAccess) {
      const timer = setTimeout(() => {
        localizedReplace("/accommodation");
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [allowed, checkingAccess, localizedReplace]);

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

  const bookingData = JSON.parse(sessionStorage.getItem("accommodationBookingData") || "{}");
  const hotel = bookingData.hotelData;

  return (
    <Layout>
      <div className="min-h-screen bg-black text-white pt-20 pb-12">
        <div className="max-w-7xl mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8">Book {hotel?.title}</h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <AccommodationBookNow />
            </div>

            {/* Summary Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-gray-800 rounded-lg p-6 sticky top-24">
                <h3 className="text-xl font-semibold mb-4">Booking Summary</h3>
                <div className="space-y-3 text-sm">
                  <div><strong>Hotel:</strong> {hotel?.title}</div>
                  <div><strong>Room:</strong> {bookingData.selectedRoom?.roomType}</div>
                  <div><strong>Meal:</strong> {bookingData.selectedRoom?.mealType}</div>
                  <div><strong>Dates:</strong> {bookingData.checkIn} → {bookingData.checkOut}</div>
                  <div><strong>Nights:</strong> {bookingData.nights}</div>
                  <div className="pt-3 border-t border-gray-700">
                    <div className="flex justify-between">
                      <span>Total</span>
                      <span className="text-2xl font-bold text-[#CC9A55]">
                        USD {bookingData.selectedRoom?.price }
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