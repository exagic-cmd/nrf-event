import React, { useState, useEffect } from "react";
import { Check } from "lucide-react";

function PromoButton({ label = "Apply Promo", prominent = false, onClick }) {
 let applied = false;
  try {
    if (typeof window !== "undefined") {
      applied = !!localStorage.getItem("promo_id");
    }
  } catch (e) {
    applied = false;
  }

  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (applied) {
      setIsVisible(true);
      const timer = setTimeout(() => setIsVisible(false), 5000);
      return () => clearTimeout(timer);
    }
  }, [applied]);

  const handleClick = (e) => {
   if (typeof window !== "undefined") {
      window.dispatchEvent(new CustomEvent("openPromoModal"));
    }
    if (onClick) onClick(e);
  };

  if (applied) {
    if (!isVisible) return null;
    return (
      <div className={`flex items-center gap-1 text-text font-medium ${prominent ? "text-sm" : "text-xs"}`}>
        <Check size={prominent ? 16 : 14} />
        <span>Promo Applied</span>
      </div>
    );
  }

  if (prominent) {
    return (
      <button
        onClick={handleClick}
        className="bg-primary text-primary-foreground px-4 py-2 rounded-md font-medium shadow-sm hover:bg-primary-hover"
      >
        {label}
      </button>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="px-2 py-0.5 text-xs font-bold text-primary-foreground bg-primary rounded-md shadow-sm"
    >
      {label}
    </button>
  );
}

export default PromoButton;
