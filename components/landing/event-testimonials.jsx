"use client";

import { useEffect, useMemo, useState } from "react";
import { Quote, Star } from "lucide-react";
import useLanguageStore from "@/store/useLanguageStore";
import useCurrencyStore from "@/store/useCurrencyStore";
import { fetchEventProducts } from "@/lib/eventRegistrationApi";

function getInitials(name) {
  if (!name) return "?";
  return String(name)
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function StarRating({ value = 0, max = 5 }) {
  const safe = Math.max(0, Math.min(max, Number(value) || 0));
  return (
    <div className="flex items-center gap-0.5" aria-label={`Rated ${safe} out of ${max}`}>
      {Array.from({ length: max }).map((_, idx) => (
        <Star
          key={idx}
          className={`h-4 w-4 ${idx < safe ? "fill-primary text-primary" : "text-muted-foreground/40"}`}
          aria-hidden="true"
        />
      ))}
    </div>
  );
}

function TestimonialCard({ item }) {
  return (
    <figure className="flex h-full flex-col rounded-2xl border border-border bg-card/75 p-6 shadow-sm backdrop-blur-sm transition hover:border-primary/40 hover:shadow-md">
      <Quote className="h-8 w-8 text-primary/30" aria-hidden="true" />
      <blockquote className="mt-3 flex-1 text-sm leading-6 text-foreground sm:text-base sm:leading-7">
        “{item.message}”
      </blockquote>
      <figcaption className="mt-5 flex items-center gap-3 border-t border-border pt-4">
        {item.photo_url ? (
          <img
            src={item.photo_url}
            alt={item.name || "Attendee"}
            className="h-11 w-11 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
            {getInitials(item.name)}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-foreground">{item.name || "Anonymous"}</p>
          {item.designation && (
            <p className="truncate text-xs text-muted-foreground">{item.designation}</p>
          )}
        </div>
        {Number(item.rating) > 0 && <StarRating value={item.rating} />}
      </figcaption>
    </figure>
  );
}

export default function EventTestimonials({ eventSlug, className = "" }) {
  const languageId = useLanguageStore((state) => state.languageId) || 1;
  const currencyId = useCurrencyStore((state) => state.currencyId);
  const [testimonials, setTestimonials] = useState([]);

  useEffect(() => {
    if (!eventSlug) {
      setTestimonials([]);
      return undefined;
    }
    const controller = new AbortController();
    let active = true;

    fetchEventProducts(languageId, eventSlug, { signal: controller.signal, currencyId })
      .then(({ event }) => {
        if (!active) return;
        const list = Array.isArray(event?.testimonials) ? event.testimonials : [];
        setTestimonials(list);
      })
      .catch((error) => {
        if (controller.signal.aborted || error?.name === "AbortError") return;
        console.error("Unable to load testimonials:", error);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [eventSlug, languageId, currencyId]);

  const visibleTestimonials = useMemo(() => {
    if (testimonials.length <= 3) return testimonials;
    const pool = [...testimonials];
    for (let i = pool.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [pool[i], pool[j]] = [pool[j], pool[i]];
    }
    return pool.slice(0, 3);
  }, [testimonials]);

  if (!visibleTestimonials.length) return null;

  return (
    <section
      className={`relative w-full overflow-hidden py-12 sm:py-16 md:py-20 ${className}`}
      aria-labelledby="event-testimonials-heading"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -left-24 top-10 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-80 sm:w-80"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-24 bottom-0 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl sm:h-80 sm:w-80"
      />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
            Testimonials
          </p>
          <h2
            id="event-testimonials-heading"
            className="mt-2 text-2xl font-semibold leading-tight text-foreground sm:text-3xl md:text-4xl"
          >
            What attendees are saying
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Stories from past delegates who made the most of the event.
          </p>
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTestimonials.map((item) => (
            <TestimonialCard key={item.id} item={item} />
          ))}
        </div>
      </div>
    </section>
  );
}
