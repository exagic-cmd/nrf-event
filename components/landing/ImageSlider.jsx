import React from "react";

export default function HeroSection() {
  const largeScreenImageUrl =
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1764326672/External%20Links/Group_39466.webp";
  const smallScreenImageUrl =
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1764328249/External%20Links/lhsjacediff4b9pgp1al.svg";

  return (
    <div className="min-h-[40vh] bg-white w-full ">
      <div className="  py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ">
          {/* Left  */}
          <div className="flex flex-col justify-center space-y-4 text-center md:text-left px-2 md:px-8 lg:px-12">
            <div className="">
              <h1 className="text-xl lg:text-3xl font-semibold text-gray-900 ">
                Reliable Transfers, Comfort Stays &
                <span className="text-red-600 block py-1.5 md:py-3 mt-2 text-3xl lg:text-5xl ">
                  Unforgettable Tours
                </span>
                <span className="text-red-600 text-3xl lg:text-5xl ">
                  in One Place!
                </span>
              </h1>
            </div>
            <p className="text-gray-600 text-[16px] leading-relaxed max-w-md">
              Plan your perfect Singapore trip in one simple step. Book reliable
              airport transfers, comfortable accommodations, and curated day
              tours
            </p>
          </div>
          <div className="flex justify-center items-center md:order-last">
            <div className="w-full">
              <div className="relative">
                <div></div>

                <div className="">
                  <img
                    src={smallScreenImageUrl}
                    alt="Singapore Travel Services"
                    className="block lg:hidden w-full h-auto object-cover rounded-xl"
                  />

                  <img
                    src={largeScreenImageUrl}
                    alt="Singapore Travel Services"
                    className="hidden lg:block w-full h-auto object-cover rounded-xl"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
