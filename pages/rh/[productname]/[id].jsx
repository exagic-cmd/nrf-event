// pages/rh/[productname]/[id].jsx — RateHawk hotel detail page
import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Layout from "@/components/layout/Layout";
import LoaderSvg from "@/components/common/Loader2Svg";
import NoProductsFound from "@/components/common/NoProductsFound";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useAccommodationsStore } from "@/store/useAccommodationsStore";
import { useCartStore } from "@/store/useCartStore";
import { useDrawerStore } from "@/store/useDrawerStore";
import useRecentlyViewedStore from "@/store/useRecentlyViewedStore";
import AccommodationHeader from "@/components/accommodations/AccommodationHeader";
import AccommodationGallery from "@/components/accommodations/ImageGallery";
import AccommodationInfoCard from "@/components/accommodations/AccommodationInfoCard";
import AccommodationRooms from "@/components/accommodations/RoomTypes";
import AccommodationMap from "@/components/accommodations/AccommodationMapSection";
import AccommodationHotelDetail from "@/components/accommodations/AccommodationHotelDetail.jsx";
import RecentlyViewed from "@/components/accommodations/RecentlyViewed.jsx";
import NearbyLandmarks from "@/components/accommodations/NearbyLandmarks.jsx";
import AccommodationAmenities from "@/components/accommodations/AccommodationAmenities";
import BookingModal from "@/components/accommodations/BookingModal";
import helpers from "@/lib/helpers";
import useCurrencyStore from "@/store/useCurrencyStore";

// ─── RateHawk normalizer ──────────────────────────────────────────────────────
const normalizeRatehawkAccommodationData = (rhItem, fallbackCurrency = "SGD") => {
  if (!rhItem || !rhItem.Hotel_Data) return null;

  const { Hotel_Data, rates = [] } = rhItem;
  const firstPayment = rates[0]?.payment_options?.payment_types?.[0];
  const currency =
    firstPayment?.currency_code ||
    firstPayment?.show_currency_code ||
    rhItem.currency ||
    rhItem.currency_code ||
    Hotel_Data.currency ||
    fallbackCurrency ||
    "SGD";
  const hotelImages = (Hotel_Data.media || []).map((m) => m.image);

  const hotelAmenities = Hotel_Data.highlight
    ? Hotel_Data.highlight.split(",").map((item, index) => ({
        id: index,
        name: item.trim(),
        icon: null,
      }))
    : [];

  const normalizedHotelData = {
    currency,
    id: Hotel_Data.id,
    amenities: hotelAmenities,
    title: Hotel_Data.product_title,
    name: Hotel_Data.product_title,
    short_desc: Hotel_Data.short_desc,
    long_desc: Hotel_Data.description,
    country: Hotel_Data.country_name,
    city: Hotel_Data.city_name,
    address: Hotel_Data.address,
    latitude: Hotel_Data.latitude,
    longitude: Hotel_Data.longitude,
    image: Hotel_Data.media?.[0]?.image || Hotel_Data.image || "",
    images: (Hotel_Data.media || []).map((m) => ({
      url: m.image,
      thumb: m.image,
      type: "photo",
    })),
    stars: 0,
    review_count: 0,
    rating: { rating: 0 },
    location: Hotel_Data.address || Hotel_Data.city_name,
  };

  // Group flat rates[] array by room_name
  const roomMap = {};
  rates.forEach((rate) => {
    const roomName =
      rate.room_name ||
      rate.room_data_trans?.main_room_type ||
      "Room";
    if (!roomMap[roomName]) roomMap[roomName] = [];
    roomMap[roomName].push(rate);
  });

  const normalizedRooms = Object.entries(roomMap).map(([roomName, roomRates]) => {
    const ratePlans = roomRates.map((rate) => {
      const paymentType = rate.payment_options?.payment_types?.[0];
      const price = parseFloat(paymentType?.show_amount || paymentType?.amount || 0);
      const rateCurrency =
        paymentType?.currency_code ||
        paymentType?.show_currency_code ||
        currency;
      const cancellationBefore =
        paymentType?.cancellation_penalties?.free_cancellation_before;
      const isRefundable = !!cancellationBefore;
      const hasBreakfast = rate.meal_data?.has_breakfast;
      const mealLabel = hasBreakfast ? "Breakfast included" : "Room Only";

      return {
        id: rate.book_hash,
        roomTypeId: roomName,
        roomTypeName: roomName,
        name: `${roomName} — ${mealLabel}`,
        bedDetails:
          rate.amenities_data?.find((a) => a.includes("bed")) || null,
        smokingType: rate.amenities_data?.includes("non-smoking")
          ? "Non-Smoking"
          : null,
        mealType: rate.meal,
        mealPlanCode: rate.meal,
        price,
        originalPrice: price,
        hasDiscount: false,
        cancellationPolicy: isRefundable
          ? "Free Cancellation"
          : "Non-Refundable",
        occupancyAdults: rate.rg_ext?.capacity || 2,
        occupancyChildren: 0,
        isAvailable: true,
        canAccommodate: true,
        rawPricing: {
          ...rate,
          pricing: {
            total: price,
            currency: rateCurrency,
            nights:
              rate.daily_prices?.map((p) => ({ price: parseFloat(p) })) || [],
          },
        },
        images: hotelImages,
        view: null,
        pricing: {
          total: price,
          currency: rateCurrency,
          nights:
            rate.daily_prices?.map((p) => ({ price: parseFloat(p) })) || [],
        },
        book_hash: rate.book_hash,
      };
    });

    return {
      id: roomName,
      name: roomName,
      size: null,
      view: null,
      images: hotelImages,
      bedDetails: null,
      ratePlans,
      amenities: hotelAmenities,
    };
  });

  const allRatePlans = normalizedRooms.flatMap((r) => r.ratePlans);
  const validPrices = allRatePlans.map((r) => r.price).filter((p) => p > 0);
  const startingPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

  normalizedHotelData.starting_price = startingPrice;
  normalizedHotelData.price = startingPrice;

  const lowestPriceRoom = allRatePlans.reduce(
    (low, r) => (!low || r.price < low.price ? r : low),
    null
  );

  return {
    normalizedHotelData,
    normalizedRoomData: normalizedRooms,
    lowestPriceRoom,
    hotel: {
      amenities: Hotel_Data.amenities || [],
      nearby_landmarks: [],
      latitude: Hotel_Data.latitude,
      longitude: Hotel_Data.longitude,
    },
  };
};

export async function getServerSideProps({ locale }) {
  const translations = await serverSideTranslations(locale || "en", [
    "common",
    "accommodation",
  ]);
  return { props: { ...translations } };
}

export default function RatehawkAccommodationDetailPage() {
  const { t } = useTranslation(["common", "accommodation"]);
  const router = useRouter();
  const { id: accommodationId, productname, link_type_id } = router.query;
  const { localizedReplace, localizedPush } = useLocalizedRouter();

  const { searchParams } = useAccommodationsStore();
  const { items, removeItem } = useCartStore();
  const { openDrawer, setDrawerContent } = useDrawerStore();
  const addRecentlyViewed = useRecentlyViewedStore(
    (state) => state.addRecentlyViewed
  );
  const storeCurrencyId = useCurrencyStore((state) => state.currencyId);
  const storeCurrency = useCurrencyStore((state) => state.currency);

  const lastFetchedIdRef = useRef(null);

  const [accommodation, setAccommodation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyModal, setAlreadyModal] = useState(false);

  const slugify = useCallback((text) => {
    if (typeof text !== "string" || !text) return "";
    return text
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "");
  }, []);

  const handleRoomSelect = (room) => setSelectedRoom(room);

  const handleScrollToOptions = () => {
    const el = document.getElementById("room-types-section");
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleProceedBooking = (roomArg = null, bookHash = null, prebookRates = null) => {
    const roomToUse = roomArg || selectedRoom;
    if (!roomToUse) {
      alert("Please select a room first");
      return;
    }
    if (roomArg) setSelectedRoom(roomToUse);

    const exists = items.some(
      (item) =>
        item.tourId === accommodationId && item.type === "accommodation"
    );

    if (exists) {
      setAlreadyModal(true);
      return;
    }

    const bookingData = {
      accommodationId,
      hotelData: accommodation.normalizedHotelData,
      selectedRoom: roomToUse,
      searchParams,
      nights: searchParams?.nights || 1,
      checkIn: searchParams?.start_date,
      checkOut: searchParams?.end_date,
      isRatehawk: true,
      link_type_id: 10,
      book_hash: bookHash || null,
      prebooking_rates: prebookRates || null,
      timestamp: new Date().toISOString(),
    };

    sessionStorage.setItem(
      "accommodationBookingData",
      JSON.stringify(bookingData)
    );
    sessionStorage.setItem("fromAccommodationDetail", "true");
    localizedPush(`/accommodation/booking/${accommodationId}`);
  };

  const handleModalUpdate = async () => {
    const existingItem = items.find(
      (item) =>
        item.tourId === accommodationId && item.type === "accommodation"
    );
    if (existingItem) removeItem(existingItem.key);
    sessionStorage.setItem("fromAccommodationDetail", "true");
    setAlreadyModal(false);
    localizedPush(`/accommodation/booking/${accommodationId}`);
  };

  const handleModalGoToCart = async () => {
    setAlreadyModal(false);
    const LoadedCartDrawerContent = (
      await import("@/components/common/CartDrawerContent")
    ).default;
    setDrawerContent(<LoadedCartDrawerContent />);
    openDrawer();
  };

  const fetchAccommodationDetail = useCallback(async (forcedCurrencyId = null) => {
    if (!router.isReady || !accommodationId) return;

    const currencyId =
      forcedCurrencyId ||
      storeCurrencyId ||
      (typeof window !== "undefined" && Number(localStorage.getItem("currency_id"))) ||
      2;

    const currencyCode =
      (currencyId === 3 || storeCurrency === "USD" || (typeof window !== "undefined" && localStorage.getItem("currency") === "USD"))
        ? "USD"
        : "SGD";

    // Guard against React 18 StrictMode double-invoke and same-ID/currency re-renders
    const fetchKey = `${accommodationId}_${currencyId}`;
    if (lastFetchedIdRef.current === fetchKey) return;
    lastFetchedIdRef.current = fetchKey;

    setLoading(true);
    setError(null);

    try {
      // Resolve effective search params
      let effectiveSearchParams = { ...searchParams };

      if (
        !searchParams ||
        !searchParams.start_date ||
        !searchParams.end_date
      ) {
        const savedPayload =
          sessionStorage.getItem("rhAccommodationPayload") ||
          sessionStorage.getItem("stubaAccommodationPayload");
        if (savedPayload) {
          const parsed = JSON.parse(savedPayload);
          effectiveSearchParams = {
            start_date: parsed.start_date,
            end_date:
              parsed.end_date ||
              new Date(
                new Date(parsed.start_date).getTime() +
                  (parsed.nights || 2) * 86400000
              )
                .toISOString()
                .split("T")[0],
            rooms: parsed.rooms || [{ adult: 2, children: [] }],
            nights: parsed.nights || 2,
          };
        } else {
          effectiveSearchParams = {
            start_date: new Date().toISOString().split("T")[0],
            end_date: new Date(Date.now() + 2 * 86400000)
              .toISOString()
              .split("T")[0],
            rooms: [{ adult: 2, children: [] }],
            nights: 2,
          };
        }
        useAccommodationsStore.getState().setSearchParams(effectiveSearchParams);
      }

      const rooms = effectiveSearchParams.rooms || [
        { adult: 2, children: [] },
      ];
      const pax = rooms.reduce((sum, r) => {
        const adults = Number(r.adult) || 0;
        const children = Array.isArray(r.children) ? r.children.length : 0;
        return sum + adults + children;
      }, 0);

      // Build RateHawk hotel_details payload
      const payload = {
        region: null,
        hotel_id: String(accommodationId),
        start_date: effectiveSearchParams.start_date,
        end_date: effectiveSearchParams.end_date,
        nights: effectiveSearchParams.nights || 2,
        rooms,
        nationality: "all",
        stars: null,
        pax,
        currency_id: currencyId,
        currency: currencyCode,
        currency_code: currencyCode,
      };

      const res = await fetch(
        `${helpers.getApiAbsoluteURL("ratehawk/hotel_details")}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("RateHawk hotel_details API failed");

      const responseData = await res.json();

      // Find matching item by hid, fall back to first
      const rhItem =
        responseData.data?.find(
          (item) => String(item.hid) === String(accommodationId)
        ) || responseData.data?.[0];

      if (!rhItem) throw new Error("No RateHawk hotel data found");

      const normalizedData = normalizeRatehawkAccommodationData(rhItem, currencyCode);
      if (!normalizedData) throw new Error("Failed to normalize RateHawk data");

      setAccommodation(normalizedData);

      // Fix slug if needed
      const actualSlug = slugify(
        normalizedData.normalizedHotelData.title || "accommodation"
      );

      if (productname !== actualSlug) {
        localizedReplace(
          { pathname: "/rh/[productname]/[id]", query: {} },
          { pathname: `/rh/${actualSlug}/${accommodationId}`, query: {} },
          { shallow: true }
        );
      }
    } catch (err) {
      console.error("RateHawk fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [router.isReady, accommodationId, storeCurrencyId, storeCurrency, searchParams, productname, slugify, localizedReplace]);

  useEffect(() => {
    fetchAccommodationDetail();
  }, [fetchAccommodationDetail]);

  useEffect(() => {
    const handleCurrencyChange = (e) => {
      const newCurrencyId = e.detail?.currency_id || e.detail?.currencyId;
      if (newCurrencyId) {
        lastFetchedIdRef.current = null;
        fetchAccommodationDetail(newCurrencyId);
      }
    };
    window.addEventListener("currencyChange", handleCurrencyChange);
    return () => {
      window.removeEventListener("currencyChange", handleCurrencyChange);
    };
  }, [fetchAccommodationDetail]);

  useEffect(() => {
    if (accommodation?.normalizedHotelData?.title) {
      const { id, title, image, stars, rating } =
        accommodation.normalizedHotelData;

      let lowestPrice = accommodation.normalizedHotelData.starting_price;
      if (accommodation.normalizedRoomData?.length > 0) {
        const allPrices = accommodation.normalizedRoomData
          .flatMap(
            (room) =>
              room.ratePlans?.map(
                (plan) => plan.rawPricing?.pricing?.total || plan.price || 0
              ) || []
          )
          .filter((p) => p > 0);
        if (allPrices.length > 0) lowestPrice = Math.min(...allPrices);
      }

      addRecentlyViewed({
        id,
        name: title,
        image,
        hotel_id: accommodationId,
        price: lowestPrice,
        rating: stars || rating?.rating || 0,
        currency: accommodation.normalizedHotelData.currency,
        type: "accommodation",
        link: router.asPath,
      });
    }
  }, [accommodation, addRecentlyViewed, router.asPath]);

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <LoaderSvg height="120px" />
        </div>
      </Layout>
    );
  }

  if (error || !accommodation) {
    return (
      <Layout>
        <Head>
          <title>Accommodation Not Found | Explore Singapore</title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="mt-12">
          <NoProductsFound height="calc(100vh - 48px)" />
        </div>
      </Layout>
    );
  }

  const hotelData = accommodation.normalizedHotelData;
  const roomData = accommodation.normalizedRoomData;
  const nights = searchParams?.nights || 1;
  const roomsCount = (searchParams?.rooms || []).length || 1;

  return (
    <Layout>
      <Head>
        <title>
          {hotelData?.title || "Accommodation Detail"} | Explore Singapore
        </title>
      </Head>

      <div className="min-h-screen bg-surface-muted text-surface-foreground pt-[80px] md:pt-16 pb-12">
        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-6 lg:gap-8">
            <div className="lg:col-span-9">
              <div className="flex flex-col bg-surface p-2 rounded-2xl lg:flex-row justify-between gap-1">
                <AccommodationHeader hotelData={hotelData} />
                <AccommodationInfoCard
                  hotelData={hotelData}
                  startingPrice={hotelData.starting_price}
                  allRooms={accommodation.normalizedRoomData}
                  selectedRoom={selectedRoom}
                  ratePlans={roomData?.flatMap((r) => r.ratePlans) || []}
                  currency={hotelData.currency}
                  onScrollToOptions={handleScrollToOptions}
                  onProceedBooking={handleProceedBooking}
                  nights={nights}
                  roomsCount={roomsCount}
                />
              </div>
              <div className="mt-2">
                <AccommodationGallery hotelData={accommodation} />
              </div>
            </div>
            <div className="lg:col-span-3 mt-5 lg:mt-0">
              <RecentlyViewed />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-2">
          <AccommodationRooms
            allRooms={accommodation.normalizedRoomData}
            normalizedRoomData={accommodation.normalizedRoomData}
            room_categories={accommodation.room_categories}
            room_types={accommodation.room_types}
            productId={accommodationId}
            currency={hotelData.currency}
            onRoomSelect={handleRoomSelect}
            nights={nights}
            onProceedBooking={handleProceedBooking}
            allotments={accommodation.allotments}
            selectedRoom={selectedRoom}
            amenities={hotelData.amenities}
            link_type_id={10}
          />
          <div className="grid grid-cols-1">
            <AccommodationMap
              hotelData={hotelData}
              landmarks={accommodation?.hotel?.nearby_landmarks}
            />
            <NearbyLandmarks
              landmarks={accommodation?.hotel?.nearby_landmarks}
              hotelLatitude={accommodation?.hotel?.latitude}
              hotelLongitude={accommodation?.hotel?.longitude}
            />
          </div>
          <AccommodationHotelDetail hotelData={accommodation} />
        </div>
      </div>

      <BookingModal
        isOpen={alreadyModal}
        onClose={() => setAlreadyModal(false)}
        onUpdate={handleModalUpdate}
        onGoToCart={handleModalGoToCart}
        productType="accommodation"
      />
    </Layout>
  );
}
