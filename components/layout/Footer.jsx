"use client";
import LocalizedLink from "@/components/LocalizedLink";
import {
  ChevronUp, Facebook, Instagram, PhoneCall, Mail, MapPinCheckInside, Music2
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-white py-5 px-4 sm:px-12">
      <div className="max-w-7xl mx-auto">
        {/* Top Section - Brand and Social */}
        <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-8 mb-8">
          <div className="flex-1">
             {/* <LocalizedLink href="/">
                      <img
                        src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1756984770/External%20Links/Logo_2.png"
                        alt="Logo"
                        className="h-9 mb-3 md:h-[50px]"
                      />
                    </LocalizedLink> */}
           {/* Logo */}
      <div className="text-lg font-semibold text-gray-800 ">
        
         <img
  src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1757669808/External%20Links/Logo_2.png"
  alt="Logo"
  className="h-8 md:12 w-auto object-contain -ml-4"
/>
      </div>
            <p className="text-gray-300 text-sm leading-relaxed max-w-md">
              We specialize in Singapore airport transfers, offering reliable Changi Airport pickups and hotel drop-offs with licensed drivers and premium vehicles.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
           
            {/* <div className="text-sm">
              <h3 className="font-semibold text-white mb-2">Quick Links</h3>
              <div className="flex space-x-4">
                <LocalizedLink 
                  href="/contactUs" 
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Contact
                </LocalizedLink>
                <LocalizedLink 
                  href="/transfers" 
                  scroll={true}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Transfers
                </LocalizedLink>
                <LocalizedLink 
                  href="/affiliateProgram" 
                  scroll={true}
                  className="text-gray-300 hover:text-white transition-colors"
                >
                  Affilate Program
                </LocalizedLink>
              </div>
            </div> */}
             <div className="flex space-x-3">
              <a
                href="#"
                aria-label="Instagram"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-[#CC9A55] p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Instagram size={16} />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-[#CC9A55] p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Facebook size={16} />
              </a>
              <a
                href="#"
                aria-label="TikTok"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gray-800 text-[#CC9A55] p-2 rounded-full hover:bg-gray-700 transition-colors"
              >
                <Music2 size={16} />
              </a>
            </div>
          </div>
        </div>

        {/* Contact Section */}
        <div className="border-t border-gray-700 pt-8">
          <h3 className="font-semibold text-white mb-3 text-center">Our Global Offices</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 ">
            {/* Singapore Office */}
            <div className="text-left">
              <h4 className="font-semibold text-white mb-3 text-md">Singapore</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center justify-start">
                  <PhoneCall size={14} className="mr-2 text-[#CC9A55]" /> 
                  ‪+65 88041972
                </p>
                <p className="flex items-center justify-start">
                  <Mail size={14} className="mr-2 text-[#CC9A55]" /> 
                  inquiry@airporttransfers.ai
                </p>
                <p className="flex items-start justify-start leading-relaxed">
                  <MapPinCheckInside size={14} className="mr-2 mt-0.5 text-[#CC9A55] flex-shrink-0" />
                  <span className="text-left">
                    1B Cantonment road 4419,
                    Singapore (085201)
                  </span>
                </p>
              </div>
            </div>

            {/* Australia Office */}
            <div className="text-left">
              <h4 className="font-semibold text-white mb-3 text-md">Australia</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center justify-start">
                  <PhoneCall size={14} className="mr-2 text-[#CC9A55]" /> 
                  +61 415 311 340
                </p>
                <p className="flex items-start justify-start leading-relaxed">
                  <MapPinCheckInside size={14} className="mr-2 mt-0.5 text-[#CC9A55] flex-shrink-0" />
                  <span className="text-left">
                    31 Woods St 
                    Laverton, VIC 3028 
                    Australia
                  </span>
                </p>
              </div>
            </div>

            {/* UAE Office */}
            <div className="text-left">
              <h4 className="font-semibold text-white mb-3 text-md">UAE</h4>
              <div className="space-y-2 text-sm text-gray-300">
                <p className="flex items-center justify-start">
                  <PhoneCall size={14} className="mr-2 text-[#CC9A55]" /> 
                  +971 55 263 7321
                </p>
                <p className="flex items-start justify-start leading-relaxed">
                  <MapPinCheckInside size={14} className="mr-2 mt-0.5 text-[#CC9A55] flex-shrink-0" />
                  <span className="text-left">
                    267 Victoria Cluster 
                    Damac Hills 2 
                    Dubai, UAE
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

       <div className="border-t border-gray-700 mt-8 pt-4 flex flex-col sm:flex-row justify-between items-center text-xs text-gray-400 gap-4">
  <p className="text-center sm:text-left">
    NRF © {currentYear} | All Rights Reserved
  </p>
  <div className="flex flex-wrap md:justify-center justify-end space-x-6">
    {/* <p className="flex items-center">
      <ChevronUp size={12} className="text-[#CC9A55] mr-1"/>
      Language
    </p>
    <p>Terms & Conditions</p>
    <p>Privacy Policy</p> */}
  </div>
</div>

      </div>
    </footer>
  );
};

export default Footer;
