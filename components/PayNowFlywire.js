import { useEffect, useState } from 'react';
import { useRouter } from "next/router";
import { useLocalizedRouter } from "@/components/localizedRouter";
const PayNowFlywire = ({
  returnOrderId,
  name,
  email,
  totalPrice,
  branchId,
  onSuccess,
  onFailure,
  onClose 
}) => {
    const [flywireModal, setFlywireModal] = useState(null);
   const router = useRouter();
  const { localizedPush } = useLocalizedRouter();
useEffect(() => {
  console.log("PayNowFlywire props:", {
    returnOrderId,
    name,
    email,
    totalPrice,
    branchId,
    env: "prod",
    recipientCode: "OUH",
    thailandEnv: process.env.NEXT_PUBLIC_FLYWIRE_THAILAND_ENV,
    thailandRecipientCode: process.env.NEXT_PUBLIC_FLYWIRE_THAILAND_RECIPIENT_CODE,
    callbackUrl: "https://app.airporttransfers.ai/api/flywire-notifications",
    thailandCallbackUrl: process.env.NEXT_PUBLIC_FLYWIRE_THAILAND_CALLBACK_URL,
    callbackVersion: 2,
    thailandCallbackVersion: process.env.NEXT_PUBLIC_FLYWIRE_THAILAND_CALLBACK_VERSION,
  });

  const loadScript = () => {
    if (!document.getElementById('flywire-script')) {
      const script = document.createElement('script');
      script.id = 'flywire-script';
      script.src = 'https://checkout.flywire.com/flywire-payment.js';
      script.async = true;
      script.onload = () => {
        initiatePayment();
      };
      document.body.appendChild(script);
    } else {
      initiatePayment();
    }
  };

const initiatePayment = () => {
  const config = {
    env: "prod",
    recipientCode: "OUH",
    amount: parseFloat(totalPrice),
    firstName: name,
    lastName: "",
    email: email,
    phone: "",
    address: "",
    city: "",
    state: "",
    zip: "",
    country: "",
    locale: "en",
    readonlyFields: ["booking_reference", "order_id"],
    recipientFields: {
      booking_reference: returnOrderId,
      order_id: returnOrderId,
      additional_information: null,
    },
    callbackId: returnOrderId,
    callbackUrl: "https://app.airporttransfers.ai/api/flywire-notifications",
    callbackVersion:"2",
    onCancel: () => {
      localizedPush(`/payment-process/${returnOrderId}`);
    },

    onInvalidInput: (errors) => {
      errors.forEach((error) => alert(error.msg));
    },
    onCompleteCallback: (args) => {
      console.log("Payment Response:", args);
      if (args.status === "success") {
        onSuccess();
      } else {
        onFailure("failed");
      }
       if (flywireModal) {
            flywireModal.close();
          }
    },
    requestPayerInfo: true,
    requestRecipientInfo: false,
    nonce: "TE" + Math.floor(1000000 + Math.random() * 9000000),
    paymentOptionsConfig: {
      sort: [
        { currency: ["local", "foreign"] },
        { amount: "asc" },
        { type: ["credit_card"] },
      ],
    },
  };

  console.log("🚀 Final Flywire config:", config);

  if (window.FlywirePayment) {
    const modal = window.FlywirePayment.initiate(config);
    modal.render();
  } else {
    console.error("Flywire script not loaded.");
    onFailure("Flywire not loaded");
  }
};


    loadScript();

    return () => {
      if (flywireModal) {
        flywireModal.close();
      }
      const script = document.getElementById('flywire-script');
      if (script) {
        script.remove();
      }
    };
  }, [returnOrderId, name, email, totalPrice, branchId]);
  return null; 
};

export default PayNowFlywire;
