"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Gift, Check, MessageCircle } from "lucide-react";
import { getIP } from "@/utils/getIP";
import { useRouter } from "next/navigation";
import { getFullImageUrl } from "@/utils/imageService";
export default function PromoModal({ isOpen, onClose, onSuccess, visitorId = null, userId = null, promo = null }) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [onlineAgent, setOnlineAgent] = useState(null);
  const [agentLoading, setAgentLoading] = useState(true);
  const router = useRouter();

  const activePromo = promo;
useEffect(() => {
    if (isOpen) {
    //  fetchOnlineAgent();
    }
  }, [isOpen]);


  const fetchOnlineAgent = async () => {
    setAgentLoading(true);
    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/agent-online`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (response.ok) {
        const data = await response.json();
        if (data?.success && data?.data?.agent) {
          setOnlineAgent(data.data.agent);
        }
      }
    } catch (err) {
      console.error("Failed to fetch online agent:", err);
    } finally {
      setAgentLoading(false);
    }
  };

  const handleStartChat = async () => {
    if (!name.trim() || !email.trim()) {
      setError("Please fill in your name and email");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email");
      return;
    }

    setLoading(true);

    try {
      let ipAddress = null;
      try {
        const cached = localStorage.getItem("cachedIPInfo");
        if (cached) {
          const obj = JSON.parse(cached);
          ipAddress = obj?.ip || null;
        } else {
          const ipObj = await getIP();
          ipAddress = ipObj?.ip || null;
        }
      } catch {}

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const payload = {
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
        visitor_id: visitorId || null,
        promo_id: activePromo.id,
        ip_address: ipAddress,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/add_popup_customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();

      if (data?.success) {
        const agentName = onlineAgent?.name || "";
        const chatUrl = `/chat?agent=${encodeURIComponent(agentName)}`;
        router.push(chatUrl);
      } else {
        setError(data?.message || "Something went wrong. Please try again.");
        setLoading(false);
      }
    } catch (err) {
      console.error("Promo submission error:", err);
      setError("Failed to submit. Please try again.");
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  if (!activePromo) return null;

  const validateEmail = (value) => {
    return /\S+@\S+\.\S+/.test(value);
  };

  const handleSubmit = async (e) => {
    e?.preventDefault();
    setError("");
    setSuccessMessage("");
    if (!validateEmail(email)) {
      setError("Please enter a valid email");
      return;
    }
    setLoading(true);

    try {
      let ipAddress = null;
      try {
        const cached = localStorage.getItem("cachedIPInfo");
        if (cached) {
          const obj = JSON.parse(cached);
          ipAddress = obj?.ip || null;
        } else {
          const ipObj = await getIP();
          ipAddress = ipObj?.ip || null;
        }
      } catch {
       }

      const nameParts = name.trim().split(" ");
      const firstName = nameParts[0] || "";
      const lastName = nameParts.slice(1).join(" ") || "";

      const payload = {
        email: email.trim(),
        first_name: firstName,
        last_name: lastName,
        visitor_id: visitorId || null,
        promo_id: activePromo.id,
        ip_address: ipAddress,
      };

      const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
      const response = await fetch(`${baseUrl}/add_popup_customer`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!response.ok) throw new Error("API request failed");
      const data = await response.json();

      if (data?.success) {
      try { onSuccess?.(activePromo.id); } catch (e) {}

       if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('promoAppliedAndSearch', { detail: { promo_id: activePromo.id } }));
        }

        setSuccessMessage(data?.message || "Thank you! Check your email.");
        setTimeout(() => {
          onClose?.();
        }, 5000);
      } else {
        setError(data?.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Promo submission error:", err);
      setError("Failed to submit. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const formatAmount = (val) => {
    return val ? parseFloat(val).toString() : "";
  };

  const discountValue = activePromo.promo_type === "percent" || activePromo.promo_type === "flat"
    ? `${formatAmount(activePromo.amount || activePromo.discount)}%`
    : activePromo.promo_type === "flat"
    ? `$${formatAmount(activePromo.amount)}`
    : `${formatAmount(activePromo.amount || activePromo.discount)}%`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4 pointer-events-none">
      {/* Black background */}
      <div 
        className="absolute inset-0 pointer-events-auto bg-black/70"
        style={{
          animation: "fadeIn 0.4s ease-out forwards"
        }}
        onClick={() => {
          onClose?.();
        }}
      />
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-8px); }
        }
        .animate-slideUp {
          animation: slideUp 0.6s ease-out forwards;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>

      {/* Modal */}
      <div 
        className="w-full max-w-md pointer-events-auto relative animate-slideUp"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="relative bg-white rounded-2xl shadow-2xl p-8 overflow-hidden">
          
          {/* Close button */}
          <button
            aria-label="Close"
            onClick={onClose}
            className="absolute right-4 top-4 p-2  rounded-full hover:bg-gray-100 transition-all duration-300 z-10"
          >
            <X className="w-5 h-5 text-gray-400" />
          </button>

          {/* Content */}
          <div className="relative">
            {/* Icon */}
            <div className="flex justify-center mb-3">
              <Gift className="w-12 h-12 text-[#D3202D] animate-float" />
            </div>

            {/* Main offer display */}
            {!successMessage && <div className="text-center mb-8">
              <div className="mb-6 bg-gray-50 rounded-2xl p-8 border border-gray-200">
                <div className="text-6xl font-black text-[#D3202D]">
                  {discountValue}<span className="text-4xl">{" OFF"}</span>
                  
                  
                  
                </div>
                <div className="text-xs font-bold text-gray-600 mt-2 tracking-widest uppercase">Limited Time Offer</div>
              </div>

              <p className="text-base font-semibold text-gray-900 mb-2">
                {activePromo.text || "Please provide your name and email to unlock this offer"}
              </p>
              {/* <p className="text-sm text-gray-600">
                Use code: <span className="font-bold text-gray-900">{activePromo.promocode}</span>
              </p> */}
            </div>}

            {/* Form */}
            {successMessage ? (
              <div className="text-center py-6 animate-slideUp">
                <div className="flex justify-center mb-4">
                  <div className="rounded-full bg-[#D3202D]/10 p-3">
                    <Check className="w-8 h-8 text-[#D3202D]" />
                  </div>
                </div>
                <h3 className="text-xl font-bold text-[#D3202D] mb-2">
                  Successfully Applied!
                </h3>
                <p className="text-gray-600">{successMessage}</p>
              </div>
            ) : onlineAgent && !agentLoading ? (
              <div className="space-y-2">
                <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <img
                    src={getFullImageUrl(onlineAgent.profile_photo_url)}
                    alt={onlineAgent.name}
                    className="w-14 h-14 rounded-full border-2 border-[#D3202D] shadow-sm flex-shrink-0"
                  />
                  <div className="text-left">
                    <h3 className="text-base font-bold text-gray-900">
                      Hi, I'm {onlineAgent.name}
                    </h3>
                    <p className="text-gray-600 text-xs leading-tight mt-1">
                      Let me help you book your transfer with special discount.
                    </p>
                  </div>
                </div>
 <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 placeholder-gray-400 disabled:opacity-60 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && !loading && handleStartChat()}
                      placeholder="you@example.com"
                      disabled={loading}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 placeholder-gray-400 disabled:opacity-60 text-gray-900"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-xs text-red-600 font-medium text-center">
                    {error}
                  </p>
                )}

                <button
                  onClick={handleStartChat}
                  disabled={loading || !name.trim() || !email.trim()}
                  className={`w-full py-2.5 px-6 rounded-lg font-semibold text-white text-sm transition-all duration-300 flex items-center justify-center gap-2 ${
                    loading || !name.trim() || !email.trim()
                      ? "bg-gray-400 cursor-not-allowed opacity-75"
                      : "bg-[#D3202D] hover:bg-[#B8851F]"
                  }`}
                >
                  {loading ? (
                    <span className="flex items-center justify-center gap-2">
                      <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{animation: "spin 1s linear infinite"}} />
                      Connecting...
                    </span>
                  ) : (
                    <>
                      <MessageCircle className="w-4 h-4" />
                      Start Chat
                    </>
                  )}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-2">
                  We respect your privacy.
                </p>
              </div>
            ) : (
              // Original Discount Button Flow
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="John Doe"
                      disabled={loading || !!successMessage}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 placeholder-gray-400 disabled:opacity-60 text-gray-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-700 mb-1 uppercase tracking-wide">Email</label>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
                      placeholder="you@example.com"
                      disabled={loading || !!successMessage}
                      className="w-full px-3 py-2 bg-white border-2 border-gray-200 rounded-lg text-sm transition-all duration-300 placeholder-gray-400 disabled:opacity-60 text-gray-900"
                    />
                  </div>
                </div>

              {error && (
                <p className="text-sm text-red-600 font-medium">
                  {error}
                </p>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className={`w-full py-3 px-6 rounded-lg font-semibold text-white transition-all duration-300 ${
                  loading
                    ? "bg-gray-400 cursor-not-allowed opacity-75"
                    : "bg-[#D3202D]"
                }`}
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <span className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full" style={{animation: "spin 1s linear infinite"}} />
                    Submitting...
                  </span>
                ) : (
                  "Get Discount"
                )}
              </button>
            </div>
            )}

            {/* Footer */}
            {!successMessage && !onlineAgent && <p className="mt-5 text-xs text-gray-500 text-center">
              We respect your privacy.
            </p>}
          </div>
        </div>
      </div>
    </div>
  );
}