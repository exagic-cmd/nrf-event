"use client"

import { useState, useEffect, useRef } from "react"
import Layout from "@/components/layout/Layout"
import { ShuttleBannerWeServeSection} from "@/components/landing/shuttle-banner-weServe-section"
import  CountdownTimer  from "@/components/landing/event-count-down"
import {  OurRecommendation } from "@/components/landing/our-recommendation"
import { EventPartners } from "@/components/landing/event-partners"
import { Preloader } from "@/components/landing/preloader"
import LocalizedLink from "@/components/LocalizedLink"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import useUserStore from "@/store/useAuthStore"
import { useAffiliateStore } from "@/store/useAffiliateStore";
import { useEventStore } from "@/store/useEventStore";
import Herosection from "@/components/landing/hero-section";
import {AboutSection} from "@/components/landing/event-about-section";
import HeroFilter from "@/components/landing/hero-category-filter"
function normalizeLayout(value) {
  const normalizedValue = String(value ?? "1").trim().toLowerCase();
  if (["2","layout_2"].includes(normalizedValue)) return 2;
  if (["1", "layout1", "layout-1", "layout_1"].includes(normalizedValue)) return 1;
  if (["3", "layout3", "layout-3", "layout_3"].includes(normalizedValue)) return 3;
  return 1;
}

export default function LandingPage() {
  const { t } = useTranslation("common")
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const { token } = useUserStore()
  const [checkingAuth, setCheckingAuth] = useState(true)
  const { trackAffiliateRedirect } = useAffiliateStore();
  const { event, FetchEvent, isLoading: eventStoreLoading } = useEventStore();
  const eventDetails = event?.event || {};
  const layoutValue = eventDetails.landing_layout ?? eventDetails.layout ?? eventDetails.layout_id;
  const layout = normalizeLayout(layoutValue);

  useEffect(() => {
    if (token) {
      setCheckingAuth(false)
    } else {
      setCheckingAuth(false)
    }
  }, [token, router])

  useEffect(() => {
    if (!router.isReady) return;
    trackAffiliateRedirect(router);
  }, [router.isReady]); 

  useEffect(() => {
    if (router.isReady && !event) {
      FetchEvent(router);
    }
  }, [router.isReady, event, FetchEvent, router]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 500) 

    return () => clearTimeout(timer)
  }, [])

  if (isLoading || checkingAuth || eventStoreLoading || !event) {
    return <Preloader /> 
  }

  return (
    <Layout className=" ">
      <div>
        <div className="bg-surface-secondary pt-16">
            <Herosection layout={layout}  />
            <HeroFilter layout={layout} />
        </div>
          <AboutSection  />
          <ShuttleBannerWeServeSection layout={layout}   />
          <OurRecommendation layout={layout} />
          <EventPartners  />
         </div>
      
     
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
