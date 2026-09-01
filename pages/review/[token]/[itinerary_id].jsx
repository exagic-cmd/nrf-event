import React, { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import RatingSmiles from "@/components/order/ItinearyInfo/RatingSmiles";
import { useOrderStore } from "@/store/useOrderStore";
import { useRouter } from "next/router";
import useUserStore from "@/store/useAuthStore";
import LoadingSvg2 from "@/components/common/Loader2Svg";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";


const ReviewScreen = ({ onBack }) => {
  const { t } = useTranslation("order"); 
  const router = useRouter();
  const { token: qrcode, itinerary_id: itineraryId } = router.query;

  const {
    selectedTrip,
    fetchReviewQuestions,
    reviewQuestions,
    loading: storeLoading,
  } = useOrderStore();

  const { user, submitReview } = useUserStore();

  const [reviewData, setReviewData] = useState({
    overall: 0,
    comments: "",
    answers: {},
  });
const [successMessage, setSuccessMessage] = useState("");

  const [reviewMeta, setReviewMeta] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState({});
  const [alreadySubmitted, setAlreadySubmitted] = useState(false);
  const [invalidItinerary, setInvalidItinerary] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    const loadData = async () => {
      if (router.isReady && itineraryId && qrcode) {
        const result = await fetchReviewQuestions(itineraryId, qrcode);

        if (result?.error) {
          setInvalidItinerary(true);
          setErrorMessage(result.error);
          return;
        }

        if (result?.message === "Review already exists for this product.") {
          setInvalidItinerary(true);
          return;
        }

if (result?.success && result?.message?.toLowerCase()?.includes("success")) {
  setReviewMeta({
    order_itinerary_id: result.itinerary_id,
    customer_id: result.customer_id,
    category_id: result.category_id,
    product_id: result.product_id,
    booking_id: result.booking_id,
    
  });
} else {
  console.error("❌ Failed to fetch review meta:", result?.error || result);
        }
      }
    };
    loadData();
  }, [router.isReady, itineraryId, qrcode, fetchReviewQuestions]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(storeLoading);
    }, 500);
    return () => clearTimeout(timer);
  }, [storeLoading]);

  const handleInputChange = (questionId, value) => {
    setErrors((prev) => ({ ...prev, [questionId]: null }));
    setReviewData((prev) => ({
      ...prev,
      answers: { ...prev.answers, [questionId]: value },
    }));
  };


  const validateForm = () => {
    const newErrors = {};
    if (!reviewData.overall) newErrors.overall = t("error.overall");
    reviewQuestions.forEach((q) => {
      if (!reviewData.answers[q.id]) newErrors[q.id] = t("error.required");
    });
    if (!reviewData.comments.trim()) newErrors.comments = t("error.message");
    return newErrors;
  };

  const handleSubmit = async () => {
    const newErrors = validateForm();
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    if (!reviewMeta) {
      setErrors({ general: [t("error.missingInfo")] });
      return;
    }

    const payload = {
      product_id: reviewMeta?.product_id || selectedTrip?.product_id || "",
      client_id: reviewMeta?.customer_id || user?.id || "",
      category_id: reviewMeta?.category_id || selectedTrip?.category_id || "",
      booking_id: reviewMeta?.booking_id || selectedTrip?.booking_id || "",
      order_itinerary_id: reviewMeta?.itinerary_id || itineraryId,
      user_remarks: reviewData.comments || "",
      rating: reviewData.overall,
      answers: Object.entries(reviewData.answers).map(([qid, ans]) => ({
        question_id: Number(qid),
        answer: ans,
      })),
    };

   try {
  setErrors({});
  const result = await submitReview(payload);

  if (result?.error) {
    if (result.error.includes("already")) setAlreadySubmitted(true);
    else setErrors({ general: [result.error] });
    return;
  }

  if (
    result?.message === "Review submitted successfully." ||
    result?.message === "success" ||
    result?.message === "Review created successfully."
  ) {
    setErrors({});
    setSuccessMessage(t("success.submitted"));
    setReviewData({ overall: 0, comments: "", answers: {} });
  } else {
    setErrors({ general: [result?.message || t("error.unknown")] });
  }
} catch (err) {
  console.error("❌ Submit failed:", err);
  setErrors({ general: [t("error.submitFail")] });
}
  };
  if (isLoading)
    return (
      <div className="min-h-screen bg-muted flex items-center justify-center">
        <LoadingSvg2 />
      </div>
    );
if (successMessage)
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-surface-muted bg-opacity-50 p-4">
      <div className="bg-surface p-6 rounded-xl shadow-lg max-w-md w-full text-center">
        <h2 className="text-lg sm:text-xl font-bold mb-4 text-primary">
          {t("success.title", { defaultValue: "Thank you!" })}
        </h2>
        <p className="text-muted-foreground mb-6">
          {successMessage || t("success.submitted")}
        </p>
        <button
          onClick={() => router.push("/order")}
          className="px-6 py-2 bg-primary text-white rounded-lg "
        >
          {t("button.back")}
        </button>
      </div>
    </div>
  );

  if (invalidItinerary)
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 p-4">
        <div className="bg-surface p-6 rounded-xl shadow-lg max-w-md w-full text-center">
          {/* <h2 className="text-lg sm:text-xl font-bold mb-4">
            {t("invalid.title")}
          </h2> */}
          <p className="text-muted-foreground mb-6">
            {errorMessage || t("invalid.message")}
          </p>
          <button
            onClick={() => router.push("/order")}
            className="px-6 py-2 bg-primary text-white rounded-lg"
          >
            {t("button.back")}
          </button>
        </div>
      </div>
    );

  return (
    <div className="min-h-screen lg:mt-20 md:mt-12 mt-12 bg-surface-muted">
      <div className="max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8">
        {/* Back button */}
        <button
          onClick={onBack ? onBack : () => router.push("/order")}
          className="flex items-center mt-2  gap-2 text-gray-100 hover:text-primary mb-6 transition-colors"
        >
          <ArrowLeft size={20} /> {t("button.back")}
        </button>

        <div className="bg-surface rounded-3xl shadow-xl overflow-hidden p-6 sm:p-8 md:p-12">
          {errors.general && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
              <ul className="list-disc list-inside">
                {errors.general.map((msg, i) => (
                  <li key={i}>{msg}</li>
                ))}
              </ul>
            </div>
          )}
{errors.general || !reviewQuestions?.length ? (
  <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg mb-6">
    <p>
      {errorMessage ||
        errors.general?.[0] ||
        "No review questions available for this itinerary."}
    </p>
    <button
      onClick={() => router.push("/order")}
      className="mt-4 px-6 py-2 bg-primary text-white rounded-lg"
    >
      {t('goback')}
    </button>
  </div>
          ) : (
            <>
          <div className="text-center mb-8">
            <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-2">
              {t("heading.title", {
                name: selectedTrip?.title || selectedTrip?.hotel_name,
              })}
            </h2>
            <p className="text-muted-foreground">{t("heading.subtitle")}</p>
          </div>

          <RatingSmiles
            rating={reviewData.overall}
            onRate={(rating) => {
              setErrors((prev) => ({ ...prev, overall: null }));
              setReviewData((prev) => ({ ...prev, overall: rating }));
            }}
            label={t("labels.overall")}
          />
          {errors.overall && (
            <p className="text-red-500 text-sm">{errors.overall}</p>
          )}

        {reviewQuestions?.length > 0 &&
                reviewQuestions.map((q) => (
            <div key={q.id} className="space-y-2">
              <label className="block text-base sm:text-lg font-semibold text-foreground">
                {q.question}
              </label>
              {q.type === "rating" ? (
                <RatingSmiles
                  rating={reviewData.answers[q.id] || 0}
                  onRate={(rating) => handleInputChange(q.id, rating)}
                  label=""
                />
              ) : (
                <textarea
                  value={reviewData.answers[q.id] || ""}
                  onChange={(e) => handleInputChange(q.id, e.target.value)}
                  className="w-full p-4 border-2 border-border rounded-xl focus:border-blue-500 focus:ring-0 resize-none h-24"
                  placeholder={t("placeholder.answer")}
                />
              )}
              {errors[q.id] && (
                <p className="text-red-500 text-sm">{errors[q.id]}</p>
              )}
            </div>
          ))}

          <div className="space-y-3">
            <label className="block text-base sm:text-lg font-semibold text-foreground">
              {t("labels.comment")}
            </label>
            <textarea
              value={reviewData.comments}
              onChange={(e) => {
                setErrors((prev) => ({ ...prev, comments: null }));
                setReviewData((prev) => ({
                  ...prev,
                  comments: e.target.value,
                }));
              }}
              className="w-full p-4 border-2 border-border rounded-xl focus:border-blue-500 focus:ring-0 resize-none h-32"
              placeholder={t("placeholder.comment")}
            />
            {errors.comments && (
              <p className="text-red-500 text-sm">{errors.comments}</p>
            )}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <button
              onClick={onBack ? onBack : () => router.push("/order")}
              className="flex-1 px-6 py-3 border-2 border-border text-muted-foreground rounded-xl font-semibold hover:bg-muted transition-colors"
            >
              {t("button.cancel")}
            </button>

            {!alreadySubmitted ? (
              <button
                onClick={handleSubmit}
                disabled={storeLoading}
                className="flex-1 px-6 py-3 bg-primary text-white rounded-xl font-semibold hover:shadow-lg transform hover:scale-105 transition-all duration-200 disabled:opacity-50"
              >
                {storeLoading ? t("button.submitting") : t("button.submit")}
              </button>
            ) : (
              <p className="bg-primary font-semibold flex-1 text-center self-center">
                {t("alreadySubmitted")}
              </p>
            )}
          </div>
           </>
            )}
        </div>
      </div>
    </div>
  );
};

export default ReviewScreen;
export async function getServerSideProps({ locale }) {
  console.log("Current locale:", locale);
  return {
    props: {
      ...(await serverSideTranslations(locale ?? "en", ["common", "order"])),
    },
  };

}