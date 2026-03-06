const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;

export async function createCheckoutSession(orderId) {
  const res = await fetch(`${API_URL}/create-checkout-session`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ order_id: orderId }),
  });
  return res.json();
}

export async function getCheckoutSession(sessionId) {
  const res = await fetch(`${API_URL}/checkout/session/${sessionId}`);
  return res.json();
}

export async function retryCheckout(orderId) {
  const res = await fetch(`${API_URL}/checkout/retry/${orderId}`, {
    method: "POST",
  });
  return res.json();
}