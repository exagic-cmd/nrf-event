import React from "react";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";

const PromotionalBanner = ({ image, alt, href, external = false, title, description }) => {
  const content = (
    <div className="group relative h-56 overflow-hidden rounded-2xl border border-border/60 bg-surface shadow-md sm:h-60 md:h-64 lg:h-[280px]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
      />
     {title && (
  <div className="absolute inset-x-0 bottom-0 flex items-end justify-end bg-gradient-to-t from-primary via-primary/90 to-primary/0 px-4 pb-4 pt-12 text-foreground sm:px-6 sm:pb-5 md:inset-y-0 md:left-auto md:right-0 md:w-[55%] md:items-center md:bg-gradient-to-l md:from-primary md:via-primary/90 md:to-primary/0 md:px-7 md:py-6 lg:w-1/2 lg:px-9">
    
    <div className="w-full max-w-sm text-right flex flex-col items-end">
        
        <h2 className="line-clamp-2 text-base text-white font-bold leading-snug sm:text-lg md:text-xl">
          {title}
        </h2>
        {description && (
          <p className="mt-1.5 line-clamp-2 text-xs leading-5 text-white sm:mt-2 sm:text-sm sm:leading-6">
            {description} 
          </p>
        )}
        <span className="mt-2.5 inline-flex rounded-lg bg-white px-3.5 py-2 text-xs font-semibold text-primary transition-colors group-hover:bg-white-hover sm:mt-3 sm:px-4 sm:text-sm">
          Book Shuttle
        </span>
    </div>
  </div>
      )}
    </div>
  );

  return (
    <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
      {external ? (
        <a href={href} target="_blank" rel="noopener noreferrer" className="block">
          {content}
        </a>
      ) : (
        <Link href={href} className="block">
          {content}
        </Link>
      )}
    </div>
  );
};

export const ShuttleBannerWeServeSection = ({ layout = 2 }) => {
  const icon1 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Travel_anywhere_in_the_world_with_a_suitcase.png`;
  const icon2 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/yellow_paper_airplane.png`;
  const icon3 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/card.png`;

  const { event } = useEventStore();
  const eventData = event?.event;

  // Render shuttle banner ONLY if has_shuttle is true AND banner URL exists
  const hasShuttleBanner =
    Boolean(eventData?.has_shuttle) &&
    Boolean(eventData?.shuttle_banner_url?.trim());

  // Render external banner ONLY if both image and link exist
  const hasExternalBanner =
    Boolean(eventData?.externallinkbanner_url?.trim()) &&
    Boolean(eventData?.externallinkbanner_text?.trim());

  const values = [
    { icon: icon1, title: "Lot of Choices", desc: "Explore a wide variety of tours and accommodations." },
    { icon: icon2, title: "Best Guides", desc: "Our experienced guides make every trip memorable." },
    { icon: icon3, title: "Easy Booking", desc: "Book your entire trip with just a few clicks." },
  ];
  const layoutOneValues = [
    values[1],
    values[0],
    values[2],
  ];

  /* ============================================================
     LAYOUT 1 — Single-card image overlay banner
  ============================================================ */
  if (layout === 1) {
    return (
      <section className="mt-8 w-full md:mt-4">
        {hasShuttleBanner && (
          <div className="mb-8">
            <PromotionalBanner
              image={eventData.shuttle_banner_url}
              alt={eventData.shuttle_title || "Explore Shuttle"}
              href="/shuttle"
              title={eventData.shuttle_title}
              description={eventData.shuttle_description}
            />
          </div>
        )}

        <div className="relative isolate mx-auto mt-8 max-w-7xl px-4 sm:mt-10 sm:px-6 md:mt-12 ">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -left-8 top-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl sm:h-64 sm:w-64"
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -right-8 bottom-0 -z-10 h-48 w-48 rounded-full bg-primary/10 blur-3xl sm:h-64 sm:w-64"
          />

          <div className="rounded-3xl border border-border/70 bg-card/75 px-5 py-6 shadow-sm backdrop-blur-sm sm:p-7 md:px-8 md:py-9 lg:px-9 lg:py-10">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-x-5 sm:gap-y-6 lg:grid-cols-4 lg:gap-x-6 lg:gap-y-8 xl:grid-cols-[1.65fr_repeat(3,minmax(0,1fr))] xl:gap-0">
              <div className="flex flex-col justify-center pb-4 sm:col-span-2 sm:pb-0 lg:col-span-4 xl:col-span-1 xl:border-r xl:border-border/70 xl:pr-7">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary sm:text-sm">
                  WHY CHOOSE US
                </p>
                <h2 className="mt-2 text-2xl font-bold leading-tight text-foreground sm:text-3xl lg:text-4xl xl:text-[2rem]">
                  Top Values For You
                </h2>
                <p className="mt-2 text-sm leading-6 text-muted-foreground sm:text-base">
                  Your Singapore trip, booked in one step.
                </p>
              </div>

              {layoutOneValues.map(({ icon, title, desc }) => (
                <article
                  key={title}
                  className="flex flex-col items-center rounded-2xl border border-border/70 bg-surface/70 px-4 py-5 text-center sm:border-0 sm:bg-transparent sm:px-3 sm:py-2 xl:rounded-none xl:border-l xl:border-border/70 xl:px-4 xl:py-1"
                >
                  <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full border border-primary/15 bg-primary/10 sm:h-16 sm:w-16">
                    <img
                      src={icon}
                      alt=""
                      aria-hidden="true"
                      loading="lazy"
                      className="h-8 w-8 object-contain sm:h-9 sm:w-9"
                    />
                  </div>
                  <h3 className="text-base font-semibold leading-snug text-foreground sm:text-lg">
                    {title}
                  </h3>
                  <p className="mt-1.5 max-w-[15rem] text-sm leading-5 text-muted-foreground">
                    {desc}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </div>

        {hasExternalBanner && (
          <div className="my-8">
            <PromotionalBanner
              image={eventData.externallinkbanner_url}
              alt="External Link Banner"
              href={eventData.externallinkbanner_text}
              external
            />
          </div>
        )}
      </section>
    );
  }

  /* ============================================================
     LAYOUT 2 — Side-by-side split panel
  ============================================================ */
  if (layout === 2) {
    return (
      <section className="w-full mt-16 md:mt-6">
        {hasShuttleBanner && (
          <div className="mb-10">
            <PromotionalBanner
              image={eventData.shuttle_banner_url}
              alt={eventData.shuttle_title || "Explore Shuttle"}
              href="/shuttle"
              title={eventData.shuttle_title}
              description={eventData.shuttle_description}
            />
          </div>
        )}

        <div className="px-4 md:px-8 lg:px-12">
          <div className="mb-6">
            <p className="text-primary font-semibold tracking-wide text-sm">WHAT WE SERVE</p>
            <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">Top Values For You</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 border-t border-b border-border/50">
            {values.map((v) => (
              <div key={v.title} className="flex items-center gap-4 py-5 md:py-6 md:px-6 first:md:pl-0">
                <img src={v.icon} alt={`value-icon-${v.title}`} className="w-10 h-10 shrink-0" />
                <div>
                  <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
                  <p className="text-muted-foreground text-sm mt-0.5">{v.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {hasExternalBanner && (
          <div className="my-8">
            <PromotionalBanner
              image={eventData.externallinkbanner_url}
              alt="External Link Banner"
              href={eventData.externallinkbanner_text}
              external
            />
          </div>
        )}
      </section>
    );
  }

  /* ============================================================
     LAYOUT 3 — Gradient overlay card banner with value cards
  ============================================================ */
  return (
    <section className="w-full mt-10 md:mt-8">
      {hasShuttleBanner && (
        <div className="mb-8 md:mb-10">
          <PromotionalBanner
            image={eventData.shuttle_banner_url}
            alt={eventData.shuttle_title || "Explore Shuttle"}
            href="/shuttle"
            title={eventData.shuttle_title}
            description={eventData.shuttle_description}
          />
        </div>
      )}

      <div className="px-4 md:px-8 lg:px-12 mt-8 md:mt-10 relative z-10">
        <div className="text-center mb-8">
          <p className="text-primary font-semibold tracking-wide text-sm">WHAT WE SERVE</p>
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">
            Top Values For You
          </h2>
          <p className="text-muted-foreground text-sm mt-2">
            Your Singapore trip, booked in one step.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {values.map((v) => (
            <div
              key={v.title}
              className="bg-surface rounded-2xl shadow-lg p-6 flex flex-col items-center text-center"
            >
              <img src={v.icon} alt={`value-icon-${v.title}`} className="w-12 h-12 mb-3" />
              <h3 className="text-lg font-semibold text-foreground">{v.title}</h3>
              <p className="text-muted-foreground text-sm mt-1">{v.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {hasExternalBanner && (
        <div className="my-8 md:mt-16">
          <PromotionalBanner
            image={eventData.externallinkbanner_url}
            alt="External Link Banner"
            href={eventData.externallinkbanner_text}
            external
          />
        </div>
      )}
    </section>
  );
};