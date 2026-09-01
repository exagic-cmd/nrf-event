import React from "react";
import { useTranslation } from "next-i18next";
import { Clock, Briefcase, User, MessageSquare, MapPin } from "lucide-react";

const TourInfoCard = ({ price, duration, guideTour, guideLanguage, city, onBookNow }) => {
  const { t } = useTranslation("daytour");

  return (
    <div className="bg-surface rounded-lg shadow-lg overflow-hidden w-full">
      {/* Price Section */}
      <div className="p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <div className="text-sm text-muted-foreground">{t("from")}</div>
            <div className="text-2xl font-semibold text-[#CC9A55]">SGD {price}</div>
            <div className="text-sm text-muted-foreground">{t("per_person")}</div>
          </div>
          <button
            onClick={onBookNow}
            className="bg-brand-secondary  text-white font-medium px-5 py-2 rounded-full transition-colors"
          >
            {t("book_now")}
          </button>
        </div>
      </div>

      <br />

      {/* Tour Details Section */}
      <div className="p-4 shadow-sm">
        <div className="space-y-3">
          {duration && (
            <div className="flex items-center">
              <div className="w-8">
                <Clock size={20} className="text-muted-foreground" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">{t("duration")}:</span>
                <span className="text-foreground">{duration} {t("hours")}</span>
              </div>
            </div>
          )}

          {/* Always show Tour Type */}
          <div className="flex items-center">
            <div className="w-8">
              <Briefcase size={20} className="text-muted-foreground" />
            </div>
            <div className="flex justify-between w-full">
              <span className="text-muted-foreground">{t("tour_type")}:</span>
              <span className="text-foreground">{t("shared_tour")}</span>
            </div>
          </div>

          {guideTour && (
            <div className="flex items-center">
              <div className="w-8">
                <User size={20} className="text-muted-foreground" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">{t("guided_tour")}:</span>
                <span className="text-foreground">{guideTour}</span>
              </div>
            </div>
          )}

          {guideLanguage && (
            <div className="flex items-center">
              <div className="w-8">
                <MessageSquare size={20} className="text-muted-foreground" />
              </div>
              <div className="flex justify-between w-full">
                <span className="text-muted-foreground">{t("guide_language")}:</span>
                <span className="text-foreground">{guideLanguage}</span>
              </div>
            </div>
          )}

          {/* Always show visit city */}
          <div className="flex items-center">
            <div className="w-8">
              <MapPin size={20} className="text-muted-foreground" />
            </div>
            <div className="flex justify-between w-full">
              <span className="text-muted-foreground">{t("visit_city")}:</span>
              <span className="text-foreground">{city}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TourInfoCard;
