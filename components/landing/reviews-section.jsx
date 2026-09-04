import React from "react";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";

export const ReviewsSection = () => {
  const icon1 =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Travel_anywhere_in_the_world_with_a_suitcase.png`;
  const icon2 =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/yellow_paper_airplane.png`;
  const icon3 =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/card.png`;
  const { event } = useEventStore();

  const bannerSm = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/CURATED_ALL-INCLUSIVE_PACKAGES_1.png`;
  const bannerLg = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/CURATED_ALL-INCLUSIVE_PACKAGES_1.png`;

  return (
    <section className="w-full mt-32 md:mt-4 ">
{event?.shuttle_banner_url && (
  <div className="w-full px-4 md:px-8 lg:px-12 mb-10">
    <Link
      href="/shuttle"
      className="block w-full transition-transform hover:scale-[1.01] duration-300"
    >
      {/* ================= Desktop Banner ================= */}
      <div className="relative hidden md:block">
        <img
          src={bannerLg}
          alt="Explore Singapore"
          className="w-full h-auto rounded-2xl shadow-md"
        />

        {/* Desktop Overlay */}
        <div className="absolute inset-0 flex items-center">
          <div className="ml-10 max-w-md bg-black/40 backdrop-blur-md text-white p-6 rounded-2xl">
            <h2 className="text-2xl font-semibold mb-2">
              {event?.shuttle_title}
            </h2>

            <p className="text-sm opacity-90 mb-4">
              {event?.shuttle_description}
            </p>

            <div className="inline-block bg-surface text-surface-foreground text-sm font-semibold px-5 py-2 rounded-lg">
              Book Shuttle
            </div>
          </div>
        </div>
      </div>

      {/* ================= Mobile Banner ================= */}
      <div className="relative block md:hidden">
        <img
          src={bannerSm}
          alt="Explore Singapore"
          className="w-full h-48 rounded-2xl shadow-md"
        />

        {/* Mobile Overlay */}
        <div className="absolute inset-4 flex items-start justify-start px-0">
          <div className="max-w-sm text-white p-2 rounded-2xl text-start shadow-lg">
            <h2 className="text-lg font-semibold mb-2">
              {event?.shuttle_title}
            </h2>

            <p className="text-xs opacity-90 mb-3">
              {event?.shuttle_description}
            </p>

            <div className="inline-block bg-surface text-surface-foreground text-xs font-semibold px-4 py-2 rounded-lg">
              Book Shuttle
            </div>
          </div>
        </div>
      </div>
    </Link>
  </div>
)}

      <div className="px-2 md:px-8 lg:px-12  grid grid-cols-1 md:grid-cols-4 gap-10 md:bg-surface bg-[#F7F7F780] py-4 rounded-lg md:mx-0 mx-4">
        {/* LeftIntro Text */}
        <div className="md:col-span-1 space-y-3 text-center md:text-left">
          <p className="text-primary font-semibold tracking-wide">WHAT WE SERVE</p>
          <h2 className=" text-xl md:text-2xl font-bold pt-2 leading-snug text-foreground">
            Top Values <br /> For You
          </h2>
          <p className="text-muted-foreground text-sm pt-2">
            Your Singapore trip, booked in one step.
          </p>
        </div>

        {/* Item 1 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon1} alt="value-icon-1" className=" " />
          <h3 className="text-xl font-semibold text-foreground">Lot of Choices</h3>
          <p className="text-muted-foreground text-sm">
            Explore a wide variety of tours and accommodations.
          </p>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon2} alt="value-icon-2" className=" " />
          <h3 className="text-xl font-semibold text-foreground">Best Guides</h3>
          <p className="text-muted-foreground text-sm">
            Our experienced guides make every trip memorable.
          </p>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon3} alt="value-icon-3" className=" " />
          <h3 className="text-xl font-semibold text-foreground">Easy Booking</h3>
          <p className="text-muted-foreground text-sm">
            Book your entire trip with just a few clicks.
          </p>
        </div>
      </div>
         {event?.externallinkbanner_url && event?.externallinkbanner_text && (
  <div className="w-full my-8 px-2 lg:px-6">
    
    {/* Large Banner */}
    <a
      href={event.externallinkbanner_text}
      target="_blank"
      rel="noopener noreferrer"
      className="hidden lg:block w-full"
    >
      <img
        src={event.externallinkbanner_url}
        alt="External Link Banner"
        className="w-full h-auto rounded-lg shadow-md"
      />
    </a>

    {/* Small Banner */}
    <a
      href={event.externallinkbanner_text}
      target="_blank"
      rel="noopener noreferrer"
      className="lg:hidden w-full"
    >
      <img
        src={event.externallinkbanner_url}
        alt="External Link Banner"
        className="w-full h-auto rounded-lg shadow-md"
      />
    </a>

  </div>
)}
        </section>
  );
};
