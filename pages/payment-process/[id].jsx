import { useLocalizedRouter } from "@/components/localizedRouter";
import { useRouter } from 'next/router';

import { useEffect, useState } from 'react';
import { useTranslation } from 'next-i18next';
import PayNowFlywire from '@/components/PayNowFlywire';
import LoaderSvg from "@/components/common/Loader2Svg";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
export default function OrderPaymentPage() {
  const { localizedPush } = useLocalizedRouter();
    const router = useRouter();
  const { id: returnOrderId } = router.query;
  const { t } = useTranslation('order-payment');

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showFlywire, setShowFlywire] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);
  const [resumePayment, setResumePayment] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [totalPrice, setTotalPrice] = useState(0);

  useEffect(() => {
    if (!returnOrderId) return;

    const fetchOrder = async () => {
      try {
        const res = await fetch(`https://app.airporttransfers.ai/api/orderInfo/${returnOrderId}`);
        const data = await res.json();

if (data?.status === "success" && data?.data) {
  const order = data.data;
  setOrderDetails(order);
  setName(order.name || '');
  setEmail(order.email || '');
  setTotalPrice(order.total_price || 0);
console.log(order.name)
console.log(order.total_price)
console.log(order.email)
  setPaymentSuccess(order.booking_status === 'Confirmed');
} else {
  console.error("Invalid order data", data);
}
      } catch (error) {
        console.error("Failed to fetch order:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [returnOrderId]);

  return (
    <div className="p-10 mt-8 text-center min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-50 relative">
      <button
        onClick={() => localizedPush('/')}
        className="fixed top-24 z-50 left-2 md:left-12  flex items-center gap-2 bg-white border border-[#FE6F4F] text-[#FE6F4F] hover:bg-orange-50 px-4 py-2 rounded-full transition-colors duration-300 shadow-md"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
        {t('goBack')}
      </button>

      {loading ? (
        <div className="h-[60vh] flex items-center justify-center">
          <LoaderSvg height="50vh" />
        </div>
      ) : paymentSuccess ? (
        <div className="p-4">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl mx-[250px] text-center border border-orange-100 mt-20 relative overflow-hidden">
            {/* Top accent bar */}
            <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FE6F4F] via-orange-300 to-[#FE6F4F]"></div>
            
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-[#FE6F4F] to-orange-400 rounded-full flex items-center justify-center shadow-lg transform hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" strokeWidth="3" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            
            {/* Header */}
            <h2 className="text-[#FE6F4F] text-3xl font-bold mb-3 tracking-tight">{t('bookingConfirmed')}</h2>
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">{t('thankYou')}</p>
            
            {/* Tour Details Card */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-2xl shadow-inner mb-6 text-left relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 -skew-x-12 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FE6F4F] bg-opacity-15 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FE6F4F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  {t('tourDetails')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-start gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div>
                      <p className="font-semibold text-gray-900 group-hover:text-[#FE6F4F] transition-colors duration-200">
                        {orderDetails?.connectedProduct?.[0]?.title}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {orderDetails?.travel_date}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {orderDetails?.itinerariesData?.[0]?.pickup_time}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full mt-2 flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-start gap-2">
                      <svg className="w-4 h-4 text-gray-500 mt-0.5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <p className="text-gray-700 group-hover:text-gray-900 transition-colors duration-200">
                        {orderDetails?.itinerariesData?.[0]?.pickup_point}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Payment Summary Card */}
            <div className="bg-gradient-to-r from-gray-50 to-orange-50 p-6 rounded-2xl shadow-inner text-left relative overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-30 -skew-x-12 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-3">
                  <div className="w-10 h-10 bg-[#FE6F4F] bg-opacity-15 rounded-xl flex items-center justify-center">
                    <svg className="w-6 h-6 text-[#FE6F4F]" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                    </svg>
                  </div>
                  {t('paymentSummary')}
                </h3>
                <div className="space-y-3">
                  <div className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                      <span className="text-gray-600">{t('bookingId')}:</span>
                      <span className="font-semibold text-gray-900 ml-auto">T-BK-{returnOrderId}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      <span className="text-gray-600">{t('bookingDate')}:</span>
                      <span className="font-semibold text-gray-900 ml-auto">{orderDetails?.created_at?.split(' ')[0]}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 group">
                    <div className="w-2 h-2 bg-[#FE6F4F] rounded-full flex-shrink-0 group-hover:scale-125 transition-transform duration-200"></div>
                    <div className="flex items-center gap-2 flex-1">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                      </svg>
                      <span className="text-gray-600">Payment Method:</span>
                      <span className="font-semibold text-gray-900 ml-auto">{orderDetails?.payment_method_name || '•••• 4532'}</span>
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between">
                      <span className="text-lg font-bold text-gray-800">{t('totalPaid')}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-[#FE6F4F] rounded-full animate-pulse"></div>
                        <span className="text-2xl font-bold text-[#FE6F4F]">${orderDetails?.total_price?.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Action Buttons */}
            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <a
                // href={`https://online.toureast.net/login/${orderDetails?.qr_code}`}
                href="#"
                className="group bg-[#FE6F4F] hover:bg-orange-500 transition-all duration-300 text-white font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                {t('viewReceipt')}
              </a>
              <a
                href="mailto:fay.l@toureast.net"
                className="group bg-white border-2 border-gray-200 hover:border-[#FE6F4F] hover:bg-orange-50 transition-all duration-300 text-gray-700 hover:text-[#FE6F4F] font-semibold px-8 py-3 rounded-full shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
              >
                <svg className="w-5 h-5 group-hover:rotate-12 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                {t('contactSupport')}
              </a>
            </div>
            
            {/* Decorative bottom element */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#FE6F4F] to-transparent rounded-full"></div>
          </div>
        </div>
      ) : (
        <div className="min-h-screen w-full flex items-center justify-center p-4 relative overflow-hidden">
          <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl mx-[250px] text-center relative z-10 border border-orange-100 backdrop-blur-sm">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#FE6F4F] to-transparent rounded-t-3xl"></div>
            
            <div className="relative mb-6">
              <div className="w-20 h-20 mx-auto bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg ">
                <svg className="w-10 h-10 text-white animate-bounce" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
            </div>

            {/* Header */}
            <h2 className="text-2xl md:text-3xl font-bold text-[#FE6F4F] mb-4 tracking-tight">
              {t('paymentIncomplete')}
            </h2>
            
            <p className="text-gray-600 mb-8 text-lg leading-relaxed">
              {t('bookingAlmostComplete')}
            </p>

            {/* Help section with enhanced styling */}
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 p-6 rounded-2xl mb-8 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-50 -skew-x-12 animate-pulse"></div>
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center justify-center gap-2">
                  <div className=" rounded-lg flex items-center justify-center">
                  </div>
                  {t('needHelp')}
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
                      <p className="text-sm text-gray-600">{t('callUs')}</p>
                      <a href="tel:+6588998424" className="font-semibold text-[#FE6F4F] hover:underline">
                        (+65) 88998424
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
                      <p className="text-sm text-gray-600">{t('emailUs')}</p>
                      <a href="mailto:marketing@airporttransfers.ai" className="font-semibold text-[#FE6F4F] hover:underline">
                        marketing@airporttransfers.ai
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Resume Payment Button */}
            <button
              className="group relative w-full bg-gradient-to-r from-[#FE6F4F] to-orange-500 hover:from-orange-500 hover:to-[#FE6F4F] transition-all duration-300 text-white font-bold px-8 py-4 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-3 overflow-hidden"
              onClick={() => setShowFlywire(true)}
            >
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white via-transparent opacity-20 -skew-x-12 group-hover:animate-pulse"></div>
              
              {/* Button content */}
              <div className="relative z-10 flex items-center gap-3">
                <span className="text-lg">{t('resumePayment')}</span>
                <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
            </button>

            {/* Security badge */}
            <div className="mt-6 flex items-center justify-center gap-2 text-sm text-gray-500">
              <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
              <span>{t('securePayment')}</span>
            </div>

        {/* Bottom decorative element */}
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-20 h-1 bg-gradient-to-r from-transparent via-[#FE6F4F] to-transparent rounded-full"></div>
      </div>

      {/* Demo alert for Flywire state */}
      {/* {showFlywire && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm mx-auto text-center">
            <div className="w-16 h-16 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-4">
              <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Payment Resumed!</h3>
            <p className="text-gray-600 mb-4">Redirecting to secure payment...</p>
            <button
              onClick={() => setShowFlywire(false)}
              className="bg-[#FE6F4F] text-white px-6 py-2 rounded-full font-medium hover:bg-orange-500 transition-colors"
            >
              Close Demo
            </button>
          </div>
        </div>
      )} */}
    </div>
      )}

      {showFlywire && (
        <PayNowFlywire
          returnOrderId={returnOrderId}
          name={name}
          email={email}
          totalPrice={totalPrice}
          branchId={2}
          onSuccess={() => {
            setShowFlywire(false);
            setPaymentSuccess(true);
          }}
          onFailure={() => {
            setShowFlywire(false);
            setResumePayment(true);
          }}
          onClose={() => setShowFlywire(false)} 
        />
      )}
    </div>
  );
}
export async function getStaticPaths() {
  return {
    // No paths are pre-rendered at build time.
    paths: [],
    // When a user requests a path that's not pre-rendered,
    // Next.js will server-render it and then cache it for subsequent requests.
    fallback: "blocking",
  }
}
export async function getStaticProps({ locale }) {
  return {
    props: {
      ...(await serverSideTranslations(locale, ['common','order-payment'])),
    },
  };
}