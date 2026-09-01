// components/accommodations/AccommodationDetailPage.jsx
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
import { getFullImageUrl } from "@/utils/imageService";
import helpers from "@/lib/helpers";
import { Hotel } from "lucide-react";

const normalizeStubaAccommodationData = (stubaItem) => {
  if (!stubaItem || !stubaItem.Hotel_Data) return null;

  const { Hotel_Data, Result } = stubaItem;
  const currency = stubaItem.currency || Hotel_Data.currency
  const hotelImages = (Hotel_Data.media || []).map(m => m.image);
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
    currency: Hotel_Data.currency || "USD",
    short_desc: Hotel_Data.short_desc,
    long_desc: Hotel_Data.description,
    country: Hotel_Data.country_name,
    city: Hotel_Data.city_name,
    address: Hotel_Data.address,
    latitude: Hotel_Data.latitude,
    longitude: Hotel_Data.longitude,
    image: getFullImageUrl(Hotel_Data.media?.[0]?.image || Hotel_Data.image) || "",
    images: (Hotel_Data.media || []).map(m => ({
      url: getFullImageUrl(m.image),
      thumb: getFullImageUrl(m.image),
      type: "photo",
    })),
    stars: 0,
    amenities: Hotel_Data.amenities || [],
    review_count: 0,
    rating: { rating: 0 },
    location: Hotel_Data.address || Hotel_Data.city_name,
  };

  const normalizedRooms = Object.entries(Result || {}).map(([roomTypeName, options]) => {
    // options is an object keyed by option ids (e.g. "28767155-0")
    const ratePlans = Object.entries(options).map(([optionId, option]) => {
      const rooms = option.Rooms || [];
      const room = rooms[0] || {};
      const price = parseFloat(option.TotalPrice || room?.Price?.["@attributes"]?.amt || 0);
      const isRefundable = room?.CancellationPolicyStatus === "Refundable";

      return {
        amenities: hotelAmenities,
        images: hotelImages,
        id: optionId,
        roomTypeId: room?.RoomType?.["@attributes"]?.code,
        roomTypeName,
        name: `${roomTypeName} — ${room?.MealType?.["@attributes"]?.text}`,
        bedDetails: null,
        smokingType: null,
        mealType: room?.MealType?.["@attributes"]?.text,
        mealPlanCode: room?.MealType?.["@attributes"]?.code,
        price,
        originalPrice: price,
        hasDiscount: false,
        cancellationPolicy: isRefundable ? "Free Cancellation" : "Non-Refundable",
        occupancyAdults: 2,
        occupancyChildren: 0,
        isAvailable: true,
        canAccommodate: true,
        rawPricing: {
          ...option,
          pricing: {
            total: price,
            currency,
            nights: [],
          },
        },
        images: [],
        view: null,
        pricing: { total: price, currency, nights: [] },
      };
    });

    return {
      id: ratePlans[0]?.roomTypeId || roomTypeName,
      name: roomTypeName,
      size: null,
      view: null,
      images: [], 
      bedDetails: null,
      images: hotelImages,
      ratePlans,
      amenities: hotelAmenities,
    };
  });

  const allRatePlans = normalizedRooms.flatMap(r => r.ratePlans);
  const validPrices = allRatePlans.map(r => r.price).filter(p => p > 0);
  const startingPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

  normalizedHotelData.starting_price = startingPrice;
  normalizedHotelData.price = startingPrice;

  const lowestPriceRoom = allRatePlans.reduce((low, r) =>
    (!low || r.price < low.price) ? r : low, null
  );

  return {
    normalizedHotelData,
    normalizedRoomData: normalizedRooms,
    lowestPriceRoom,
    // Mirror the shape the components expect for hotel-level data
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

export default function AccommodationDetailPage() {
  const { t } = useTranslation(["common", "accommodation"]);
  const router = useRouter();
  const { id: accommodationId, productname, link_type_id } = router.query;
  const { localizedReplace, localizedPush } = useLocalizedRouter();
  const {
    selectedRegion,
    searchParams,
    isLoading,
    setSearchParams,
  } = useAccommodationsStore();

  const { items, removeItem } = useCartStore();
  const { openDrawer, setDrawerContent } = useDrawerStore();
  const addRecentlyViewed = useRecentlyViewedStore((state) => state.addRecentlyViewed);

  const lastFetchedIdRef = useRef(null);

  const [accommodation, setAccommodation] = useState(null);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alreadyModal, setAlreadyModal] = useState(false);

  const slugify = useCallback((text) => {
    // Ensure text is a string before attempting operations
    if (typeof text !== 'string' || text === null || text === undefined) {
      return "";
    }
    return text.toLowerCase()
      .replace(/\s+/g, "-")       // Replace spaces with -
      .replace(/[^\w-]+/g, "");  // Remove all non-word chars
  }, []);

  // Normalize accommodation data function (keep your existing implementation)
  const normalizeAccommodationData = (data) => {
    if (!data || !data.hotel) return null;

    const { hotel, rooms: roomData, meta } = data;

    // Helper: Calculate total payable and original price from per-night pricing
    const calculateRatePlanPrice = (pricing) => {
      const nights = pricing?.nights || [];
      if (!Array.isArray(nights) || nights.length === 0) {
        return {
          total: Number(pricing?.total || 0),
          original: Number(pricing?.total || 0),
          hasDiscount: false,
        };
      }

      let originalTotal = 0;
      let discountedTotal = 0;

      nights.forEach((night) => {
        const price = Number(night.price || 0);
        const promo = Number(night.promo_price || 0);
        originalTotal += price;
        discountedTotal += promo > 0 ? promo : price;
      });

      return {
        total: discountedTotal,
        original: originalTotal,
        hasDiscount: discountedTotal < originalTotal,
      };
    };
    const detectedCurrency =
      roomData?.[0]?.rate_plans?.[0]?.pricing?.currency ||
      "-";
    // 1. Normalize Hotel Data
    const normalizedHotelData = {
      currency,
      id: hotel.id,
      title: hotel.name,
      name: hotel.name,
      currency: detectedCurrency,
      short_desc: hotel.short_desc,
      long_desc: hotel.long_desc,
      country: hotel.country,
      city: hotel.city,
      address: hotel.address,
      latitude: hotel.latitude,
      longitude: hotel.longitude,
      image: hotel.photos?.[0]?.image || "",
    images: (hotel.photos || []).map(p => ({ url: getFullImageUrl(p.image), thumb: getFullImageUrl(p.image), type: 'photo' })),
      stars: parseFloat(hotel.star_rating) || 0,
      amenities: data.hotel.amenities || [],
      review_count: 0,
      rating: { rating: parseFloat(hotel.star_rating) || 0 },
      location: hotel.address || hotel.city,
    };

    // 2. Normalize Room Data
    const normalizedRooms = (roomData || []).map(room => {
      const roomRatePlans = (room.rate_plans || []).map(plan => {
        const priceInfo = calculateRatePlanPrice(plan.pricing);

        return {
          id: `${plan.id}`,
          roomTypeId: room.id,
          roomTypeName: room.name,
          name: plan.name, // e.g., "Standard Twin with breakfast"
          bedDetails: plan.bed_type?.name || room.beds?.[0]?.bed_type_title,
          smokingType: plan.smoking_type,
          mealType: plan.meal?.title || plan.name,
          mealPlanCode: plan.meal_plan_code,
          price: priceInfo.total,           // ← This is the discounted price (payable)
          originalPrice: priceInfo.original, // ← Original full price (for strikethrough)
          hasDiscount: priceInfo.hasDiscount,
          cancellationPolicy: plan.cancellation_policy?.name || (plan.is_refundable ? "Free Cancellation" : "Non-Refundable"),
          occupancyAdults: plan.occupancy_adults,
          occupancyChildren: plan.occupancy_children,
          isAvailable: true,
        canAccommodate: true, 
          rawPricing: plan,
          images: (room.images || []).map(img => img.image),
          view: room.view,
          pricing: plan.pricing, // Keep full pricing for fallback
        };
      });

      return {
        id: room.id,
        name: room.name,
        size: room.size,
        view: room.view,
      images: (room.images || []).map(img => getFullImageUrl(img.image)),
        bedDetails: room.beds?.[0]?.bed_type_title,
        ratePlans: roomRatePlans,
        amenities: room.amenities || [], // Add room-specific amenities
      };
    });

    // 3. Find lowest payable price (discounted if available)
    const allRatePlans = normalizedRooms.flatMap(r => r.ratePlans);
    const validPrices = allRatePlans.map(r => r.price).filter(p => p > 0);
    const startingPrice = validPrices.length > 0 ? Math.min(...validPrices) : 0;

    normalizedHotelData.starting_price = startingPrice;
    normalizedHotelData.price = startingPrice;

    const lowestPriceRoom = allRatePlans.reduce((low, r) =>
      (!low || r.price < low.price) ? r : low, null
    );

    return {
      ...data,
      normalizedHotelData,
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
  // Accept an optional `roomArg` so callers (e.g. RoomTypes) can pass the room directly
  const handleProceedBooking = (roomArg = null) => {
    const roomToUse = roomArg || selectedRoom;
    if (!roomToUse) {
      alert("Please select a room first");
      return;
    }

    // Ensure local selectedRoom state reflects the room being booked
    if (!roomArg) {
      // nothing to do, selectedRoom already set
    } else {
      setSelectedRoom(roomToUse);
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
      hotelData: accommodation.normalizedHotelData,
      selectedRoom: roomToUse,
      searchParams,
      nights: searchParams?.nights || 1,
      checkIn: searchParams?.start_date,
      checkOut: searchParams?.end_date,
      isStuba: true,
      link_type_id: 9,
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
      // Guard against double invocation (React 18 StrictMode) and same-ID re-renders
      if (lastFetchedIdRef.current === accommodationId) return;
      lastFetchedIdRef.current = accommodationId;

      setLoading(true);
      setError(null);

      try {
        console.log("Stuba Detail Page - Hotel ID:", accommodationId);

        // Get search params from store or default
        let effectiveSearchParams = { ...searchParams };

        // If searchParams are missing, get from sessionStorage or use defaults
        if (!searchParams || !searchParams.start_date || !searchParams.end_date) {
          const savedPayload = sessionStorage.getItem("stubaAccommodationPayload");
          if (savedPayload) {
            console.log("Found saved Stuba payload in sessionStorage.");
            const parsedPayload = JSON.parse(savedPayload);
            effectiveSearchParams = {
              start_date: parsedPayload.start_date,
              end_date: new Date(new Date(parsedPayload.start_date).getTime() + (parsedPayload.nights || 2) * 86400000).toISOString().split("T")[0],
              rooms: parsedPayload.rooms || [{ adult: 2, children: [] }],
              nights: parsedPayload.nights || 2,
            };
          } else {
            console.log("No search params or saved payload. Using default.");
            effectiveSearchParams = {
              start_date: new Date().toISOString().split("T")[0],
              end_date: new Date(Date.now() + 2 * 86400000).toISOString().split("T")[0], // Default to 2 nights
              rooms: [{ adult: 2, children: [] }],
              nights: 2,
            };
          }
          useAccommodationsStore.getState().setSearchParams(effectiveSearchParams);
        }

        // Calculate total pax
        const rooms = effectiveSearchParams.rooms || [{ adult: 2, children: [] }];
        const pax = rooms.reduce((sum, r) => {
          const adults = Number(r.adult) || 0;
          const children = Array.isArray(r.children) ? r.children.length : 0;
          return sum + adults + children;
        }, 0);

        // Build Stuba API payload
        const payload = {
          region: null,
          hotel_id: accommodationId,
          start_date: effectiveSearchParams.start_date,
          nights: effectiveSearchParams.nights || 2,
          rooms: rooms,
          nationality: "all",
          stars: null,
          pax: pax,
        };

        console.log("Calling Stuba API with payload:", payload);

        // Call Stuba API
        const res = await fetch(
          `${helpers.getApiAbsoluteURL("customer/stuba")}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

        if (!res.ok) throw new Error("Stuba API failed");

        const responseData = await res.json();

        // responseData.data is an array — find the right hotel or take first
        const stubaItem = responseData.data?.find(
          item => String(item.Hotel_Data?.stuba_id) === String(accommodationId)
        ) || responseData.data?.[0];

        if (!stubaItem) throw new Error("No Stuba hotel data found");

        const normalizedData = normalizeStubaAccommodationData(stubaItem);
        if (!normalizedData) throw new Error("Failed to normalize Stuba data");

        setAccommodation(normalizedData);

        // Fix slug if needed
        const actualSlug = slugify(
          normalizedData?.normalizedHotelData.title || "accommodation"
        );

        if (productname !== actualSlug) {
          localizedReplace(
            {
              pathname: "/hotel/[productname]/[id]",
              query: {},
            },
            {
              pathname: `/hotel/${actualSlug}/${accommodationId}`,
              query: {},
            },
            { shallow: true }
          );
        }
      } catch (err) {
        console.error("Stuba fetch error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAccommodationDetail();
  }, [router.isReady, accommodationId]);

  useEffect(() => {
    if (accommodation?.normalizedHotelData && accommodation.normalizedHotelData.title) {
      const { id, title, image, stars, rating } = accommodation.normalizedHotelData;
      // Get the lowest total_promo price from all rate plans
      let lowestPrice = accommodation.normalizedHotelData.starting_price; // fallback

      if (accommodation.normalizedRoomData && accommodation.normalizedRoomData.length > 0) {
        // Extract all total_promo prices from all rate plans
        const allPromoPrices = accommodation.normalizedRoomData.flatMap(room =>
          room.ratePlans?.map(plan => plan.rawPricing?.pricing?.total_promo || plan.price || 0) || [] 
        ).filter(price => price > 0);

        if (allPromoPrices.length > 0) {
          lowestPrice = Math.min(...allPromoPrices);
        }
      }

      addRecentlyViewed({
        id: id,
        name: title,
        image: image,
        hotel_id: accommodationId,
        price: lowestPrice,
        rating: stars || rating?.rating || 0,
        currency: hotelData?.currency,
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
  const totalGuests = (searchParams?.rooms || []).reduce((sum, r) => sum + (Number(r.adult) || 0) + (Array.isArray(r.children) ? r.children.length : 0), 0) || 1;
  // Use the number of rooms the user actually requested, not from meta
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
          <div className="grid grid-cols-1 lg:grid-cols-12 w-full gap-6 lg:gap-8"> {/* New grid container for main content and sidebar */}
            <div className="lg:col-span-9"> {/* Main content area */}
              {/* Accommodation Header and Info Card */}
              <div className="flex flex-col bg-surface p-2 rounded-2xl lg:flex-row justify-between gap-1"> {/* Removed max-w-6xl */}
                <AccommodationHeader hotelData={hotelData} />

                <AccommodationInfoCard
                  hotelData={hotelData}
                  startingPrice={hotelData.starting_price}
                  allRooms={accommodation.normalizedRoomData}
                  selectedRoom={selectedRoom}
                  ratePlans={roomData?.flatMap(r => r.ratePlans) || []}
                  currency={hotelData.currency}
                  onScrollToOptions={handleScrollToOptions}
                  onProceedBooking={handleProceedBooking}
                  nights={nights}
                  roomsCount={roomsCount}
                />
              </div>

              {/* Accommodation Gallery */}
              <div className="mt-2"> {/* This div previously had grid and col-span, now just a wrapper */}
                <AccommodationGallery hotelData={accommodation} />
              </div>
            </div>
            <div className="lg:col-span-3 mt-5 lg:mt-0"> {/* RecentlyViewed sidebar */}
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
            link_type_id={9}
          />
          <div className="grid grid-cols-1">
            <AccommodationMap hotelData={hotelData} landmarks={accommodation?.hotel?.nearby_landmarks} />
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