import React from 'react'

function linkcardSection() {
  return (
    <div>
      {/* Affiliate Link Cards Section */}
<div className="bg-white">
  <div className=" gap-12">
    <div className="text-center mb-4">
    <p className="text-[#FE6F4F] text-lg font-bold  mb-2">Types of</p>
    <h2 className="text-xl md:text-4xl font-bold text-gray-900 mb-4">

Affiliate Links on airporttransfers</h2>
    </div>

    <div className="flex flex-col md:flex-row items-stretch justify-center gap-8 mt-10 mx-0 md:mx-14">
      
       {/* Card 1: Banners & Buttons */}
       <div className="bg-[#e0dede] rounded-lg p-0 pt-0 flex flex-col items-center text-center flex-1">
       <div classname="">
       <p className="text-md md:text-2xl font-semibold mb-2 pt-8">Text Links</p>
        <p className=" text-md md:text-lg text-gray-600  mx-6 md:mx-8 -mb-5">
        Quick and easy setup with
        dedicated support.
        </p>
       </div>
        
        <div className="mt-auto flex justify-center w-full">
          <div className="relative  min-h-[404px] min-w-[241px] md:min-h-[504px] md:min-w-[341px]">
          <img 
              src= {`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744890545/External+Links/Group_1000006875.png`} 
              alt="Phone frame" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
      {/* Card 2: Banners & Buttons */}
      <div className="bg-[#EBF3FF] rounded-lg p-0 pt-0 flex flex-col items-center text-center flex-1">
      <div className="text-center mb-7">
        <p className="text-lg md:text-2xl font-semibold pt-8">Banners & Buttons</p>
        <p className="text-md md:text-xl text-gray-600   mx-6 md:mx-8 -mb-5">
          Attractive call-to-action images directing users to tours
        </p>
        </div>
        <div className=" flex justify-center w-full">
        <div className="relative    min-h-[404px] min-w-[241px] md:min-h-[504px] md:min-w-[341px]">
          <img 
              src={ `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744798056/External+Links/rstgi83pb3pjvmfptmjc.svg` }
              alt="Phone frame" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
  {/* Card 3: Banners & Buttons */}
  <div className="bg-[#E6F8F3] rounded-lg p-0 pt-0 flex flex-col items-center text-center flex-1">
  <div className="text-center mb-9">
      <p className="text-lg md:text-2xl font-semibold pt-8">Tour Listings</p>
      <p className="text-md md:text-xl text-gray-600  mx-6 md:mx-8 -mb-5">
      Direct links to specific tours with pricing and reviews.
      </p>
      
       </div>
        
        <div className="flex justify-center w-full">
        <div className="relative    min-h-[404px] min-w-[241px] md:min-h-[504px] md:min-w-[341px]">
          <img 
              src={ `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1744798422/External+Links/Group_1000006866.png` } 
              alt="Phone frame" 
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
      
    </div>
  </div>
</div>
    </div>
  )
}

export default linkcardSection
