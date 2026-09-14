import { useState, useRef, useEffect, useCallback } from "react"
import { useRouter } from "next/router"
import Head from "next/head"
import { useProductStore } from "@/store/useProductStore"
import Layout from "@/components/layout/Layout"
import LoaderSvg from "@/components/common/Loader2Svg"
import NoProductsFound from "@/components/common/NoProductsFound"
import { useCartStore } from "@/store/useCartStore"
import { useDrawerStore } from "@/store/useDrawerStore"
import { useAffiliateStore } from "@/store/useAffiliateStore"
import TourHeader from "@/components/daytours/tour-detail/TourHeader.jsx"
import ImageGallery from "@/components/daytours/tour-detail/ImageGallery.jsx"
import TourInfoCard from "@/components/daytours/tour-detail/TourInfoCard.jsx"
import TourHighlights from "@/components/daytours/tour-detail/TourHighlights.jsx"
import TourAccordion from "@/components/daytours/tour-detail/TourAccordion.jsx"
import TourVariants from "@/components/daytours/tour-detail/TourVariants.jsx"
import CompareSection from "@/components/daytours/tour-detail/CompareSection.jsx"
import BookingModal from "@/components/daytours/tour-detail/BookingModal.jsx"
import { apiRequest } from "@/lib/clientApi"
import TourDetailHead from "@/components/daytours/tour-detail/TourDetailHead.jsx"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useLocalizedRouter } from "@/components/localizedRouter";
import TourRoute from "@/components/daytours/tour-detail/TourRoute.jsx";
import TourItinerary from "@/components/daytours/tour-detail/TourItinerary.jsx";
import {ChevronDown, ChevronRight,Hotel,Eye,X,} from "lucide-react"
import { useTranslation } from "next-i18next";
import { useScrollToTop } from '@/hooks/use-scroll-top';
import formatPrice from "@/lib/formatPrice";
// Category constants
const PACKAGE_TOUR_CATEGORY_ID = 8;

export async function getServerSideProps(context) {
  const { productname, id: productid } = context.params;

  const locale = context.locale || context.query.locale || 'en';
  const languageMap = {
    en: 1,
    es: 6,
    ja: 5,
    ko: 14, 'zh-CN': 4, ru: 16, de: 15
  };
  const languageId = languageMap[locale] || 1;
  let initialBookedProductDetail = null;
  let initialTieredPricingData = {};
  let initialTourMapData = [];
  let notFound = false;
const translations = await serverSideTranslations(locale, ["common", "daytour","virtualtour"]);
  if (productid) {
    try {
      const productData = await apiRequest({
        endpoint: `product/${productid}/${languageId}`,
        method: "GET",
      })
      initialBookedProductDetail = productData

      const tieredPricing = await apiRequest({
        endpoint: `product_tiered_pricing/${productid}`,
        method: "GET",
      })
      initialTieredPricingData = tieredPricing

      const tourMapRes = await apiRequest({
        endpoint: `tour_location/${productid}/${languageId}`,
        method: "GET",
      })
      initialTourMapData = tourMapRes?.data?.markers || []

      if (!initialBookedProductDetail?.data?.basicinfo) {
        notFound = true
      }
    } catch (error) {
      console.error("SSR Data Fetching Error:", error)
      notFound = true
    }
  } else {
    notFound = true
  }

  if (notFound) {
    return {
      notFound: true,
    }
  }

  return {
    props: {
      ...translations,
      initialBookedProductDetail,
      initialTieredPricingData,
      initialTourMapData,
       productname,
        productid,
       
    },
  }
}

const GroupTourDetailPage = ({ initialBookedProductDetail, initialTieredPricingData, initialTourMapData , productname,
  productid}) => {
  const { t } = useTranslation("common", "daytour");
  const [currencyData, setCurrencyData] = useState(null);

  const parsePrice = (priceStr) => {
    if (typeof priceStr === "number") return priceStr;
    if (!priceStr) return 0;
    const match = priceStr.toString().replace(/[^0-9.]/g, "");
    return parseFloat(match) || 0;
  };
  const { trackAffiliateRedirect } = useAffiliateStore()
  const { setSelectedVariant, setBookedProductDetail, setTieredPricingData, setTourMap } = useProductStore()
  const [bookedProductDetail, setLocalBookedProductDetail] = useState(initialBookedProductDetail)
  const [tourMapData, setLocalTourMapData] = useState(initialTourMapData)
  const center = { lat: 1.3521, lng: 103.8198 }
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const tourOptionsRef = useRef(null)
  const { bookProduct, isLoading } = useProductStore()
  const { localizedPush, localizedReplace } = useLocalizedRouter();
  const router = useRouter()
  //const { productname, id: productid } = router.query
  const { items, removeItem } = useCartStore()
  const { openDrawer, setDrawerContent } = useDrawerStore()
  const [alreadyModal, setAlreadyModal] = useState(false)
  const [showContent, setShowContent] = useState(!!initialBookedProductDetail?.data?.basicinfo)
  const [isNavigating, setIsNavigating] = useState(false)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [viewingHotels, setViewingHotels] = useState(null);
  const [showAllHotels, setShowAllHotels] = useState(false);
  const accommodationGroups = bookedProductDetail?.data?.basicinfo?.accommodation_group_pricing || [];
  const [isLanguageLoading, setIsLanguageLoading] = useState(false)
  const [previousLocale, setPreviousLocale] = useState(router.locale)

  const languageMap = {
    en: 1,
    es: 6,
    ja: 5,
  }

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

  // declare param-related state BEFORE any derived state that uses it
  const [fromOrderScreen, setFromOrderScreen] = useState(false);
  const [isParamReady, setIsParamReady] = useState(false); 

  const isStillLoading =
    !router.isReady || !isParamReady || !bookedProductDetail?.data?.basicinfo || isLanguageLoading
  const [notReady, setNotReady] = useState(true)

  useEffect(() => {
    if (router.isReady) {
      const postParam = router.query?.post === "true";
      const storedFlag = typeof window !== "undefined" && sessionStorage.getItem("fromOrder") === "true";

      if (postParam) {
        sessionStorage.setItem("fromOrder", "true");
        setFromOrderScreen(true);
      } else if (storedFlag) {
        setFromOrderScreen(true);
      } else {
        setFromOrderScreen(false);
      }

      setIsParamReady(true);
      // optional: remove after reading if needed
      // sessionStorage.removeItem("fromOrder");
    }
  }, [router.isReady, router.query?.post]);

  useEffect(() => {
    setLocalBookedProductDetail(initialBookedProductDetail)
    setLocalTourMapData(initialTourMapData)
  }, [initialBookedProductDetail, initialTourMapData])

  useEffect(() => {
    const actualTitle = bookedProductDetail?.data?.basicinfo?.product_description?.title;
    if (actualTitle && router.isReady) {
        const { productname, id } = router.query;
        const actualSlug = slugify(actualTitle);

        if (productname !== actualSlug) {
            const newAs = `/day-tours/${actualSlug}/${id}`;
            const newHref = `/day-tours/[productname]/[id]`;
            localizedReplace(newHref, newAs);
        }
    }
  }, [bookedProductDetail, router.isReady, router.query, localizedReplace, slugify]);

  const fetchDataForLanguage = async (locale, productId) => {
    const languageId = languageMap[locale] || 1

    try {
      setIsLanguageLoading(true)
      const [productData, tieredPricing, tourMapRes] = await Promise.all([
        apiRequest({
          endpoint: `product/${productId}/${languageId}`,
          method: "GET",
        }),
        apiRequest({
          endpoint: `product_tiered_pricing/${productId}`,
          method: "GET",
        }),
        apiRequest({
          endpoint: `tour_location/${productId}/${languageId}`,
          method: "GET",
        }),
      ]);

      const newTitle = productData?.data?.basicinfo?.title;
      if (newTitle) {
        const newSlug = slugify(newTitle);
        const newAs = `/day-tours/${newSlug}/${productId}`;
        const newHref = `/day-tours/[productname]/[id]`;
        localizedReplace(newHref, newAs);
      }

      setLocalBookedProductDetail(productData)
      setTieredPricingData(tieredPricing)
      setLocalTourMapData(tourMapRes?.data?.markers || [])
    } catch (error) {
      console.error("Language change data fetching error:", error)
    } finally {
      setIsLanguageLoading(false)
    }
  }

  useEffect(() => {

    if (
      router.isReady &&
      router.locale !== previousLocale &&
      productid &&
      previousLocale !== null 
    ) {
      console.log(`Language changed from ${previousLocale} to ${router.locale}`)
      fetchDataForLanguage(router.locale, productid)
      setPreviousLocale(router.locale)
    } else if (router.isReady && previousLocale === null) {
      setPreviousLocale(router.locale)
    }
  }, [router.locale, router.isReady, productid, previousLocale])

  useEffect(() => {
    if (initialBookedProductDetail) {
      setBookedProductDetail(initialBookedProductDetail)
    }
    if (initialTieredPricingData) {
      setTieredPricingData(initialTieredPricingData)
    }
    if (initialTourMapData) {
      setTourMap(initialTourMapData)
    }
  }, [
    initialBookedProductDetail,
    initialTieredPricingData,
    initialTourMapData,
    setBookedProductDetail,
    setTieredPricingData,
    setTourMap,
  ])

  useEffect(() => {
    const handleDone = () => setIsNavigating(false)
    router.events.on("routeChangeComplete", handleDone)
    router.events.on("routeChangeError", handleDone)
    return () => {
      router.events.off("routeChangeComplete", handleDone)
      router.events.off("routeChangeError", handleDone)
    }
  }, [router.events])

  useEffect(() => {
    if (router.isReady) {
      setIsTransitioning(true)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 1200)
    }
  }, [router.isReady])

useEffect(() => {
  if (router.isReady) {
    const refId = router.query["sr-no"];
    const refType = router.query["type"];
    const source = router.query["source"];
    const campaign = router.query["campaign"] || router.query["compaign"];


    console.log("Router Query:", router.query);
    console.log("refId:", refId);
    console.log("refType:", refType);
    console.log("source:", source);
    console.log("campaign:", campaign);

    if (refId && refType === "affiliate") {
      console.log("Tracking Affiliate Redirect...");
      trackAffiliateRedirect(router);
    } else {
      console.log("No affiliate redirect triggered.");
    }
  } else {
    console.log("Router not ready yet...");
  }
}, [router.query, router.isReady, trackAffiliateRedirect]);
 
  // useEffect(() => {
  //   const handleDone = () => setIsNavigating(false)
  //   router.events.on("routeChangeComplete", handleDone)
  //   router.events.on("routeChangeError", handleDone)
  //   return () => {
  //     router.events.off("routeChangeComplete", handleDone)
  //     router.events.off("routeChangeError", handleDone)
  //   }
  // }, [])
  useEffect(() => {
    if (!isStillLoading) {
      const timer = setTimeout(() => {
        setShowContent(true)
      }, 100)
      return () => clearTimeout(timer)
    } else {
      setShowContent(false)
    }
  }, [isStillLoading])


  const apiData = bookedProductDetail?.data?.basicinfo
  const itineraryData = apiData?.itinerary || bookedProductDetail?.data?.productitinerary || bookedProductDetail?.data?.product_itinerary || [];
  const startingPrice = apiData.starting_price || ""
  if (!apiData) {
    return (
      <Layout>
        <Head>
          <title>Tour Not Found | Explore Singapore </title>
          <meta name="robots" content="noindex, nofollow" />
        </Head>
        <div className="mt-12">
          <NoProductsFound height="calc(100vh - 48px)" />
        </div>
      </Layout>
    )
  }

  if (isNavigating) {
    return (
      <Layout>
        <div className="flex bg-surface-secondary items-center justify-center min-h-screen">
          <LoaderSvg height="120px" />
        </div>
      </Layout>
    )
  }

  if (!showContent || isLanguageLoading) {
    return (
      <Layout>
        <div className="flex bg-foreground items-center justify-center min-h-screen">
          <LoaderSvg height="120px" />
        </div>
      </Layout>
    )
  }

  const groupProducts = apiData?.group_products || []

  const scrollToTourOptions = () => {
    tourOptionsRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  const handleProceedBooking = async () => {
    const exists = items.some((i) => i.tourId === productid)
    if (exists) {
      setAlreadyModal(true)
    } else {
      setIsNavigating(true)
      sessionStorage.setItem("fromDetail", "true")
      await new Promise((resolve) => setTimeout(resolve, 1200))
      localizedPush(`/day-tours/booking/${productid}`)
    }
  }

const handleVariantSelect = async (variant) => {
  const variantId = variant?.group_product_id?.toString()

  const exists = items.some((i) => i.tourId?.toString() === variantId)

  if (exists) {

    setAlreadyModal(true)
  } else {
    sessionStorage.setItem("fromDetail", "true")
    setSelectedVariant(variant)
    setIsNavigating(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
   localizedPush(`/day-tours/${productname}/${variantId}`)
  }
}



 const handleModalUpdate = async () => {
  const baseProductId = productid?.toString()
  const groupProductIds = groupProducts?.map((gp) => gp.group_product_id?.toString()) || []
  let existingItem
  let variantIdToRoute

  if (groupProductIds.length > 0) {
    const allValidIds = [baseProductId, ...groupProductIds]
    existingItem = items.find((i) => allValidIds.includes(i.tourId?.toString()))
    variantIdToRoute = existingItem?.tourId 
  } else {
    existingItem = items.find((i) => i.tourId?.toString() === baseProductId)
    variantIdToRoute = baseProductId 
  }
  if (existingItem) {
    removeItem(existingItem.key)
  }

  sessionStorage.setItem("fromDetail", "true")
  setAlreadyModal(false)
  setIsNavigating(true)
  await new Promise((resolve) => setTimeout(resolve, 1200))
  localizedPush(`/day-tours/booking/${variantIdToRoute}`)
}



  const handleModalGoToCart = async () => {
    setAlreadyModal(false)
    const LoadedCartDrawerContent = (await import("@/components/common/CartDrawerContent")).default
    setDrawerContent(<LoadedCartDrawerContent />)
    openDrawer()
  }


  const isPackageTour = Number(apiData?.category_id) === PACKAGE_TOUR_CATEGORY_ID;
  const handleInquireNow = () => {
    sessionStorage.setItem("fromDetail", "true")
    localizedPush("/inquiry")
  }

  return (
    <Layout>
    <TourDetailHead basicInfo={apiData} productname={productname} productid={productid} />

      <div className="min-h-screen bg-surface text-foreground w-full pt-[80px] md:pt-10 pb-12">
        <div className="relative overflow-hidden">
          <div className="px-4 sm:px-6 lg:px-12 py-4 sm:py-6 lg:py-8">
            <TourHeader apiData={apiData} />
   <TourHighlights apiData={apiData} fromOrderScreen={fromOrderScreen} />
  
        <div className=" py-4 lg:pt-4">
       

         
          {/* {!isPackageTour &&  (
            <TourRoute
              prod_id={productid}
              lang_id={languageMap[router.locale] || 1}
              colortext="#222"
              colorheading="#ffff"
              fromOrderScreen={fromOrderScreen}
            />
          )} */}
          
         
          
        </div>
     
            <div className="grid grid-cols-1 lg:grid-cols-6 gap-6 lg:gap-8">
              <ImageGallery
                apiData={apiData}
                currentImageIndex={currentImageIndex}
                setCurrentImageIndex={setCurrentImageIndex}
              />

              <TourInfoCard
                apiData={apiData}
                onScrollToOptions={scrollToTourOptions}
                onProceedBooking={handleProceedBooking}
                isPackageTour={isPackageTour}
                onInquireNow={handleInquireNow}
              />
            </div>
               {isPackageTour && (
            <>
              {apiData?.product_description?.long_desc && (
                <div className="my-10">
                  <h2 className="text-xl font-semi-bold mb-4 text-primary">
                    {t("daytour:tourDetail.tourDescription", "Tour Description")}
                  </h2>
                  <div 
                    className="text-gray-300 leading-relaxed prose prose-invert max-w-none"
                    dangerouslySetInnerHTML={{ __html: apiData.product_description.long_desc }} 
                  />
                </div>
              )}
              <TourItinerary itineraryData={itineraryData} />
            </>
          )}
             <TourAccordion apiData={apiData} />
          </div>
        </div>

    {!fromOrderScreen && (
      <>
     <div className="md:hidden block mb-6">
       <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
         {isPackageTour && (
           <>
             <div className="p-4 border-b bg-gray-50">
               <h3 className="font-bold text-gray-900 flex items-center gap-2">
                 <Hotel size={18} className="text-[#CC9A55]" />
                 {t("packageOptions")}
               </h3>
             </div>

             {/* Mobile Stacked Cards */}
             <div className="divide-y divide-gray-100">
               {accommodationGroups.map((group) => (
                 <div key={group.group_id} className="p-4 space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="font-bold text-gray-900">{group.name}</span>
                      <div className="flex flex-col text-right">
                        <span className="text-[#CC9A55] font-bold">
                          {apiData?.currency} {group.b2c_tiers?.[0]?.adult_sharing || "N/A"}
                        </span>
                        {currencyData && currencyData.exchange_rate !== 1 && group.b2c_tiers?.[0]?.adult_sharing && (
                          <span className="text-[10px] text-gray-500 font-medium mt-0.5">
                            Est. {formatPrice(group.b2c_tiers?.[0]?.adult_sharing * currencyData.exchange_rate)} {currencyData.currency}
                          </span>
                        )}
                      </div>
                    </div>
                   <div className="flex justify-between items-center text-xs">
                     <span className="text-gray-500">{t("hotelSelection", "Hotel Selection")}: {group.allow_hotel_selection ? t("yes") : t("no")}</span>
                     <button 
                       onClick={() => { setViewingHotels(group); setShowAllHotels(false); }}
                       className="text-[#CC9A55] font-bold flex items-center gap-1"
                     >
                       <Eye size={14} /> {t("viewHotels", "View Hotels")}
                     </button>
                   </div>
                 </div>
               ))}
             </div>
           </>
         )}

         <div className="bg-gradient-to-r from-orange-50 to-orange-100 p-4 border-t border-orange-200">
           <div className="text-center">
             {!isPackageTour && (
               <>
                 <div className="text-sm text-gray-600">
                   {t("starting_from", "Starting From")}
                 </div>
                  <div className="my-2 flex flex-col items-center">
                    <span className="text-2xl font-bold text-gray-900">
                      {apiData?.currency} {startingPrice}
                    </span>
                    {currencyData && currencyData.exchange_rate !== 1 && (
                      <span className="text-sm text-gray-500 font-medium mt-0.5">
                        Est. {formatPrice(displayPrice * currencyData.exchange_rate)} {currencyData.currency}
                      </span>
                    )}
                  </div>
               </>
             )}

             {apiData?.is_group && !isPackageTour ? (
               <button
                 onClick={scrollToTourOptions}
                 className="w-full bg-[#CC9A55] text-white px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
               >
                 {t("choose_tour_type", "Choose your Type")}
                 <ChevronDown size={20} />
               </button>
             ) : (
               <button
                 onClick={handleProceedBooking}
                 className="w-full bg-[#CC9A55] text-white px-4 py-3 rounded-xl font-semibold shadow-lg transform hover:scale-105 transition-all duration-300 flex items-center justify-center gap-2"
               >
                 {t("proceedBooking")}
                 <ChevronRight size={20} />
               </button>
             )}
           </div>
         </div>
       </div>

       {/* Hotel Selection Modal */}
       {viewingHotels && (
         <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-surface-secondary/60 backdrop-blur-sm">
           <div className="bg-white rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden flex flex-col shadow-2xl">
             <div className="p-4 border-b flex justify-between items-center bg-gray-50">
               <h4 className="font-bold text-gray-900">{viewingHotels.name} - {t("hotelList", "Hotels")}</h4>
               <button onClick={() => setViewingHotels(null)} className="p-1 hover:bg-gray-200 rounded-full transition-colors">
                 <X size={20} className="text-gray-500" />
               </button>
             </div>
             <div className="p-4 overflow-y-auto space-y-3">
               {(showAllHotels ? viewingHotels.hotels : viewingHotels.hotels?.slice(0, 4))?.map((hotel, idx) => (
                 <div key={idx} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                   <div className="bg-orange-100 p-2 rounded-lg"><Hotel size={16} className="text-[#CC9A55]" /></div>
                   <span className="text-sm font-medium text-gray-800">{hotel.title || hotel}</span>
                 </div>
               ))}
               {viewingHotels.hotels?.length > 4 && !showAllHotels && (
                 <button 
                   onClick={() => setShowAllHotels(true)}
                   className="w-full py-2 text-sm font-bold text-[#CC9A55] hover:bg-orange-50 rounded-xl border-2 border-dashed border-orange-200 transition-colors"
                 >
                   {t("loadMore", "Load More Hotels")} ({viewingHotels.hotels.length - 4})
                 </button>
               )}
             </div>
           </div>
         </div>
       )}
     </div>

      </>
 )}

        {apiData?.is_group && (
          <TourVariants ref={tourOptionsRef} groupProducts={groupProducts} onVariantSelect={handleVariantSelect} />
        )}

       <CompareSection
        currentProduct={apiData}
        currentProductId={productid}
        relatedProducts={apiData?.related_products}
        onNavigateToProduct={() => setIsNavigating(true)}
      />
      </div>

      <BookingModal
        isOpen={alreadyModal}
        onClose={() => setAlreadyModal(false)}
        onUpdate={handleModalUpdate}
        onGoToCart={handleModalGoToCart}
      />
    </Layout>
  )
}

export default GroupTourDetailPage