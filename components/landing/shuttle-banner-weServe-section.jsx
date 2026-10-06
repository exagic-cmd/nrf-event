import React from "react";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";

const PromotionalBanner = ({ image, alt, href, external = false, title, description }) => {
  const content = (
    <div className="group relative h-48 overflow-hidden rounded-xl shadow-md sm:h-52 md:h-60 lg:h-[280px]">
      <img
        src={image}
        alt={alt}
        className="absolute inset-0 h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.02]"
      />
      {title && (
        <>
          <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/45 to-transparent" />
          <div className="absolute inset-y-0 left-0 flex w-full items-center p-4 text-white sm:p-6 md:p-8">
            <div className="max-h-full max-w-[85%] overflow-y-auto md:max-w-[55%]">
              <h2 className="text-lg font-bold leading-tight sm:text-xl md:text-2xl">
                {title}
              </h2>
              {description && (
                <p className="mt-2 line-clamp-2 text-xs text-white/90 sm:text-sm">
                  {description}
                </p>
              )}
              <span className="mt-3 inline-flex rounded-lg bg-primary px-4 py-2 text-xs font-semibold text-primary-foreground sm:text-sm">
                Book Shuttle
              </span>
            </div>
          </div>
        </>
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

  /* ============================================================
     LAYOUT 1 — Single-card image overlay banner
  ============================================================ */
  if (layout === 1) {
    return (
      <section className="w-full mt-8 md:mt-4">
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

        <div className="px-2 md:px-8 lg:px-12 mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-4 gap-10 md:bg-surface bg-foreground/10 py-4 rounded-lg md:mx-0 mx-4">
          <div className="md:col-span-1 space-y-3 text-center md:text-left">
            <p className="text-primary font-semibold tracking-wide">WHAT WE SERVE</p>
            <h2 className="text-xl md:text-2xl font-bold pt-2 leading-snug text-foreground">
              Top Values <br /> For You
            </h2>
            <p className="text-muted-foreground text-sm pt-2">Your Singapore trip, booked in one step.</p>
          </div>

          {values.map((v) => (
            <div key={v.title} className="flex flex-col items-center md:items-start space-y-3">
              <img src={v.icon} alt={`value-icon-${v.title}`} />
              <h3 className="text-xl font-semibold text-foreground">{v.title}</h3>
              <p className="text-muted-foreground text-sm">{v.desc}</p>
            </div>
          ))}
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