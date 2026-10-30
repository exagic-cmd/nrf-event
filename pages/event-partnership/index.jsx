import Head from "next/head";
import { useRouter } from "next/router";
import { useState } from "react";
import { BedDouble, BusFront, Luggage, Plane } from "lucide-react";
import Header from "@/components/layout/Header";
import MiceInquiryForm from "@/components/forms/MiceInquiryForm";
import EventRegistrationForm from "@/components/events/EventRegistrationForm";
import { getEventSlugFromPath } from "@/lib/eventRouting";
import { useEventStore } from "@/store/useEventStore";
import Loader2Svg from "@/components/common/Loader2Svg";
import styles from "./event-partnership.module.css";

const DEFAULT_EVENT_ID = 6;

export default function EventPartnershipPage({ routeEventSlug = "" }) {
  const router = useRouter();
  const [registrationLoading, setRegistrationLoading] = useState(Boolean(routeEventSlug));
  const event = useEventStore((state) => state.event);
  const loadedEventSlug = useEventStore((state) => state.eventSlug);
  const eventStatus = useEventStore((state) => state.status);
  const ref = router.isReady && typeof router.query.ref === "string"
    ? router.query.ref.trim()
    : "";
  const pathSegments = String(router.asPath || "").split(/[?#]/, 1)[0].split("/").filter(Boolean);
  const partnershipIndex = pathSegments.findIndex((segment) => segment === "event-partnership");
  const pathEventSlug = partnershipIndex > 0 ? pathSegments[partnershipIndex - 1] : "";
  const eventSlug = routeEventSlug || pathEventSlug || (router.isReady
    ? getEventSlugFromPath(router.asPath, router.locale, router.defaultLocale) || ""
    : "");
  const themeReady = eventSlug
    ? loadedEventSlug === eventSlug && eventStatus === "ready" && Boolean(event)
    : eventStatus === "ready" &&
      String(event?.event?.id ?? event?.id) === String(DEFAULT_EVENT_ID);

  return (
    <>
      <Head>
        <title>{eventSlug ? "Event Registration | Smart Destinations" : "MICE Inquiry | Smart Destinations"}</title>
        <meta
          name="description"
          content={eventSlug
            ? "Register for this event."
            : "Tell us about your event and MICE travel requirements in Singapore."}
        />
      </Head>
      <Header />
      <main className={`${styles.page} bg-background text-foreground`}>
        <div className={styles.skyline} aria-hidden="true" />
        <div className={styles.cityArt} aria-hidden="true" />
        <section className={styles.hero} id="top">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.intro}>
            <p className={styles.eyebrow}>{eventSlug ? "EVENT REGISTRATION" : "MICE INQUIRY"}</p>
            <h1>
              {eventSlug ? <>Join the Event<br /><span>Register Now</span></> : <>Plan Your Event<br /><span>With Us</span></>}
            </h1>
            <p className={styles.lead}>
              {eventSlug
                ? "Complete your details and the event-specific questions to register."
                : "Tell us about your event and travel requirements. Our team will help coordinate the right services for your delegates."}
            </p>
          </div>
          <div className={styles.contentGrid}>
            {eventSlug
              ? <EventRegistrationForm eventSlug={eventSlug} onLoadingChange={setRegistrationLoading} />
              : <MiceInquiryForm refValue={ref} />}
            <aside className={styles.benefits} id="benefits">
              <p className={styles.eyebrow}>WHY REGISTER?</p>
              <h2>More Reach. Less Effort.</h2>
              <p className={styles.benefitCopy}>We connect your event with a trusted travel platform, giving your attendees easy access to the best accommodation, transfers, shuttles and tours in Singapore.</p>
              <div className={styles.perks}>
                <Perk icon={<BedDouble />} title="Accommodation">Hotels for every<br />budget &amp; style</Perk>
                <Perk icon={<Plane />} title="Airport Transfers">Hassle-free arrivals<br />&amp; departures</Perk>
                <Perk icon={<BusFront />} title="Shuttle Services">Group transport<br />for your event</Perk>
                <Perk icon={<Luggage />} title="Tours & Experiences">Explore the best<br />of Singapore</Perk>
              </div>
              <p className={styles.tagline}>Your Event. Our Travel Expertise.</p>
            </aside>
          </div>
        </section>
      </main>
      {(!themeReady || (eventSlug && registrationLoading)) && (
        <div className="fixed inset-0 z-[10000] flex items-center justify-center bg-background" role="status" aria-live="polite" aria-label="Loading event theme and registration form">
          <Loader2Svg height="100vh" size={60} />
        </div>
      )}
    </>
  );
}

export async function getServerSideProps({
  locale,
  defaultLocale,
  resolvedUrl,
  query,
}) {
  const routeEventSlug =
    getEventSlugFromPath(resolvedUrl, locale, defaultLocale) ||
    (typeof query?.slug === "string"
      ? getEventSlugFromPath(`/${query.slug}`, locale, defaultLocale)
      : null);

  return { props: { routeEventSlug: routeEventSlug || "" } };
}

function Perk({ icon, title, children }) {
  return <div className={styles.perk}><span className={styles.perkIcon}>{icon}</span><strong>{title}</strong><span>{children}</span></div>;
}
