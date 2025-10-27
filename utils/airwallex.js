import { init } from '@airwallex/components-sdk';

function showLoader() {
  let loader = document.getElementById('airwallex-loader');
  if (!loader) {
    loader = document.createElement('div');
    loader.id = 'airwallex-loader';
    loader.innerHTML = `
      <div style="
        position: fixed;
        inset: 0;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        background: rgba(255, 255, 255, 0.85);
        z-index: 9999;
        font-family: sans-serif;
      ">
        <div style="
          width: 60px;
          height: 60px;
          border: 6px solid #fcd6bd;
          border-top: 6px solid #CC9A55;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        "></div>
        <p style="
          margin-top: 20px;
          font-size: 1.1rem;
          font-weight: 600;
          color: #CC9A55;
        ">
          Redirecting to secure payment checkout...
        </p>
      </div>
      <style>
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      </style>
    `;
    document.body.appendChild(loader);
  }
}

function hideLoader() {
  const loader = document.getElementById('airwallex-loader');
  if (loader) loader.remove();
}

export async function redirectToAirwallexCheckout(orderId) {
  try {
    showLoader();

    const res = await fetch(
      `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/payments/create-intent`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId }),
      }
    );

    if (!res.ok) throw new Error(`Failed to create payment intent: ${res.status}`);

    const { id: intent_id, client_secret } = await res.json();

    const { payments } = await init({
      env: process.env.NEXT_PUBLIC_AIRWALLEX_ENV || 'prod',
      enabledElements: ['payments'],
    });

    localStorage.setItem("pendingPaymentOrderId", orderId);

    payments.redirectToCheckout({
      intent_id,
      client_secret,
      currency: process.env.NEXT_PUBLIC_PAYMENT_CURRENCY || 'SGD',
      country_code: process.env.NEXT_PUBLIC_PAYMENT_COUNTRY || 'SG',
      successUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-success?orderId=${orderId}`,
      failUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-failed?orderId=${orderId}`,
    });
  } catch (err) {
    console.error('Airwallex redirect error:', err);
    alert('Unable to start payment. Please try again later.');
    hideLoader();
  }
}