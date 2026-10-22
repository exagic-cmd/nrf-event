
import React from "react";
import ReactMarkdown from "react-markdown";
import { useEffect, useRef, useState } from "react";
import { ArrowRight } from "lucide-react";

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

  const title = isUsableEventCopy(eventDetails.about_title)
    ? eventDetails.about_title
    : null;

  const description = isUsableEventCopy(eventDetails.about_description)
    ? eventDetails.about_description
    : null;

  const image = eventDetails.about_image
    ? getFullImageUrl(eventDetails.about_image)
    : null;

  useEffect(() => {
    const element = descriptionRef.current;

    if (!element || !description) {
      setHasMoreDescription(false);
      return;
    }

    const measureDescription = () => {
      if (isDescriptionExpanded) {
        // Temporarily remove the clamp while measuring
        setHasMoreDescription(
          element.scrollHeight > element.clientHeight + 1
        );
        return;
      }

      setHasMoreDescription(
        element.scrollHeight > element.clientHeight + 1
      );
    };

    // Wait until markdown has rendered
    requestAnimationFrame(measureDescription);

    window.addEventListener("resize", measureDescription);

    return () => {
      window.removeEventListener("resize", measureDescription);
    };
  }, [description, layout, isDescriptionExpanded]);

  useEffect(() => {
    // Reset expanded state when description changes
    setIsDescriptionExpanded(false);
  }, [description]);

  if (!title && !description && !image) return null;

  /*
   * ============================================================
   * LAYOUT 1
   * Existing side-by-side design
   * ============================================================
   */

  if (layout === 1) {
    return (
      <section
        id="about"
        className="relative isolate my-8 w-full overflow-hidden md:my-10 md:py-16 lg:my-12 lg:py-10"
        style={{ scrollMarginTop: "5.5rem" }}
        aria-labelledby="event-about-title"
      >
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -left-24 top-8 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-72 w-72 rounded-full bg-primary/10 blur-3xl sm:h-96 sm:w-96"
        />
        <div className="mx-auto grid w-full max-w-7xl grid-cols-1 items-center gap-5 px-4 sm:gap-9 sm:px-6 md:grid-cols-2 md:gap-10 md:px-8 lg:gap-14">
        <div className="order-2 flex min-w-0 flex-col justify-center rounded-2xl border border-border/70 bg-card/75 p-4 backdrop-blur-sm md:order-1 md:rounded-3xl md:p-7 lg:p-10">
            <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
              About the event
            </p>

            {title && (
              <h2
                id="event-about-title"
                className="max-w-2xl break-words text-xl font-semibold leading-tight text-foreground [overflow-wrap:anywhere] md:text-2xl lg:text-3xl"
              >
                {title}
              </h2>
            )}

            {description && (
              <div className="mt-4 min-w-0 max-w-2xl break-words text-sm leading-6 text-muted-foreground [overflow-wrap:anywhere] sm:mt-5 sm:text-base sm:leading-7">
                <div
                  ref={descriptionRef}
                  className={
                    isDescriptionExpanded
                      ? "space-y-3 [&_p]:break-words"
                      : "line-clamp-5 space-y-3 [&_p]:break-words"
                  }
                >
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>

                {description && (
                  <button
                    type="button"
                    onClick={() =>
                      setIsDescriptionExpanded((expanded) => !expanded)
                    }
                    aria-expanded={isDescriptionExpanded}
                    className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                  >
                    {isDescriptionExpanded ? "Show less" : "Learn More"}
                    <ArrowRight
                      aria-hidden="true"
                      className={`h-4 w-4 transition-transform ${
                        isDescriptionExpanded ? "-rotate-90" : ""
                      }`}
                    />
                  </button>
                )}
              </div>
            )}
          </div>

          {image && (
            <div className="order-1 min-w-0 md:order-2">
              <img
                src={image}
                alt={title || "About the event"}
                className="mx-auto h-52 w-full rounded-2xl object-cover object-center shadow-lg sm:h-64 md:h-72 lg:h-[22rem]"
              />
            </div>
          )}
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * LAYOUT 2
   * Full-bleed image banner with overlapping card
   * ============================================================
   */

  if (layout === 2) {
    return (
      <section
        id="about"
        className="w-full my-12 py-12 md:py-20"
        style={{ scrollMarginTop: "5.5rem" }}
        aria-labelledby="event-about-title"
      >
        <div className="mx-auto mt-12 max-w-7xl px-4 md:mt-2 sm:px-6 lg:px-8">
          <div className="relative">
            {image && (
              <img
                src={image}
                alt={title || "About the event"}
                className="mx-auto h-auto max-h-[22rem] w-full rounded-2xl object-contain shadow-lg md:h-[26rem] md:max-h-none md:object-cover"
              />
            )}

            <div
              className={`relative md:absolute md:bottom-0 md:left-8 md:right-8 md:translate-y-1/3 ${
                image ? "-mt-10 md:mt-0" : ""
              }`}
            >
              <div className="mx-4 rounded-2xl bg-surface p-6 shadow-xl md:mx-0 md:p-8">
                <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                  About the event
                </p>

                {title && (
                  <h2
                    id="event-about-title"
                    className="text-2xl font-bold leading-tight text-foreground md:text-3xl"
                  >
                    {title}
                  </h2>
                )}

                {description && (
                  <div className="mt-3 max-w-2xl text-sm leading-7 text-muted-foreground">
                    <div
                      ref={descriptionRef}
                      className={
                        isDescriptionExpanded
                          ? "space-y-3"
                          : "line-clamp-5 space-y-3"
                      }
                    >
                      <ReactMarkdown>{description}</ReactMarkdown>
                    </div>

                    {hasMoreDescription && (
                      <button
                        type="button"
                        onClick={() =>
                          setIsDescriptionExpanded(
                            (expanded) => !expanded
                          )
                        }
                        className="mt-3 font-semibold text-primary underline-offset-4 hover:underline"
                      >
                        {isDescriptionExpanded
                          ? "Show less"
                          : "Read more"}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Spacer so the overlapping card has room to breathe on desktop */}
          <div className="hidden h-16 md:block" />
        </div>
      </section>
    );
  }

  /*
   * ============================================================
   * LAYOUT 3
   * Framed inset image with offset accent block
   * ============================================================
   */

  return (
    <section
      id="about"
      className="w-full my-12 py-12 md:py-20"
      style={{ scrollMarginTop: "5.5rem" }}
      aria-labelledby="event-about-title"
    >
      <div className="mx-auto mt-12 max-w-7xl px-4 md:mt-2 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-center gap-8 md:grid-cols-12 md:gap-10">
          {image && (
            <div className="relative order-1 md:col-span-5">
              <div className="absolute -left-4 -top-4 hidden h-full w-full rounded-2xl bg-primary/15 md:block" />

              <img
                src={image}
                alt={title || "About the event"}
                className="relative mx-auto h-auto max-h-[22rem] w-full rounded-2xl object-contain md:h-[24rem] md:max-h-none md:object-cover"
              />
            </div>
          )}

          <div
            className={`order-2 ${
              image ? "md:col-span-7" : "md:col-span-12"
            }`}
          >
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
              About the event
            </p>

            {title && (
              <h2
                id="event-about-title"
                className="max-w-2xl border-l-2 border-primary pl-5 text-3xl font-bold leading-tight text-foreground md:text-4xl"
              >
                {title}
              </h2>
            )}

            {description && (
              <div className="mt-5 max-w-2xl pl-5 text-sm leading-7 text-muted-foreground md:text-base">
                <div
                  ref={descriptionRef}
                  className={
                    isDescriptionExpanded
                      ? "space-y-3"
                      : "line-clamp-5 space-y-3"
                  }
                >
                  <ReactMarkdown>{description}</ReactMarkdown>
                </div>

                {hasMoreDescription && (
                  <button
                    type="button"
                    onClick={() =>
                      setIsDescriptionExpanded(
                        (expanded) => !expanded
                      )
                    }
                    className="mt-3 font-semibold text-primary underline-offset-4 hover:underline"
                  >
                    {isDescriptionExpanded
                      ? "Show less"
                      : "Read more"}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

export default AboutSection;
