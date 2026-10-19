import React from "react";
import { useEventStore } from "@/store/useEventStore";

export default function HeroSection({ layout = 2 }) {
  const { event } = useEventStore();
  const eventDetails = event?.event;

  const defaultLargeImage =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Group_39466.webp`;

  const heroImage =
    eventDetails?.hero_image_url ||
    (eventDetails?.hero_image
      ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${eventDetails.hero_image}`
      : defaultLargeImage);
  const heroTitle = eventDetails?.hero_title || "PLAN YOUR TRIP TO NRF 2026 APAC";
  const heroHeading = eventDetails?.hero_heading || "Heading to Singapore this June?";
  const heroParagraph =
    eventDetails?.hero_paragraph ||
    "Attendees of NRF 2026 APAC can enjoy exclusive flight and hotel rates, only on Tour East!";

  if (layout === 1) {
    return (
      <section className="relative mx-3 overflow-hidden rounded-2xl bg-surface-strong shadow-sm sm:mx-6 sm:rounded-3xl lg:mx-8">
        <div className="relative min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px] xl:min-h-[420px]">
          <img
            src={heroImage}
            alt={heroHeading}
            className="absolute inset-0 h-full w-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-primary/75 via-primary/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-primary/20 via-transparent to-transparent" />

          <div className="relative z-10  flex min-h-[280px] max-w-7xl items-start px-5 pb-8 pt-9 sm:min-h-[320px] sm:px-10 sm:pb-10 sm:pt-11 md:min-h-[360px] md:px-14 md:pt-12 lg:min-h-[400px] lg:px-16 lg:pt-14 xl:min-h-[420px] xl:px-20">
            <div className="max-w-lg lg:max-w-[34rem]">
              <p className="mb-2 max-w-md text-[0.68rem] font-semibold uppercase tracking-[0.16em] text-white/90 sm:mb-3 sm:text-xs sm:tracking-[0.18em]">
                {heroTitle}
              </p>
              <h1 className="max-w-xl text-balance text-2xl font-semibold leading-[1.12] text-white sm:text-3xl md:text-4xl lg:text-[2.5rem]">
                {heroHeading}
              </h1>
              <p className="mt-3 max-w-md text-[0.8125rem] leading-5 text-white/90 sm:mt-4 sm:text-sm sm:leading-6 md:text-[0.9375rem]">
                {heroParagraph}
              </p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ============================================================
     LAYOUT 2 — Full-bleed banner with overlaid copy
     A single edge-to-edge image (matching the reference
     screenshot's banner) with the heading/paragraph overlaid
     directly on it inside a padded content wrapper, plus a
     small accent rule under the eyebrow.
  ============================================================ */
  if (layout === 2) {
    return (
      <div className="w-full ">
        <div className="px-4 py-6 md:px-8 md:py-10  lg:px-12">
          <div className="bg-primary/30  grid overflow-hidden rounded-2xl shadow-xl md:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
            <div className="order-2 flex flex-col justify-center px-6 py-10 text-background sm:px-10 md:order-1 md:px-12 ">
              <p className="mb-4 w-fit rounded-full bg-primary px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white sm:text-sm">
                {heroTitle}
              </p>
              <div className="mb-5 h-1 w-14 rounded-full bg-primary" />
              <h1 className="max-w-xl text-2xl md:text-4xl text-foreground font-semibold leading-[1] ">
                {heroHeading}
              </h1>
              <p className="mt-5 max-w-lg text-foreground text-sm leading-7  sm:text-base">
                {heroParagraph}
              </p>
            </div>
            <div className="order-1 min-h-[16rem] md:order-2 md:min-h-[30rem]">
              <img
                src={heroImage}
                alt={heroHeading}
                className="h-full w-full object-contain object-center md:object-right"
              />
            </div>
          </div>
        </div>
      </div>
    );
  }

  /* ============================================================
     LAYOUT 3 — Framed modular
     Centered stacked composition: heading first, image sits in
     an offset frame with a solid colour block behind it instead
     of a shadow, paragraph runs alongside as a caption column.
  ============================================================ */
  return (
    <div className="w-ful bg-surface">
      <div className="px-4 md:px-8 lg:px-12 py-10 md:py-16">
        <div className=" max-w-3xl mx-auto text-center">
          <p className="text-primary text-sm font-semibold tracking-wide">
            {heroTitle}
          </p>
          <h1 className="text-foreground text-2xl md:text-4xl font-semibold leading-tight mt-3">
            {heroHeading}
          </h1>
        </div>

        <div className="mt-10 md:mt-14 grid grid-cols-1 md:grid-cols-12 gap-6 md:gap-10 items-start max-w-5xl mx-auto">
          {/* Framed image with a solid offset block instead of a shadow */}
          <div className="md:col-span-8 relative">
            <div className="hidden md:block absolute -bottom-4 -right-4 w-full h-full  bg-primary/15 rounded-2xl" />
            <img
              src={heroImage}
              alt={heroHeading}
              className="relative w-full h-[300px] md:h-[420px] object-contain rounded-2xl"
            />
          </div>

          {/* Caption / paragraph column */}
          <div className="md:col-span-4 flex md:h-[420px] items-center">
            <div className="border-l-2 border-primary pl-5 py-1">
              <p className="text-muted-foreground text-base leading-relaxed">
                {heroParagraph}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}