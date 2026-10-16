"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
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
      <footer className="relative isolate mt-12 overflow-hidden border-t border-border bg-surface text-foreground sm:mt-16">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 bottom-0 -z-10 h-32 bg-primary opacity-[0.10] sm:h-32 lg:h-56 "
          style={{
            maskImage: "url('/partners-skyline.png')",
            maskPosition: "center bottom",
            maskRepeat: "no-repeat",
            maskSize: "100% 100%",
            WebkitMaskImage: "url('/partners-skyline.png')",
            WebkitMaskPosition: "center bottom",
            WebkitMaskRepeat: "no-repeat",
            WebkitMaskSize: "100% 100%",
          }}
        />
        <div className="relative mx-auto max-w-7xl px-4 mb-12 py-10 sm:px-6 sm:py-12 md:px-8 lg:px-12 lg:py-14">
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 lg:grid-cols-[1.25fr_0.7fr_1.25fr_0.9fr] lg:gap-10">
            <div className="space-y-4">
              <LocalizedLink href="/" className="inline-flex min-h-12 items-center">
                {event?.event?.logo ? (
                  <img
                    src={`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}${event.event.logo}`}
                    alt={event?.event?.title || event?.event?.organizer || "Home"}
                    className="max-h-12 w-auto max-w-[200px] object-contain"
                  />
                ) : (
                  <span className="text-lg font-bold text-foreground">
                    {event?.event?.organizer || event?.event?.title}
                  </span>
                )}
              </LocalizedLink>
              {event?.event?.short_desc && (
                <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                  {event.event.short_desc}
                </p>
              )}
              {hasSocialLinks && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {socialLinks.map(
                    (social) =>
                      social.href && (
                        <a
                          key={social.ariaLabel}
                          href={social.href}
                          aria-label={social.ariaLabel}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border bg-card text-muted-foreground transition hover:border-primary/40 hover:bg-primary/10 hover:text-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                        >
                          {social.icon}
                        </a>
                      )
                  )}
                </div>
              )}
            </div>

            <nav aria-label="Footer navigation" className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                Explore
              </h2>
              <ul className="space-y-2.5 text-sm">
                <li>
                  <LocalizedLink href="/" className="text-muted-foreground transition hover:text-primary">
                    Home
                  </LocalizedLink>
                </li>
                <li>
                  <Link href="/#about" className="text-muted-foreground transition hover:text-primary">
                    About
                  </Link>
                </li>
                <li>
                  <Link href="/#recommendations" className="text-muted-foreground transition hover:text-primary">
                    Recommended
                  </Link>
                </li>
              </ul>
            </nav>

            <div className="space-y-4">
              <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                Contact Us
              </h2>
              <div className="space-y-3 text-sm text-muted-foreground">
                {(event?.event?.phone || event?.event?.email || event?.event?.location) && (
                  <div className="space-y-2.5">
                    {event?.event?.phone && (
                      <p className="flex items-start gap-3">
                        <PhoneCall aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{event.event.phone}</span>
                      </p>
                    )}
                    {event?.event?.email && (
                      <p className="flex items-start gap-3">
                        <Mail aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span className="break-all">{event.event.email}</span>
                      </p>
                    )}
                    {event?.event?.location && (
                      <p className="flex items-start gap-3">
                        <MapPin aria-hidden="true" size={16} className="mt-0.5 shrink-0 text-primary" />
                        <span>{event.event.location}</span>
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-5">
              {hasAnyLegal && (
                <div className="space-y-4">
                  <h2 className="text-sm font-semibold uppercase tracking-[0.14em] text-foreground">
                    Information
                  </h2>
                  <ul className="space-y-2.5 text-sm">
                    {hasTerms && (
                      <li>
                        <button
                          onClick={() => openModal("terms")}
                          className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                        >
                          <FileText size={15} />
                          Event Terms
                        </button>
                      </li>
                    )}
                    {hasPolicy && (
                      <li>
                        <button
                          onClick={() => openModal("policy")}
                          className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                        >
                          <Shield size={15} />
                          Event Policy
                        </button>
                      </li>
                    )}
                    {hasSupport && (
                      <li>
                        <button
                          onClick={() => openModal("support")}
                          className="flex items-center gap-2 text-muted-foreground transition hover:text-primary"
                        >
                          <HeadphonesIcon size={15} />
                          Event Support
                        </button>
                      </li>
                    )}
                  </ul>
                </div>
              )}
            </div>
          </div>

          <div className="mt-9 border-t border-border/70 pt-5 text-center text-xs leading-5 text-muted-foreground sm:mt-10 sm:text-sm">
            <p>
              {event?.event?.organizer || event?.event?.title} © {currentYear} | All Rights Reserved
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