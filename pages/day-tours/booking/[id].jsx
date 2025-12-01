"use client"

import { useEffect, useState } from "react"
import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from "next/router"
import Layout from "@/components/layout/Layout"
import { useProductStore } from "@/store/useProductStore"
import BookNow from "@/components/daytours/booking/BookNow"
import LoaderSvg from "@/components/common/Loader2Svg"
import { getFullImageUrl } from "@/utils/imageService"
import { MapPin, Tag, Info, Star, Clock } from "lucide-react"
import { useCartStore } from "@/store/useCartStore"
import AddedToCartDialog from "@/components/daytours/booking/AddedToCartDialog"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useTranslation } from "next-i18next"
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import useLanguageStore from "@/store/useLanguageStore";

const slugify = (text) => {
    if (!text) return "";
    const processedText = text
        .toString()
        .toLowerCase()
        .replace(/\s+/g, "-") 
        .replace(/[^\p{L}\p{N}-]+/gu, "") 
        .replace(/--+/g, "-")
        .replace(/^-+/, "")
        .replace(/-+$/, "");
    return encodeURIComponent(processedText);
}

const DayTourBookingPage = () => {
  const { t } = useTranslation('daytour','common')
  const { localizedPush,localizedReplace } = useLocalizedRouter();
    const router = useRouter()
  const { id } = router.query
  const { items } = useCartStore()
  const { bookProduct, bookedProductDetail, isLoading, setSelectedVariant, selectedVariant } = useProductStore()
  const [showConfirmationDialog, setShowConfirmationDialog] = useState(false)
  const [allowed, setAllowed] = useState(false)
  const [checkingAccess, setCheckingAccess] = useState(true)
  const [isLanguageHydrated, setIsLanguageHydrated] = useState(false)
  const { languageId, currentLocale } = useLanguageStore();

  useEffect(() => {
    if (useLanguageStore.persist.hasHydrated()) {
      setIsLanguageHydrated(true);
    } else {
        const unsub = useLanguageStore.persist.onFinishHydration(() => setIsLanguageHydrated(true));
        return () => unsub();
    }
  }, []);

  useEffect(() => {
    return () => {
      setSelectedVariant(null)
    }
  }, [])

    useEffect(() => {
        if (!isLanguageHydrated) return;

        const fromDetail = sessionStorage.getItem("fromDetail");
        if (fromDetail === "true") {
            setAllowed(true);
            sessionStorage.removeItem("fromDetail");
        } else {
            setAllowed(false);
        }
        setCheckingAccess(false);
    }, [isLanguageHydrated]);

    useEffect(() => {
        if (allowed === false && checkingAccess === false) {
            const timer = setTimeout(() => {
                const apiTitle = bookedProductDetail?.data?.basicinfo?.product_description?.title;
                if (id && apiTitle) {
                    localizedReplace(`/day-tours/${slugify(apiTitle)}/${id}`);
                } else {
                    localizedReplace("/transfers");
                }
            }, 1200);
            return () => clearTimeout(timer);
        }
    }, [allowed, checkingAccess, bookedProductDetail, id, localizedReplace]);

  useEffect(() => {
    if (router.isReady && id && allowed && isLanguageHydrated) {
      bookProduct(id,languageId)
    }
  }, [router.isReady, id, bookProduct, allowed, languageId, isLanguageHydrated])

  const handleItemAddedToCart = (formData) => {
    setShowConfirmationDialog(true)
  }

  const handleContinueShopping = () => {
    localizedPush("/transfers")
  }

  const handleProceedToCheckout = () => {
    sessionStorage.setItem("fromBooking", "true")
    setShowConfirmationDialog(false)
    localizedPush("/checkout")
  }

  if (checkingAccess || (isLoading && allowed) || !router.isReady || !isLanguageHydrated) {
    return (
      <Layout>
        <div className="flex items-center justify-center pb-12 min-h-screen">
          <LoaderSvg />
        </div>
      </Layout>
    )
  }

  if (!allowed) {
    return (
      <Layout>
        <div className="flex items-center bg-[#f4f4f4]justify-center pb-12 min-h-screen text-center px-4">
          <div>
             <h2 className="text-xl font-semibold text-black mb-2">{t("redirecting")}</h2>
            <p className="text-black">{t("redirectingMessage")}</p>
          </div>
        </div>
      </Layout>
    )
  }

  const apiData = bookedProductDetail?.data?.basicinfo
 const productTitle = apiData?.product_description?.title || t("defaultTourTitle");

  const displayVariant = selectedVariant
  const displayTitle = displayVariant?.Title ? `${productTitle} - ${displayVariant.Title}` : productTitle
  const displayId = displayVariant?.group_product_id || id
  const imageUrl = getFullImageUrl(displayVariant?.image || apiData?.images?.[0]?.image)
  const displayPrice = displayVariant?.Starting_price || apiData?.starting_price

  return (
    <Layout>
      <div className="min-h-screen bg-[#f4f4f4] pb-12 pt-12 md:pt-20">
        <div className="max-w-7xl mx-auto px-1 md:px-4 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-6">
              <BookNow id={displayId} productTitle={displayTitle} onBookNow={handleItemAddedToCart} />
            </div>
         
            <div className="relative lg:block hidden">
              <div className="lg:sticky top-24 space-y-4">
                <Card className=" border shadow-lg overflow-hidden">
                
                  <CardContent className="p-0">
                    {/* Image Section */}
                    <div className="relative">
                      <img
                        src={imageUrl || "/placeholder.svg"}
                        alt={displayTitle}
                        className="w-full h-48 object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                      <div className="absolute bottom-3 left-3 right-3">
                        
                      </div>
                    </div>

                    {/* Content Section */}
                    <div className="p-6 space-y-4">
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 leading-tight">{productTitle}</h3>
        
                      </div>

                      <Separator />

                      {/* Details Section */}
                      <div className="space-y-3">
                       
                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-lg">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                            <Tag className="w-4 h-4 text-[#2176FF]" />
                          </div>
                          <div>
     <p className="text-xs text-gray-500 uppercase tracking-wide">{t("price")}</p>
                            <p className="font-medium text-gray-900">
  {t("startingFrom")}  SGD { displayPrice }
</p>
                          </div>
                        </div>            
                      </div>

                      {/* Trust Indicators */}
        <div className="pt-4 border-t border-gray-100">
          <div className="flex items-center justify-between text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500 fill-current" />
              <span>{t("trustedExperience")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4 text-gray-400" />
              <span>{t("quickConfirmation")}</span>
            </div>
          </div>
        </div>
      </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export async function getStaticPaths() {
  return {
    paths: [],
    fallback: "blocking",
  }
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "daytour"])),
    },
  };
}
export default DayTourBookingPage
