import React from 'react'

function DiscoverSection() {
  return (
    <div className="mb-6 my-14">
      <div className="container px-4 mx-auto">
        <div className="flex flex-col md:flex-row items-center relative">
          {/* Left Column: Text Content */}
          <div className="md:w-2/3 space-y-6">
            <h2 className=" text-lg md:text-3xl font-bold text-[#FE6F4F]">Discover Our</h2>
            <h1 className="text-lg md:text-3xl font-bold text-gray-800">
              Exciting Singapore Tours
            </h1>
            <p className="text-gray-600 text-md md:text-lg">
              Join us on an unforgettable journey through Singapore&apos;s vibrant streets and hidden
              gems. Our tours offer a unique blend of culture, history, and adventure, tailored to
              suit every traveler&apos;s needs and preferences.
            </p>

            {/* Card Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1 */}
              <div className="p-1 flex items-start gap-4">
                <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797457/External%20Links/ghucj0rj36ocynxgn371.svg" alt="Tour Types" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Tours Types</h2>
                  <p className="md:text-normal text-sm text-gray-600">Explore diverse tours: city, cultural, adventure, and more.</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="p-1 flex items-start gap-4">
                <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797456/External%20Links/jhrknqowjuddg7cflspy.svg" alt="Accommodation" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Accommodation</h2>
                  <p className="text-gray-600 md:text-normal text-sm">Comfortable stays tailored to enhance your travel experience.</p>
                </div>
              </div>

              {/* Card 3 */}
              <div className="p-1 flex items-start gap-4">
                <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797457/External%20Links/ddu7rwsxejrxy3xl5pb6.svg" alt="Affiliate Program" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Affiliate Program</h2>
                  <p className="text-gray-600 md:text-normal text-sm">Earn by promoting our city tours and cultural experiences.</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="p-1 flex items-start gap-4">
                <img src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797456/External%20Links/gf99gdggyxyrsgyx3h3b.svg" alt="Transfers" />
                <div>
                  <h2 className="text-lg font-semibold text-gray-800">Transfers</h2>
                  <p className="text-gray-600 md:text-normal text-sm">Seamless transfers with guided tours and cultural adventures.</p>
                </div>
              </div>
            </div>

            <button className="text-[#FE6F4F] flex items-center gap-2 mt-4">
              Explore Now
            </button>
          </div>

          {/* Right Column: Image Section */}
          <div className="md:absolute md:bottom-0 md:right-12 mt-10 md:mt-0 w-[280px]">
            <img
              src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797467/External%20Links/imcnm76fxa6agxkjsscr.svg"
              alt="img"
              className="w-full h-full object-cover"
            />
          </div>

          {/* Decorative Stars */}
          <div className="absolute top-[60px] left-80 md:left-2/3  text-[#FE6F4F] ">
            <img
              src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1744797488/External%20Links/yrgzbjyvjvyziduap2zr.svg"
              alt="star"
              
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default DiscoverSection
