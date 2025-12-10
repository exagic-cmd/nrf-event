import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SideDrawer from "@/components/layout/SideDrawer";
import { useDrawerStore } from "@/store/useDrawerStore";
import CartBubble from "@/components/common/CartBubble";
import { useTranslation } from "next-i18next";
import { AlertCircle, Loader2, Lock, Eye, EyeClosed } from "lucide-react";
import { redirectToAirwallexCheckout } from "@/utils/airwallex";
import { stripePromise } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/stripeApi";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout({ children }) {
  const { isOpen, drawerContent, closeDrawer } = useDrawerStore();
  const { t } = useTranslation("common");
  const router = useRouter();




  const [accessGranted, setAccessGranted] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");

  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [loading, setLoading] = useState(false);


  useEffect(() => {
    const orderId = localStorage.getItem("pendingPaymentOrderId");
    if (orderId) setPendingOrderId(orderId);
  }, []);

  useEffect(() => {
    if (router.pathname === "/payment-success") setPendingOrderId(null);
  }, [router.pathname]);


  const handleStripeResume = async (orderId) => {
    try {
      setLoading(true);
      const data = await createCheckoutSession(orderId);
      if (data?.id) {
        const stripe = await stripePromise;
        await stripe.redirectToCheckout({ sessionId: data.id });
      } else {
        setLoading(false);
        alert("Unable to resume Stripe payment. Please try again.");
      }
    } catch (err) {
      console.error("Stripe resume failed:", err);
      setLoading(false);
      alert("Stripe payment failed. Please try again.");
    }
  };

  const handleAirwallexResume = async (orderId) => {
    try {
      setLoading(true);
      await redirectToAirwallexCheckout(orderId);
    } catch (err) {
      console.error("Airwallex resume failed:", err);
      setLoading(false);
      alert("Airwallex payment failed. Please try again.");
    }
  };
  return (
    <>
      <Head>
        <meta name="agd-partner-manual-verification" content="" />
      </Head>

    

      {/* ===== MAIN LAYOUT ===== */}
      <Header />
      <main className="min-h-screen">{children}</main>

      {pendingOrderId && !loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#CC9A55] text-white text-sm px-4 py-3 rounded-xl shadow-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 z-50 max-w-[90%] sm:max-w-2xl w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>You have a pending payment (Order ID: {pendingOrderId})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStripeResume(pendingOrderId)}
              className="bg-white text-[#CC9A55] px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
            >
              Resume Payment
            </button>
            <button
              onClick={() => {
                localStorage.removeItem("pendingPaymentOrderId");
                setPendingOrderId(null);
              }}
              className="bg-white/20 text-white px-3 py-1 rounded-lg text-xs font-semibold hover:bg-white/30 transition"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Redirecting to secure checkout…</p>
        </div>
      )}

      <Footer />
      <SideDrawer isOpen={isOpen} onClose={closeDrawer} title={t("tourDetail")}>
        {drawerContent || <p>{t("noContentYet")}</p>}
      </SideDrawer>
      {!router.pathname.includes("booking") && <CartBubble />}
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
    </>
  );
}
