import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import Layout from "@/components/layout/Layout"
import LoaderSvg from "@/components/common/Loader2Svg"
import NoProductsFound from "@/components/common/NoProductsFound"
import { useCartStore } from "@/store/useCartStore"
import { useDrawerStore } from "@/store/useDrawerStore"
import { useAccommodationsStore } from "@/store/useAccommodationsStore"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useTranslation } from "next-i18next";
import AccommodationHeader from "@/components/accommodations/AccommodationHeader"
import ImageGallery from "@/components/accommodations/ImageGallery"
import AccommodationInfoCard from "@/components/accommodations/AccommodationInfoCard"
import AccommodationAmenities from "@/components/accommodations/AccommodationAmenities"
import AccommodationDescription from "@/components/accommodations/AccommodationDescription"
import RoomTypes from "@/components/accommodations/RoomTypes"
import AccommodationMapSection from "@/components/accommodations/AccommodationMapSection"
import BookingModal from "@/components/accommodations/BookingModal"
import { ChevronDown, ChevronRight } from "lucide-react"

export async function getServerSideProps(context) {
  const { productname, id: accommodationId } = context.params;
  const locale = context.locale || context.query.locale || 'en';
  
  const translations = await serverSideTranslations(locale, ["common", "accommodation"]);
  
  let accommodationData = null;
  let notFound = false;

  if (accommodationId) {
    try {
      // Mock data based on your API structure
      const mockAccommodationData = {
        status: true,
        data: [
          {
            Hotel_Data: {
              id: 677,
              stuba_id: "167895",
              title: "Al Khaleej Hotel",
              description: "This is a popular budget hotel that is suitable for guests looking to be central without breaking the bank.",
              country: "UNITED ARAB EMIRATES",
              city: "DEIRA DUBAI",
              address: JSON.stringify({
                fax: "97142237140",
                tel: "9714211144",
                url: "",
                zip: "",
                city: "DEIRA DUBAI",
                email: "khotel@alkhaleejhotels.ae",
                state: "",
                country: "UNITED ARAB EMIRATES",
                address1: "OFF AL MAKTOUM STR.Naser Square, PO BOX 10559",
                address2: "",
                address3: "",
                latitude: "25.268281",
                longitude: "55.303394"
              }),
              latitude: "25.268281",
              longitude: "55.303394",
              image: "/RXLStagingImages/7/DXB-ALK4hotel_Exterior_1.jpg",
              type: "Hotel",
              stars: 3,
              amenities: "Safe, TV in room, Air conditioning, Clothing iron, Mini-bar, Room service, Hair dryer",
              rating: JSON.stringify({
                score: 30,
                system: "Stars",
                description: "Three star"
              }),
              media: JSON.stringify([
                {
                  url: "/RXLStagingImages/7/DXB-ALK4hotel_Exterior_1.jpg",
                  type: "ExternalViewOfTheHotel",
                  thumb: "/RXLStagingImages/7/DXB-ALK4hotel_Exterior_1_thumb.jpg"
                }
              ]),
              descriptions: JSON.stringify([
                {
                  text: "This is a popular budget hotel that is suitable for guests looking to be central without breaking the bank.",
                  type: "General"
                }
              ]),
              is_valid: 1,
              is_active: 1
            },
            Result: [
              {
                "@attributes": {
                  id: "28202355-81"
                },
                Room: {
                  RoomType: {
                    "@attributes": {
                      code: "1060866",
                      text: "Double With Balcony"
                    }
                  },
                  MealType: {
                    "@attributes": {
                      code: "1000041",
                      text: "Room only"
                    }
                  },
                  Price: {
                    "@attributes": {
                      amt: "505.00"
                    }
                  },
                  CancellationPolicyStatus: "NonRefundable"
                }
              }
            ],
            Hotel: {
              "@attributes": {
                id: "167895",
                name: "Al Khaleej"
              }
            },
            "@attributes": {
              hotelQuoteId: "28202355_167895"
            }
          }
        ],
        currency: "USD",
        status: true
      };

      accommodationData = mockAccommodationData;

      // If using real API, uncomment below:
      /*
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/accommodations/${accommodationId}`);
      if (response.ok) {
        accommodationData = await response.json();
      } else {
        notFound = true;
      }
      */

          if (!accommodationData?.data?.[0]?.Hotel_Data) {
            // API returned but payload is missing expected structure — treat as not found
            notFound = true;
          }
    } catch (error) {
      // Network or unexpected error while fetching on server — don't force a 404 so the
      // client can attempt to fetch via the store after hydration.
      console.error("SSR Data Fetching Error:", error);
      accommodationData = null;
    }
  } else {
    notFound = true;
  }

  if (notFound) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      ...translations,
      accommodationData,
      accommodationId,
      productname,
    },
  }
}

// Safe JSON parse function
const safeJsonParse = (str, fallback = null) => {
  try {
    return JSON.parse(str);
  } catch (error) {
    console.error("JSON parse error:", error);
    return fallback;
  }
};

const AccommodationDetailPage = ({ accommodationData, accommodationId, productname }) => {
  const { t } = useTranslation("common", "accommodation");
  const fetchAccommodations = useAccommodationsStore((s) => s.fetchAccommodations);
  const { items, removeItem } = useCartStore();
  const { openDrawer, setDrawerContent } = useDrawerStore();
  const { localizedPush, localizedReplace } = useLocalizedRouter();
  const router = useRouter();
  
  const [accommodation, setAccommodation] = useState(accommodationData);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [alreadyModal, setAlreadyModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showContent, setShowContent] = useState(!!accommodationData?.data?.[0]?.Hotel_Data);
  const [isNavigating, setIsNavigating] = useState(false);

  const roomOptionsRef = useRef(null);

  // Slugify function (same as your tour page)
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

  // Extract data from API response - CORRECTED structure
  const firstAccommodation = accommodation?.data?.[0];
  const hotelData = firstAccommodation?.Hotel_Data;
  const results = firstAccommodation?.Result ? 
    (Array.isArray(firstAccommodation.Result) ? firstAccommodation.Result : [firstAccommodation.Result]) : [];
  const currency = accommodation?.currency || 'USD';

  // Parse JSON fields safely
  const address = hotelData?.address ? safeJsonParse(hotelData.address, {}) : {};
  const rating = hotelData?.rating ? safeJsonParse(hotelData.rating, null) : null;
  const media = hotelData?.media ? safeJsonParse(hotelData.media, []) : [];
  const descriptions = hotelData?.descriptions ? safeJsonParse(hotelData.descriptions, []) : [];
  
  // Find general description
  const generalDescription = descriptions.find(desc => desc.type === 'General')?.text || hotelData?.description || '';
  
  // Calculate lowest price safely
  const lowestPrice = results.length > 0 ? results.reduce((min, result) => {
    const price = parseFloat(result.Room?.Price?.["@attributes"]?.amt) || 0;
    return price < min ? price : min;
  }, parseFloat(results[0]?.Room?.Price?.["@attributes"]?.amt) || 0) : 0;

  useEffect(() => {
    setAccommodation(accommodationData);
  }, [accommodationData]);

  // If SSR didn't provide accommodationData, fetch on client via store
  useEffect(() => {
    let mounted = true;
    const doFetch = async () => {
      if (accommodationData && accommodationData.data && accommodationData.data.length) return;
      if (!fetchAccommodations || !accommodationId) return;
      try {
        setIsLoading(true);
        const res = await fetchAccommodations(accommodationId);
        // fetchAccommodations may update store and/or return data
        if (mounted && res) {
          setAccommodation(res);
        }
      } catch (err) {
        // eslint-disable-next-line no-console
        console.error('fetchAccommodations failed', err);
      } finally {
        if (mounted) setIsLoading(false);
      }
    };

    doFetch();
    return () => { mounted = false; };
  }, [accommodationData, accommodationId, fetchAccommodations]);

  // URL correction logic (same as your tour page)
  useEffect(() => {
    // Ensure the URL slug matches the fetched hotel title.
    // Use either Hotel_Data.title or Hotel['@attributes'].name as fallback.
    const actualTitle = hotelData?.title || hotelData?.Hotel?.["@attributes"]?.name;
    if (actualTitle && router.isReady) {
      const { productname, id } = router.query;
      const actualSlug = slugify(actualTitle);

      // If productname is missing, equals 'detail', or doesn't match actual slug, replace it.
      if (!productname || productname === 'detail' || productname !== actualSlug) {
        const newAs = `/accommodation/${actualSlug}/${id}`;
        const newHref = `/accommodation/[productname]/[id]`;
        // Use localizedReplace if available; prefer shallow replace to avoid full reload
        try {
          localizedReplace(newHref, newAs, { shallow: true });
        } catch (err) {
          // Fallback to router.replace
          router.replace(newHref, newAs, { shallow: true });
        }
      }
    }
  }, [hotelData, router.isReady, router.query, localizedReplace, slugify]);

  useEffect(() => {
    if (accommodationData && hotelData) {
      const timer = setTimeout(() => {
        setShowContent(true);
      }, 100);
      return () => clearTimeout(timer);
    }
  }, [accommodationData, hotelData]);

  // Navigation event handlers
  useEffect(() => {
    const handleDone = () => setIsNavigating(false);
    router.events.on("routeChangeComplete", handleDone);
    router.events.on("routeChangeError", handleDone);
    return () => {
      router.events.off("routeChangeComplete", handleDone);
      router.events.off("routeChangeError", handleDone);
    }
  }, [router.events]);

  const scrollToRoomOptions = () => {
    roomOptionsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleProceedBooking = async () => {
    const exists = items.some((item) => item.tourId === accommodationId && item.category === "accommodation");
    if (exists) {
      setAlreadyModal(true);
    } else {
      setIsNavigating(true);
      sessionStorage.setItem("fromAccommodationDetail", "true");
      await new Promise((resolve) => setTimeout(resolve, 1200));
      localizedPush(`/accommodations/booking/${accommodationId}`);
    }
  };

  const handleRoomSelect = async (room) => {
    const roomId = room["@attributes"]?.id;
    const exists = items.some((item) => item.tourId === roomId && item.category === "accommodation");

    if (exists) {
      setAlreadyModal(true);
    } else {
      sessionStorage.setItem("fromAccommodationDetail", "true");
      setIsNavigating(true);
      await new Promise((resolve) => setTimeout(resolve, 1200));
      localizedPush(`/accommodations/booking/${accommodationId}?room=${roomId}`);
    }
  };

  const handleModalUpdate = async () => {
    const existingItem = items.find((item) => 
      item.tourId === accommodationId && item.category === "accommodation"
    );
    
    if (existingItem) {
      removeItem(existingItem.key);
    }

    sessionStorage.setItem("fromAccommodationDetail", "true");
    setAlreadyModal(false);
    setIsNavigating(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    localizedPush(`/accommodations/booking/${accommodationId}`);
  };

  const handleModalGoToCart = async () => {
    setAlreadyModal(false);
    const LoadedCartDrawerContent = (await import("@/components/common/CartDrawerContent")).default;
    setDrawerContent(<LoadedCartDrawerContent />);
    openDrawer();
  };

  if (!accommodationData || !hotelData) {
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

  if (isNavigating) {
    return (
      <Layout>
        <div className="flex bg-black items-center justify-center min-h-screen">
          <LoaderSvg height="120px" />
        </div>
      </Layout>
    );
  }

  if (!showContent || isLoading) {
    return (
      <Layout>
        <div className="flex bg-black items-center justify-center min-h-screen">
          <LoaderSvg height="120px" />
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <Head>
        <title>{hotelData.title} | Accommodation | Explore Singapore</title>
        <meta name="description" content={generalDescription?.substring(0, 160)} />
      </Head>

      <div className="min-h-screen bg-black text-white w-full pt-[80px] md:pt-10 pb-12">
        <div className="relative overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
            <AccommodationHeader 
              hotelData={hotelData} 
              address={address}
              rating={rating}
            />
            
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8">
              <ImageGallery
                media={media}
                hotelData={hotelData}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
              />

              <AccommodationInfoCard
                hotelData={hotelData}
                lowestPrice={lowestPrice}
                currency={currency}
                onScrollToOptions={scrollToRoomOptions}
                onProceedBooking={handleProceedBooking}
              />
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-12 py-6 lg:py-8">
          <AccommodationAmenities amenities={hotelData.amenities} />
          
          <AccommodationDescription 
            descriptions={descriptions}
            generalDescription={generalDescription}
          />

          {address.latitude && address.longitude && (
            <AccommodationMapSection 
              latitude={parseFloat(address.latitude)}
              longitude={parseFloat(address.longitude)}
              hotelName={hotelData.title}
              address={address}
            />
          )}
        </div>

        <div ref={roomOptionsRef}>
          <RoomTypes 
            results={results}
            currency={currency}
            onRoomSelect={handleRoomSelect}
          />
        </div>

        {/* Mobile Bottom Booking Bar */}
        <div className="md:hidden fixed bottom-0 left-0 right-0 bg-gradient-to-r from-orange-50 to-orange-100 p-2 border-t border-orange-200 shadow-t-lg z-50">
          <div className="flex justify-between items-center max-w-screen-xl mx-auto px-4">
            <div>
              <div className="text-sm text-gray-600">{t("starting_from", "Starting From")}</div>
              <div className="text-xl font-bold text-gray-900">
                {currency} {lowestPrice.toFixed(2)}
              </div>
            </div>
            <button
              onClick={scrollToRoomOptions}
              className="bg-[#CC9A55] text-white px-6 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
            >
              {t("choose_room", "Choose Room")}
              <ChevronDown size={20} />
            </button>
          </div>
        </div>
      </div>

      <BookingModal
        isOpen={alreadyModal}
        onClose={() => setAlreadyModal(false)}
        onUpdate={handleModalUpdate}
        onGoToCart={handleModalGoToCart}
        type="accommodation"
      />
    </Layout>
  );
};

export default AccommodationDetailPage;