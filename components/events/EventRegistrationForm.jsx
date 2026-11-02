import { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";
import {
  fetchEventRegistrationForm,
  submitEventRegistration,
} from "@/lib/eventRegistrationApi";
import { STATIC_CURRENCIES } from "@/store/useCurrencyStore";
import { useLocalizedRouter } from "@/components/localizedRouter";

const inputClassName =
  "mt-1 block w-full rounded-lg border border-input bg-muted/40 px-3 py-2.5 text-sm text-foreground shadow-sm outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-2 focus:ring-ring/20";

const CURRENCY_CODE_BY_ID = STATIC_CURRENCIES.reduce((map, item) => {
  map[item.id] = item.code || item.name || "";
  return map;
}, {});

export default function EventRegistrationForm({ eventSlug, onLoadingChange }) {
  const { localizedPush } = useLocalizedRouter();
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
      onLoadingChange?.(false);
      setLoadError("This registration link is missing its event.");
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    setLoading(true);
    onLoadingChange?.(true);
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
        if (active && !controller.signal.aborted && error.name !== "AbortError") {
          console.error("Unable to load event registration form:", error);
          setLoadError(error.message || "Unable to load this event’s registration form.");
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
          onLoadingChange?.(false);
        }
      });

    return () => {
      active = false;
      // Ignore the expected fetch rejection when React cleans up or restarts
      // this effect (for example during development Strict Mode).
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
      const response = await submitEventRegistration(eventSlug, {
        ticket_tier_id: selectedTier?.id ?? null,
        answers,
      });
      setSubmitted(true);
      const qrCode = response?.data?.qr_code ?? response?.qr_code;
      if (qrCode) {
        localizedPush(`/login/${encodeURIComponent(qrCode)}`);
      }
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

  const selectedTier = form.tiers.find((tier) => String(tier.id) === ticketTierId);
  const needsTierSelection = form.tiers.length > 0 && !selectedTier;

  if (needsTierSelection) {
    return (
      <RegistrationFrame eventTitle={form.eventTitle}>
        {form.registrationOpen === false && (
          <p className="mb-6 rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm text-muted-foreground" role="status">
            {form.closedReason || "Registration for this event is currently closed."}
          </p>
        )}
        <p className="mb-6 text-sm leading-6 text-muted-foreground">
          Choose a ticket option to continue to the registration form.
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {form.tiers.map((tier) => (
            <TierCard
              key={tier.id}
              tier={tier}
              disabled={!form.registrationOpen}
              onSelect={() => setTicketTierId(String(tier.id))}
            />
          ))}
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
        {selectedTier && (
          <section className="rounded-lg border border-primary/40 bg-primary/5 p-4">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary">Selected ticket</p>
                <h3 className="mt-1 text-base font-semibold text-card-foreground">{selectedTier.label}</h3>
                {selectedTier.priceLabel && (
                  <p className="mt-1 text-sm font-medium text-card-foreground">
                    {selectedTier.priceLabel}
                    {selectedTier.hasPromo && selectedTier.originalPriceLabel && (
                      <span className="ml-2 text-xs text-muted-foreground line-through">
                        {selectedTier.originalPriceLabel}
                      </span>
                    )}
                  </p>
                )}
              </div>
              {form.tiers.length > 1 && (
                <button
                  type="button"
                  className="rounded-md border border-border px-3 py-1.5 text-xs font-medium text-card-foreground transition hover:border-primary/60"
                  onClick={() => setTicketTierId("")}
                >
                  Change
                </button>
              )}
            </div>
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

function TierCard({ tier, disabled, onSelect }) {
  const soldOut = tier.remaining === 0;
  return (
    <div
      className={`flex h-full flex-col rounded-xl border border-border bg-background p-4 shadow-sm transition ${
        disabled || soldOut ? "opacity-60" : "hover:border-primary/60 hover:shadow-md"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-base font-semibold text-card-foreground">{tier.label}</h3>
        {tier.remaining !== null && tier.remaining > 0 && (
          <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-medium text-primary">
            {tier.remaining} left
          </span>
        )}
        {soldOut && (
          <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-[11px] font-medium text-destructive">
            Sold out
          </span>
        )}
      </div>

      {tier.priceLabel && (
        <div className="mt-2 flex items-baseline gap-2">
          <span className="text-xl font-semibold text-primary">{tier.priceLabel}</span>
          {tier.hasPromo && tier.originalPriceLabel && (
            <span className="text-sm text-muted-foreground line-through">
              {tier.originalPriceLabel}
            </span>
          )}
        </div>
      )}

      {tier.description && (
        <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
      )}

      {tier.inclusions.length > 0 && (
        <ul className="mt-3 space-y-1.5 text-sm text-card-foreground">
          {tier.inclusions.map((item) => (
            <li key={`inc-${item}`} className="flex items-start gap-2">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
              <span className="min-w-0 break-words">{item}</span>
            </li>
          ))}
        </ul>
      )}

      {tier.exclusions.length > 0 && (
        <div className="mt-3 border-t border-border pt-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Not included</p>
          <ul className="mt-1.5 space-y-1 text-sm text-muted-foreground">
            {tier.exclusions.map((item) => (
              <li key={`exc-${item}`} className="min-w-0 break-words">— {item}</li>
            ))}
          </ul>
        </div>
      )}

      <button
        type="button"
        onClick={onSelect}
        disabled={disabled || soldOut}
        className="mt-4 w-full rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition hover:bg-primary-hover disabled:cursor-not-allowed disabled:opacity-55"
      >
        {soldOut ? "Sold out" : "Choose Plan"}
      </button>
    </div>
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
    const actualPrice = normalizePrice(tier.actual_price ?? tier.price ?? tier.amount);
    const promoPrice = normalizePrice(tier.promo_price);
    const currencyCode = resolveCurrencyCode(tier);
    const hasPromo = promoPrice !== null && actualPrice !== null && promoPrice < actualPrice;
    const displayPrice = hasPromo ? promoPrice : actualPrice;
    const remaining = tier.remaining === null || tier.remaining === undefined
      ? null
      : Number(tier.remaining);
    return {
      id: tier.id,
      label: String(tier.name ?? tier.title ?? tier.label ?? "Ticket"),
      description: tier.description ?? "",
      actualPrice,
      promoPrice,
      hasPromo,
      displayPrice,
      currencyCode,
      priceLabel: formatPriceLabel(displayPrice, currencyCode, form.pricing_type),
      originalPriceLabel: hasPromo ? formatPriceLabel(actualPrice, currencyCode, form.pricing_type) : "",
      inclusions: splitLines(tier.inclusions),
      exclusions: splitLines(tier.exclusions),
      remaining: Number.isFinite(remaining) ? remaining : null,
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

function normalizePrice(value) {
  if (value === null || value === undefined || value === "") return null;
  const num = Number(value);
  return Number.isFinite(num) ? num : null;
}

function resolveCurrencyCode(tier) {
  if (tier.currency_code) return String(tier.currency_code);
  if (tier.currency && typeof tier.currency === "string") return tier.currency;
  if (tier.currency?.code) return String(tier.currency.code);
  const id = Number(tier.currency_id);
  if (Number.isFinite(id) && CURRENCY_CODE_BY_ID[id]) return CURRENCY_CODE_BY_ID[id];
  return "";
}

function formatPriceLabel(amount, currencyCode, pricingType) {
  if (amount === null || amount === undefined) {
    return pricingType === "free" ? "Free" : "";
  }
  const formatted = Number.isInteger(amount) ? String(amount) : amount.toFixed(2);
  return `${currencyCode ? `${currencyCode} ` : ""}${formatted}`;
}

function splitLines(value) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean);
}
