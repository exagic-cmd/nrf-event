import React from "react";
import { CheckCircle, Users, Globe, DollarSign, Heart, Star } from "lucide-react";

function AffiliateDiscloserSection() {
  const features = [
    {
      icon: <Star className="w-6 h-6 text-[#FE6F4F]" />,
      title: "Promote Top-Rated Experiences",
      desc: "Share handpicked tours and attractions selected from trusted platform.",
    },
    {
      icon: <Globe className="w-6 h-6 text-[#FE6F4F]" />,
      title: "Enable Seamless Booking",
      desc: "Help travelers book experiences easily through verified networks.",
    },
    {
      icon: <Users className="w-6 h-6 text-[#FE6F4F]" />,
      title: "Empower Content Creators",
      desc: "Earn commissions by sharing curated Singapore travel content.",
    },
    {
      icon: <DollarSign className="w-6 h-6 text-[#FE6F4F]" />,
      title: "Support Our Mission",
      desc: "Affiliate revenue helps us grow and deliver high-quality insights.",
    },
    {
      icon: <Heart className="w-6 h-6 text-[#FE6F4F]" />,
      title: "Champion Responsible Tourism",
      desc: "We promote meaningful, sustainable travel experiences in Singapore.",
    },
  ];

  return (
    <div className="my-16 px-4 md:px-12">

        <div className="justify-items-center mb-6">
          <p className="text-[#FE6F4F] text-lg font-semibold mb-2">Why Join</p>
          <h2 className="text-xl md:text-4xl font-bold text-foreground mb-6">
            Our Affiliate Program
          </h2>
        </div>
      <div className="grid md:grid-cols-2 gap-12 items-center bg-surface">
        {/* Text Section */}
        <div>

          <div className="space-y-4">
            {features.map((feature, index) => (
              <div key={index} className="flex items-start space-x-4">
                <div className="flex-shrink-0 pt-1">{feature.icon}</div>
                <div>
                  <h4 className="text-md font-semibold text-foreground">{feature.title}</h4>
                  <p className="text-muted-foreground text-sm">{feature.desc}</p>
                </div>
              </div>
            ))}
          </div>

          <button className="bg-[#FE6F4F] text-white font-medium py-2.5 px-6 mt-8 rounded-full flex items-center w-fit">
            <a href="/contactUs">Contact Us</a>
            <svg
              className="w-4 h-4 ml-2"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* Image Section */}
        <div className="flex justify-center">
          <img
            src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/front-view-young-beautiful-lady-grey-shirt-working-with-documents-laptop-sitting-inside-her-office-daytime-building-job-activity-min.jpg`}
            alt="Affiliate Partners"
            className="w-full max-w-[550px] rounded-lg"
          />
        </div>
      </div>
    </div>
  );
}

export default AffiliateDiscloserSection;
