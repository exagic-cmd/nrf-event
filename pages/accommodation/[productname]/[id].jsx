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
    // Your existing normalizeAccommodationData function
    if (!data) return null;

    const hotelData = data.Hotel_Data || data;
    const roomData = data.Result || data.rooms || [];
    console.log('hotelData',hotelData)
    
    let images = [];
    try {
      if (hotelData.media) {
        console.log(hotelData.media)
        const mediaArray =hotelData.media;
          console.log('mediaArray',mediaArray)
        images = mediaArray.map(media => ({
          url: media.image,
          thumb: media.thumb,
          type: media.type
        }));
      }
    } catch (e) {
      console.warn("Failed to parse media:", e);
    }
    console.log('images',images)
    let address = hotelData?.address;
    // try {
    //   if (hotelData.address) {
    //     address = JSON.parse(hotelData.address);
    //   }
    // } catch (e) {
    //   console.warn("Failed to parse address:", e);
    // }

    let region = {};
    try {
      if (hotelData.region) {
        region = JSON.parse(hotelData.region);
      }
    } catch (e) {
      console.warn("Failed to parse region:", e);
    }

    let rating = {};
    try {
      if (hotelData.rating) {
        rating = JSON.parse(hotelData.rating);
      }
    } catch (e) {
      console.warn("Failed to parse rating:", e);
    }

    const roomsWithPrices = roomData.map(room => ({
      ...room,
      price: parseFloat(room.Room?.Price?.["@attributes"]?.amt || 0)
    }));

    const startingPrice = roomsWithPrices.length > 0 
      ? Math.min(...roomsWithPrices.map(room => room.price))
      : hotelData.price || 0;

    const lowestPriceRoom = roomsWithPrices.length > 0 
      ? roomsWithPrices.reduce((lowest, room) => 
          room.price < lowest.price ? room : lowest
        )
      : null;
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
        address: address,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        image: hotelData.image,
        images: images,
        type: hotelData.type,
        stars: hotelData.stars,
        amenities: hotelData.amenities,
        category_name: hotelData.category_name,
        region: region,
        rating: rating,
        starting_price: startingPrice,
        price: startingPrice,
        location: address || hotelData?.city_name || "",
        review_count: 0,
        features: hotelData.amenities ? hotelData.amenities.split(', ') : []
      },
      normalizedRoomData: roomData.map(room => ({
        id: room["@attributes"]?.id,
        roomType: room.Room?.RoomType?.["@attributes"]?.text || "Standard Room",
        mealType: room.Room?.MealType?.["@attributes"]?.text || "Room Only",
        price: parseFloat(room.Room?.Price?.["@attributes"]?.amt || 0),
        cancellationPolicy: room.Room?.CancellationPolicyStatus || "NonRefundable",
        roomCode: room.Room?.RoomType?.["@attributes"]?.code,
        mealCode: room.Room?.MealType?.["@attributes"]?.code
      })),
      lowestPriceRoom: lowestPriceRoom ? {
        id: lowestPriceRoom["@attributes"]?.id,
        roomType: lowestPriceRoom.Room?.RoomType?.["@attributes"]?.text || "Standard Room",
        mealType: lowestPriceRoom.Room?.MealType?.["@attributes"]?.text || "Room Only",
        price: lowestPriceRoom.price,
        cancellationPolicy: lowestPriceRoom.Room?.CancellationPolicyStatus || "NonRefundable",
        roomCode: lowestPriceRoom.Room?.RoomType?.["@attributes"]?.code,
        mealCode: lowestPriceRoom.Room?.MealType?.["@attributes"]?.code
      } : null
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
    
    // Check if this accommodation is already in cart
    const exists = items.some(item => 
      item.tourId === accommodationId && item.type === 'accommodation'
    );
    
    if (exists) {
      setAlreadyModal(true);
      return;
    }
    
    console.log("🚀 Proceeding to booking with room:", selectedRoom);
    
    // Store booking data in sessionStorage for the booking page
    const bookingData = {
      accommodationId: accommodationId,
      hotelData: hotelData,
      selectedRoom: selectedRoom,
      searchParams: searchParams,
      nights: searchParams?.nights || 1,
      checkIn: searchParams?.start_date,
      checkOut: searchParams?.end_date,
      guests: searchParams?.rooms?.[0]?.adult || 2,
      timestamp: new Date().toISOString()
    };
    
    sessionStorage.setItem("accommodationBookingData", JSON.stringify(bookingData));
    sessionStorage.setItem("fromAccommodationDetail", "true");
    
    // Navigate to booking page
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

  // Fetch accommodation data (keep your existing useEffect)
  useEffect(() => {
    const fetchAccommodationDetail = async () => {
      if (!accommodationId) return;

      setLoading(true);
      setError(null);

      try {
        const payload = {
          nationality: searchParams?.nationality || "SG",
          nights: searchParams?.nights || 1,
          refund_policy: searchParams?.refund_policy || "all",
          region: searchParams?.region || selectedRegion || null,
          rooms: searchParams?.rooms || [{ adult: 2, children: [] }],
          stars: searchParams?.stars || "0",
          visitor_id: searchParams?.visitor_id || "abc123",
          start_date: searchParams?.start_date || new Date().toISOString().split("T")[0],
          end_date: searchParams?.end_date || new Date(Date.now() + 86400000).toISOString().split("T")[0],
          hotel_id: false,
        };

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/customer/stuba`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          }
        );

        if (!res.ok) throw new Error("Network response was not ok");
        const data = await res.json();

        let allResults = [];
        if (Array.isArray(data?.accommodations)) {
          allResults = data.accommodations;
        } else if (Array.isArray(data?.data)) {
          allResults = data.data;
        } else if (Array.isArray(data)) {
          allResults = data;
        } else if (typeof data === "object" && data !== null) {
          allResults = Object.values(data);
        }

        const matched = allResults.find((item) => {
          const id = item?.Hotel_Data?.stuba_id || item?.stuba_id || item?.hotel_id || item?.Hotel?.["@attributes"]?.id;
          return String(id) === String(accommodationId);
        });

        if (!matched) {
          setError("Accommodation not found");
          setAccommodation(null);
        } else {
          const normalizedData = normalizeAccommodationData(matched);
          setAccommodation(normalizedData);

          if (normalizedData.lowestPriceRoom) {
            setSelectedRoom(normalizedData.lowestPriceRoom);
          }

          const actualSlug = slugify(normalizedData.normalizedHotelData.title || "accommodation");
          if (productname !== actualSlug) {
            const newAs = `/accommodation/${actualSlug}/${accommodationId}`;
            localizedReplace(`/accommodation/[productname]/[id]`, newAs);
          }
        }
      } catch (err) {
        console.error("❌ fetchAccommodationDetail error:", err);
        setError("Failed to fetch accommodation details");
      } finally {
        setLoading(false);
      }
    };

    if (router.isReady) {
      fetchAccommodationDetail();
    }
  }, [router.isReady, accommodationId, searchParams, selectedRegion]);

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
              allRooms={roomData}
              selectedRoom={selectedRoom}
              currency="USD"
              onScrollToOptions={handleScrollToOptions}
              onProceedBooking={handleProceedBooking}
              nights={nights}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <AccommodationRooms 
            allRooms={roomData} 
            currency="USD"
            onRoomSelect={handleRoomSelect}
            nights={nights}
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