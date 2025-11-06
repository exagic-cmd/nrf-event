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
import AccommodationHeader from "@/components/accommodations/AccommodationHeader";
import AccommodationGallery from "@/components/accommodations/ImageGallery";
import AccommodationInfoCard from "@/components/accommodations/AccommodationInfoCard";
import AccommodationRooms from "@/components/accommodations/RoomTypes";
import AccommodationMap from "@/components/accommodations/AccommodationMapSection";

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
  const { localizedReplace } = useLocalizedRouter();

  const {
    selectedRegion,
    searchParams,
    isLoading,
    setSearchParams,
  } = useAccommodationsStore();

  const [accommodation, setAccommodation] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  // ✅ Helper function to normalize accommodation data
  const normalizeAccommodationData = (data) => {
    if (!data) return null;

    const hotelData = data.Hotel_Data || data;
    const roomData = data.Result || data.rooms || [];
    
    // ✅ Extract images from media field
    let images = [];
    try {
      if (hotelData.media) {
        const mediaArray = JSON.parse(hotelData.media);
        images = mediaArray.map(media => ({
          url: media.url,
          thumb: media.thumb,
          type: media.type
        }));
      }
    } catch (e) {
      console.warn("Failed to parse media:", e);
    }

    // ✅ Parse address
    let address = {};
    try {
      if (hotelData.address) {
        address = JSON.parse(hotelData.address);
      }
    } catch (e) {
      console.warn("Failed to parse address:", e);
    }

    // ✅ Parse region
    let region = {};
    try {
      if (hotelData.region) {
        region = JSON.parse(hotelData.region);
      }
    } catch (e) {
      console.warn("Failed to parse region:", e);
    }

    // ✅ Parse rating
    let rating = {};
    try {
      if (hotelData.rating) {
        rating = JSON.parse(hotelData.rating);
      }
    } catch (e) {
      console.warn("Failed to parse rating:", e);
    }

    // ✅ Calculate starting price from rooms
    const startingPrice = roomData.length > 0 
      ? Math.min(...roomData.map(room => parseFloat(room.Room?.Price?.["@attributes"]?.amt || 0)))
      : hotelData.price || 0;

    return {
      ...data,
      normalizedHotelData: {
        id: hotelData.id,
        stuba_id: hotelData.stuba_id,
        title: hotelData.title,
        name: hotelData.title, // For components expecting 'name'
        description: hotelData.description,
        country: hotelData.country,
        city: hotelData.city,
        address: address,
        latitude: hotelData.latitude,
        longitude: hotelData.longitude,
        image: hotelData.image,
        images: images,
        type: hotelData.type,
        stars: hotelData.stars,
        amenities: hotelData.amenities,
        region: region,
        rating: rating,
        starting_price: startingPrice,
        price: startingPrice, // For backward compatibility
        // Additional fields for components
        location: address.address1 || hotelData.city || "",
        review_count: 0, // You might need to get this from API
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
      }))
    };
  };

  useEffect(() => {
    const fetchAccommodationDetail = async () => {
      if (!accommodationId) return;

      setLoading(true);
      setError(null);

      try {
        // ✅ Dynamic payload similar to Zustand store
        const payload = {
          nationality: searchParams?.nationality || "SG",
          nights:
            searchParams?.nights ||
            (searchParams?.start_date && searchParams?.end_date
              ? Math.ceil(
                  (new Date(searchParams.end_date) -
                    new Date(searchParams.start_date)) /
                    (1000 * 60 * 60 * 24)
                )
              : 1),
          refund_policy: searchParams?.refund_policy || "all",
          region: searchParams?.region || selectedRegion || null,
          rooms: searchParams?.rooms || [{ adult: 2, children: [] }],
          stars: searchParams?.stars || "0",
          visitor_id: searchParams?.visitor_id || "abc123",
          start_date:
            searchParams?.start_date ||
            new Date().toISOString().split("T")[0],
          end_date:
            searchParams?.end_date ||
            new Date(Date.now() + 86400000).toISOString().split("T")[0],
          hotel_id: false,
        };

        console.log("🌐 Fetching /customer/stuba with payload:", payload);

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
        console.log("🏨 Full accommodations response:", data);

        // ✅ Normalize structure safely
        let allResults = [];

        if (Array.isArray(data?.accommodations)) {
          allResults = data.accommodations;
        } else if (Array.isArray(data?.data)) {
          allResults = data.data;
        } else if (Array.isArray(data)) {
          allResults = data;
        } else if (typeof data === "object" && data !== null) {
          // if backend returned object of hotels keyed by something
          allResults = Object.values(data);
        }

        console.log("📦 Normalized results length:", allResults.length);

        // ✅ Match by stuba_id (string-safe)
        const matched = allResults.find((item) => {
          const id =
            item?.Hotel_Data?.stuba_id ||
            item?.stuba_id ||
            item?.hotel_id ||
            item?.Hotel?.["@attributes"]?.id;
          return String(id) === String(accommodationId);
        });

        if (!matched) {
          console.warn("⚠️ No accommodation found for stuba_id:", accommodationId);
          setError("Accommodation not found");
          setAccommodation(null);
        } else {
          console.log("✅ Found accommodation:", matched);
          
          // ✅ Normalize the data for components
          const normalizedData = normalizeAccommodationData(matched);
          setAccommodation(normalizedData);

          // 🔄 Auto-fix slug mismatch
          const actualSlug = slugify(
            normalizedData.normalizedHotelData.title || "accommodation"
          );
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

  // ---- UI STATES ----
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

  // Use normalized data for components
  const hotelData = accommodation.normalizedHotelData;
  const roomData = accommodation.normalizedRoomData;

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
              // startingPrice={hotelData.starting_price}
              allRooms={roomData}
            />
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <AccommodationRooms allRooms={roomData} />
          <AccommodationMap hotelData={hotelData} />
        </div>
      </div>
    </Layout>
  );
}