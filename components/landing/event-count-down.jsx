"use client";

import { useState, useEffect } from "react";
import { useEventStore } from "@/store/useEventStore";
import { MapPin, Calendar, Flag, Clock, User, Globe } from "lucide-react";

function formatDate(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

function TimeBox({ label, value }) {
  return (
    <div className="flex min-w-[64px] flex-col items-center sm:min-w-[96px]">
      <div className="flex w-full items-center justify-center rounded-2xl bg-primary px-3 py-3 text-primary-foreground shadow-sm sm:px-5 sm:py-5">
        <span className="text-3xl font-semibold tabular-nums tracking-tight sm:text-5xl">
          {String(value).padStart(2, "0")}
        </span>
      </div>
      <span className="mt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground sm:text-xs">
        {label}
      </span>
    </div>
  );
}

function DetailRow({ icon: Icon, label, children }) {
  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/10">
        <Icon className="h-4 w-4 text-primary" aria-hidden="true" />
      </div>
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted-foreground">
          {label}
        </p>
        <p className="mt-1 break-words text-sm font-medium text-foreground sm:text-base">
          {children}
        </p>
      </div>
    </div>
  );
}

export default function CountdownTimer({ className = "" }) {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const eventDetails = useEventStore((state) => state.event?.event);

  useEffect(() => {
    const end = eventDetails?.reg_end;
    if (!end) {
      setEndTime(null);
      setTimeLeft(null);
      return;
    }
    const endOfDay = new Date(end);
    endOfDay.setHours(23, 59, 59, 999);
    setEndTime(endOfDay.getTime());
  }, [eventDetails?.reg_end]);

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const diff = endTime - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / (1000 * 60 * 60 * 24)),
        hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((diff / (1000 * 60)) % 60),
        seconds: Math.floor((diff / 1000) % 60),
      });
    };

    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [endTime]);

  if (!eventDetails || !timeLeft) {
    return (
      <section className={`w-full py-10 ${className}`}>
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="animate-pulse rounded-2xl border border-border bg-card/60 p-10 text-center text-sm text-muted-foreground">
            Loading countdown…
          </div>
        </div>
      </section>
    );
  }

  const registrationEnded =
    timeLeft.days === 0 &&
    timeLeft.hours === 0 &&
    timeLeft.minutes === 0 &&
    timeLeft.seconds === 0;

  const { location, start_date, end_date } = eventDetails;

  return (
    <section
      className={`relative w-full overflow-hidden py-10 sm:py-12 md:py-16 ${className}`}
      aria-labelledby="event-countdown-heading"
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
        <div className="rounded-2xl border border-border bg-card/75 p-6 shadow-sm backdrop-blur-sm sm:p-8 md:p-10">
          <div className="flex flex-col items-center text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary sm:text-sm">
              {registrationEnded ? "Registration closed" : "Registration closes in"}
            </p>
            <h2
              id="event-countdown-heading"
              className="mt-2 max-w-2xl text-xl font-semibold leading-tight text-foreground sm:text-2xl md:text-3xl"
            >
              {registrationEnded
                ? "Thanks — registration for this event has ended."
                : `Secure your spot before ${formatDate(eventDetails.reg_end)}`}
            </h2>

            <div className="mt-7 flex flex-wrap items-start justify-center gap-3 sm:gap-5">
              <TimeBox label="Days" value={timeLeft.days} />
              <TimeBox label="Hours" value={timeLeft.hours} />
              <TimeBox label="Minutes" value={timeLeft.minutes} />
              <TimeBox label="Seconds" value={timeLeft.seconds} />
            </div>
          </div>

          <div className="mt-10 grid grid-cols-1 gap-6 border-t border-border pt-8 sm:grid-cols-2 lg:grid-cols-3">
            {location && (
              <DetailRow icon={MapPin} label="Location">
                {location}
              </DetailRow>
            )}
            {start_date && (
              <DetailRow icon={Calendar} label="Start date">
                {formatDate(start_date)}
              </DetailRow>
            )}
            {end_date && (
              <DetailRow icon={Flag} label="End date">
                {formatDate(end_date)}
              </DetailRow>
            )}
            {eventDetails.reg_end && (
              <DetailRow icon={Clock} label="Registration deadline">
                <span className="text-primary">{formatDate(eventDetails.reg_end)}</span>
              </DetailRow>
            )}
            {eventDetails.time_zone?.name && (
              <DetailRow icon={Globe} label="Time zone">
                {eventDetails.time_zone.name}
              </DetailRow>
            )}
            {eventDetails.organizer && (
              <DetailRow icon={User} label="Organizer">
                {eventDetails.organizer}
              </DetailRow>
            )}
          </div>

          {eventDetails.short_desc && (
            <p className="mt-8 border-t border-border pt-6 text-sm leading-6 text-muted-foreground sm:text-base sm:leading-7">
              <span className="font-semibold text-foreground">About the event: </span>
              {eventDetails.short_desc}
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
