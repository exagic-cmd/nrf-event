import React, { useState } from "react";
import { useTranslation } from "next-i18next";
import { Clock, Utensils, Car, Building, Plane, LogIn, LogOut, Camera, Waves, Moon, Info, MapPin } from "lucide-react";
import { getFullImageUrl } from "@/utils/imageService";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"; // Assuming shadcn/ui accordion
import { Badge } from "@/components/ui/badge"; // Assuming shadcn/ui badge
import { cn } from "@/lib/utils"; // For conditional class names

const ActivityDescription = ({ text }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { t } = useTranslation("daytour");

  if (!text) return null;

  return (
    <div className="mt-2 flex flex-col items-start">
      <p className={cn(
        "text-muted-foreground text-sm leading-relaxed transition-all duration-300",
        !isExpanded && "line-clamp-2"
      )}>
        {text}
      </p>
      {text.length > 120 && (
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-primary text-xs font-semibold mt-1 hover:underline focus:outline-none text-left"
        >
          {isExpanded ? t("showLess") : t("showMore")}
        </button>
      )}
    </div>
  );
};

const TourItinerary = ({ itineraryData }) => {
  const { t } = useTranslation(["common", "daytour"]);

  // Ensure itineraryData is an object with itinerary_days
  const itineraryDays = itineraryData?.itinerary_days || [];

  // Gracefully handle empty or missing itinerary data
  if (!Array.isArray(itineraryDays) || itineraryDays.length === 0) {
    return null;
  }

  const getTagDetails = (activity) => {
    const category = activity.category_name;
    const tag = activity.tag;
    const subtype = activity.subtype;

    if (category === "Transfers") {
      const isArrival = tag?.toLowerCase().includes("pickup") || tag?.toLowerCase().includes("arrival");
      return {
        icon: isArrival ? Plane : Car,
        label: isArrival ? t("daytour:airportPickup", "Arrive") : (tag || t("daytour:transfer")),
      };
    }

    if (category === "Accommodations") {
      if (subtype === "check_in") return { icon: LogIn, label: t("daytour:checkIn") };
      if (subtype === "check_out") return { icon: LogOut, label: t("daytour:checkOut") };
      if (subtype === "breakfast") return { icon: Utensils, label: t("daytour:breakfast") };
      if (subtype === "stay") return { icon: Moon, label: t("daytour:accommodation") };
      return { icon: Building, label: t("daytour:accommodation") };
    }

    const defaultIcon = category === "Day Tours" ? Camera : Info;
    return { icon: defaultIcon, label: tag || t("daytour:activity") };
  };

  return (
    <div className="py-8 lg:py-12">
      <h2 className="text-2xl lg:text-3xl font-bold text-primary mb-6 lg:mb-8">
        {t("daytour:tourItinerary", "Day by Day Itinerary")}
      </h2>
      <Accordion
        type="single"
        collapsible
        defaultValue={itineraryDays.length > 0 ? `day-${itineraryDays[0].day}` : undefined}
        className="w-full space-y-4 lg:space-y-5"
      >
        {itineraryDays.map((dayItem) => (
          <AccordionItem
            key={dayItem.day}
            value={`day-${dayItem.day}`}
            className="border border-border rounded-2xl overflow-hidden bg-card/80 backdrop-blur-sm shadow-lg"
          >
            <AccordionTrigger className="flex justify-start items-center py-4 px-4 sm:py-5 sm:px-6 hover:bg-muted transition-all text-foreground hover:no-underline gap-3 sm:gap-5">
              <div className="bg-primary text-primary-foreground w-9 h-9 sm:w-11 sm:h-11 rounded-xl flex items-center justify-center font-semibold text-sm shrink-0">
                {dayItem.day}
              </div>
              <span className="text-lg sm:text-xl lg:text-2xl font-semibold tracking-tight">
                {t("day", "Day")} {dayItem.day}
              </span>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-5 pt-1 sm:px-6 sm:pb-6 sm:pt-2">
              <div className="space-y-5 sm:space-y-6 relative before:absolute before:left-[15px] sm:before:left-[19px] before:top-1 before:bottom-1 before:w-px before:bg-border">
                {dayItem.activities
                  .sort((a, b) => {
                    // Sort by sequence first to maintain logical travel flow (Pick-up -> Check-in)
                    return (Number(a.sequence) || 0) - (Number(b.sequence) || 0);
                  })
                  .map((activity, index) => {
                    const { icon: Icon, label, color } = getTagDetails(activity);

                    return (
                      <div
                        key={activity.id || index}
                        className="flex gap-4 sm:gap-6 relative ml-8 sm:ml-10"
                      >
                        {/* Timeline Bullet */}
                        <div className="absolute -left-[25px] sm:-left-[33px] top-1.5 w-3 h-3 sm:w-4 sm:h-4 rounded-full bg-background border-2 border-primary z-10" />

                        <div className="flex flex-col md:flex-row bg-background border border-border rounded-2xl overflow-hidden w-full group hover:border-primary/40 transition-all duration-300 shadow-sm hover:shadow-xl">
                          {/* Image Container - Fixed Size */}
                          <div className="relative w-full md:w-56 h-36 sm:h-44 md:h-40 flex-shrink-0 overflow-hidden">
                            <img
                              src={getFullImageUrl(activity.image) || "/placeholder.svg"}
                              alt={activity.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:hidden" />
                          </div>

                          <div className="p-4 sm:p-5 flex-grow flex flex-col justify-center items-start text-left min-w-0">
                            <div className="flex flex-wrap items-start justify-between w-full mb-3 gap-2">
                              <div className="space-y-1 min-w-0">
                                <Badge variant="outline" className="text-[10px] uppercase tracking-[0.15em] px-2 py-0.5 font-semibold bg-primary/5 text-primary border-primary/20">
                                  <Icon className="mr-1 h-3 w-3 shrink-0" />
                                  <span className="truncate">{label}</span>
                                </Badge>
                                <h4 className="text-base sm:text-lg font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                                  {activity.title}
                                </h4>
                              </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1.5 mb-3">
                              {(activity.display_time || activity.start_time) && (
                                <div className="flex items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                  <Clock size={14} className="mr-1.5 text-primary shrink-0" />
                                  {activity.display_time || activity.start_time}
                                </div>
                              )}
                              {activity.city_name && activity.city_name.toLowerCase() !== "singapore" && (
                                <div className="flex items-center text-muted-foreground text-xs font-bold uppercase tracking-wider">
                                  <MapPin size={14} className="mr-1.5 text-primary shrink-0" />
                                  {activity.city_name}
                                </div>
                              )}
                            </div>

                            <ActivityDescription text={activity.description} />
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
};

export default TourItinerary;