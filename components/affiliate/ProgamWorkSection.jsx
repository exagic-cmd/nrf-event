import React from 'react';
import { useTranslation } from 'next-i18next';
import { User, Settings, FileText, DollarSign } from "lucide-react";

function ProgramWorkSection() {
  const { t } = useTranslation('affiliateProgram');

  const steps = [
    {
      id: 1,
      icon: <User className="w-6 h-6" />,
      title: t('programWork.steps.register.title'),
      description: t('programWork.steps.register.description')
    },
    {
      id: 2,
      icon: <Settings className="w-6 h-6" />,
      title: t('programWork.steps.create.title'),
      description: t('programWork.steps.create.description')
    },
     {
      id: 3,
      icon: <DollarSign className="w-6 h-6" />,
      title: t('programWork.steps.promote.title'),
      description: t('programWork.steps.promote.description')
    },
    {
      id: 4,
      icon: <FileText className="w-6 h-6" />,
      title: t('programWork.steps.ads.title'),
      description: t('programWork.steps.ads.description')
    }
   
  ];

  return (
    <div className='my-12 md:mx-24 mx-2'>
      <div className="bg-white">
        <div className="text-center mb-12">
          <p className="text-[#CC9A55] text-lg">{t('programWork.subtitle')}</p>
          <h2 className="text:lg md:text-4xl font-bold text-gray-900 mt-1">
            {t('programWork.title')}
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6 relative">
          {steps.map((step, index) => (
            <div key={step.id} className="flex flex-col items-center relative">
              <div className="relative mb-4">
                <div className="flex items-center justify-center w-12 h-12 bg-white rounded-full border-2 border-gray-200">
                  {step.icon}
                </div>
                <div className="absolute -top-1 -right-1 w-6 h-6 bg-[#CC9A55] rounded-full flex items-center justify-center text-white text-xs font-medium">
                  {step.id}
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{step.title}</h3>
              <p className="text-sm text-gray-600 text-center leading-relaxed px-2">
                {step.description}
              </p>

              {index < steps.length - 1 && (
                <svg className="hidden lg:block absolute top-6 right-[-50px]" width="100" height="40">
                  <defs>
                    <marker id="arrowhead" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                      <polygon points="0 0, 10 3.5, 0 7" fill="#ccc" />
                    </marker>
                  </defs>
                  <path d="M0,20 Q50,-20 100,20" stroke="#ccc" fill="none" markerEnd="url(#arrowhead)" />
                </svg>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ProgramWorkSection;
