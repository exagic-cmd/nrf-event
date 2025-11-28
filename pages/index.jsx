"use client"

import { useState, useEffect, useRef } from "react"
import Layout from "@/components/layout/Layout"
import { TransferBenefitsSection } from "@/components/landing/transfer-benefits-section"
import  CountdownTimer  from "@/components/landing/event-count-down"
import { ReviewsSection } from "@/components/landing/reviews-section"
import { Preloader } from "@/components/landing/preloader"
import LocalizedLink from "@/components/LocalizedLink"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Herosection from "@/components/landing/Herosection"
import useUserStore from "@/store/useAuthStore"
import { useAffiliateStore } from "@/store/useAffiliateStore";
import { useEventStore } from "@/store/useEventStore";
import ImageSlider from "@/components/landing/ImageSlider";
export default function LandingPage() {
  const { t } = useTranslation("common")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { token } = useUserStore()
  const [checkingAuth, setCheckingAuth] = useState(true)
    const { trackAffiliateRedirect } = useAffiliateStore();
    const { FetchEvent } = useEventStore();
  useEffect(() => {
    if (token) {
      setCheckingAuth(false)
      // router.push("/order")
    } else {
    
      setCheckingAuth(false)
    }
  }, [token, router])
  useEffect(() => {
    
    if (!router.isReady) return;

    trackAffiliateRedirect(router);
 
   
  }, [router.isReady]); 

  useEffect(() => {

    const timer = setTimeout(() => {
      setIsLoading(false)
     // setIsVisible(true) 
    }, 500) 

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return <Preloader /> 
  }
 if (checkingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Preloader />
      </div>
    )
  }
  return (
    <Layout className=" ">
   <div>
       <div className="bg-[#233BA0]  pt-16">
        <ImageSlider />
      </div>
 < Herosection/>

   </div>
        {/* ottom Gradient */}
   

        {/* Transfer Benefits Section */}
        {/* <CountdownTimer /> */}
     <ReviewsSection />
        <TransferBenefitsSection />
        {/* Reviews Section */}
        {/* <ReviewsSection /> */}
       
    </Layout>
  )
}

export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "transfers"])),
    },
  }
}
