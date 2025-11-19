// components/accommodations/AccommodationDetailPage.jsx
import { useState, useEffect, useCallback } from "react";
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
import AccommodationHeader from "@/components/accommodations/AccommodationHeader";
import AccommodationGallery from "@/components/accommodations/ImageGallery";
import AccommodationInfoCard from "@/components/accommodations/AccommodationInfoCard";
import AccommodationRooms from "@/components/accommodations/RoomTypes";
import AccommodationMap from "@/components/accommodations/AccommodationMapSection";
import BookingModal from "@/components/accommodations/BookingModal";

export async function getServerSideProps({ locale }) {
  const translations = await serverSideTranslations(locale || "en", [
    "common",
    "accommodation",
  ]);
  return { props: { ...translations } };
}

export default function AccommodationDetailPage() {
  const { t } = useTranslation(["common", "accommodation"]);
  const router = useRouter();
  const { id: accommodationId, productname } = router.query;
  const { localizedReplace, localizedPush } = useLocalizedRouter();
  const [isNonStuba, setIsNonStuba] = useState(false);

  const {
    selectedRegion,
    searchParams,
    isLoading,
    setSearchParams,
  } = useAccommodationsStore();

  const { items, removeItem } = useCartStore();
  const { openDrawer, setDrawerContent } = useDrawerStore();

  const [accommodation, setAccommodation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyModal, setAlreadyModal] = useState(false);

  const slugify = useCallback((text) => {
    if (!text) return "";
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-")
      .replace(/[^\p{L}\p{N}-]+/gu, "")
      .replace(/--+/g, "-")
      .replace(/^-+/, "")
      .replace(/-+$/, "");
  }, []);

  // Normalize accommodation data function (keep your existing implementation)
  const normalizeAccommodationData = (data) => {
  if (!data) return null;

  const hotelData = data.Hotel_Data || data;
  const results = data.Result || [];

  // ---------- 1. Build images ----------
  let images = [];
  try {
    if (Array.isArray(hotelData.media)) {
      images = hotelData.media.map(m => ({
        url: m.image,
        thumb: m.thumb || m.image,
        type: m.type || "photo"
      }));
    }
  } catch (e) {
    console.warn("Failed to parse media:", e);
  }

  // ---------- 2. Parse optional JSON fields ----------
  let address = hotelData?.address;
  let region = {};
  let rating = {};

  try { if (hotelData.address) address = JSON.parse(hotelData.address); } catch {}
  try { if (hotelData.region) region = JSON.parse(hotelData.region); } catch {}
  try { if (hotelData.rating) rating = JSON.parse(hotelData.rating); } catch {}

  // ---------- 3. Group rooms by Result.id ----------
  const roomGroups = {};

  results.forEach(result => {
    const resultId = result["@attributes"]?.id;
    if (!resultId) return;

    const nights = Array.isArray(result.Room) ? result.Room : [result.Room].filter(Boolean);

    // Extract common room type / meal from first night (they are the same for all nights)
    const firstNight = nights[0];
    const roomType = firstNight?.RoomType?.["@attributes"]?.text || "Standard Room";
    const mealType = firstNight?.MealType?.["@attributes"]?.text || "Room Only";
    const roomCode = firstNight?.RoomType?.["@attributes"]?.code;
    const mealCode = firstNight?.MealType?.["@attributes"]?.code;
    const cancellation = firstNight?.CancellationPolicyStatus || "NonRefundable";

    // Sum all night prices
    const totalAmt = nights.reduce((sum, night) => {
      const amt = parseFloat(night?.Price?.["@attributes"]?.amt || 0);
      return sum + amt;
    }, 0);

    roomGroups[resultId] = {
      id: resultId,
      roomType,
      mealType,
      price: totalAmt,
      cancellationPolicy: cancellation,
      roomCode,
      mealCode,
      rawNights: nights, // keep for debugging / future use
    };
  });

  const normalizedRooms = Object.values(roomGroups);

  // ---------- 4. Find cheapest ROOM ----------
  const startingPrice = normalizedRooms.length > 0
    ? Math.min(...normalizedRooms.map(r => r.price))
    : hotelData.price || 0;

  const lowestPriceRoom = normalizedRooms.length > 0
    ? normalizedRooms.reduce((low, r) => r.price < low.price ? r : low)
    : null;

  // ---------- 5. Return normalized structure ----------
  return {
    ...data,
    normalizedHotelData: {
      id: hotelData.id,
      stuba_id: hotelData.stuba_id,
      title: hotelData.title,
      name: hotelData.title,
      description: hotelData.description,
      country: hotelData.country_name,
      city: hotelData.city_name,
      address,
      latitude: hotelData.latitude,
      longitude: hotelData.longitude,
      image: hotelData.image,
      images,
      type: hotelData.type,
      stars: hotelData.stars,
      amenities: hotelData.amenities,
      category_name: hotelData.category_name,
      region,
      rating,
      starting_price: startingPrice,
      price: startingPrice,
      location: address || hotelData?.city_name || "",
      review_count: 0,
      features: hotelData.amenities ? hotelData.amenities.split(', ') : []
    },
    normalizedRoomData: normalizedRooms,
    lowestPriceRoom,
  };
};

  // Handle room selection
  const handleRoomSelect = (room) => {
    setSelectedRoom(room);
  };

  // Handle scroll to room options
  const handleScrollToOptions = () => {
    const roomTypesSection = document.getElementById('room-types-section');
    if (roomTypesSection) {
      roomTypesSection.scrollIntoView({ 
        behavior: 'smooth',
        block: 'start'
      });
    }
  };

  // Handle proceed to booking with cart validation
  const handleProceedBooking = () => {
  if (!selectedRoom) {
    alert("Please select a room first");
    return;
  }

  const exists = items.some(item => 
    item.tourId === accommodationId && item.type === 'accommodation'
  );

  if (exists) {
    setAlreadyModal(true);
    return;
  }

  const bookingData = {
    accommodationId,
    hotelData: accommodation.normalizedHotelData, // ← fixed
    selectedRoom,
    searchParams,
    nights: searchParams?.nights || 1,
    checkIn: searchParams?.start_date,
    checkOut: searchParams?.end_date,
    isNonStuba, // optional
    isNonStuba: isNonStuba,
    timestamp: new Date().toISOString()
  };

  sessionStorage.setItem("accommodationBookingData", JSON.stringify(bookingData));
  sessionStorage.setItem("fromAccommodationDetail", "true");
  localizedPush(`/accommodation/booking/${accommodationId}`);
};

  // Handle modal update (remove existing and proceed)
  const handleModalUpdate = async () => {
    const existingItem = items.find(item => 
      item.tourId === accommodationId && item.type === 'accommodation'
    );
    
    if (existingItem) {
      removeItem(existingItem.key);
    }

    sessionStorage.setItem("fromAccommodationDetail", "true");
    setAlreadyModal(false);
    
    // Navigate to booking page
    localizedPush(`/accommodation/booking/${accommodationId}`);
  };

  // Handle modal go to cart
  const handleModalGoToCart = async () => {
    setAlreadyModal(false);
    const LoadedCartDrawerContent = (await import("@/components/common/CartDrawerContent")).default;
    setDrawerContent(<LoadedCartDrawerContent />);
    openDrawer();
  };

useEffect(() => {
  const fetchAccommodationDetail = async () => {
    if (!router.isReady || !accommodationId) return;

    setLoading(true);
    setError(null);

    try {
      const urlLinkTypeId = router.query.link_type_id
        ? Number(router.query.link_type_id)
        : null;

      console.log("URL link_type_id:", urlLinkTypeId, "ID:", accommodationId);

      // ——————————————————— NON-STUBA ———————————————————
if (urlLinkTypeId != null && urlLinkTypeId !== 9) {
  console.log("Non-Stuba flow");

  const hotelData = await useAccommodationsStore.getState().fetchNonStubaAccommodation(accommodationId);
  if (!hotelData) throw new Error("Hotel not found");

  const roomsData = await useAccommodationsStore.getState().fetchNonStubaRooms(accommodationId);
  if (!roomsData?.product_pricing || roomsData.product_pricing.length === 0) {
    throw new Error("No room pricing available");
  }

  const nights = searchParams?.nights || 1;
  const fromDate = searchParams?.start_date;
  const toDate = searchParams?.end_date;

  // Total guests & rooms requested
  const totalGuests = (searchParams?.rooms || []).reduce((sum, r) => 
    sum + (Number(r.adult) || 0) + (r.children?.length || 0), 0) || 1;
  const totalRoomsRequested = (searchParams?.rooms || []).length || 1;

  // 1. Check full date range availability ONCE
  let allotments = [];
  let isHotelAvailable = true;
  if (fromDate && toDate) {
    const avail = await useAccommodationsStore.getState().checkNonStubaAvailability(
      accommodationId, fromDate, toDate
    );
    isHotelAvailable = avail.isFullyAvailable;
    allotments = avail.allotments || [];
  }

  // 2. Build rooms with availability flags
  const normalizedRooms = roomsData.product_pricing.map(p => {
    const category = roomsData.room_categories.find(c => c.id === Number(p.room_category_id)) || {};
    const type = roomsData.room_types.find(t => t.id === Number(p.room_type_id)) || {};

    const basePrice = p.adult_promo_price && parseFloat(p.adult_promo_price) > 0
      ? parseFloat(p.adult_promo_price)
      : parseFloat(p.adult_price);

    const maxPax = Number(type.max_pax || p.max_pax || 1);
    // Determine guests needed per room when booking multiple rooms.
    const perRoomNeeded = totalRoomsRequested > 0 ? Math.ceil(totalGuests / totalRoomsRequested) : totalGuests;
    // Allow using the same room type across requested rooms: each room must support perRoomNeeded guests
    const canAccommodate = maxPax >= perRoomNeeded;

    return {
      id: `nonstuba-${p.room_category_id}-${p.room_type_id}`,
      roomType: p.room_category || "Room",
      roomCat: p.room_type_name || "Room",
      mealType: p.room_category,
      price: basePrice * nights,
      cancellationPolicy: "NonRefundable",
      maxPax,
      canAccommodate,
      isHotelAvailable,
      isAvailable: isHotelAvailable && canAccommodate,
      paxMessage: !canAccommodate ? `Each room must support ${perRoomNeeded} guest(s); this room supports ${maxPax}.` : null,
      rawPricing: p,
    };
  });

  if (normalizedRooms.length === 0 || (!isHotelAvailable && allotments.length === 0)) {
    throw new Error("No rooms available for your dates");
  }

  const availableRooms = normalizedRooms.filter(r => r.isAvailable);
  const lowestPriceRoom = availableRooms.length > 0 ? availableRooms[0] : normalizedRooms[0];

  const fullData = {
    ...hotelData,
    normalizedHotelData: {
      ...hotelData.normalizedHotelData,
      starting_price: lowestPriceRoom.price,
      price: lowestPriceRoom.price,
      currency: hotelData.normalizedHotelData.currency || "SGD"
    },
    normalizedRoomData: normalizedRooms,
    lowestPriceRoom,
    allotments, // ← pass to RoomTypes
    totalGuests,
    totalRoomsRequested,
  };

  setAccommodation(fullData);
  setIsNonStuba(true);
  if (lowestPriceRoom?.isAvailable) {
    setSelectedRoom(lowestPriceRoom);
  }

  // Slug fix
  const actualSlug = slugify(fullData.normalizedHotelData.title || "accommodation");
  if (productname !== actualSlug) {
    localizedReplace(
      { pathname: "/accommodation/[productname]/[id]", query: { link_type_id: urlLinkTypeId } },
      { pathname: `/accommodation/${actualSlug}/${accommodationId}`, query: { link_type_id: urlLinkTypeId } },
      { shallow: true }
    );
  }

  setLoading(false);
  return;
}

      // ——————————————————— STUBA ———————————————————
      console.log("Stuba flow");

      const payload = {
        nationality: searchParams?.nationality || "SG",
        nights: searchParams?.nights || 1,
        refund_policy: searchParams?.refund_policy || "all",
        region: false,
        rooms: searchParams?.rooms || [{ adult: 2, children: [] }],
        stars: searchParams?.stars || "0",
        visitor_id: $helpers.getVisitorId(),
        start_date: searchParams?.start_date || new Date().toISOString().split("T")[0],
        end_date: searchParams?.end_date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
        hotel_id: accommodationId,
      };

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );

      if (!res.ok) throw new Error("Network error");
      const data = await res.json();

      // ... find matched hotel, normalize ...
      const results = data?.accommodations || data?.data || data || [];
      let matched = null;
      if (Array.isArray(results) && results.length > 0) {
        matched = results.find((r) => {
          const candidateId = r?.Hotel_Data?.id || r?.Hotel?.["@attributes"]?.id || r?.stuba_id || r?.hotel_id || null;
          return candidateId && String(candidateId) === String(accommodationId);
        }) || results[0];
      } else if (results && typeof results === 'object') {
        matched = results;
      }

      if (!matched) throw new Error("Not found");

      const normalizedData = normalizeAccommodationData(matched);
      setAccommodation(normalizedData);
      setIsNonStuba(false);

      if (normalizedData.lowestPriceRoom) {
        setSelectedRoom(normalizedData.lowestPriceRoom);
      }

  // Save quote ID (if present on matched result)
  const quoteId = matched?.["@attributes"]?.hotelQuoteId || matched?.Hotel_Data?.["@attributes"]?.hotelQuoteId || matched?.hotelQuoteId || null;
  if (quoteId) sessionStorage.setItem("hotelQuoteId", String(quoteId));

      // Slug (no link_type_id)
      const actualSlug = slugify(normalizedData.normalizedHotelData.title || "accommodation");
      if (productname !== actualSlug) {
        localizedReplace(
          { pathname: "/accommodation/[productname]/[id]", query: {} },
          { pathname: `/accommodation/${actualSlug}/${accommodationId}`, query: {} }
        );
      }
    } catch (err) {
      console.error("fetch error:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  fetchAccommodationDetail();
}, [
  router.isReady,
  accommodationId,
  router.query.link_type_id,
  searchParams,
  selectedRegion
]);

  if (loading) {
    return (
      <Layout>
        <div className="flex bg-black items-center justify-center min-h-screen">
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
  const totalGuests = (searchParams?.rooms || []).reduce((sum, r) => sum + (Number(r.adult) || 0) + (Array.isArray(r.children) ? r.children.length : 0), 0) || 1;

  return (
    <Layout>
      <Head>
        <title>
          {hotelData?.title || "Accommodation Detail"} | Explore Singapore
        </title>
      </Head>

      <div className="min-h-screen bg-black text-white pt-[80px] md:pt-10 pb-12">
        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <AccommodationHeader hotelData={hotelData} />

          <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8 mt-6">
            <AccommodationGallery hotelData={hotelData} />
            <AccommodationInfoCard
              hotelData={hotelData}
              startingPrice={hotelData.starting_price}
              allRooms={accommodation.normalizedRoomData}
              selectedRoom={selectedRoom}
              currency={hotelData.currency} // Pass currency from hotelData
              onScrollToOptions={handleScrollToOptions}
              onProceedBooking={handleProceedBooking}
              nights={nights}
              totalGuests={totalGuests}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <AccommodationRooms
            isNonStuba={isNonStuba}
            allRooms={accommodation.normalizedRoomData}
            normalizedRoomData={accommodation.normalizedRoomData}
            room_categories={accommodation.room_categories}
            room_types={accommodation.room_types}
            productId={accommodationId}
            currency={hotelData.currency} // Pass currency from hotelData
            onRoomSelect={handleRoomSelect}
            nights={nights}
            allotments={accommodation.allotments}
            selectedRoom={selectedRoom}
          />
          <AccommodationMap hotelData={hotelData} />
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