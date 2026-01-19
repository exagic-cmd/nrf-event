import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import SideDrawer from "@/components/layout/SideDrawer";
import { useDrawerStore } from "@/store/useDrawerStore";
import CartBubble from "@/components/common/CartBubble";
import AccommodationTimerBubble from "@/components/common/AccommodationTimerBubble";
import PromoModal from "@/components/layout/PromoModal";
import useUserStore from "@/store/useAuthStore";
import { useTranslation } from "next-i18next";
import { useVisitorStore } from "@/store/useVisitorStore";
import { getIP } from "@/utils/getIP";
import { AlertCircle, Loader2, Lock, Eye, EyeClosed } from "lucide-react";
import { redirectToAirwallexCheckout } from "@/utils/airwallex";
import { stripePromise } from "@/lib/stripe";
import { createCheckoutSession } from "@/lib/stripeApi";
import CookieConsent from "@/components/common/CookieConsent";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Layout({ children }) {
  const { isOpen, drawerContent, closeDrawer } = useDrawerStore();
  const { t } = useTranslation(["common", "privacy"])
  const [isVisible, setIsVisible] = useState(false)
  const router = useRouter();
  const { initializeVisitor } = useVisitorStore();
  const visitorId = useVisitorStore((s) => s.userId);
  const authUserId = useUserStore((s) => s.userId ?? (s.user && s.user.id) ?? null);
  const [accessGranted, setAccessGranted] = useState(false);
  const [showAccessModal, setShowAccessModal] = useState(false); 
  const [showPassword, setShowPassword] = useState(false);
  const [statusMessage, setStatusMessage] = useState("");
  const [error, setError] = useState("");
  const [showPromoModal, setShowPromoModal] = useState(false);
  const [promoData, setPromoData] = useState(null);

  const [pendingOrderId, setPendingOrderId] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    initializeVisitor();
    getIP(); 
  }, []); 

 useEffect(() => {
    if (typeof window === "undefined") return;

    if (router.pathname !== "/" && router.pathname !== "/transfers") return;

    const seen = localStorage.getItem("promo_seen");
    let mounted = true;

    const fetchPromo = async () => {
      try {
        const base = process.env.NEXT_PUBLIC_API_BASE_URL || "";
        const res = await fetch(`${base}/getPopup_Discount`, { cache: "no-store" });
        if (!res.ok) throw new Error("promo fetch failed");
        const json = await res.json();
        if (mounted && json?.success && json?.data) {
          setPromoData(json.data);

          const savedPromoId = localStorage.getItem("promo_id");
          const seenUntil = parseInt(localStorage.getItem("promo_seen_until"), 10) || 0;
          const now = Date.now();
          if (!savedPromoId && (!seenUntil || seenUntil < now)) {
            setShowPromoModal(true);
          }
          return;
        }
      } catch (err) {
      }

      const savedPromoId = localStorage.getItem("promo_id");
      const seenUntil = parseInt(localStorage.getItem("promo_seen_until"), 10) || 0;
      const now = Date.now();
      if (!savedPromoId && (!seenUntil || seenUntil < now)) {
        const timer = setTimeout(() => setShowPromoModal(true), 800);
        return () => clearTimeout(timer);
      }
    };

    fetchPromo();
  const openHandler = () => setShowPromoModal(true);
    window.addEventListener('openPromoModal', openHandler);
    return () => {
      mounted = false;
      window.removeEventListener('openPromoModal', openHandler);
    };
  }, [router.pathname]);

  useEffect(() => {
    const orderId = localStorage.getItem("pendingPaymentOrderId");
    if (orderId) setPendingOrderId(orderId);
  }, []);

  useEffect(() => {
    if (router.pathname === "/payment-success") setPendingOrderId(null);
  }, [router.pathname]);


  // const handleStripeResume = async (orderId) => {
  //   try {
  //     setLoading(true);
  //     const data = await createCheckoutSession(orderId);
  //     if (data?.id) {
  //       const stripe = await stripePromise;
  //       await stripe.redirectToCheckout({ sessionId: data.id });
  //     } else {
  //       setLoading(false);
  //       alert("Unable to resume Stripe payment. Please try again.");
  //     }
  //   } catch (err) {
  //     console.error("Stripe resume failed:", err);
  //     setLoading(false);
  //     alert("Stripe payment failed. Please try again.");
  //   }
  // };

  // const handleAirwallexResume = async (orderId) => {
  //   try {
  //     setLoading(true);
  //     await redirectToAirwallexCheckout(orderId);
  //   } catch (err) {
  //     console.error("Airwallex resume failed:", err);
  //     setLoading(false);
  //     alert("Airwallex payment failed. Please try again.");
  //   }
  // };

  // const handleAcceptCookies = () => {
  //   getIP();
  // };

  return (
    <>
      <Head>
        <title>NRF</title>
        <meta name="agd-partner-manual-verification" content="" />
        <link rel="icon" type="image/png" href="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1768826953/nrf_sg_icon.png" />
      </Head>

    

      {/* ===== MAIN LAYOUT ===== */}
      <Header />
      <main className="min-h-screen">{children}</main>

      {/* {pendingOrderId && !loading && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#D3202D] text-white text-sm px-4 py-3 rounded-xl shadow-lg flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 z-50 max-w-[90%] sm:max-w-2xl w-full sm:w-auto">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>You have a pending payment (Order ID: {pendingOrderId})</span>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => handleStripeResume(pendingOrderId)}
              className="bg-white text-[#D3202D] px-3 py-1 rounded-lg text-xs font-semibold hover:bg-gray-100 transition"
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
      )} */}

      {loading && (
        <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 text-white">
          <Loader2 className="w-8 h-8 animate-spin mb-3" />
          <p className="text-sm font-medium">Redirecting to secure checkout…</p>
        </div>
      )}

      <Footer />
      <CookieConsent
      //  onAccept={handleAcceptCookies} 
       />
      <PromoModal
        isOpen={showPromoModal}
        onClose={() => {
          const savedPromoId = localStorage.getItem("promo_id");
          if (!savedPromoId) {
            const until = Date.now() + 24 * 60 * 60 * 1000;
            localStorage.setItem("promo_seen_until", String(until));
          }
          setShowPromoModal(false);
        }}
        onSuccess={(promoId) => {
          try {
            if (promoId) {
              localStorage.setItem('promo_id', promoId);
              localStorage.setItem('promo_saved_at', String(Date.now()));
              localStorage.removeItem('promo_seen_until');
            }
          } catch (e) {}
        }}
        visitorId={visitorId}
        userId={authUserId}
        promo={promoData}
      />
      <SideDrawer isOpen={isOpen} onClose={closeDrawer} title={t("tourDetail")}>
        {drawerContent || <p>{t("noContentYet")}</p>}
      </SideDrawer>
   {!router.pathname.includes("booking") && <CartBubble />}
      <AccommodationTimerBubble />
      <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} />
   
    </>
  );
}
