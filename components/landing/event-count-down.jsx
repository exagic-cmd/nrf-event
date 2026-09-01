"use client";

import { useState, useEffect } from "react";
import helpers from "@/lib/helpers"; 
import { MapPin, Calendar, Flag, Clock,User,Building2, Globe, Mail, Phone,Globe2,Share2 } from 'lucide-react';
const { getEventData, formatDate } = helpers;
function TimeBox({ label, value }) {
  return (
    <div className="flex flex-col items-center text-foreground px-3 py-3 sm:px-4 sm:py-4 rounded-xl min-w-[60px] sm:min-w-[90px]">
      <span className="text-2xl sm:text-4xl font-bold tracking-wide text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-xs sm:text-sm uppercase text-muted-foreground mt-1">{label}</span>
    </div>
  );
}

export default function CountdownTimer({ className = "" }) {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [eventDetails, setEventDetails] = useState(null);
  useEffect(() => {
    async function loadEvent() {
      const data = await getEventData();
      const end = data?.event?.reg_end;
      if (data?.event) {
        setEventDetails(data.event); 
      }

      if (end) {
        const endOfDay = new Date(end);
        endOfDay.setHours(23, 59, 59, 999);
        setEndTime(endOfDay.getTime());
      }
    }
    loadEvent();
  }, []);

  useEffect(() => {
    if (!endTime) return;

    const tick = () => {
      const now = Date.now();
      const diff = endTime - now;

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
  if (!timeLeft || !eventDetails) {
    return (
      <section className="w-full py-8 sm:py-12 md:py-24 bg-surface relative overflow-hidden">
        <div className="text-surface-foreground text-center animate-pulse text-base sm:text-lg">
          Loading countdown...
        </div>
      </section>
    );
  }
  const registrationEnded = timeLeft.days === 0 && timeLeft.hours === 0 && timeLeft.minutes === 0 && timeLeft.seconds === 0;
  const { title, location, start_date, end_date } = eventDetails;
  return (
    <section
      className={`w-full pt-2 pb-3 md:pb-6 bg-surface relative overflow-hidden ${className}`}
    >
      <div className="container px-4 sm:px-6 mx-auto max-w-7xl flex flex-col items-center">
      
        {/* <div className="text-center mb-2 max-w-3xl">
         
          {registrationEnded ? (
            <p className="text-xl text-red-400 font-semibold">
              ⚠️ Registration for this event has ended!
            </p>
          ) : (
            <p className="text-xl text-[#CCA555] font-semibold">
              Time left to register before the deadline:
            </p>
          )}
        </div> */}
        <div className="w-full max-w-xl p-4 sm:p-6 md:p-8 flex flex-wrap sm:flex-nowrap items-center justify-center gap-4 sm:gap-6 mb-6">
          <TimeBox label="Days" value={timeLeft.days} />
          <TimeBox label="Hours" value={timeLeft.hours} />
          <TimeBox label="Minutes" value={timeLeft.minutes} />
          <TimeBox label="Sec" value={timeLeft.seconds} />
        </div>

{/* --- Event Details Card --- */}
<div className="w-full p-6 sm:p-8 bg-surface rounded-2xl shadow-xl border border-[#12366A]">
  {/* <h2 className="text-2xl sm:text-3xl font-bold text-foreground mb-8">
    Event Details
  </h2> */}

  <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-8 text-foreground">

    {/* Location */}
    <div className="flex items-start gap-4">
      <MapPin className="w-6 h-6 text-[#2176FF] mt-1" />
      <div>
        <p className="font-semibold text-foreground">Location</p>
        <p className="text-muted-foreground">{location}</p>
      </div>
    </div>

    {/* Start Date */}
    <div className="flex items-start gap-4">
      <Calendar className="w-6 h-6 text-[#2176FF] mt-1" />
      <div>
        <p className="font-semibold text-foreground">Start Date</p>
        <p className="text-muted-foreground">{formatDate(start_date)}</p>
      </div>
    </div>

    {/* End Date */}
    <div className="flex items-start gap-4">
      <Flag className="w-6 h-6 text-[#2176FF] mt-1" />
      <div>
        <p className="font-semibold text-foreground">End Date</p>
        <p className="text-muted-foreground">{formatDate(end_date)}</p>
      </div>
    </div>

    {/* Registration Deadline */}
    <div className="flex items-start gap-4">
      <Clock className="w-6 h-6 text-[#2176FF] mt-1" />
      <div>
        <p className="font-semibold text-foreground">Registration Deadline</p>
        <p className="text-primary font-semibold">
          {formatDate(eventDetails.reg_end)}
        </p>
      </div>
    </div>

    {/* Time Zone */}
    {eventDetails.time_zone?.name && (
      <div className="flex items-start gap-4">
        <Globe className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Time Zone</p>
          <p className="text-muted-foreground">{eventDetails.time_zone.name}</p>
        </div>
      </div>
    )}

    {/* Organizer */}
    {eventDetails.organizer && (
      <div className="flex items-start gap-4">
        <User className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Organizer</p>
          <p className="text-muted-foreground">{eventDetails.organizer}</p>
        </div>
      </div>
    )}

    {/* Company Name */}
    {/* {eventDetails.company_name && (
      <div className="flex items-start gap-4">
        <Building2 className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Company</p>
          <p className="text-muted-foreground">{eventDetails.company_name}</p>
        </div>
      </div>
    )} */}

    {/* Contact Number */}
    {/* {eventDetails.phone && (
      <div className="flex items-start gap-4">
        <Phone className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Phone</p>
          <p className="text-muted-foreground">{eventDetails.phone}</p>
        </div>
      </div>
    )} */}

    {/* Email */}
    {/* {eventDetails.email && (
      <div className="flex items-start gap-4">
        <Mail className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Email</p>
          <p className="text-muted-foreground">{eventDetails.email}</p>
        </div>
      </div>
    )} */}

    {/* Website */}
    {/* {eventDetails.web_link && (
      <div className="flex items-start gap-4">
        <Globe2 className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Website</p>
          <a
            href={eventDetails.web_link}
            target="_blank"
            className="text-blue-600 underline"
          >
            Visit Website
          </a>
        </div>
      </div>
    )} */}

    {/* Social Links */}
    {/* {(eventDetails.fb_link || eventDetails.twitter_link || eventDetails.linkedIn_link) && (
      <div className="flex items-start gap-4">
        <Share2 className="w-6 h-6 text-[#2176FF] mt-1" />
        <div>
          <p className="font-semibold text-foreground">Social</p>
          <div className="flex gap-3 mt-1">
            {eventDetails.fb_link && (
              <a href={eventDetails.fb_link} target="_blank" className="text-blue-600 underline">
                Facebook
              </a>
            )}
            {eventDetails.twitter_link && (
              <a href={eventDetails.twitter_link} target="_blank" className="text-blue-600 underline">
                Twitter
              </a>
            )}
            {eventDetails.linkedIn_link && (
              <a href={eventDetails.linkedIn_link} target="_blank" className="text-blue-600 underline">
                LinkedIn
              </a>
            )}
          </div>
        </div>
      </div>
    )} */}

  </div>

  {/* Description */}
  {eventDetails.short_desc && (
    <p className="mt-10 text-surface-foreground border-t border-border pt-6 leading-relaxed">
      <span className="font-semibold text-foreground">About the Event: </span>
      {eventDetails.short_desc}
    </p>
  )}
</div>




      </div>
    </section>
  );
}