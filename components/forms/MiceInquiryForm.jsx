import { useEffect, useRef, useState } from "react";
import { CalendarDays, ChevronLeft, ChevronRight } from "lucide-react";
import { submitMiceInquiry } from "@/lib/eventPartnershipApi";

const initialForm = {
  companyName: "",
  eventName: "",
  venue: "",
  delegates: "",
  arrivalDate: "",
  departureDate: "",
  services: "",
  contactName: "",
  contactEmail: "",
  contactPhone: "",
};

const inputClassName =
  "mt-1 block w-full rounded-lg border border-input bg-background px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

export default function MiceInquiryForm({ refValue = "" }) {
  const [form, setForm] = useState(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function updateField(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");

    if (!form.arrivalDate || !form.departureDate) {
      setSubmitError("Please select both an arrival date and a departure date.");
      return;
    }
    if (form.departureDate < form.arrivalDate) {
      setSubmitError("Departure date must be on or after the arrival date.");
      return;
    }

    setSubmitting(true);
    try {
      await submitMiceInquiry({
        company_name: form.companyName,
        event_name: form.eventName,
        event_venue: form.venue,
        no_of_delegates: Number.parseInt(form.delegates, 10),
        arrival_date: form.arrivalDate,
        departure_date: form.departureDate,
        services_required: form.services.split(",").map((service) => service.trim()).filter(Boolean),
        contact_name: form.contactName,
        contact_email: form.contactEmail,
        contact_phone: form.contactPhone,
        ...(refValue ? { ref: refValue } : {}),
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to submit MICE inquiry:", error);
      setSubmitError(error.message || "Unable to submit your inquiry. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function resetForm() {
    setForm(initialForm);
    setSubmitted(false);
    setSubmitError("");
  }

  if (submitted) {
    return (
      <div className="rounded-xl border border-border bg-card p-6 text-card-foreground shadow-xl" role="status">
        <h2 className="text-xl font-semibold">Thank you for your inquiry</h2>
        <p className="mt-2 text-sm">Your MICE inquiry has been submitted successfully.</p>
        <button
          className="mt-5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          type="button"
          onClick={resetForm}
        >
          Submit another inquiry
        </button>
      </div>
    );
  }

  return (
    <form
      className="space-y-6 rounded-xl border border-border bg-card/95 p-6 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-7"
      onSubmit={handleSubmit}
    >
      <section>
        <h2 className="text-lg font-semibold text-primary">Inquiry details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="Company name" name="companyName" value={form.companyName} onChange={updateField} required />
          <TextField label="Event name" name="eventName" value={form.eventName} onChange={updateField} required />
          <TextField label="Event venue" name="venue" value={form.venue} onChange={updateField} required />
          <TextField label="Number of delegates" name="delegates" type="number" min="1" value={form.delegates} onChange={updateField} required />
          <DatePicker
            label="Arrival date"
            value={form.arrivalDate}
            onChange={(arrivalDate) => setForm((current) => ({ ...current, arrivalDate }))}
            maxDate={form.departureDate || undefined}
            required
          />
          <DatePicker
            label="Departure date"
            value={form.departureDate}
            onChange={(departureDate) => setForm((current) => ({ ...current, departureDate }))}
            minDate={form.arrivalDate || undefined}
            required
          />
          <label className="block text-sm font-medium text-card-foreground sm:col-span-2">
            Services required
            <input
              className={inputClassName}
              name="services"
              placeholder="Separate services with commas"
              value={form.services}
              onChange={updateField}
              required
            />
            <span className="mt-1 block text-xs font-normal text-muted-foreground">Enter each requested service separated by a comma.</span>
          </label>
        </div>
      </section>

      <section>
        <h2 className="text-lg font-semibold text-primary">Contact details</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <TextField label="Contact name" name="contactName" value={form.contactName} onChange={updateField} required />
          <TextField label="Email address" name="contactEmail" type="email" value={form.contactEmail} onChange={updateField} required />
          <TextField label="Phone number" name="contactPhone" type="tel" value={form.contactPhone} onChange={updateField} required />
        </div>
      </section>

      {submitError && <p className="text-sm text-destructive" role="alert">{submitError}</p>}
      <button
        className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
        type="submit"
        disabled={submitting}
      >
        {submitting ? "Submitting…" : "Submit inquiry"}
      </button>
    </form>
  );
}

function DatePicker({ label, value, onChange, required, minDate, maxDate, className = "" }) {
  const [isOpen, setIsOpen] = useState(false);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(parseDate(value) || new Date()));
  const containerRef = useRef(null);
  const triggerRef = useRef(null);
  const selectedDate = parseDate(value);
  const monthLabel = visibleMonth.toLocaleDateString(undefined, { month: "long", year: "numeric" });
  const firstWeekday = (new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), 1).getDay() + 6) % 7;
  const daysInMonth = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 0).getDate();
  const calendarDays = [
    ...Array(firstWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];
  while (calendarDays.length % 7) calendarDays.push(null);
  const todayValue = toDateValue(new Date());
  const minimum = minDate ? parseDate(minDate) : null;
  const maximum = maxDate ? parseDate(maxDate) : null;

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) setIsOpen(false);
    }

    function handleKeyDown(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        triggerRef.current?.focus();
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  function openCalendar() {
    setVisibleMonth(startOfMonth(selectedDate || new Date()));
    setIsOpen(true);
  }

  function selectDate(day) {
    const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
    onChange(toDateValue(date));
    setIsOpen(false);
    triggerRef.current?.focus();
  }

  function changeMonth(offset) {
    setVisibleMonth((month) => new Date(month.getFullYear(), month.getMonth() + offset, 1));
  }

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="block text-sm font-medium text-card-foreground">
        {label}{required && <span className="text-destructive"> *</span>}
        <button
          ref={triggerRef}
          className={`${inputClassName} flex cursor-pointer items-center justify-between gap-3 text-left`}
          type="button"
          aria-label={`${label}${value ? `: ${formatDate(value)}` : ""}`}
          aria-haspopup="dialog"
          aria-expanded={isOpen}
          aria-required={required}
          onClick={() => (isOpen ? setIsOpen(false) : openCalendar())}
        >
          <span className={value ? "text-foreground" : "text-muted-foreground"}>
            {value ? formatDate(value) : "Select a date"}
          </span>
          <CalendarDays className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute left-0 top-full z-50 mt-2 w-[min(20rem,calc(100vw-3rem))] rounded-xl border border-border bg-popover p-4 text-popover-foreground shadow-2xl"
          role="dialog"
          aria-label={`${label} calendar`}
        >
          <div className="mb-3 flex items-center justify-between">
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              aria-label="Previous month"
              onClick={() => changeMonth(-1)}
              disabled={Boolean(minimum && visibleMonth <= startOfMonth(minimum))}
            >
              <ChevronLeft className="h-4 w-4" aria-hidden="true" />
            </button>
            <h3 className="text-sm font-semibold">{monthLabel}</h3>
            <button
              className="grid h-9 w-9 place-items-center rounded-lg border border-border transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-40"
              type="button"
              aria-label="Next month"
              onClick={() => changeMonth(1)}
              disabled={Boolean(maximum && visibleMonth >= startOfMonth(maximum))}
            >
              <ChevronRight className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>

          <div className="grid grid-cols-7 text-center text-xs font-medium text-muted-foreground" aria-hidden="true">
            {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
              <span className="py-2" key={day}>{day}</span>
            ))}
          </div>
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, index) => {
              if (!day) return <span className="aspect-square" key={`empty-${index}`} />;
              const date = new Date(visibleMonth.getFullYear(), visibleMonth.getMonth(), day);
              const dateValue = toDateValue(date);
              const isDisabled = Boolean((minimum && date < startOfDay(minimum)) || (maximum && date > startOfDay(maximum)));
              const isSelected = selectedDate && dateValue === value;
              const isToday = dateValue === todayValue;

              return (
                <button
                  className={`aspect-square rounded-lg text-sm transition hover:bg-accent disabled:cursor-not-allowed disabled:opacity-30 ${isSelected ? "bg-primary font-semibold text-primary-foreground hover:bg-primary-hover" : ""} ${isToday && !isSelected ? "ring-1 ring-primary text-primary" : ""}`}
                  key={dateValue}
                  type="button"
                  disabled={isDisabled}
                  aria-label={date.toLocaleDateString(undefined, { dateStyle: "full" })}
                  aria-pressed={Boolean(isSelected)}
                  onClick={() => selectDate(day)}
                >
                  {day}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

function parseDate(value) {
  if (!value) return null;
  const [year, month, day] = value.split("-").map(Number);
  if (!year || !month || !day) return null;
  return new Date(year, month - 1, day);
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

function toDateValue(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatDate(value) {
  const date = parseDate(value);
  return date ? date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" }) : "";
}

function TextField({ label, name, type = "text", value, onChange, required, min }) {
  return (
    <label className="block text-sm font-medium text-card-foreground">
      {label}
      <input className={inputClassName} name={name} type={type} min={min} value={value} onChange={onChange} required={required} />
    </label>
  );
}
