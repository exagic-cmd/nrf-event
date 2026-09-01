// components/CookieConsent.jsx
"use client";
import { useEffect, useState } from "react";
import Cookies from "js-cookie";

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    const consent = Cookies.get("cookie_consent");
    if (!consent) setShowBanner(true);
  }, []);

  const handleAccept = () => {
    Cookies.set("cookie_consent", "accepted", { expires: 365 });
    setShowBanner(false);
  };

  const handleDecline = () => {
    Cookies.set("cookie_consent", "declined", { expires: 365 });
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <div className="fixed bottom-0 w-full bg-card text-card-foreground border-t p-4 shadow-lg z-50">
      <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-3">
        <p className="text-sm text-muted-foreground">
          🍪 We use cookies to improve your experience. By continuing, you agree to our use of cookies.
        </p>
        <div className="flex gap-2">
          <button onClick={handleAccept} className="bg-primary text-primary-foreground px-4 py-1 rounded hover:bg-primary-hover">
            Accept
          </button>
          <button onClick={handleDecline} className="bg-secondary text-secondary-foreground px-4 py-1 rounded hover:bg-muted">
            Decline
          </button>
        </div>
      </div>
    </div>
  );
}
