"use client";

import { useEffect, useState } from "react";
import { stripePromise } from "../../lib/stripe";
import { createCheckoutSession } from "../../lib/stripeApi";
import { useCartStore } from "@/store/useCartStore";
export async function redirectToStripeCheckout(orderId) {
  try {
    localStorage.setItem("pendingPaymentOrderId", orderId);

    const data = await createCheckoutSession(orderId);
       useCartStore.getState().clearCart();
    if (data.error || !data.id) throw new Error(data.error || "No session ID");

    const stripe = await stripePromise;
    const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
    if (error) throw error;
  } catch (err) {
    console.error("Stripe redirect failed:", err);
    alert("Failed to start checkout. Please try again.");
  }
}

export default function CheckoutRedirect({ orderId }) {
  const [status, setStatus] = useState("loading");

  const startCheckout = async () => {
    setStatus("loading");
    try {
      localStorage.setItem("pendingPaymentOrderId", orderId);
       
      
      const data = await createCheckoutSession(orderId);
  useCartStore.getState().clearCart();
      if (data.error) {
        console.error("Stripe error:", data.error);
        setStatus("error");
        return;
      }

      const stripe = await stripePromise;
      setStatus("redirecting");
      const { error } = await stripe.redirectToCheckout({ sessionId: data.id });
      if (error) {
        console.error("Stripe redirect failed:", error);
        setStatus("error");
      }
    } catch (err) {
      console.error("Checkout error:", err);
      setStatus("error");
    }
  };

  useEffect(() => {
    if (orderId) startCheckout();
  }, [orderId]);

  if (status === "loading")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold">Preparing secure checkout...</p>
      </div>
    );

  if (status === "redirecting")
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <p className="text-xl font-semibold">Redirecting to Stripe checkout...</p>
      </div>
    );

  if (status === "error")
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 gap-4">
        <p className="text-red-600 text-lg font-semibold">
          ❌ Payment initiation failed.
        </p>
        <button
          className="bg-[#CC9A55] text-white px-6 py-2 rounded-md font-semibold hover:bg-[#b68a47]"
          onClick={startCheckout}
        >
          Retry
        </button>
      </div>
    );

  return null;
}