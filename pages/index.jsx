"use client"

import { useEffect, useRef } from "react"
import Layout from "@/components/layout/Layout"
import { ShuttleBannerWeServeSection} from "@/components/landing/shuttle-banner-weServe-section"
import  CountdownTimer  from "@/components/landing/event-count-down"
import {  OurRecommendation } from "@/components/landing/our-recommendation"
import { EventPartners } from "@/components/landing/event-partners"
import { useTranslation } from "next-i18next"
import { useRouter } from "next/router"
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
import { useAffiliateStore } from "@/store/useAffiliateStore";
import { useEventStore } from "@/store/useEventStore";
import Herosection from "@/components/landing/hero-section";
import {AboutSection} from "@/components/landing/event-about-section";
import HeroFilter from "@/components/landing/hero-category-filter"
import { getEventSlugFromPath, getEventSlugFromRouter } from "@/lib/eventRouting";
function normalizeLayout(value) {
  const normalizedValue = String(value ?? "1").trim().toLowerCase();
  if (["2","layout_2"].includes(normalizedValue)) return 2;
  if (["1", "layout1", "layout-1", "layout_1"].includes(normalizedValue)) return 1;
  if (["3", "layout3", "layout-3", "layout_3"].includes(normalizedValue)) return 3;
  return 1;
}

export default function LandingPage({ routeEventSlug: pageRouteEventSlug }) {
  const { t } = useTranslation("common")
  const router = useRouter()
  const { trackAffiliateRedirect } = useAffiliateStore();
  const event = useEventStore((state) => state.event);
  const routeEventSlug =
    pageRouteEventSlug !== undefined
      ? pageRouteEventSlug
      : getEventSlugFromRouter(router);
  const eventDetails = event?.event || {};
  const layoutValue = eventDetails.landing_layout ?? eventDetails.layout ?? eventDetails.layout_id;
  const layout = normalizeLayout(layoutValue);

  useEffect(() => {
    if (!router.isReady) return;
    trackAffiliateRedirect(router);
  }, [router.isReady]); 

  return (
    <Layout footerClassName={routeEventSlug ? "!mt-0 sm:!mt-0" : ""}>
      <div>
        <div className={layout === 1 ? "bg-surface-muted pt-20" : "bg-surface-secondary pt-16"}>
            <Herosection layout={layout} />
            <HeroFilter layout={layout} />
        </div>
          <AboutSection layout={layout} />
          <ShuttleBannerWeServeSection layout={layout} />
          <OurRecommendation layout={layout} />
          <EventPartners layout={layout} />
         </div>
      
     
    </Layout>
  )
}

export async function getServerSideProps({
  locale,
  defaultLocale,
  resolvedUrl,
  query,
}) {
  const routeEventSlug =
    typeof query?.slug === "string"
      ? getEventSlugFromPath(`/${query.slug}`, locale, defaultLocale)
      : getEventSlugFromPath(resolvedUrl, locale, defaultLocale);

  return {
    props: {
      routeEventSlug,
      ...(await serverSideTranslations(locale, ["common", "transfers"])),
    },
  }
}
