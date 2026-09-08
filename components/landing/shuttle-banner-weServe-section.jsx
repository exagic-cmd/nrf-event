import React from "react";
import Link from "next/link";
import { useEventStore } from "@/store/useEventStore";

export const ShuttleBannerWeServeSection = ({ layout = 2 }) => {
  const icon1 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Travel_anywhere_in_the_world_with_a_suitcase.png`;
  const icon2 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/yellow_paper_airplane.png`;
  const icon3 = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/card.png`;
  const { event } = useEventStore();

  const bannerSm = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/CURATED_ALL-INCLUSIVE_PACKAGES_1.png`;
  const bannerLg = `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/CURATED_ALL-INCLUSIVE_PACKAGES_1.png`;

  const values = [
    { icon: icon1, title: "Lot of Choices", desc: "Explore a wide variety of tours and accommodations." },
    { icon: icon2, title: "Best Guides", desc: "Our experienced guides make every trip memorable." },
    { icon: icon3, title: "Easy Booking", desc: "Book your entire trip with just a few clicks." },
  ];

  /* ============================================================
     LAYOUT 1 — Existing design (unchanged)
  ============================================================ */
  if (layout === 1) {
    return (
      <section className="w-full mt-32 md:mt-4 ">
        {event?.shuttle_banner_url && (
          <div className="w-full px-4 md:px-8 lg:px-12 mb-10">
            <Link href="/shuttle" className="block w-full transition-transform hover:scale-[1.01] duration-300">
              <div className="relative hidden md:block">
                <img src={bannerLg} alt="Explore Singapore" className="w-full h-auto rounded-2xl shadow-md" />
                <div className="absolute inset-0 flex items-center">
                  <div className="ml-10 max-w-md bg-black/40 backdrop-blur-md text-white p-6 rounded-2xl">
                    <h2 className="text-2xl font-semibold mb-2">{event?.shuttle_title}</h2>
                    <p className="text-sm opacity-90 mb-4">{event?.shuttle_description}</p>
                    <div className="inline-block bg-surface text-surface-foreground text-sm font-semibold px-5 py-2 rounded-lg">
                      Book Shuttle
                    </div>
                  </div>
                </div>
              </div>

              <div className="relative block md:hidden">
                <img src={bannerSm} alt="Explore Singapore" className="w-full h-48 rounded-2xl shadow-md" />
                <div className="absolute inset-4 flex items-start justify-start px-0">
                  <div className="max-w-sm text-white p-2 rounded-2xl text-start shadow-lg">
                    <h2 className="text-lg font-semibold mb-2">{event?.shuttle_title}</h2>
                    <p className="text-xs opacity-90 mb-3">{event?.shuttle_description}</p>
                    <div className="inline-block bg-surface text-surface-foreground text-xs font-semibold px-4 py-2 rounded-lg">
                      Book Shuttle
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        )}

        <div className="px-2 md:px-8 lg:px-12  mt-6 md:mt-12 grid grid-cols-1 md:grid-cols-4 gap-10 md:bg-surface bg-foreground/10 py-4 rounded-lg md:mx-0 mx-4">
          <div className="md:col-span-1 space-y-3 text-center md:text-left">
            <p className="text-primary font-semibold tracking-wide">WHAT WE SERVE</p>
            <h2 className=" text-xl md:text-2xl font-bold pt-2 leading-snug text-foreground">
              Top Values <br /> For You
            </h2>
            <p className="text-muted-foreground text-sm pt-2">Your Singapore trip, booked in one step.</p>
          </div>

          {values.map((v) => (
            <div key={v.title} className="flex flex-col items-center md:items-start space-y-3">
              <img src={v.icon} alt={`value-icon-${v.title}`} className=" " />
              <h3 className="text-xl font-semibold text-foreground">{v.title}</h3>
              <p className="text-muted-foreground text-sm">{v.desc}</p>
            </div>
          ))}
        </div>

        {event?.externallinkbanner_url && event?.externallinkbanner_text && (
          <div className="w-full my-8 px-2 lg:px-6">
            <a href={event.externallinkbanner_text} target="_blank" rel="noopener noreferrer" className="hidden lg:block w-full">
              <img src={event.externallinkbanner_url} alt="External Link Banner" className="w-full h-auto rounded-lg shadow-md" />
            </a>
            <a href={event.externallinkbanner_text} target="_blank" rel="noopener noreferrer" className="lg:hidden w-full">
              <img src={event.externallinkbanner_url} alt="External Link Banner" className="w-full h-auto rounded-lg shadow-md" />
            </a>
          </div>
        )}
      </section>
    );
  }

  /* ============================================================
     LAYOUT 2 — Side-by-side panel
     The shuttle promo becomes a two-column panel (copy left,
     image right, no text-over-image overlay). Values run as a
     horizontal strip of plain icon+text pairs separated by thin
     vertical rules instead of a shaded card.
  ============================================================ */
  // if (layout === 2) {
  //   return (
  //     <section className="w-full mt-16 md:mt-6">
  //       {event?.shuttle_banner_url && (
  //         <div className="w-full px-4 md:px-8 lg:px-12 mb-12">
  //           <Link href="/shuttle" className="block w-full">
  //             <div className="grid grid-cols-1 md:grid-cols-2 rounded-2xl overflow-hidden border border-border/50">
  //               <div className="p-8 md:p-10 flex flex-col justify-center bg-surface order-2 md:order-1">
  //                 <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-3">
  //                   {event?.shuttle_title}
  //                 </h2>
  //                 <p className="text-muted-foreground text-sm md:text-base mb-6">
  //                   {event?.shuttle_description}
  //                 </p>
  //                 <span className="inline-block w-fit bg-primary text-primary-foreground text-sm font-semibold px-5 py-2.5 rounded-lg">
  //                   Book Shuttle
  //                 </span>
  //               </div>
  //               <div className="h-48 md:h-auto order-1 md:order-2">
  //                 <img src={bannerLg} alt="Explore Singapore" className="w-full h-full object-cover" />
  //               </div>
  //             </div>
  //           </Link>
  //         </div>
  //       )}

  //       <div className="px-4 md:px-8 lg:px-12">
  //         <div className="mb-6">
  //           <p className="text-primary font-semibold tracking-wide text-sm">WHAT WE SERVE</p>
  //           <h2 className="text-2xl md:text-3xl font-bold text-foreground mt-1">Top Values For You</h2>
  //         </div>
  //         <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50 border-t border-b border-border/50">
  //           {values.map((v) => (
  //             <div key={v.title} className="flex items-center gap-4 py-5 md:py-6 md:px-6 first:md:pl-0">
  //               <img src={v.icon} alt={`value-icon-${v.title}`} className="w-10 h-10 shrink-0" />
  //               <div>
  //                 <h3 className="text-base font-semibold text-foreground">{v.title}</h3>
  //                 <p className="text-muted-foreground text-sm mt-0.5">{v.desc}</p>
  //               </div>
  //             </div>
  //           ))}
  //         </div>
  //       </div>

  //       {event?.externallinkbanner_url && event?.externallinkbanner_text && (
  //         <div className="w-full my-10 px-4 md:px-8 lg:px-12">
  //           <a href={event.externallinkbanner_text} target="_blank" rel="noopener noreferrer" className="block w-full">
  //             <img src={event.externallinkbanner_url} alt="External Link Banner" className="w-full h-auto rounded-lg" />
  //           </a>
  //         </div>
  //       )}
  //     </section>
  //   );
  // }

  /* ============================================================
     LAYOUT 3 — Stacked value cards over full-width banner
     The shuttle banner runs full-bleed with the promo text
     placed below it (not overlaid). The three value props are
     rendered as individual elevated cards floating in a row,
     rather than one shared background block.
  ============================================================ */
  return (
    <section className="w-full mt-16 md:mt-8">
      {event?.shuttle_banner_url && (
        <Link href="/shuttle" className="block w-full">
          <div className="w-full">
            <img
              src={bannerLg}
              alt="Explore Singapore"
              className="w-full h-56 md:h-72 object-cover"
            />
          </div>
          <div className="px-4 md:px-8 lg:px-12 py-6 bg-foreground text-background">
            <div className="max-w-2xl">
              <h2 className="text-xl md:text-2xl font-semibold mb-1">{event?.shuttle_title}</h2>
              <p className="text-sm opacity-80 mb-4">{event?.shuttle_description}</p>
              <span className="inline-block bg-primary text-primary-foreground text-sm font-semibold px-5 py-2 rounded-full">
                Book Shuttle
              </span>
            </div>
          </div>
        </Link>
      )}

      <div className="px-4 md:px-8 lg:px-12 -mt-8 md:-mt-10 relative z-10">
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

      {event?.externallinkbanner_url && event?.externallinkbanner_text && (
        <div className="w-full mt-10 px-4 md:px-8 lg:px-12">
          <a href={event.externallinkbanner_text} target="_blank" rel="noopener noreferrer" className="block w-full">
            <img src={event.externallinkbanner_url} alt="External Link Banner" className="w-full h-auto rounded-lg" />
          </a>
        </div>
      )}
    </section>
  );
};