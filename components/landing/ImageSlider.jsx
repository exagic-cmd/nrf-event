import React from "react";

export default function HeroSection() {
  const largeScreenImageUrl =
    `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1775730723/External+Links/THE_NEXT_NOW.png`;
  const smallScreenImageUrl =
     `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1775730722/External+Links/THE_NEXT_NOW_488_x_522_px.png`;

  return (
    <div className="min-h-[40vh] bg-white w-full ">
      <div className="  py-4 md:py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12 items-center ">
          {/* Left  */}
          <div className="flex flex-col justify-center space-y-4 text-center md:text-left px-2 md:px-8 lg:px-12">
            <div className="">
              <h1 className="text-xl lg:text-3xl font-semibold text-gray-900 ">
                PLAN YOUR TRIP TO NRF 2026 APAC
                <span className="text-red-600 block py-1.5 md:py-3 mt-2 text-3xl lg:text-5xl ">
                  Heading to Singapore this June? 
                </span>
                {/* <span className="text-red-600 text-3xl lg:text-5xl ">
                  in One Place!
                </span> */}
              </h1>
            </div>
            <p className="text-gray-600 text-[16px] leading-relaxed max-w-md">
             Attendees of NRF 2026 APAC can enjoy exclusive flight and hotel rates, only on Tour East!
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
