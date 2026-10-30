import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import {
  fetchEventRegistrationForm,
  submitEventRegistration,
} from "@/lib/eventRegistrationApi";

const inputClassName =
  "mt-1 block w-full rounded-lg border border-input bg-muted/40 px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

export default function EventRegistrationForm({ eventSlug }) {
  const [form, setForm] = useState(null);
  const [answers, setAnswers] = useState({});
  const [ticketTierId, setTicketTierId] = useState("");
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState("");
  const [requestVersion, setRequestVersion] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (!eventSlug) {
      setLoading(false);
      setLoadError("This registration link is missing its event.");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    setLoadError("");
    setForm(null);

    fetchEventRegistrationForm(eventSlug, { signal: controller.signal })
      .then((registrationForm) => {
        if (!active) return;
        const normalized = normalizeRegistrationForm(registrationForm);
        setForm(normalized);
        setAnswers({});
        setTicketTierId(
          normalized.tiers.length === 1 ? String(normalized.tiers[0].id) : ""
        );
      })
      .catch((error) => {
        if (active && error.name !== "AbortError") {
          console.error("Unable to load event registration form:", error);
          setLoadError(error.message || "Unable to load this event’s registration form.");
        }
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
      controller.abort();
    };
  }, [eventSlug, requestVersion]);

  function updateCheckboxAnswer(questionId, option, checked) {
    setAnswers((current) => {
      const selected = Array.isArray(current[questionId])
        ? current[questionId]
        : [];
      return {
        ...current,
        [questionId]: checked
          ? [...selected, option]
          : selected.filter((item) => item !== option),
      };
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitError("");
    if (!form || !form.registrationOpen || submitting) return;

    const missingQuestion = form.questions.find((question) => {
      if (!question.required) return false;
      const answer = answers[question.id];
      return Array.isArray(answer)
        ? answer.length === 0
        : !String(answer ?? "").trim();
    });
    if (missingQuestion) {
      setSubmitError(`Please answer the required question: ${missingQuestion.label}`);
      return;
    }

    const selectedTier = form.tiers.find(
      (tier) => String(tier.id) === ticketTierId
    );
    if (form.tiers.length > 0 && !selectedTier) {
      setSubmitError("Please select a ticket option.");
      return;
    }
    if (form.pricingType !== "free" && form.tiers.length === 0) {
      setSubmitError("Ticket options are currently unavailable. Please try again later.");
      return;
    }

    setSubmitting(true);
    try {
      await submitEventRegistration(eventSlug, {
        ticket_tier_id: selectedTier?.id ?? null,
        answers,
      });
      setSubmitted(true);
    } catch (error) {
      console.error("Unable to submit event registration:", error);
      setSubmitError(error.message || "Unable to submit your registration. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <RegistrationFrame>
        <div className="flex min-h-48 flex-col items-center justify-center gap-3 text-center" role="status" aria-live="polite">
          <Loader2 className="h-8 w-8 animate-spin text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">Loading event registration…</p>
        </div>
      </RegistrationFrame>
    );
  }

  if (loadError) {
    return (
      <RegistrationFrame>
        <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{loadError}</p>
        <button
          className="mt-4 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition hover:bg-primary-hover"
          type="button"
          onClick={() => setRequestVersion((version) => version + 1)}
        >
          Try again
        </button>
      </RegistrationFrame>
    );
  }

  if (!form) return null;

  if (submitted) {
    return (
      <RegistrationFrame eventTitle={form.eventTitle}>
        <div className="rounded-lg border border-border bg-muted/40 p-5 text-card-foreground" role="status">
          <h2 className="text-xl font-semibold">You’re registered!</h2>
          <p className="mt-2 text-sm">
            Your registration for {form.eventTitle || "this event"} has been received.
          </p>
        </div>
      </RegistrationFrame>
    );
  }

  return (
    <RegistrationFrame eventTitle={form.eventTitle}>
      {form.registrationOpen === false && (
        <p className="mb-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">
          {form.closedReason || "Registration for this event is currently closed."}
        </p>
      )}
      <p className="mb-6 text-sm leading-6 text-muted-foreground">
        Answer the questions below to register. Fields marked with an asterisk are required.
      </p>
      <form className="space-y-6" onSubmit={handleSubmit}>
        {form.tiers.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary">Ticket</h2>
            <label className="mt-4 block text-sm font-medium text-card-foreground">
              Ticket option <span className="text-destructive">*</span>
              <select
                className={inputClassName}
                value={ticketTierId}
                onChange={(event) => setTicketTierId(event.target.value)}
                required
              >
                <option value="">Select a ticket option</option>
                {form.tiers.map((tier) => (
                  <option key={tier.id} value={String(tier.id)}>
                    {tier.label}{tier.priceLabel ? ` — ${tier.priceLabel}` : ""}
                  </option>
                ))}
              </select>
            </label>
            {form.tiers.find((tier) => String(tier.id) === ticketTierId)?.description && (
              <p className="mt-2 text-sm text-muted-foreground">
                {form.tiers.find((tier) => String(tier.id) === ticketTierId).description}
              </p>
            )}
          </section>
        )}

        {form.questions.length > 0 && (
          <section>
            <h2 className="text-lg font-semibold text-primary">Event questions</h2>
            <div className="mt-4 grid gap-5">
              {form.questions.map((question) => (
                <DynamicQuestion
                  key={question.id}
                  question={question}
                  value={answers[question.id]}
                  onChange={(value) =>
                    setAnswers((current) => ({ ...current, [question.id]: value }))
                  }
                  onCheckboxChange={(option, checked) =>
                    updateCheckboxAnswer(question.id, option, checked)
                  }
                />
              ))}
            </div>
          </section>
        )}

        {submitError && <p className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive" role="alert">{submitError}</p>}
        <button
          className="w-full rounded-lg bg-primary px-5 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55 sm:w-auto"
          type="submit"
          disabled={submitting || !form.registrationOpen}
        >
          {submitting ? "Submitting…" : form.registrationOpen ? "Complete registration" : "Registration closed"}
        </button>
      </form>
    </RegistrationFrame>
  );
}

function RegistrationFrame({ children, eventTitle }) {
  return (
    <div className="space-y-6 rounded-xl border border-border bg-card/95 p-6 text-card-foreground shadow-[0_18px_50px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-7">
      <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-primary">
            Event registration
          </p>
          <h2 className="mt-2 text-xl font-semibold text-card-foreground">
            {eventTitle || "Join us"}
          </h2>
      </div>
      {children}
    </div>
  );
}

function DynamicQuestion({ question, value, onChange, onCheckboxChange }) {
  const helperId = `question-${question.id}-help`;
  const helper = question.helperText && (
    <span id={helperId} className="mt-1 block text-xs font-normal leading-5 text-muted-foreground">
      {question.helperText}
    </span>
  );
  const requiredMarker = question.required && <span className="text-destructive"> *</span>;

  if (question.type === "radio" || question.type === "checkbox") {
    return (
      <fieldset
        className="min-w-0"
        aria-describedby={question.helperText ? helperId : undefined}
      >
        <legend className="text-sm font-medium text-card-foreground">
          {question.label}{requiredMarker}
        </legend>
        {helper}
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {question.options.map((option) => {
            const checked = question.type === "radio"
              ? value === option.value
              : Array.isArray(value) && value.includes(option.value);

            return (
              <label
                key={option.value}
                className={`flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border px-3 py-2 text-sm text-card-foreground transition ${
                  checked
                    ? "border-primary/60 bg-primary/10"
                    : "border-border bg-muted/25 hover:border-primary/40"
                }`}
              >
                <input
                  className="h-4 w-4 shrink-0 accent-primary"
                  type={question.type}
                  name={`question-${question.id}`}
                  value={option.value}
                  checked={checked}
                  required={question.type === "radio" && question.required}
                  onChange={(event) => question.type === "radio"
                    ? onChange(option.value)
                    : onCheckboxChange(option.value, event.target.checked)}
                />
                <span>{option.label}</span>
              </label>
            );
          })}
        </div>
      </fieldset>
    );
  }

  return (
    <label className="block min-w-0 text-sm font-medium text-card-foreground">
      {question.label}{requiredMarker}
      {helper}
      {question.type === "textarea" ? (
        <textarea
          className={`${inputClassName} min-h-28 resize-y font-normal`}
          id={`question-${question.id}`}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          aria-describedby={question.helperText ? helperId : undefined}
        />
      ) : question.type === "dropdown" ? (
        <select
          className={`${inputClassName} font-normal`}
          id={`question-${question.id}`}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          aria-describedby={question.helperText ? helperId : undefined}
        >
          <option value="">Select an option</option>
          {question.options.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      ) : (
        <input
          className={`${inputClassName} font-normal`}
          id={`question-${question.id}`}
          type={question.type}
          value={value ?? ""}
          onChange={(event) => onChange(event.target.value)}
          required={question.required}
          aria-describedby={question.helperText ? helperId : undefined}
        />
      )}
    </label>
  );
}

function normalizeRegistrationForm(form) {
  const questions = form.questions.map((question) => {
    const id = question?.id ?? question?.question_id;
    const label =
      question?.label ?? question?.question ?? question?.question_text ?? question?.title;
    const type = normalizeInputType(
      question?.type ?? question?.field_type ?? question?.question_type
    );
    const options = normalizeOptions(question?.options);
    if (id === undefined || !label) {
      throw new Error("The registration form contains an invalid custom question.");
    }
    if (type === "radio" && options.length === 0) {
      options.push(
        { label: "Yes", value: "Yes" },
        { label: "No", value: "No" }
      );
    }
    if (["checkbox", "dropdown"].includes(type) && options.length === 0) {
      throw new Error(`The question "${label}" has no available options.`);
    }
    return {
      id: String(id),
      label: String(label),
      type,
      helperText:
        question.helper_text ??
        question.help_text ??
        question.info ??
        question.description ??
        "",
      required: isRequired(question),
      options,
    };
  });

  const tiers = form.tiers.map((tier) => {
    if (tier?.id === undefined) {
      throw new Error("The registration form contains an invalid ticket option.");
    }
    return {
      id: tier.id,
      label: String(tier.name ?? tier.title ?? tier.label ?? "Ticket"),
      description: tier.description ?? "",
      priceLabel: getPriceLabel(tier, form.pricing_type),
    };
  });

  return {
    eventTitle: form.event?.title ?? "",
    registrationOpen: form.registration_open !== false,
    closedReason: form.closed_reason ?? "",
    pricingType: String(form.pricing_type ?? "").toLowerCase(),
    questions: questions.filter((_, index) => isFieldActive(form.questions[index])),
    tiers,
  };
}

function normalizeInputType(value) {
  const normalized = String(value ?? "text").trim().toLowerCase().replace(/[\s-]+/g, "_");
  const aliases = {
    short_text: "text",
    long_text: "textarea",
    single_choice: "radio",
    multiple_choice: "checkbox",
    select: "dropdown",
    select_one: "dropdown",
    single_select: "dropdown",
    email_address: "email",
    phone: "tel",
    phone_number: "tel",
    telephone: "tel",
  };
  const type = aliases[normalized] ?? normalized;
  const allowedTypes = ["text", "textarea", "radio", "checkbox", "dropdown", "date", "email", "number", "tel", "url"];
  if (!allowedTypes.includes(type)) {
    throw new Error(`The registration form contains an unsupported field type: ${value}.`);
  }
  return type;
}

function normalizeOptions(value) {
  let options = value;
  if (typeof options === "string") {
    try {
      options = JSON.parse(options);
    } catch {
      options = options.split(",").map((option) => option.trim()).filter(Boolean);
    }
  }
  if (!Array.isArray(options)) return [];
  return options.map((option) => option && typeof option === "object"
    ? {
      label: String(option.label ?? option.name ?? option.value ?? ""),
      value: String(option.value ?? option.id ?? option.label ?? ""),
    }
    : { label: String(option), value: String(option) });
}

function isRequired(field) {
  const value = field?.required ?? field?.is_required ?? field?.is_mandatory ?? field?.mandatory;
  return value === true || value === 1 || ["1", "true"].includes(String(value).toLowerCase());
}

function isFieldActive(field) {
  const value = field?.is_active ?? field?.active ?? field?.status;
  return ![false, 0, "0", "false", "inactive"].includes(
    typeof value === "string" ? value.toLowerCase() : value
  );
}

function getPriceLabel(tier, pricingType) {
  const amount = tier.price ?? tier.amount ?? tier.price_amount;
  if (amount === undefined || amount === null || amount === "") {
    return pricingType === "free" ? "Free" : "";
  }
  const currency = tier.currency ?? tier.currency_code ?? "";
  return `${currency ? `${currency} ` : ""}${amount}`;
}
