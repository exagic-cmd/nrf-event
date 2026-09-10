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

  /* ============================================================
     LAYOUT 1 — Existing design (unchanged)
  ============================================================ */
  if (layout === 1) {
    return (
      <div className="min-h-[40vh] bg-surface w-full ">
        <div className="  py-4 md:py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ">
            <div className="flex flex-col justify-center space-y-4 text-center md:text-left px-2 md:px-8 lg:px-12">
              <div className="">
                <h1 className="text-xl lg:text-3xl font-semibold text-foreground uppercase tracking-wider">
                  {heroTitle}
                  <span className="text-primary block py-1.5 md:py-3 mt-2 text-3xl lg:text-5xl normal-case">
                    {heroHeading}
                  </span>
                </h1>
              </div>
              <p className="text-muted-foreground text-[16px] leading-relaxed max-w-md">
                {heroParagraph}
              </p>
            </div>
            <div className="flex justify-center items-center md:order-last">
              <div className="w-full">
                <div className="relative">
                  <div className="">
                    <img
                      src={heroImage}
                      alt={heroHeading}
                      className="w-full h-auto max-h-[450px] object-cover rounded-xl"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
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
          <div className="bg-primary/30 grid overflow-hidden rounded-2xl shadow-xl md:grid-cols-[minmax(18rem,0.72fr)_minmax(0,1.28fr)]">
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