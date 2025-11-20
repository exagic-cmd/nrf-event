"use client";

import { useRouter } from "next/router";
import { useState } from "react";
import { retryCheckout } from "../../lib/stripeApi";
import { stripePromise } from "../../lib/stripe";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations"
export default function CancelPage() {
  const { t } = useTranslation("payment"); 
  const router = useRouter();
  const { order_id } = router.query;

  const [loading, setLoading] = useState(false);

  const handleRetry = async () => {
    if (!order_id || loading) return;

    setLoading(true);

    try {
      const data = await retryCheckout(order_id);

      if (data.id) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        alert(t("error.retryFail"));
      }
    } catch (err) {
      console.error("Retry error:", err);
      alert(t("error.retryFail"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#f7f2ec]">
      <p className="text-xl font-semibold mb-4 text-[#D3202D]">
        ⚠️ {t("message.paymentCanceled")}
      </p>

      {order_id && (
        <button
          onClick={handleRetry}
          disabled={loading}
          className={`px-6 py-3 rounded-lg text-white transition flex items-center justify-center
            ${loading ? "bg-[#b08445] cursor-not-allowed" : "bg-[#D3202D] hover:bg-[#b08445]"}`}
        >
          {loading ? (
            <svg
              className="animate-spin h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              ></circle>
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
              ></path>
            </svg>
          ) : (
            t("button.retryPayment")
          )}
        </button>
      )}
    </div>
  );
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "payment"])),
    },
  }
}