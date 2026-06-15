import React from 'react';
import { useTranslation } from 'next-i18next';
export default function BannerSection() {
  const { t } = useTranslation('affiliateProgram');

  return (
    <div 
      className="relative flex flex-col md:flex-row items-center justify-between h-[300px] md:h-[379px] px-6 md:px-12 py-8  overflow-hidden"
      style={{
        backgroundImage: `url('${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1753355608/External%20Links/front-view-young-beautiful-lady-grey-shirt-working-with-documents-laptop-sitting-inside-her-office-daytime-building-job-activity-min.jpg')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-[#000] opacity-55 z-0" />

      {/* Content */}
      <div className="relative z-10 w-full py-4 md:py-24  md:w-1/2 pr-0 md:pr-8">
        <p className="md:text-lg text-white mb-2">{t('banner.startEarning')}</p>
        <h1 className="text-lg md:text-[44px] font-bold mb-4 leading-tight text-[#CC9A55]">
          {t('banner.heading')}
        </h1>
        <p className="text-white text-sm md:text-[18px] mb-6">
          {t('banner.description')}
        </p>

        <div
          onClick={() => window.open("https://partner.airporttransfers.ai/register", "_blank")}
          className="flex flex-wrap md:flex-nowrap items-center gap-4"
        >
          <button className="bg-[#CC9A55] text-white hover:bg-[#f3b45e] font-medium py-3 px-6 md:py-4 text-sm md:text-md rounded-full flex items-center">
            {t('banner.register')}
            <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button className="p-2 bg-white rounded-full hover:bg-gray-100 shadow">
            <svg className="w-6 h-6 text-[#CC9A55]" fill="currentColor" viewBox="0 0 24 24">
              <path d="M8 5v14l11-7z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
