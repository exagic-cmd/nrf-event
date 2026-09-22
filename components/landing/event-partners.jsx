"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEventStore } from "@/store/useEventStore";

function getPartnerLogo(partner) {
  return partner?.logo_url || partner?.logo || null;
}

/**
 * Contrast-safe wrapper for partner logos using theme `bg-surface`.
 * Ensures dark/light logos render crisp without missing issues.
 */
function LogoImage({ logo, name, featured = false, large = false, className = "" }) {
  return (
    <div className="relative flex h-full w-full items-center justify-center rounded-2xl bg-primary/10 p-2 shadow-sm border border-border/60 transition-all">
      <img
        src={logo}
        alt={name || "Event partner"}
        className={`w-full object-contain transition-all duration-300 drop-shadow-sm ${
          large
            ? "max-h-20 sm:max-h-24 md:max-h-28"
            : featured
            ? "max-h-16 sm:max-h-20 md:max-h-24"
            : "max-h-10 sm:max-h-12 md:max-h-14"
        } ${className}`}
        loading="lazy"
      />
    </div>
  );
}

/**
 * PartnerCard component rendering cards tailored per layout.
 */
function PartnerCard({
  partner,
  index,
  highlighted = false,
  featured = false,
  large = false,
  layout = 1,
  onClick,
}) {
  const logo = getPartnerLogo(partner);
  if (!logo) return null;

  // LAYOUT 1: Masked Sliding Curtain Card (Single Logo at a Time)
  if (layout === 1) {
    const cardContent = (
      <div
        className={`
          flex h-32 sm:h-36 md:h-40 w-full items-center justify-center  px-4 py-3
        `}
      >
        <LogoImage logo={logo} name={partner?.name} large={true} />
      </div>
    );

    if (partner?.url) {
      return (
        <a
          href={partner.url}
          target="_blank"
          rel="noreferrer"
          className="block w-full"
          aria-label={partner?.name || "Event partner"}
        >
          {cardContent}
        </a>
      );
    }
    return cardContent;
  }

  // LAYOUT 2: Solid Primary Color Center Spotlight Stage Card
  if (layout === 2) {
    const cardContent = (
      <button
        type="button"
        onClick={onClick}
        className={`
          relative flex w-full items-center justify-center rounded-2xl border bg-primary/0 p-2 text-left
          transition-all duration-500 cursor-pointer outline-none focus:outline-none
           text-primary-foreground border-primary
          ${
            highlighted
              ? "z-20 scale-105 shadow-xl shadow-primary/30 ring-4 ring-primary/20 border-primary-hover"
              : "scale-90 opacity-40 hover:opacity-80 border-primary/60"
          }
          ${featured || highlighted ? "h-28 sm:h-32 md:h-36" : "h-20 sm:h-24 md:h-28"}
        `}
      >
        <LogoImage logo={logo} name={partner?.name} featured={featured || highlighted} />
      </button>
    );

    if (partner?.url && !onClick) {
      return (
        <a
          href={partner.url}
          target="_blank"
          rel="noreferrer"
          className="block w-full"
          aria-label={partner?.name || "Event partner"}
        >
          {cardContent}
        </a>
      );
    }
    return cardContent;
  }

  // LAYOUT 3: Primary Gradient Cards (Single Row with ~1/3 Larger Active Card)
  const cardContent = (
    <button
      type="button"
      onClick={onClick}
      className={`
        relative flex w-full items-center justify-center text-left
        transition-all duration-500 cursor-pointer outline-none focus:outline-none
        bg-gradient-to-br from-primary/25 via-primary/15 to-primary/35 dark:from-primary/35 dark:via-primary/20 dark:to-primary/10 border-primary/30
        ${
          highlighted
            ? "z-10 scale-115 md:scale-125 border-2 border-primary shadow-xl bg-primary/10 ring-pimary-30 ring-1 "
            : "scale-90 md:scale-95 opacity-70 hover:opacity-100 hover:scale-100 hover:border-primary/50"
        }
        ${featured ? "h-28 sm:h-32 md:h-36" : "h-20 sm:h-24 md:h-28"}
      `}
    >
      <LogoImage logo={logo} name={partner?.name} featured={featured || highlighted} />
    </button>
  );

  if (partner?.url && !onClick) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noreferrer"
        className="block w-full"
        aria-label={partner?.name || "Event partner"}
      >
        {cardContent}
      </a>
    );
  }
  return cardContent;
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export function EventPartners({ layout: layoutProp }) {
  const { event } = useEventStore();
  const [activeIndex, setActiveIndex] = useState(0);

  // Normalize layout from props or store dynamically
  const layout = useMemo(() => {
    if (layoutProp !== undefined && layoutProp !== null) return Number(layoutProp);
    const eventDetails = event?.event || {};
    const val = eventDetails.landing_layout ?? eventDetails.layout ?? eventDetails.layout_id;
    const strVal = String(val ?? "1").trim().toLowerCase();
    if (["2", "layout_2", "layout2"].includes(strVal)) return 2;
    if (["3", "layout_3", "layout3"].includes(strVal)) return 2;
    return 1;
  }, [layoutProp, event]);

  /*
  |--------------------------------------------------------------------------
  | Active partners calculation
  |--------------------------------------------------------------------------
  */
  const partners = useMemo(() => {
    const eventPartners = event?.event?.partners || [];

    return eventPartners.filter((partner) => {
      const isActive =
        partner?.status === undefined || Number(partner.status) === 1;

      return isActive && getPartnerLogo(partner);
    });
  }, [event]);

  const displayPartners = partners;

  /*
  |--------------------------------------------------------------------------
  | Auto spotlight interval for Layout 1, Layout 2 & Layout 3
  |--------------------------------------------------------------------------
  */
  useEffect(() => {
    if (displayPartners.length <= 1) {
      setActiveIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % displayPartners.length);
    }, 3000);

    return () => window.clearInterval(interval);
  }, [displayPartners.length]);

  /*
  |--------------------------------------------------------------------------
  | No partners fallback
  |--------------------------------------------------------------------------
  */
  if (!displayPartners.length) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 1: Masked Sliding Curtain Slider (Single Logo Visible at a Time)
  |--------------------------------------------------------------------------
  */
  if (layout === 1) {
    return (
      <section
        className="w-full py-12 md:py-16"
        aria-labelledby="event-partners-title-1"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <p className="text-primary font-semibold text-xs md:text-sm tracking-widest uppercase">
              OUR PARTNERS
            </p>
            <h2
              id="event-partners-title-1"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
            >
              Trusted By
            </h2>
          </div>

          {/* Masked Slider Box: Width bounded, overflow-hidden mask */}
          <div className="mx-auto w-full max-w-xs sm:max-w-sm md:max-w-md py-2">
            <div className="relative overflow-hidden rounded-3xl border-2 border-primary/20 bg-primary/5 dark:bg-primary/10 p-3 shadow-lg">
              {/* Sliding Track */}
              <div
                className="flex transition-transform duration-700 ease-in-out"
                style={{ transform: `translateX(-${activeIndex * 100}%)` }}
              >
                {displayPartners.map((partner, index) => (
                  <div
                    key={`${partner.id || partner.name}-${index}`}
                    className="w-full flex-shrink-0 px-1"
                  >
                    <PartnerCard
                      partner={partner}
                      index={index}
                      large={true}
                      layout={1}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Carousel Control Dots */}
          <div className="mt-6 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
              {displayPartners.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    h-2 rounded-full transition-all duration-500 cursor-pointer
                    ${
                      index === activeIndex
                        ? "w-7 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground/40"
                    }
                  `}
                  aria-label={`Go to partner ${index + 1}`}
                />
              ))}
            </div>
           
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 2: Center Spotlight Stage Carousel (Single Visible Center Logo)
  |--------------------------------------------------------------------------
  */
  if (layout === 2) {
    const count = displayPartners.length;

    // Single partner case
    if (count === 1) {
      return (
        <section
          className="w-full py-12 md:py-16"
          aria-labelledby="event-partners-title-2"
        >
          <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
            <div className="mb-8 text-center">
              <p className="text-primary font-semibold text-xs md:text-sm tracking-widest uppercase">
                OUR PARTNERS
              </p>
              <h2
                id="event-partners-title-2"
                className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
              >
                Trusted By
              </h2>
            </div>
            <div className="mx-auto w-[220px] sm:w-[260px]">
              <PartnerCard
                partner={displayPartners[0]}
                index={0}
                highlighted
                layout={2}
              />
            </div>
          </div>
        </section>
      );
    }

    // Multiple partners spotlight stage (prev, active, next)
    const prevIndex = (activeIndex - 1 + count) % count;
    const nextIndex = (activeIndex + 1) % count;

    return (
      <section
        className="w-full py-12 md:py-16 overflow-hidden"
        aria-labelledby="event-partners-title-2"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-6 text-center">
            <p className="text-primary font-semibold text-xs md:text-sm tracking-widest uppercase">
              OUR PARTNERS
            </p>
            <h2
              id="event-partners-title-2"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
            >
              Trusted By
            </h2>
          </div>

          {/* Spotlight Stage View: Previous (dimmed side), Active (center spotlight), Next (dimmed side) */}
          <div className="mx-auto flex items-center justify-center gap-3 sm:gap-6 py-6 max-w-4xl">
            {/* Left Side Logo (Previous) */}
            <div className="w-[120px] sm:w-[160px] md:w-[190px] flex-shrink-0 transition-all duration-700">
              <PartnerCard
                partner={displayPartners[prevIndex]}
                index={prevIndex}
                highlighted={false}
                layout={2}
                onClick={() => setActiveIndex(prevIndex)}
              />
            </div>

            {/* Center Spotlight Stage Logo (Active) */}
            <div className="w-[200px] sm:w-[250px] md:w-[280px] flex-shrink-0 transition-all duration-700">
              <PartnerCard
                partner={displayPartners[activeIndex]}
                index={activeIndex}
                highlighted={true}
                featured={true}
                layout={2}
              />
            </div>

            {/* Right Side Logo (Next) */}
            <div className="w-[120px] sm:w-[160px] md:w-[190px] flex-shrink-0 transition-all duration-700">
              <PartnerCard
                partner={displayPartners[nextIndex]}
                index={nextIndex}
                highlighted={false}
                layout={2}
                onClick={() => setActiveIndex(nextIndex)}
              />
            </div>
          </div>

          {/* Carousel Controls & Caption */}
          <div className="mt-4 flex flex-col items-center justify-center gap-2">
            <div className="flex items-center justify-center gap-2">
              {displayPartners.map((_, index) => (
                <button
                  type="button"
                  key={index}
                  onClick={() => setActiveIndex(index)}
                  className={`
                    h-2 rounded-full transition-all duration-500 cursor-pointer
                    ${
                      index === activeIndex
                        ? "w-7 bg-primary"
                        : "w-2 bg-border hover:bg-muted-foreground/40"
                    }
                  `}
                  aria-label={`Go to partner ${index + 1}`}
                />
              ))}
            </div>
          
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 3: Primary Gradient Cards (Single Row with Active ~1/3 Larger)
  |--------------------------------------------------------------------------
  */
  return (
    <section
      className="w-full py-12 md:py-16"
      aria-labelledby="event-partners-title-3"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-8 text-center">
          <p className="text-primary font-semibold text-xs md:text-sm tracking-widest uppercase">
            OUR PARTNERS
          </p>
          <h2
            id="event-partners-title-3"
            className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
          >
            Trusted By
          </h2>
        </div>

        {/* Clean Single Row Layout with Enlarged Active Spotlight Item */}
        <div className="mx-auto flex flex-wrap md:flex-nowrap items-center justify-center gap-4 sm:gap-6 md:gap-8 py-6">
          {displayPartners.map((partner, index) => {
            const isHighlighted = index === activeIndex;

            return (
              <div
                key={`${partner.id || partner.name}-${index}`}
                className="w-[120px] sm:w-[120px] md:w-[140px] flex-shrink-0"
              >
                <PartnerCard
                  partner={partner}
                  index={index}
                  highlighted={isHighlighted}
                  layout={3}
                  onClick={() => setActiveIndex(index)}
                />
              </div>
            );
          })}
        </div>

        {/* Carousel Pagination & Helper */}
        <div className="mt-6 flex flex-col items-center justify-center gap-2">
          <div className="flex items-center justify-center gap-2">
            {displayPartners.map((_, index) => (
              <button
                type="button"
                key={index}
                onClick={() => setActiveIndex(index)}
                className={`
                  h-2 rounded-full transition-all duration-500 cursor-pointer
                  ${
                    index === activeIndex
                      ? "w-7 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/40"
                  }
                `}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
          <p className="text-xs text-muted-foreground font-medium">
            Auto-advances every 3s (Tap any card to spotlight)
          </p>
        </div>
      </div>
    </section>
  );
}

export default EventPartners;
