import React, { useState,useEffect } from 'react';
import { useRouter } from 'next/router';
import useUserStore from '@/store/useAuthStore';
import { useEventStore } from "@/store/useEventStore";
import { Phone, Mail } from "lucide-react"

function index() {
  //const [//, setShowFlywire] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const { message } = router.query;
  const { event, FetchEvent } = useEventStore();
  const handleTryAgain = () => {
   router.push("/")
  };

  return (
  <div className="min-h-screen mt-12 bg-surface-muted flex items-center justify-center p-4">
    <div className="
      bg-surface
      p-6 sm:p-8 md:p-10 lg:p-12 
      w-full
      max-w-md sm:max-w-lg md:max-w-xl lg:max-w-xl
      rounded-3xl shadow-2xl
      border border-orange-100 
      backdrop-blur-sm 
      text-center 
      relative
    ">
      
      {/* Top gradient bar */}
      <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D3202D] to-transparent rounded-t-3xl"></div>

      {/* Icon */}
      <div className="mb-6 flex justify-center">
        <div className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-[#33A1FD] to-[#D0E9FF] rounded-full flex items-center justify-center shadow-lg">
          <svg className="w-8 h-8 sm:w-10 sm:h-10 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        </div>
      </div>

      {/* Header */}
      <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-primary mb-3">
        An Error Occurred
      </h2>

      <p className="text-muted-foreground mb-6 text-base sm:text-lg leading-relaxed">
        {message ? decodeURIComponent(message) : "We couldn't process your request. Please try again."}
      </p>

      {/* Help Section */}
      <div className="bg-surface-muted p-4 sm:p-6 rounded-2xl mb-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-50 -skew-x-12 animate-pulse"></div>

        <div className="relative z-10">
          <h3 className="text-lg font-semibold text-foreground mb-4">
            Need Help?
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Phone */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
               <Phone className='text-red-500'/>
              </div>

              <div class="text-left">
                <p className="text-sm text-muted-foreground">Call Us</p>
                <a href={`tel:${event?.event?.phone}`} className="font-semibold text-primary">
                  {event?.event?.phone}
                </a>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-center justify-center sm:justify-start gap-3">
              <div className="w-10 h-10 bg-red-100 rounded-xl flex items-center justify-center">
                <Mail className='text-red-500'/>
              </div>

              <div class="text-left">
                <p className="text-sm text-muted-foreground">Email Us</p>
                <a href={`mailto:${event?.event?.email}`} className="font-semibold text-primary">
                  {event?.event?.email}
                </a>
              </div>
            </div>

          </div>
        </div>
      </div>

      {/* Try Again Button */}
      <button
        onClick={handleTryAgain}
        className="group w-full bg-primary text-white font-bold py-3 sm:py-4 rounded-2xl shadow-lg hover:shadow-xl transition-all flex items-center justify-center gap-2"
      >
        <span className="text-lg">Try Again</span>
        <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" strokeWidth="2">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
        </svg>
      </button>

      {/* Bottom gradient bar */}
      <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#D3202D] to-transparent rounded-full"></div>
    </div>
  </div>
);

}


export default index;