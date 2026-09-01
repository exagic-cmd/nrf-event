import { useRouter } from "next/router";
import Link from "next/link";
import { redirectToAirwallexCheckout } from "@/utils/airwallex";
import { redirectToStripeCheckout } from "@/components/stripe/CheckoutRedirect"; 
import Layout from "@/components/layout/Layout";
import { useEffect, useState } from "react";

export default function ResumePayment() {
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [orderDetails, setOrderDetails] = useState(null);

  const router = useRouter();
  const { orderId } = router.query;

  const PAYMENT_GATEWAY = process.env.NEXT_PUBLIC_PAYMENT_GATEWAY; // "stripe" or "airwallex"

  useEffect(() => {
    if (!orderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/orderInfo/${orderId}`
        );
        const data = await res.json();

        if (data?.status === "success" && data?.data) {
          const order = data.data;
          setOrderDetails(order);

          if (order.booking_status !== "Unconfirmed") {
            router.replace(`/payment-success?orderId=${order.id}`);
            return;
          }
        } else {
          console.error("Invalid order data", data);
        }
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [orderId, router]);

  const handleResume = () => {
    if (!orderId) return;
    localStorage.setItem("pendingPaymentOrderId", orderId);
    setRedirecting(true);

    redirectToStripeCheckout(orderId);
  };

  if (loading) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen">
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </Layout>
    );
  }

  if (redirecting) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-screen bg-muted">
          <p className="text-lg font-semibold text-muted-foreground">
            Redirecting to secure checkout...
          </p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen mt-6 md:mt-12 bg-black px-4 py-6 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="bg-surface shadow-xl rounded-2xl overflow-hidden">
            {/* Header */}
            <div className="bg-brand-secondary px-4 py-4 text-center relative">
              <div className="mx-auto w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-2 shadow-lg">
                <svg
                  className="w-6 h-6 text-[#CC9A55]"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2.5}
                    d="M14.828 14.828a4 4 0 01-5.656 0M9 10h1m4 0h1m-6 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <h1 className="text-xl font-bold text-white mb-1">
                Resume Payment
              </h1>
              <p className="text-white text-sm">Continue your booking</p>
            </div>

            {/* Content */}
            <div className="px-4 py-4 space-y-3">
              {orderId && (
                <div className="bg-muted rounded-lg p-2 border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-muted-foreground text-xs font-medium">
                      Order ID:
                    </span>
                    <span className="font-bold text-foreground font-mono text-xs bg-surface px-2 py-1 rounded border">
                      {orderId}
                    </span>
                  </div>
                </div>
              )}

              {/* Message */}
              <div className="text-center">
                <div className="flex items-center justify-center space-x-1 text-[#CC9A55] mb-2">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z" />
                  </svg>
                  <span className="font-semibold text-xs">Payment Pending</span>
                </div>
                <p className="text-muted-foreground text-xs leading-relaxed">
                  You have an unfinished payment!
                </p>
              </div>

              {/* Info Section */}
              <div className="bg-amber-50 rounded-lg p-3 border border-amber-100">
                <div className="flex items-center justify-center space-x-1 text-amber-600 mb-1">
                  <svg
                    className="w-3 h-3"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" />
                  </svg>
                  <span className="font-semibold text-xs">Almost There!</span>
                </div>
                <p className="text-amber-700 text-xs text-center">
                  Complete your payment to secure your booking.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={handleResume}
                  className="w-full bg-brand-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2"
                >
                  <svg
                    className="w-4 h-4"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  <span className="text-sm">Continue Payment</span>
                </button>

                <Link href="/" className="block">
                  <button className="w-full bg-muted hover:bg-secondary text-muted-foreground font-semibold py-3 px-4 rounded-lg transition-all duration-200 flex items-center justify-center space-x-2 border border-border">
                    <svg
                      className="w-4 h-4"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
                    </svg>
                    <span className="text-sm">Back to Home</span>
                  </button>
                </Link>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center mt-4">
            <p className="text-white text-xs">
              Thank you for choosing Airport Transfers AI
            </p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
