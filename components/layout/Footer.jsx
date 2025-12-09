"use client";
import { useEffect, useState } from "react";
import {
  PhoneCall,
  Mail,
  MapPin,
  Instagram,
  Facebook,
  Linkedin,
  Twitter,
  Globe,
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [event, setEvent] = useState(null);

  useEffect(() => {
    async function loadEvent() {
      const data = await $helpers.getEventData();
      setEvent(data);
    }
    loadEvent();
  }, []);

  const socialLinks = [
    {
      href: event?.event?.web_link,
      icon: <Globe size={16} />,
      ariaLabel: "Website",
    },
    {
      href: event?.event?.insta_link,
      icon: <Instagram size={16} />,
      ariaLabel: "Instagram",
    },
    {
      href: event?.event?.fb_link,
      icon: <Facebook size={16} />,
      ariaLabel: "Facebook",
    },
    {
      href: event?.event?.linkedIn_link,
      icon: <Linkedin size={16} />,
      ariaLabel: "LinkedIn",
    },
    {
      href: event?.event?.twitter_link,
      icon: <Twitter size={16} />,
      ariaLabel: "Twitter",
    },
  ];

  return (
    <footer className=" text-black">
      <hr />
      <div className="max-w-full mx-4 lg:mx-16 px-4 sm:px-6 lg:px-2 py-2">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Logo and Description */}
          <div className="space-y-2">
            <LocalizedLink href="/">
              <img
                src="https://res.cloudinary.com/www-travelpakistani-com/image/upload/v1763642543/External%20Links/Desktop_red.png"
       alt="Logo"
                className="h-12 w-auto"
              />
            </LocalizedLink>
            <p className="text-sm text-black max-w-xs">
              {event?.event?.short_desc}
            </p>
          </div>

          {/* Contact Information */}
          <div className="space-y-3">
            <h3 className="text-lg font-semibold">Contact Us</h3>
            <div className=" text-sm grid grid-cols-1 md:grid-cols-2 gap-4">
             
              <div className="space-y-1">
                {/* <h4 className="font-semibold text-sm mb-1"></h4> */}
                {event?.event?.phone && (
                  <p className="flex items-center">
                    <PhoneCall size={14} className="mr-3 flex-shrink-0" />
                    <span>{event.event.phone}</span>
                  </p>
                )}
                {event?.event?.email && (
                  <p className="flex items-center">
                    <Mail size={14} className="mr-3 flex-shrink-0" />
                    <span>{event.event.email}</span>
                  </p>
                )}
                {event?.event?.location && (
                  <p className="flex items-start">
                    <MapPin size={14} className="mr-3 mt-1 flex-shrink-0" />
                    <span>{event.event.location}</span>
                  </p>
                )}
              </div>
            
              <div className="space-y-1">
               
                <p className="flex items-center">
                  <PhoneCall size={14} className="mr-3 flex-shrink-0" />
                  <span>+65 9627 4682</span>
                </p>
                <p className="flex items-center">
                  <Mail size={14} className="mr-3 flex-shrink-0" />
                  <span>group@toureast.net</span>
                </p>
                {/* Static Address */}
                <p className="flex items-start">
                  <MapPin size={14} className="mr-3 mt-1 flex-shrink-0" />
                  <span>Singapore</span>
                </p>
              </div>
            </div>
          </div>

          {/* Social Media */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Follow Us</h3>
            <div className="flex space-x-4 ">
              {socialLinks.map(
                (social) =>
                  social.href && (
                    <a
                      key={social.ariaLabel}
                      href={social.href}
                      aria-label={social.ariaLabel}
                      target="_blank"
                      rel="noopener noreferrer"
                      className=" text-[#D3202D]  hover:text-black transition-colors"
                    >
                      {social.icon}
                    </a>
                  )
              )}
            </div>
          </div>
        </div>

        <div className="mt-2 border-t border-white pt-2 text-center text-sm text-white">
          <p>
            {event?.event?.organizer} © {currentYear} | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
