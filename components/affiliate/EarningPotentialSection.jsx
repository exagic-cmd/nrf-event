import React from 'react'
import { useTranslation } from 'next-i18next'

function EarningPotentialSection() {
  const { t } = useTranslation('affiliateProgram') 

  return (
    <div>
      <div className="bg-white mb-6 px-6 md:px-12 relative">
        <div className="z-10">

          {/* Heading */}
          <h2 className="text-center text-lg font-bold text-[#CC9A55]">
            {t('heading1')} <br />
            <span className="text-xl md:text-4xl text-black">{t('heading2')}</span>
          </h2>

          {/* Decorative Background */}
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/vvyjdk5xv8c9lyzpx6cd.svg`}
            className="absolute left-0 bottom-10 w-24 md:w-32 z-0"
            alt=""
          />
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/znwzu7tqfxetuy4krb5c.svg`}
            className="absolute right-0 top-0 w-24 md:w-32 z-0"
            alt=""
          />

          {/* Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 items-center mt-10">
            {/* Left side cards */}
            <div className="flex flex-col md:items-end gap-8 mr-8 md:mx-14">
              {/* Card 1 */}
              <div className="flex items-end gap-4">
                <div className="shadow-md rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center p-3">
                  <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/joyd8h6oahpxvbsfvfdq.svg`} alt="Commission Rates" className="w-full h-auto" />
                </div>
                <div className="py-1 md:py-5 md:mt-0 mt-4">
                  <h3 className="font-semibold text-md md:text-lg">{t('card1.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('card1.desc')}</p>
                </div>
              </div>

              {/* Card 2 */}
              <div className="flex items-end gap-4">
                <div className="shadow-md rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center p-3">
                  <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/wouh7tjlg6gv8cpsjjpx.svg`} alt="Onboarding" className="w-full h-auto" />
                </div>
                <div className="py-1 md:py-5 md:mt-0 mt-4">
                  <h3 className="font-semibold text-md md:text-lg">{t('card2.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('card2.desc')}</p>
                </div>
              </div>
            </div>

            {/* Center image */}
            <div className="flex justify-center items-center">
              <img
                src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/lvlszaahzrlttwqkjava.svg`}
                alt="Earning Illustration"
                className="w-full max-w-[250px] md:max-w-[300px]"
              />
            </div>

            {/* Right side cards */}
            <div className="flex flex-col gap-8 mr-2 md:mx-14">
              {/* Card 3 */}
              <div className="flex items-end gap-4 z-10">
                <div className="shadow-md rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center p-3">
                  <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/t38adqlkozkk4iwwpelg.svg`} alt="Affiliates" className="w-full h-auto" />
                </div>
                <div className="py-1 md:py-5 md:mt-0 mt-4">
                  <h3 className="font-semibold text-md md:text-lg">{t('card3.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('card3.desc')}</p>
                </div>
              </div>

              {/* Card 4 */}
              <div className="flex items-end gap-4 z-10">
                <div className="shadow-md rounded-xl w-24 h-24 flex-shrink-0 flex items-center justify-center p-3">
                  <img src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/jr6wrt6z8axsyzklwphx.svg`} alt="Dashboard" className="w-full h-auto" />
                </div>
                <div className="py-1 md:py-5 md:mt-0 mt-4">
                  <h3 className="font-semibold text-md md:text-lg">{t('card4.title')}</h3>
                  <p className="text-gray-600 text-sm">{t('card4.desc')}</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default EarningPotentialSection
