import React, { useState } from 'react';
import AffiliateBottomBanner from './banner';
// FAQ Item component
const FAQItem = ({ question, isOpen, toggle , answer }) => {


  return (
    <div className="border-b py-4">
      <button 
        className="flex justify-between items-center w-full text-left" 
        onClick={toggle}
      >
        <h3 className="text-sm font-medium text-gray-900">{question}</h3>
        <span className="text-gray-500 ml-2">
          {isOpen ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M12 5V19M5 12H19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          )}
        </span>
      </button>
      
      {isOpen && (
        <div className="mt-2 text-sm text-gray-600">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
};



// Main FAQ component
export default function FAQPage() {
  const [openItem, setOpenItem] = useState("how-choose");
  
  const toggleItem = (id) => {
    setOpenItem(openItem === id ? null : id);
  };
  
  const faqItems = [
    {
      id: "how-choose",
      question: "How do you choose which tours to recommend?",
      answer: "We only promote tours and travel services that meet our rigorous quality standards based on customer reviews, safety records, and value for money. Our team personally vets each tour provider to ensure we're only recommending the best experiences."
    },
    {
      id: "who-partners",
      question: "Who are your affiliate partners?",
      answer: "We partner with leading travel platforms such as Viator, GetYourGuide, Klook, and other premium local tour operators. These companies offer the best selection of high-quality tours and excellent customer support for our users."
    },
    {
      id: "how-help",
      question: "How does this help ExploreSignapore.ai?",
      answer: "When visitors book tours through our affiliate links, we earn a small commission at no extra cost to them. This helps us maintain our website, research new destinations, and continue providing free, high-quality travel recommendations to our community."
    },
    {
      id: "what-link",
      question: "What is an affiliate link?",
      answer: "An affiliate link is a special URL that includes a tracking code. When someone clicks this link and makes a purchase, the system recognizes that the customer came from our site, allowing our partners to credit us with the referral. The customer's experience and price remain exactly the same."
    },

  ];
  
  return (
    <div className=" px-4 mx-4 md:mx-16 mb-6">
      {/* Header */}
      <div className="text-center mb-8">
        <p className="text-[#FE6F4F]  text-md md:text-lg">FAQs</p>
        <h1 className="text-lg  md:text-4xl font-bold text-gray-900 mt-2">Frequently Asked Questions</h1>
      </div>
      
      {/* FAQ Grid */}
      <div className="grid md:grid-cols-2 gap-8">
        {faqItems.map(item => (
          <FAQItem 
            key={item.id}
            question={item.question} 
            isOpen={openItem === item.id}
            toggle={() => toggleItem(item.id)}
            answer={item.answer}
          />
        ))}
      </div>
      
      {/* Banner */}
     <div className='mt-12'>
     <AffiliateBottomBanner />
     </div>
    </div>
  );
}