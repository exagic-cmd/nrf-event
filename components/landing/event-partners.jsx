"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useEventStore } from "@/store/useEventStore";


function getPartnerLogo(partner) {
  return partner?.logo_url || partner?.logo || null;
}



function PartnerCard({
  partner,
  index,
  highlighted = false,
  featured = false,
  layout = 1,
}) {
  const logo = getPartnerLogo(partner);

  const cardClasses =
    layout === 2
      ? `
        flex
        items-center
        justify-center
        rounded-2xl
        border
        bg-surface
        transition-all
        duration-700
        ${
          highlighted
            ? "border-primary/60 shadow-xl shadow-primary/10 scale-105"
            : "border-border/50 shadow-sm scale-100"
        }
        ${featured ? "h-36 md:h-44" : "h-24 md:h-28"}
        px-6
      `
      : `
        flex
        items-center
        justify-center
        rounded-xl
        border
        border-border/60
        bg-surface
        px-6
        py-5
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-1
        hover:border-primary/40
        hover:shadow-md
        ${featured ? "h-40 md:h-48" : "h-24 md:h-28"}
      `;

  const content = (
    <div
      className={`
        ${cardClasses}
        ${featured ? "w-full" : "w-full"}
      `}
    >
      <img
        src={logo}
        alt={partner?.name || `Partner ${index + 1}`}
        className={`
          w-full
          object-contain
          transition-all
          duration-700
          ${
            highlighted
              ? "max-h-20 md:max-h-24"
              : featured
              ? "max-h-20 md:max-h-24"
              : "max-h-14 md:max-h-16"
          }
        `}
        loading="lazy"
      />
    </div>
  );

  if (partner?.url) {
    return (
      <a
        href={partner.url}
        target="_blank"
        rel="noreferrer"
        className="block"
        aria-label={partner?.name || "Event partner"}
      >
        {content}
      </a>
    );
  }

  return content;
}

/*
|--------------------------------------------------------------------------
| Main Component
|--------------------------------------------------------------------------
*/

export function EventPartners({ layout = 1 }) {
  const { event } = useEventStore();

  const sectionRef = useRef(null);

  const [shouldMarquee, setShouldMarquee] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);

  /*
  |--------------------------------------------------------------------------
  | Get active partners
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
  | Marquee overflow detection
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (layout !== 1) {
      setShouldMarquee(false);
      return;
    }

    const measureOverflow = () => {
      const element = sectionRef.current;

      if (!element) return;

      const isDesktop = window.innerWidth >= 768;

      const tileWidth = isDesktop ? 190 : 160;
      const gap = isDesktop ? 24 : 16;

      const totalLogoWidth =
        displayPartners.length * tileWidth +
        Math.max(0, displayPartners.length - 1) * gap;

      setShouldMarquee(totalLogoWidth > element.clientWidth);
    };

    measureOverflow();

    window.addEventListener("resize", measureOverflow);

    return () => {
      window.removeEventListener("resize", measureOverflow);
    };
  }, [displayPartners.length, layout]);

  /*
  |--------------------------------------------------------------------------
  | Layout 2 spotlight animation
  |--------------------------------------------------------------------------
  |
  | Every 3 seconds the highlighted partner moves to the next one.
  |--------------------------------------------------------------------------
  */

  useEffect(() => {
    if (layout !== 2 || displayPartners.length <= 1) {
      setActiveIndex(0);
      return;
    }

    const interval = window.setInterval(() => {
      setActiveIndex((current) => {
        return (current + 1) % displayPartners.length;
      });
    }, 3000);

    return () => {
      window.clearInterval(interval);
    };
  }, [displayPartners.length, layout]);

  /*
  |--------------------------------------------------------------------------
  | No partners
  |--------------------------------------------------------------------------
  */

  if (!displayPartners.length) {
    return null;
  }

  /*
  |--------------------------------------------------------------------------
  | SECTION STYLING
  |--------------------------------------------------------------------------
  */

  const sectionClasses =
    layout === 3
      ? "w-full py-14 md:py-20 bg-surface-secondary/40"
      : "w-full py-12 md:py-16";

  /*
  |--------------------------------------------------------------------------
  | Small partner counts
  |--------------------------------------------------------------------------
  |
  | One or two partner logos should feel intentionally centered, not like an
  | incomplete carousel/grid.
  |
  |--------------------------------------------------------------------------
  */

  if (displayPartners.length <= 2) {
    return (
      <section
        className={sectionClasses}
        aria-labelledby="event-partners-title"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
              OUR PARTNERS
            </p>

            <h2
              id="event-partners-title"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
            >
              Trusted By
            </h2>
          </div>

          <div className="mx-auto flex max-w-2xl flex-wrap items-center justify-center gap-4 md:gap-6">
            {displayPartners.map((partner, index) => (
              <div
                key={`${partner.id || partner.name}-${index}`}
                className="w-[170px] sm:w-[200px] md:w-[220px]"
              >
                <PartnerCard
                  partner={partner}
                  index={index}
                  layout={layout}
                />
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 1
  |--------------------------------------------------------------------------
  |
  | Continuous horizontal marquee.
  |
  | Important:
  | If logos fit inside the container, they stay CENTERED.
  |
  |--------------------------------------------------------------------------
  */

  if (layout === 1) {
    const logoItems = shouldMarquee
      ? [...displayPartners, ...displayPartners]
      : displayPartners;

    return (
      <section
        className={sectionClasses}
        aria-labelledby="event-partners-title"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-8 text-center">
            <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
              OUR PARTNERS
            </p>

            <h2
              id="event-partners-title"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
            >
              Trusted By
            </h2>
          </div>

          <div
            ref={sectionRef}
            className="relative overflow-hidden"
          >
            {shouldMarquee && (
              <>
                <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-background via-background/80 to-transparent" />

                <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-background via-background/80 to-transparent" />
              </>
            )}

            <div
              className={
                shouldMarquee
                  ? `
                    flex
                    w-max
                    animate-[partners-marquee_28s_linear_infinite]
                    items-center
                    gap-4
                    hover:[animation-play-state:paused]
                    md:gap-6
                  `
                  : `
                    flex
                    flex-wrap
                    items-center
                    justify-center
                    gap-4
                    md:gap-6
                  `
              }
            >
              {logoItems.map((partner, index) => (
                <div
                  key={`${partner.id || partner.name}-${index}`}
                  className="w-[160px] flex-shrink-0 md:w-[190px]"
                >
                  <PartnerCard
                    partner={partner}
                    index={index}
                    layout={1}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 2
  |--------------------------------------------------------------------------*/

  if (layout === 2) {
    return (
      <section
        className="w-full py-14 md:py-20"
        aria-labelledby="event-partners-title"
      >
        <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
          <div className="mb-10 text-center">
            <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
              OUR PARTNERS
            </p>

            <h2
              id="event-partners-title"
              className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
            >
              Trusted By
            </h2>

            <p className="mt-3 text-sm md:text-base text-muted-foreground">
              Trusted by leading partners around the world
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 md:gap-7">
            {displayPartners.map((partner, index) => {
              const isHighlighted = index === activeIndex;

              return (
                <div
                  key={`${partner.id || partner.name}-${index}`}
                  className={`
                    w-[155px]
                    md:w-[190px]
                    transition-all
                    duration-700
                    ${
                      isHighlighted
                        ? "relative z-10"
                        : "opacity-70 hover:opacity-100"
                    }
                  `}
                >
                  <PartnerCard
                    partner={partner}
                    index={index}
                    highlighted={isHighlighted}
                    layout={2}
                  />

                </div>
              );
            })}
          </div>

          <div className="mt-8 flex justify-center gap-2">
            {displayPartners.map((_, index) => (
              <span
                key={index}
                className={`
                  h-1.5 rounded-full transition-all duration-500
                  ${
                    index === activeIndex
                      ? "w-7 bg-primary"
                      : "w-1.5 bg-border"
                  }
                `}
              />
            ))}
          </div>
        </div>
      </section>
    );
  }

  /*
  |--------------------------------------------------------------------------
  | LAYOUT 3
  |--------------------------------------------------------------------------
  |
  | Premium featured partner layout.
  |
  | The active partner is large in the center.
  | Other partners are smaller around it.
  |
  |--------------------------------------------------------------------------
  */

  const featuredPartner =
    displayPartners[activeIndex % displayPartners.length];

  const sidePartners = displayPartners.filter(
    (_, index) => index !== activeIndex
  );

  return (
    <section
      className="w-full py-14 md:py-20 bg-surface-secondary/40"
      aria-labelledby="event-partners-title"
    >
      <div className="mx-auto max-w-7xl px-4 md:px-8 lg:px-12">
        <div className="mb-10 text-center">
          <p className="text-primary font-semibold text-sm md:text-base tracking-wide">
            OUR PARTNERS
          </p>

          <h2
            id="event-partners-title"
            className="mt-2 text-3xl md:text-4xl font-bold text-foreground"
          >
            Trusted By
          </h2>
        </div>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4 md:gap-6">
          {sidePartners.slice(0, 2).map((partner, index) => (
            <div
              key={`${partner.id || partner.name}-left-${index}`}
              className="flex items-center"
            >
              <PartnerCard
                partner={partner}
                index={index}
                layout={3}
              />
            </div>
          ))}

          <div className="col-span-2 row-span-2 flex items-center justify-center">
            <div className="w-full max-w-md">
              <div className="mb-3 text-center">
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
                  Featured Partner
                </span>
              </div>

              <div className="rounded-3xl border border-primary/20 bg-background p-2 shadow-xl">
                <PartnerCard
                  partner={featuredPartner}
                  index={activeIndex}
                  featured
                  layout={3}
                />
              </div>

              <div className="mt-4 text-center">
                <div className="flex justify-center gap-2">
                  {displayPartners.map((_, index) => (
                    <span
                      key={index}
                      className={`
                        h-1.5 rounded-full transition-all duration-500
                        ${
                          index === activeIndex
                            ? "w-7 bg-primary"
                            : "w-1.5 bg-border"
                        }
                      `}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {sidePartners.slice(2, 4).map((partner, index) => (
            <div
              key={`${partner.id || partner.name}-right-${index}`}
              className="flex items-center"
            >
              <PartnerCard
                partner={partner}
                index={index + 2}
                layout={3}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default EventPartners;
