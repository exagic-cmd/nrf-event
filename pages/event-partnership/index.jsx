import { useState } from "react";
import Head from "next/head";
import { ArrowRight, BedDouble, BusFront, CalendarDays, ChevronLeft, ChevronRight, Luggage, Plane, Sparkles, Trophy } from "lucide-react";
import Header from "@/components/layout/Header";
import { useEventStore } from "@/store/useEventStore";
import styles from "./event-partnership.module.css";

const initialForm = {
  organization: "", contact: "", email: "", phone: "", eventName: "", eventType: "",
  location: "", startDate: "", endDate: "", tier: "", details: "", agree: false,
};

const tiers = [
  { name: "Standard", note: "A great place to start", icon: "✦", tone: "standard" },
  { name: "Silver", note: "More support, more reach", icon: "✧", tone: "silver", popular: true },
  { name: "Gold", note: "The full partnership", icon: "✺", tone: "gold" },
];

export default function EventPartnershipPage() {
  const [form, setForm] = useState(initialForm);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const submitEventPartnership = useEventStore((state) => state.submitEventPartnership);
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(new Date().getFullYear(), new Date().getMonth(), 1));
  const update = (event) => {
    const { name, value, type, checked } = event.target;
    setForm((current) => ({ ...current, [name]: type === "checkbox" ? checked : value }));
  };

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setSubmitError("");

    try {
      await submitEventPartnership({ ...form });
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to prepare event partnership submission:", error);
      setSubmitError(error.message || "Unable to prepare your registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function selectDate(date) {
    const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    if (!form.startDate || form.endDate || dateString < form.startDate) {
      setForm((current) => ({ ...current, startDate: dateString, endDate: "" }));
    } else {
      setForm((current) => ({ ...current, endDate: dateString }));
      setCalendarOpen(false);
    }
  }

  return (
    <>
      <Head>
        <title>Event Organizer Partnership | Smart Destinations</title>
        <meta name="description" content="Partner with Smart Destinations to make travel easy for your event attendees in Singapore." />
      </Head>
      <Header />
      <main className={`${styles.page} bg-background text-foreground`}>
        <div className={styles.skyline} aria-hidden="true" />
        <div className={styles.cityArt} aria-hidden="true" />
        <section className={styles.hero} id="top">
          <div className={styles.heroGlow} aria-hidden="true" />
          <div className={styles.intro}>
            <p className={styles.eyebrow}>EVENT ORGANIZER REGISTRATION</p>
            <h1>Partner With Us for<br /><span>Your Events</span></h1>
            <p className={styles.lead}>One link for all your event travel. We manage hotels, transfers, and tours so you can focus on your event.</p>
          </div>
          <div className={styles.contentGrid}>
            <form className={`${styles.formCard} bg-surface-muted`} onSubmit={handleSubmit}>
              {submitted ? (
                <div className={styles.success} role="status">
                  <span className={styles.successIcon}><Sparkles size={22} /></span>
                  <p className={styles.eyebrow}>PAYLOAD READY FOR API</p>
                  <h2>Thanks for reaching out, {form.contact.split(" ")[0]}.</h2>
                  <p>Your registration payload has been logged in the browser console for backend integration. No request has been sent yet.</p>
                  <button className={styles.submit} type="button" onClick={() => { setForm(initialForm); setSubmitted(false); }}>Register another event <ArrowRight size={17} /></button>
                </div>
              ) : <>
                <p className={styles.formSection}>ORGANIZATION DETAILS</p>
                <div className={styles.fields}>
                  <Field label="Organization / Company Name" name="organization" placeholder="Enter your organization name" value={form.organization} onChange={update} required />
                  <Field label="Contact Person Name" name="contact" placeholder="Enter full name" value={form.contact} onChange={update} required />
                  <Field label="Business Email" name="email" type="email" placeholder="you@company.com" value={form.email} onChange={update} required />
                  <Field label="Phone Number" name="phone" type="tel" placeholder="+65  Enter phone number" value={form.phone} onChange={update} required />
                </div>
                <p className={`${styles.formSection} ${styles.eventHeading}`}>EVENT INFORMATION</p>
                <div className={styles.fields}>
                  <Field label="Event Name" name="eventName" placeholder="Enter event name" value={form.eventName} onChange={update} required />
                  <label className={styles.field}><span>Event Type <b>*</b></span><select name="eventType" value={form.eventType} onChange={update} required><option value="">Select event type</option><option>Conference</option><option>Corporate event</option><option>Exhibition / trade show</option><option>Festival</option><option>Wedding</option><option>Other</option></select></label>
                  <Field label="Event Location" name="location" placeholder="e.g. Marina Bay Sands, Singapore" value={form.location} onChange={update} required />
                  <div className={styles.field}><span>Event Date(s) <b>*</b></span><button className={styles.dateTrigger} type="button" aria-expanded={calendarOpen} onClick={() => setCalendarOpen((open) => !open)}><CalendarDays size={17} /><span>{form.startDate ? formatDate(form.startDate) : "Select start date"}</span><span className={styles.dateDash}>—</span><span>{form.endDate ? formatDate(form.endDate) : "End date"}</span><ChevronRight size={15} /></button>{calendarOpen && <CalendarPicker month={visibleMonth} setMonth={setVisibleMonth} startDate={form.startDate} endDate={form.endDate} onSelect={selectDate} />}</div>
                </div>
                <div className={styles.tierBlock}>
                  <div className={styles.tierHeading}><div><p className={styles.formSection}>PARTNERSHIP TIER</p><span>Choose the level that fits your event</span></div><span className={styles.tierHint}><Trophy size={14} /> Upgrade any time</span></div>
                  <div className={styles.tierGrid} role="radiogroup" aria-label="Partnership tier">
                    {tiers.map((tier) => <button type="button" key={tier.name} role="radio" aria-checked={form.tier === tier.name} onClick={() => setForm((current) => ({ ...current, tier: tier.name }))} className={`${styles.tierCard} ${styles[tier.tone]} ${form.tier === tier.name ? styles.selectedTier : ""}`}>
                      {tier.popular && <span className={styles.popular}>MOST POPULAR</span>}
                      <span className={styles.tierTop}><span className={styles.tierIcon}>{tier.icon}</span><span className={styles.tierCheck}>{form.tier === tier.name ? "✓" : ""}</span></span>
                      <strong>{tier.name}</strong><span className={styles.tierNote}>{tier.note}</span>
                    </button>)}
                  </div>
                  <input className={styles.tierValidation} aria-label="Select a partnership tier" tabIndex={-1} value={form.tier} required onChange={() => {}} />
                </div>
                <label className={`${styles.field} ${styles.details}`}><span>ADDITIONAL DETAILS</span><textarea name="details" value={form.details} onChange={update} placeholder="Tell us more about your event (optional) — expected attendees, special requirements, etc." rows="3" /></label>
                <label className={styles.consent}><input type="checkbox" name="agree" checked={form.agree} onChange={update} required /><span>I agree to the <a href="#terms">Terms &amp; Conditions</a> and <a href="#privacy">Privacy Policy</a>.</span></label>
                {submitError && <p className={styles.submitError} role="alert">{submitError}</p>}
                <button className={styles.submit} type="submit" disabled={submitting}>{submitting ? "Preparing..." : "Submit Registration"} <ArrowRight size={17} /></button>
              </>}
            </form>
            <aside className={styles.benefits} id="benefits">
              <p className={styles.eyebrow}>WHY REGISTER?</p>
              <h2>More Reach. Less Effort.</h2>
              <p className={styles.benefitCopy}>We connect your event with a trusted travel platform, giving your attendees easy access to the best accommodation, transfers, shuttles and tours in Singapore.</p>
              <div className={styles.perks}>
                <Perk icon={<BedDouble />} title="Accommodation">Hotels for every<br />budget &amp; style</Perk>
                <Perk icon={<Plane />} title="Airport Transfers">Hassle-free arrivals<br />&amp; departures</Perk>
                <Perk icon={<BusFront />} title="Shuttle Services">Group transport<br />for your event</Perk>
                <Perk icon={<Luggage />} title="Tours & Experiences">Explore the best<br />of Singapore</Perk>
              </div>
              <p className={styles.tagline}>Your Event. Our Travel Expertise.</p>
            </aside>
          </div>
        </section>
      </main>
    </>
  );
}

function Field({ label, name, type = "text", placeholder, value, onChange, required }) {
  return <label className={styles.field}><span>{label} {required && <b>*</b>}</span><input name={name} type={type} placeholder={placeholder} value={value} onChange={onChange} required={required} /></label>;
}

function Perk({ icon, title, children }) {
  return <div className={styles.perk}><span className={styles.perkIcon}>{icon}</span><strong>{title}</strong><span>{children}</span></div>;
}

function formatDate(value) {
  if (!value) return "";
  return new Date(`${value}T00:00:00`).toLocaleDateString("en-SG", { day: "numeric", month: "short", year: "numeric" });
}

function CalendarPicker({ month, setMonth, startDate, endDate, onSelect }) {
  const firstDay = new Date(month.getFullYear(), month.getMonth(), 1);
  const daysInMonth = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const offset = (firstDay.getDay() + 6) % 7;
  const cells = [...Array(offset).fill(null), ...Array.from({ length: daysInMonth }, (_, index) => index + 1)];
  while (cells.length % 7) cells.push(null);
  const asDate = (day) => `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
  const today = new Date(); today.setHours(0, 0, 0, 0);
  return <div className={styles.calendar}>
    <div className={styles.calendarTop}><button type="button" aria-label="Previous month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}><ChevronLeft size={17} /></button><strong>{month.toLocaleDateString("en", { month: "long", year: "numeric" })}</strong><button type="button" aria-label="Next month" onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}><ChevronRight size={17} /></button></div>
    <div className={styles.calendarGrid}>{["M", "T", "W", "T", "F", "S", "S"].map((day, i) => <span className={styles.weekday} key={`${day}-${i}`}>{day}</span>)}{cells.map((day, i) => {
      if (!day) return <span className={styles.emptyDay} key={`empty-${i}`} />;
      const value = asDate(day); const disabled = new Date(`${value}T00:00:00`) < today;
      const inRange = startDate && endDate && value >= startDate && value <= endDate;
      return <button type="button" key={value} disabled={disabled} className={`${styles.calendarDay} ${value === startDate || value === endDate ? styles.rangeEdge : ""} ${inRange ? styles.inRange : ""}`} onClick={() => onSelect(new Date(`${value}T00:00:00`))}>{day}</button>;
    })}</div>
    <p className={styles.calendarFoot}>{startDate && !endDate ? "Now choose your last day" : "Select your event start and end dates"}</p>
  </div>;
}
