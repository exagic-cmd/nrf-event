import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'next-i18next'; 

function Faqs() {
  const { t } = useTranslation("transfer"); 
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: t("faqs.q1"),
      answer: t("faqs.a1"),
    },
    {
      question: t("faqs.q2"),
      answer: t("faqs.a2"),
    },
    {
      question: t("faqs.q3"),
      answer: t("faqs.a3"),
    },
    {
      question: t("faqs.q4"),
      answer: t("faqs.a4"),
    },
    {
      question: t("faqs.q5"),
      answer: t("faqs.a5"),
    },
    {
      question: t("faqs.q6"),
      answer: t("faqs.a6"),
    },
    {
      question: t("faqs.q7"),
      answer: t("faqs.a7"),
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex((prev) => (prev === index ? null : index));
  };

  return (
    <div className="w-full md:w-[350px]  sticky top-0 rounded-xl overflow-hidden p-4 text-white shadow-md bg-[#D3202D] border">
      <h1 className="text-lg font-semibold text-white mb-6">
        {t("faqs.title")}
      </h1>

      <div className="space-y-4">
        {faqs.map((faq, index) => (
          <div
            key={index}
            className={`border-b pb-4 ${index !== faqs.length - 1 ? 'border-gray-200' : ''}`}
          >
            <button
              onClick={() => toggleFAQ(index)}
              className="w-full flex items-start justify-between text-left"
            >
              <h2 className="text-sm font-medium text-white leading-5">
                {faq.question}
              </h2>
              <ChevronDown
                className={`w-4 h-4 text-white mt-1 transition-transform duration-200 ${
                  activeIndex === index ? 'rotate-180' : ''
                }`}
              />
            </button>

            <div
              className={`overflow-hidden transition-all duration-300 text-sm text-white ${
                activeIndex === index ? 'mt-2 max-h-[200px]' : 'max-h-0'
              }`}
            >
              <p className="leading-relaxed">{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faqs;
