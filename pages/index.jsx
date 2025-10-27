"use client"

import { useState, useEffect, useRef } from "react"
import Layout from "@/components/layout/Layout"
import { TransferBenefitsSection } from "@/components/landing/transfer-benefits-section"
import { ReviewsSection } from "@/components/landing/reviews-section"
import { Preloader } from "@/components/landing/preloader"
import LocalizedLink from "@/components/LocalizedLink"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import Herosection from "@/components/landing/Herosection"
import useUserStore from "@/store/useAuthStore"
import { useAffiliateStore } from "@/store/useAffiliateStore";
export default function LandingPage() {
  const { t } = useTranslation("common")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { token } = useUserStore()
  const [checkingAuth, setCheckingAuth] = useState(true)
    const { trackAffiliateRedirect } = useAffiliateStore();
  useEffect(() => {
    if (token) {
    
      router.push("/order")
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
    <Layout>
 < Herosection/>

        {/* Bottom Gradient */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white/50 to-transparent"></div>

        {/* Transfer Benefits Section */}
        <TransferBenefitsSection />
        {/* Reviews Section */}
        <ReviewsSection />
       
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
