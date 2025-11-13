"use client";

import { useState, useEffect } from "react";

export default function CountdownTimer({ className = "" }) {
  const [endTime, setEndTime] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      const data = await $helpers.getEventData();
      const end = data?.event?.reg_end;

      if (end) {
        setEndTime(new Date(end).getTime());
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

  if (!timeLeft) {
    return (
      <section className="w-full py-12 md:py-24 lg:py-24 bg-black relative overflow-hidden">
        <div className="text-white text-center animate-pulse">
          Loading countdown...
        </div>
      </section>
    );
  }

  return (
    <section
      className={`w-full py-12 md:py-24 lg:py-24 bg-black relative overflow-hidden ${className}`}
    >
      <div className="container px-4 md:px-6 mx-auto max-w-7xl flex justify-center">
        <div className="bg-white w-full max-w-xl rounded-2xl shadow-2xl p-8 flex items-center justify-center gap-6">
          <TimeBox label="Days" value={timeLeft.days} />
          <TimeBox label="Hours" value={timeLeft.hours} />
          <TimeBox label="Minutes" value={timeLeft.minutes} />
          <TimeBox label="Sec" value={timeLeft.seconds} />
        </div>
      </div>
    </section>
  );
}

function TimeBox({ label, value }) {
  return (
    <div className="flex flex-col items-center bg-gray-900 px-6 py-5 rounded-xl min-w-[90px]">
      <span className="text-4xl font-bold tracking-wide text-white">
        {String(value).padStart(2, "0")}
      </span>
      <span className="text-sm uppercase text-gray-400 mt-1">{label}</span>
    </div>
  );
}
