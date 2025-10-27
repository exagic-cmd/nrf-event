import React from 'react';

export default function AffiliateBottomBanner() {
  return (
    <div className="relative bg-pink-50 rounded-lg px-2 md:px-6 py-4 md:py-10  overflow-hidden">

      <div className="absolute top-2 left-1 md:left-6 h-8 w-8 md:h-18 md:h-18">
        
          <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797488/External%20Links/yrgzbjyvjvyziduap2zr.svg" alt="" />
        
      </div>
      
      
      {/* Curved line decoration */}
      <div className="absolute -right-0 md:-right-2 lg:-right-10 -rotate-6 top-14 h-full w-1/3 md:w-1/3 lg:w-3/3">
      <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797456/External%20Links/rtjzw49gojwwafkigfea.svg" alt="" />
      </div>
      
      {/* Content */}
      <div className="flex flex-col items-center justify-center text-center relative z-10">
        <h2 className="text-sm md:text-2xl font-bold text-gray-900 md:mb-4">Ready to Start the<br />Affiliate Program Today?</h2>
        <button onClick={() => window.open("https://partner.airporttransfers.ai", "_blank")}
  className="bg-[#FE6F4F] text-sm md:text-lg text-white cursor-pointer px-2 md:px-6 py-1 md:py-2 rounded-full transition"
>
  Start Today
        </button>
      </div>
    </div>
  );
}