"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Layout from "@/components/layout/Layout";
import { getCheckoutSession } from "../../lib/stripeApi";
import { MailCheck } from "lucide-react";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

if (typeof window !== "undefined") {
  localStorage.removeItem("pendingPaymentOrderId");
}

export default function SuccessPage() {
  const { t } = useTranslation("payment"); // i18n namespace
  const router = useRouter();
  const { session_id } = router.query;

  const [status, setStatus] = useState("loading");
  const [orderId, setOrderId] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState("unknown");
  const [refId, setRefId] = useState(null);

  const gateway =
    process.env.NEXT_PUBLIC_PAYMENT_GATEWAY?.toUpperCase() || "UNKNOWN";

  useEffect(() => {
    localStorage.removeItem("pendingPaymentOrderId");
  }, []);

  useEffect(() => {
    const fetchSession = async () => {
      try {
        if (!session_id) return;

        const data = await getCheckoutSession(session_id);

        if (data?.error) {
          setStatus("error");
          return;
        }

        setOrderId(data?.order_id || null);
        setPaymentStatus(data?.status || "unknown");
        setRefId(data?.id || null);

        if (data?.status === "paid") {
          setStatus("success");
          localStorage.removeItem("pendingPaymentOrderId");
        } else {
          setStatus("error");
        }
      } catch {
        setStatus("error");
      }
    };

    fetchSession();
  }, [session_id]);

  const renderContent = () => {
    if (status === "loading") {
      return (
        <div className="bg-surface border rounded-md px-4 py-4 shadow text-center">
          <p className="text-sm text-muted-foreground">{t("checkingStatus")}</p>
        </div>
      );
    }

    if (status === "error") {
      return (
        <div className="bg-surface border rounded-md px-4 py-4 shadow text-center">
          <h2 className="text-lg font-bold text-primary">{t("failedTitle")}</h2>
          <p className="text-sm text-muted-foreground">{t("failedMessage")}</p>
        </div>
      );
    }

    if (status === "success") {
      return (
        <div className="bg-surface border rounded-md px-4 py-4 shadow space-y-3">
          <h2
            className={`text-lg font-bold ${
              paymentStatus === "paid" ? "text-green-600" : "text-primary"
            }`}
          >
            {paymentStatus === "paid"
              ? t("successTitle")
              : t("notCompletedTitle")}
          </h2>

          <p className="text-sm text-muted-foreground">
            {paymentStatus === "paid" ? t("successMessage") : t("notCompletedMessage")}
          </p>

          {paymentStatus === "paid" && (
            <>
              {orderId && (
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground text-sm">{t("orderId")}</span>
                  <span className="font-mono font-bold">{orderId}</span>
                </div>
              )}

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t("paymentStatus")}</span>
                <span
                  className={`font-mono text-sm font-bold ${
                    paymentStatus === "paid" ? "text-green-600" : "text-primary"
                  }`}
                >
                  {paymentStatus}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-muted-foreground text-sm">{t("paidVia")}</span>
                <span className="font-mono text-sm text-blue-600">{gateway}</span>
              </div>

              <div className="flex items-center space-x-2 text-primary mt-2">
                <MailCheck size={14} />
                <span className="text-xs font-semibold">{t("emailSent")}</span>
              </div>
              <p className="text-muted-foreground text-xs">{t("emailDetails")}</p>
            </>
          )}

          <div className="border-t pt-2 mt-2 space-y-1 text-xs">
            <p className="text-muted-foreground font-semibold">{t("needHelp")}</p>
            <p className="text-muted-foreground">📞 +65 8804 1972</p>
            <p className="text-muted-foreground">📧 marketing@airporttransfers.ai</p>
          </div>

          <Link href="/" className="block pt-2">
            <button className="w-full bg-primary text-white font-semibold py-2 px-4 rounded-md hover:opacity-90">
              {t("backHome")}
            </button>
          </Link>
        </div>
      );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-black px-4 py-6">
        <div className="w-full max-w-md space-y-4">{renderContent()}</div>
      </div>
    </Layout>
  );
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "payment"])),
    },
  };
}