import React from "react";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { getFullImageUrl } from "@/utils/imageService";
import { useEventStore } from "@/store/useEventStore";

function isUsableEventCopy(value) {
  return (
    typeof value === "string" &&
    value.trim() &&
    !value.includes("add_layout_and_theme_mode") &&
    !value.includes("We already have **Layout 1**")
  );
}

export function AboutSection({ layout = 1 }) {
  const { event } = useEventStore();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = useState(false);
  const [hasMoreDescription, setHasMoreDescription] = useState(false);
  const descriptionRef = useRef(null);
  const eventDetails = event?.event || {};
  const title = eventDetails.about_title ||  null;
  const description =eventDetails.about_description || null;
  const image = eventDetails.about_image ? getFullImageUrl(eventDetails.about_image) : null;

  useEffect(() => {
    const element = descriptionRef.current;
    if (!element || !description) return;

    const measureDescription = () => {
      setHasMoreDescription(element.scrollHeight > element.clientHeight + 1);
    };

    measureDescription();
    window.addEventListener("resize", measureDescription);
    return () => window.removeEventListener("resize", measureDescription);
  }, [description]);

  if (!title && !description && !image) return null;

  /* ============================================================
     LAYOUT 1 — Existing side-by-side design (unchanged
     composition, with the image/title fixes above applied)
  ============================================================ */
  if (layout === 1||layout === 3 || layout === 2) {
    return (
      <section className="w-full   my-12 py-12 md:py-20" aria-labelledby="event-about-title">
        <div className="mx-auto grid max-w-7xl grid-cols-1 items-center gap-8 px-4 md:grid-cols-2 md:gap-12 md:px-8 lg:px-12">
          <div className="order-2 flex flex-col justify-center md:order-1">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              About the event
            </p>
            <h2
              id="event-about-title"
              className="max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-4xl lg:text-5xl"
            >
              {title}
            </h2>
            {description && (
              <div className="mt-5 max-w-2xl text-sm leading-7 text-muted-foreground md:text-base">
                <div
                  ref={descriptionRef}
                  className={isDescriptionExpanded ? "space-y-3" : "line-clamp-5 space-y-3"}
                >
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>
                {hasMoreDescription && (
                  <button
                    type="button"
                    onClick={() => setIsDescriptionExpanded((expanded) => !expanded)}
                    className="mt-3 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {isDescriptionExpanded ? "Show less" : "Load more"}
                  </button>
                )}
              </div>
            )}
          </div>
          {image && (
            <div className="order-1 md:order-2">
              <img
                src={image}
                alt={title || "About the event"}
                className="h-64 w-full rounded-2xl object-contain shadow-lg md:h-[27rem]"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  /* ============================================================
     LAYOUT 2 — Full-bleed image banner with an overlapping
     glass card carrying the copy. Different rhythm from Layout 1:
     the image leads full-width, and the text sits on top of it
     rather than beside it.
  ============================================================ */
  // if (layout === 2) {
  //   return (
  //     <section className="w-full my-12   py-12 md:py-20" aria-labelledby="event-about-title">
  //       <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
  //         <div className="relative">
  //           {image && (
  //             <img
  //               src={image}
  //               alt={title}
  //               className="h-64 w-full rounded-2xl object-cover shadow-lg md:h-[26rem]"
  //             />
  //           )}
  //           <div
  //             className={`relative md:absolute md:bottom-0 md:left-8 md:right-8 md:translate-y-1/3 ${
  //               image ? "-mt-10 md:mt-0" : ""
  //             }`}
  //           >
  //             <div className="bg-surface rounded-2xl shadow-xl p-6 md:p-8 mx-4 md:mx-0">
  //               <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
  //                 About the event
  //               </p>
  //               <h2
  //                 id="event-about-title"
  //                 className="text-2xl md:text-3xl font-bold leading-tight text-foreground"
  //               >
  //                 {title}
  //               </h2>
  //               {description && (
  //                 <div className="mt-3 max-w-2xl space-y-3 text-sm leading-7 text-muted-foreground">
  //                   <ReactMarkdown>{description}</ReactMarkdown>
  //                 </div>
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //         {/* Spacer so the overlapping card has room to breathe on desktop */}
  //         <div className="hidden md:block h-16" />
  //       </div>
  //     </section>
  //   );
  // }

  // /* ============================================================
  //    LAYOUT 3 — Framed inset image with an offset accent block
  //    (same visual language as the Hero's Layout 3) paired with a
  //    large pull-quote style heading, reversed from Layout 1's
  //    ordering (text right, image left) with different proportions.
  // ============================================================ */
  // return (
  //   <section className="w-full my-12   py-12 md:py-20" aria-labelledby="event-about-title">
  //     <div className="mx-auto max-w-6xl px-4 md:px-8 lg:px-12">
  //       <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
  //         {image && (
  //           <div className="md:col-span-5 relative order-1">
  //             <div className="hidden md:block absolute -top-4 -left-4 w-full h-full bg-primary/15 rounded-2xl" />
  //             <img
  //               src={image}
  //               alt={title}
  //               className="relative h-64 md:h-[24rem] w-full rounded-2xl object-cover"
  //             />
  //           </div>
  //         )}
  //         <div className={`order-2 ${image ? "md:col-span-7" : "md:col-span-12"}`}>
  //           <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
  //             About the event
  //           </p>
  //           <h2
  //             id="event-about-title"
  //             className="max-w-2xl text-3xl font-bold leading-tight text-foreground md:text-4xl border-l-2 border-primary pl-5"
  //           >
  //             {title}
  //           </h2>
  //           {description && (
  //             <div className="mt-5 max-w-2xl space-y-3 text-sm leading-7 text-muted-foreground md:text-base pl-5">
  //               <ReactMarkdown>{description}</ReactMarkdown>
  //             </div>
  //           )}
  //         </div>
  //       </div>
  //     </div>
  //   </section>
  // );
}

export default AboutSection;