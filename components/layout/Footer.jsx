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
  X,
  FileText,
  Shield,
  HeadphonesIcon,
} from "lucide-react";
import LocalizedLink from "@/components/LocalizedLink";
import { useEventStore } from "@/store/useEventStore";

// ─── Terms Modal ─────────────────────────────────────────────────────────────
const TABS = [
  { key: "terms",   label: "Event Terms",   icon: FileText },
  { key: "policy",  label: "Event Policy",  icon: Shield },
  { key: "support", label: "Event Support", icon: HeadphonesIcon },
];

function TermsModal({ open, onClose, initialTab = "terms", event }) {
  const [activeTab, setActiveTab] = useState(initialTab);

  // Sync tab when caller changes it (e.g. clicking a different footer link)
  useEffect(() => {
    if (open) setActiveTab(initialTab);
  }, [initialTab, open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    const handler = (e) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const contentMap = {
    terms:   event?.event_terms,
    policy:  event?.event_policy,
    support: event?.event_support,
  };

  const content = contentMap[activeTab];

  return (
    /* Backdrop */
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Dialog */}
      <div className="relative w-full max-w-2xl max-h-[85vh] flex flex-col rounded-2xl bg-background border border-border shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-lg font-semibold text-foreground">
            {event?.title ?? "Event Information"}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-full p-1.5 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Bar */}
        <div className="flex border-b border-border shrink-0 bg-muted/30">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key)}
              className={`flex items-center gap-2 flex-1 justify-center py-3 text-sm font-medium transition-colors border-b-2 ${
                activeTab === key
                  ? "border-primary text-primary bg-background"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              }`}
            >
              <Icon size={15} />
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 px-6 py-5">
          {content ? (
            <div
              className="prose prose-sm dark:prose-invert max-w-none text-foreground leading-relaxed [&_p]:mb-3 [&_strong]:font-semibold [&_a]:text-primary [&_a:hover]:underline"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          ) : (
            <p className="text-muted-foreground text-sm text-center py-10">
              No information available.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Footer ──────────────────────────────────────────────────────────────────
const Footer = () => {
  const currentYear = new Date().getFullYear();
  const event = useEventStore((state) => state.event);
  const setEvent = useEventStore((state) => state.setEvent);

  const [modalOpen, setModalOpen]   = useState(false);
  const [activeTab, setActiveTab]   = useState("terms");

  useEffect(() => {
    async function loadEvent() {
      const data = await $helpers.getEventData();
      setEvent(data);
    }
    loadEvent();
  }, []);

  const openModal = (tab) => {
    setActiveTab(tab);
    setModalOpen(true);
  };

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

  const hasSocialLinks = socialLinks.some((social) => social.href);

  // Only show links if the event has content for them
  const hasTerms   = !!event?.event?.event_terms;
  const hasPolicy  = !!event?.event?.event_policy;
  const hasSupport = !!event?.event?.event_support;
  const hasAnyLegal = hasTerms || hasPolicy || hasSupport;

  return (
    <>
      <footer className="text-foreground bg-background">
        <hr />
        <div className="max-w-full mx-4 px-4 sm:px-6 lg:px-8 py-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-16">
            {/* Logo and Description */}
            <div className="space-y-2">
              <LocalizedLink href="/">
                <img
                  src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${event?.event?.logo}`}
                  alt="Logo"
                  className="h-12 w-auto"
                />
              </LocalizedLink>
              <p className="text-sm text-foreground max-w-xs">
                {event?.event?.short_desc}
              </p>
            </div>

            {/* Contact Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Contact Us</h3>
              <div className=" text-sm grid grid-cols-1 md:grid-cols-2 gap-14">
               
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

            {/* Social Media + Legal Links */}
            <div className="space-y-4">
                {/* Legal / Info Links */}
              {hasAnyLegal && (
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold">Information</h3>
                  <ul className="space-y-1 text-sm">
                    {hasTerms && (
                      <li>
                        <button
                          onClick={() => openModal("terms")}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <FileText size={13} />
                          Event Terms
                        </button>
                      </li>
                    )}
                    {hasPolicy && (
                      <li>
                        <button
                          onClick={() => openModal("policy")}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Shield size={13} />
                          Event Policy
                        </button>
                      </li>
                    )}
                    {hasSupport && (
                      <li>
                        <button
                          onClick={() => openModal("support")}
                          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
                        >
                          <HeadphonesIcon size={13} />
                          Event Support
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
              {hasSocialLinks && (
              
                  <div className="flex space-x-4">
                    {socialLinks.map(
                      (social) =>
                        social.href && (
                          <a
                            key={social.ariaLabel}
                            href={social.href}
                            aria-label={social.ariaLabel}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary hover:text-primary-foreground transition-colors"
                          >
                            {social.icon}
                          </a>
                        )
                    )}
                  </div>
              )}

            
            </div>
          </div>

          <div className="mt-2 border-t border-border pt-2 text-center text-sm text-muted-foreground">
            <p>
              {event?.event?.organizer} © {currentYear} | All Rights Reserved
            </p>
          </div>
        </div>
      </footer>

      {/* Terms / Policy / Support Modal */}
      <TermsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialTab={activeTab}
        event={event?.event}
      />
    </>
  );
};

export default Footer;