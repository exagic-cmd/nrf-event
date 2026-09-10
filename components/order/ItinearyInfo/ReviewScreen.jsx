// components/ReviewScreen.js
import React, { useState } from "react";
import { ArrowLeft } from "lucide-react";
import RatingSmiles from "./RatingSmiles";
import { useTranslation } from "next-i18next";

const ReviewScreen = ({ trip, onBack, onSubmit }) => {
  const { t } = useTranslation("order"); 

  const [reviewData, setReviewData] = useState({
    overall: 0,
    service: 0,
    value: 0,
    experience: 0,
    comments: ''
  });

  const handleSubmit = () => {
    onSubmit(reviewData);
    setReviewData({
      overall: 0,
      service: 0,
      value: 0,
      experience: 0,
      comments: ''
    });
  };

  return (
    <div className="min-h-screen bg-surface-muted">
      <div className="max-w-6xl mx-auto px-4 py-4 sm:px-6 sm:py-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground mb-4 sm:mb-6 transition-colors"
        >
          <ArrowLeft size={20} />
          <span className="text-sm sm:text-base">{t("back")}</span>
        </button>

        <div className="bg-surface rounded-2xl sm:rounded-3xl shadow-xl overflow-hidden">
          {/* Header */}
          <div className="relative h-48 sm:h-64 md:h-80">
            <img
              src={trip.image}
              alt={trip.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/40"></div>
            <div className="absolute bottom-4 left-4 sm:bottom-6 sm:left-6">
              <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-1 sm:mb-2">
                {trip.title}
              </h1>
              <p className="text-white/90 text-sm sm:text-base">
                {t("bookingId")}: {trip.id}
              </p>
            </div>
          </div>

          {/* Review Form */}
          <div className="p-4 sm:p-8 md:p-12 space-y-6 sm:space-y-8">
            <div className="text-center mb-3 sm:mb-4">
              <h2 className="text-lg sm:text-2xl font-bold text-foreground mb-1 sm:mb-2">
                {t("howWasExperience")}
              </h2>
              <p className="text-muted-foreground text-sm sm:text-base">
                {t("feedbackHelps")}
              </p>
            </div>

            <RatingSmiles
              rating={reviewData.overall}
              onRate={(rating) =>
                setReviewData({ ...reviewData, overall: rating })
              }
              label={t("overallExperience")}
            />

            <RatingSmiles
              rating={reviewData.service}
              onRate={(rating) =>
                setReviewData({ ...reviewData, service: rating })
              }
              label={t("serviceQuality")}
            />

            <RatingSmiles
              rating={reviewData.value}
              onRate={(rating) =>
                setReviewData({ ...reviewData, value: rating })
              }
              label={t("valueForMoney")}
            />

            <RatingSmiles
              rating={reviewData.experience}
              onRate={(rating) =>
                setReviewData({ ...reviewData, experience: rating })
              }
              label={t("tourGuide")}
            />

            <div className="space-y-2 sm:space-y-3">
              <label className="block text-base sm:text-lg font-semibold text-foreground">
                {t("tellUsMore")}
              </label>
              <textarea
                value={reviewData.comments}
                onChange={(e) =>
                  setReviewData({ ...reviewData, comments: e.target.value })
                }
                className="w-full p-3 sm:p-4 border-2 border-border rounded-xl focus:border-blue-500 focus:ring-0 resize-none h-28 sm:h-32"
                placeholder={t("shareThoughts")}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4 sm:pt-6">
              <button
                onClick={onBack}
                className="flex-1 px-5 py-3 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:bg-muted transition-colors text-sm sm:text-base"
              >
                {t("cancel")}
              </button>
              <button
                onClick={handleSubmit}
                className="flex-1 px-5 py-3 bg-primary text-primary-foreground rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 text-sm sm:text-base"
              >
                {t("submitReview")}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
