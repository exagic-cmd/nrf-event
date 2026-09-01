import { useRouter } from "next/router";
import Link from "next/link";
import { useEffect } from "react";
import { MailCheck } from "lucide-react"
import Layout from "@/components/layout/Layout"
export default function PaymentSuccess() {
  const router = useRouter();
  const { orderId } = router.query;

  useEffect(() => {
    localStorage.removeItem("pendingPaymentOrderId");
  }, []);

  return (
    <Layout>    
    <div className="min-h-screen mt-6 md:mt-12 bg-black px-4 py-6 flex items-center justify-center">
      <div className="w-full max-w-md">
        <div className="bg-surface shadow-xl rounded-2xl overflow-hidden">
          {/* Header Section */}
          <div className="bg-brand-secondary px-4 py-4 text-center relative">
            <div className="mx-auto w-12 h-12 bg-surface rounded-full flex items-center justify-center mb-2 shadow-lg">
              <svg 
                className="w-6 h-6 text-[#CC9A55]" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={3} 
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>
            
            <h1 className="text-xl font-bold text-white mb-1">
              Payment Successful!
            </h1>
            <p className="text-green-100 text-sm">
              Your booking has been confirmed
            </p>
          </div>

          {/* Content Section */}
          <div className="px-4 py-4 space-y-3">
            {/* Order ID */}
            {orderId && (
              <div className="bg-muted rounded-lg p-2 border border-border">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground text-xs font-medium">Order ID:</span>
                  <span className="font-bold text-foreground font-mono text-xs bg-surface px-2 py-1 rounded border">
                    {orderId}
                  </span>
                </div>
              </div>
            )}

            {/* Confirmation */}
            <div className="text-center">
              <div className="flex items-center justify-center space-x-1 text-[#CC9A55] mb-2">
<MailCheck  size={12}/>
                {/* <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg> */}
                <span className="font-semibold text-xs">Confirmation email sent</span>
              </div>
              <p className="text-muted-foreground text-xs leading-relaxed">
                Your booking details have been emailed you.
              </p>
            </div>

            {/* Support */}
            <div className="bg-blue-50 rounded-lg p-3 border border-orange-100">
              <h3 className="font-semibold text-foreground mb-2 flex items-center text-xs">
                <svg className="w-3 h-3 text--[#CC9A55] mr-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.94-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z"/>
                </svg>
                Need Help?
              </h3>
              
              <div className="space-y-1 text-xs">
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-muted-foreground mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  <span className="text-muted-foreground">+65 8804 1972</span>
                </div>
                
                <div className="flex items-center">
                  <svg className="w-3 h-3 text-muted-foreground mr-2" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
                  </svg>
                  <span className="text-muted-foreground">marketing@airporttransfers.ai</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <Link href="/" className="block pt-1">
              <button className="w-full bg-brand-secondary text-white font-semibold py-3 px-4 rounded-lg transition-all duration-200 transform hover:scale-[1.02] flex items-center justify-center space-x-2">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z"/>
                </svg>
                <span className="text-sm">Back to Home</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-4">
          <p className="text-white text-xs">
            Thank you for choosing Airport Transfers AI
          </p>
        </div>
      </div>
    </div>
    </Layout>
  );
}