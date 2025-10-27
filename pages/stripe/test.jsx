"use client";

import { useEffect } from "react";
import { stripePromise } from "../../lib/stripe";
import { createCheckoutSession } from "../../lib/stripeApi";

export default function TestCheckoutPage() {
  const testOrderId = 7; // 🔹 replace with an existing order_id in DB

  useEffect(() => {
    const startCheckout = async () => {
      const data = await createCheckoutSession(testOrderId);

      if (data.error) {
        console.error("Stripe error:", data.error);
        alert("Checkout failed: " + data.error);
        return;
      }

      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: data.id });
    };

    startCheckout();
  }, []);

  return <p>Redirecting to Stripe Checkout for order {testOrderId}...</p>;
}