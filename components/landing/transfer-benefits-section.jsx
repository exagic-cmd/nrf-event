"use client";

import { useTranslation } from "next-i18next";
import { useState, useEffect } from "react";
import { Clock, Shield, MapPin, Users, Car, Headphones } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useDaytoursStore } from "@/store/useDaytoursStore";
import { useLocalizedRouter } from "@/components/localizedRouter";

export function TransferBenefitsSection() {
  const { t } = useTranslation("common");
  const { localizedPush } = useLocalizedRouter();
  const { fetchSearchResults } = useDaytoursStore();

  const [topDayTours, setTopDayTours] = useState([]);
  const [topAccommodations, setTopAccommodations] = useState([]);
  const [isLoadingDay, setIsLoadingDay] = useState(true);
  const [isLoadingAcc, setIsLoadingAcc] = useState(true);

  const benefits = t("transferBenefits.benefits", { returnObjects: true }) || [];
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % benefits.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [benefits.length]);

  /* ---------------------- Load Top Day Tours ---------------------- */
  useEffect(() => {
    const loadDayTours = async () => {
      setIsLoadingDay(true);
      try {
        const results = await fetchSearchResults({
          category_id: 3, // day-tours
          is_b2c_only: 1,
        });
        if (results?.length) setTopDayTours(results.slice(0, 3));
      } catch (err) {
        console.error("Error loading day tours:", err);
      } finally {
        setIsLoadingDay(false);
      }
    };
    loadDayTours();
  }, [fetchSearchResults]);

  const handleCardClick = (tour, category) => {
    const path =
      category === "daytour"
        ? `/day-tours/detail/${tour.id}`
        : `/accommodations/detail/${tour.id}`;
    localizedPush(path);
  };

  return (
    <section className="w-full py-12 md:py-24 lg:py-24 bg-black relative overflow-hidden">
      {/* Backgrounds */}
      <img
        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1756794120/External%20Links/businesswoman-getting-taxi-cab.jpg"
        alt="Singapore Airport"
        className="absolute top-10 left-0 w-52 h-52 object-cover opacity-10 -translate-x-1/4 rotate-3 hidden sm:block rounded-xl"
      />
      <img
        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1756794127/External%20Links/full-shot-people-traveling-together.jpg"
        alt="Luxury Car"
        className="absolute bottom-1/2 right-0 w-36 h-36 object-cover opacity-10 translate-y-1/2 rotate-45 hidden sm:block rounded-xl"
      />

      <div className="container px-4 md:px-6 mx-auto max-w-7xl relative">
        {/* ---------------------- Day Tours ---------------------- */}
        <div className="text-center mb-6">
          <h2 className="font-bold tracking-tighter text-3xl md:text-4xl text-white">
            Top Day Tours
          </h2>
        </div>

        {isLoadingDay ? (
          <p className="text-center text-white">Loading top day tours…</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {topDayTours.map((tour, idx) => (
              <Card
                key={tour.id ?? idx}
                onClick={() => handleCardClick(tour, "daytour")}
                className="border border-gray-200 bg-white cursor-pointer hover:scale-[1.02] hover:shadow-xl transition-all duration-300"
              >
                <CardHeader className="p-0">
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${tour.image}` || "/placeholder.jpg"}
                    alt={tour.product_title}
                    className="w-full h-48 object-cover rounded-t-xl"
                  />
                </CardHeader>
                <CardContent className="p-4">
                  <CardTitle className="text-lg font-semibold mb-2">
                    {tour.product_title}
                  </CardTitle>
                  <CardDescription className="text-sm text-gray-600">
                    {tour.short_desc || "Explore amazing experiences!"}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
