import React from "react";
import { useEventStore } from "@/store/useEventStore";

export default function HeroSection() {
  const { event } = useEventStore();
  const eventDetails = event?.event;

  const defaultLargeImage =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Group_39466.webp`;

  const heroImage = eventDetails?.hero_image_url || (eventDetails?.hero_image ? `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${eventDetails.hero_image}` : defaultLargeImage);
  const heroTitle = eventDetails?.hero_title || "PLAN YOUR TRIP TO NRF 2026 APAC";
  const heroHeading = eventDetails?.hero_heading || "Heading to Singapore this June?";
  const heroParagraph = eventDetails?.hero_paragraph || "Attendees of NRF 2026 APAC can enjoy exclusive flight and hotel rates, only on Tour East!";

  return (
    <div className="min-h-[40vh] bg-surface w-full ">
      <div className="  py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ">
          {/* Left  */}
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
