import React, { useState } from 'react';
import { useRouter } from 'next/router';
import useUserStore from '@/store/useAuthStore';

function index() {
  const [showFlywire, setShowFlywire] = useState(false);
  const user = useUserStore((state) => state.user);
  const router = useRouter();
  const { msg } = router.query;

  const handleTryAgain = () => {
    if (!user) {
        try {
            if (typeof $helpers?.getGevmeRedirectURL === "function") {
                const url = $helpers.getGevmeRedirectURL();
                if (url) {
                    window.location.assign(url);
                } else {
                    console.error("Redirect URL is empty");
                }
            } else {
                console.error("helpers.getGevmeRedirectURL is not available");
            }
        } catch (err) {
            console.error("Failed to get redirect URL", err);
        }
    } else {
        setShowFlywire(true);
    }
  };

  return (
    <div>
         <div className="min-h-screen bg-[#D0E9FF] w-full flex items-center justify-center p-4 relative overflow-hidden">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl mx-[250px] text-center relative z-10 border border-orange-100 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#D3202D] to-transparent rounded-t-3xl"></div>
            
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#33A1FD] to-[#D0E9FF] rounded-full flex items-center justify-center shadow-lg ">
                <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#D3202D] mb-4 tracking-tight">
              An Error Occurred
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {msg ? decodeURIComponent(msg) : "We couldn't process your request. Please try again."}
            </p>

            {/* Help section with enhanced styling */}
            <div className="bg-[#D0E9FF] p-6 rounded-2xl mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-50 -skew-x-12 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <div className=" rounded-lg flex items-center justify-center">
                  </div>
                  Need Help?
                </h3>
                
                <div className="space-y-3">
                  {/* Phone contact */}
                  <div className="flex items-center justify-start gap-3 group">
                    <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center group-hover:bg-green-200 transition-colors duration-200">
                      <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Call Us</p>
                      <a href="tel:+6588998424" className="font-semibold text-[#D3202D] hover:underline">
                        1546541321
                      </a>
                    </div>
                  </div>

                  {/* Email contact */}
                  <div className="flex items-center justify-start gap-3 group">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors duration-200">
                      <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <div className="text-left">
                      <p className="text-sm text-gray-600">Email Us</p>
                      <a href="mailto:contact@nrf.com" className="font-semibold text-[#D3202D] hover:underline">
                        contact@nrf.com
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Payment Button */}
            <button
              className="group relative w-full bg-[#D3202D] transition-all duration-300 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
              onClick={handleTryAgain}
            >
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-20 -skew-x-12 group-hover:animate-pulse"></div>
              
              {/* Button content */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-lg">Try Again</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

          

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#D3202D] to-transparent rounded-full"></div>
      </div>

      
    </div>
    </div>
  )
}