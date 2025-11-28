import React from "react";

export const ReviewsSection = () => {
  const icon1 =
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1764333338/External%20Links/Travel_anywhere_in_the_world_with_a_suitcase.png";
  const icon2 =
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1764333320/External%20Links/yellow_paper_airplane.png";
  const icon3 =
    "https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1764333286/External%20Links/card.png";

  return (
    <section className="w-full mt-44 md:mt-16 ">
      <div className="px-2 md:px-8 lg:px-12  grid grid-cols-1 md:grid-cols-4 gap-10 md:bg-white bg-[#F7F7F780] py-4 rounded-lg md:mx-0 mx-4">
        {/* LeftIntro Text */}
        <div className="md:col-span-1 space-y-3 text-center md:text-left">
          <p className="text-red-600 font-semibold tracking-wide">WHAT WE SERVE</p>
          <h2 className=" text-xl md:text-2xl font-bold leading-snug text-gray-900">
            Top Values <br /> For You
          </h2>
          <p className="text-gray-500 text-sm pt-2">
            Your Singapore trip, booked in one step.
          </p>
        </div>

        {/* Item 1 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon1} alt="value-icon-1" className=" " />
          <h3 className="text-xl font-semibold text-gray-900">Lot of Choices</h3>
          <p className="text-gray-500 text-sm">
            Explore a wide variety of tours and accommodations.
          </p>
        </div>

        {/* Item 2 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon2} alt="value-icon-2" className=" " />
          <h3 className="text-xl font-semibold text-gray-900">Best Guides</h3>
          <p className="text-gray-500 text-sm">
            Our experienced guides make every trip memorable.
          </p>
        </div>

        {/* Item 3 */}
        <div className="flex flex-col items-center md:items-start space-y-3">
          <img src={icon3} alt="value-icon-3" className=" " />
          <h3 className="text-xl font-semibold text-gray-900">Easy Booking</h3>
          <p className="text-gray-500 text-sm">
            Book your entire trip with just a few clicks.
          </p>
        </div>
      </div>
    </section>
  );
};
