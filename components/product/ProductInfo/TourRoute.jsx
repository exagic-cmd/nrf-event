"use client";

import { useState } from "react";
import { useTranslation } from "next-i18next"; 

const ItineraryTimeline = ({
  stops = [],
  title = "Tour Itinerary",
  customColor = null,
  secondaryColor = "white"
}) => {
  const { t } = useTranslation("daytour"); 
  const [expandedStop, setExpandedStop] = useState(null);

  const colorStyles = customColor
    ? {
        bgCircle: { backgroundColor: customColor },
        bgHeader: { backgroundColor: customColor },
        textTitle: { color: customColor },
        textBtn: { color: customColor },
        borderLine: { borderColor: customColor }
      }
    : null;

  const toggleExpand = (id) => {
    setExpandedStop((prev) => (prev === id ? null : id));
  };

  return (
    <div className="p-4 pb-12 font-sans">
      <div className="max-w-3xl bg-black overflow-hidden">
        <div className="p-6">
          {stops.map((stop, index) => (
            <div key={stop.id} className="relative pl-16 py-4 mb-10">
              {/* Vertical connector line */}
              {index < stops.length && (
                <div
                  className="absolute top-14 left-6 h-full border-l-2"
                  style={{ borderColor: "#CC9A55" }}
                ></div>
              )}

              {/* Number Circle */}
              <div
                className="absolute left-0 top-0 z-10 w-12 h-12 rounded-full text-white flex items-center justify-center font-bold text-lg"
                style={{ backgroundColor: "#CC9A55" }}
              >
                {stop.sequence || index + 1}
              </div>

              {/* Travel Mode Icon */}
              {stop.travel_mode === "DRIVING" ? (
                <div className="mt-12 absolute left-0 bottom-1 z-10 w-12 h-12 rounded-full bg-surface text-surface-foreground flex items-center justify-center border border-border shadow-md">
                  <img
                    className="h-6 w-6"
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/lf2qbooh2bgk15b01xdq.svg`}
                    alt=""
                  />
                </div>
              ) : stop.travel_mode === "WALKING" ? (
                <div className="mt-12 absolute left-0 bottom-1 z-10 w-12 h-12 rounded-full bg-surface text-surface-foreground flex items-center justify-center border border-border shadow-md">
                  <img
                    className="h-6 w-6"
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/wxi5gj9uzfrsydu3kdfj.svg`}
                    alt=""
                  />
                </div>
              ) : null}

              {/* Title & Time */}
              <div>
                <div className="flex">
                  <p className="text-gray-100 mt-1 mr-2 text-sm md:text-md">
                    {formatTime12(stop.start_time)}
                  </p>
                  <h2
                    className="text-md md:text-lg md:mt-0 mt-1 line-clamp-1 font-bold"
                    style={{ color: "#CC9A55" }}
                  >
                    {stop.Title}
                  </h2>
                </div>

                {/* Stop time & admission */}
                <p className="text-white text-sm">
                  {stop.stop_time &&
                    `${t("stopTime")} ${stop.stop_time} ${t("minutes")}`}
                  {stop.admission_status &&
                    ` | ${stop.admission_status} ${t("admission")}`}
                </p>

                {/* Description */}
                <div
                  className={`text-white mt-2 ${
                    expandedStop === stop.id ? "" : "line-clamp-1"
                  }`}
                >
                  {typeof stop.description === "string"
                    ? stop.description.replace(/<\/?[^>]+(>|$)/g, "")
                    : t("noDescription")}
                </div>

                {/* Show more/less */}
                {stop.description?.length > 50 && (
                  <button
                    onClick={() => toggleExpand(stop.id)}
                    className="font-medium mt-1 hover:underline"
                    style={{ color: "#CC9A55" }}
                  >
                    {expandedStop === stop.id ? t("showLess") : t("showMore")}
                  </button>
                )}

                {/* Travel time & distance */}
                {(stop.travel_time || stop.travel_distance) && (
                  <div className="mt-5 text-sm text-white flex items-center">
                    {stop.travel_time && `${stop.travel_time}`}
                    {stop.travel_distance && ` • ${stop.travel_distance}`}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

function formatTime12(time24) {
  if (!time24) return "";
  const [hourStr, minute] = time24.split(":");
  let hour = parseInt(hourStr, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  hour = hour % 12;
  hour = hour === 0 ? 12 : hour;
  return `${hour}:${minute} ${ampm}`;
}

export default function TourRoute({ stops }) {
  const { t } = useTranslation("tour");

  if (!stops || stops.length === 0) {
    return (
      <p className="p-6 text-start text-muted-foreground">
        {t("noTourRoute")}
      </p>
    );
  }

  return (
    <ItineraryTimeline
      stops={stops}
      title={t("tourItinerary")}
      customColor="#CC9A55"
      secondaryColor="white"
    />
  );
}
