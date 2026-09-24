import { useEffect, useState } from "react";
import { CircleHelp } from "lucide-react";
import { apiRequest } from "@/lib/clientApi";

function getOptions(question) {
  if (Array.isArray(question?.options_list) && question.options_list.length > 0) {
    return question.options_list;
  }

  const parsedOptions = question?.parsed_options || {};
  const labels = Array.isArray(parsedOptions.text) ? parsedOptions.text : [];
  const values = Array.isArray(parsedOptions.values) ? parsedOptions.values : [];

  return labels.map((label, index) => ({
    label,
    value: values[index] ?? label,
  }));
}

function QuestionControl({ question, value, onChange }) {
  const options = getOptions(question);
  const commonClassName =
    "mt-1 w-full rounded border border-border bg-surface px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

  // MULTIPLE OPTIONS: RADIO
  if (question.type === "radio") {
    return (
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name={`event-faq-${question.id}`}
              value={option.value}
              checked={value === option.value}
              onChange={(event) => onChange(event.target.value)}
              className="h-4 w-4 border-border text-primary focus:ring-primary"
            />
            {option.label}
          </label>
        ))}
      </div>
    );
  }

  // MULTIPLE OPTIONS: CHECKBOX
  if (question.type === "checkbox") {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <div className="mt-2 grid gap-2 sm:grid-cols-2 md:grid-cols-3">
        {options.map((option) => {
          const checked = selectedValues.includes(option.value);
          return (
            <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
              <input
                type="checkbox"
                value={option.value}
                checked={checked}
                onChange={() =>
                  onChange(
                    checked
                      ? selectedValues.filter((selected) => selected !== option.value)
                      : [...selectedValues, option.value]
                  )
                }
                className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
              />
              {option.label}
            </label>
          );
        })}
      </div>
    );
  }

  // MULTIPLE OPTIONS: MULTI-SELECT
  if (question.type === "select-multiple" || question.type === "multiselect") {
    const selectedValues = Array.isArray(value) ? value : [];

    return (
      <select
        multiple
        value={selectedValues}
        onChange={(event) => {
          const selected = Array.from(event.target.selectedOptions, (option) => option.value);
          onChange(selected);
        }}
        className={`${commonClassName} h-32`}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value} className="p-1">
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // TEXTAREA
  if (question.type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={commonClassName}
        placeholder={`Enter ${question.question.toLowerCase()}`}
      />
    );
  }

  // SINGLE DROPDOWN
  if (question.type === "dropdown" || question.type === "select") {
    return (
      <select value={value || ""} onChange={(event) => onChange(event.target.value)} className={commonClassName}>
        <option value="">Select an option</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );
  }

  // STANDARD INPUT (text, date, number, etc.)
  return (
    <input
      type={question.type === "date" ? "date" : "text"}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={commonClassName}
      placeholder={`Enter ${question.question.toLowerCase()}`}
    />
  );
}

export default function EventFAQs({ eventId, onChange, onValidityChange }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!eventId) {
      setQuestions([]);
      setAnswers({});
      setError("");
      return;
    }

    let cancelled = false;
    setQuestions([]);
    setAnswers({});
    setLoading(true);
    setError("");

    apiRequest({ endpoint: `events/${eventId}/faqs`, method: "GET" })
      .then((response) => {
        if (!cancelled) setQuestions(Array.isArray(response?.data) ? response.data : []);
      })
      .catch(() => {
        if (!cancelled) {
          setError("Unable to load event questions.");
          onValidityChange?.(false);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [eventId]);

  useEffect(() => {
    const faqAnswers = questions.map((question) => ({
      faq_id: question.id,
      question: question.question,
      answer: answers[question.id] ?? (["checkbox", "select-multiple", "multiselect"].includes(question.type) ? [] : ""),
    }));

    const isValid = questions.every((question) => {
      if (!question.is_required && !question.mandatory) return true;
      const answer = answers[question.id];
      return Array.isArray(answer) ? answer.length > 0 : String(answer || "").trim().length > 0;
    });

    onChange?.(faqAnswers);
    onValidityChange?.(isValid);
  }, [answers, onChange, onValidityChange, questions]);

  if (!eventId || (!loading && !questions.length && !error)) return null;

  // Categorize questions
  const MULTI_OPTION_TYPES = ["checkbox", "radio", "select-multiple", "multiselect", "textarea"];

  const isMultiOption = (q) =>
    MULTI_OPTION_TYPES.includes(q.type) || getOptions(q).length > 0;

  // Stack 1: Multi-option / Full-width questions (Sorted by option count descending)
  const fullWidthQuestions = questions
    .filter((q) => isMultiOption(q))
    .sort((a, b) => getOptions(b).length - getOptions(a).length);

  // Stack 2: Standard two-column questions
  const standardQuestions = questions.filter((q) => !isMultiOption(q));

  const renderQuestionCard = (question) => (
    <div key={question.id}>
      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <CircleHelp className="h-4 w-4 shrink-0" />
        <span>{question.question}</span>
        {(question.is_required || question.mandatory) && <span className="text-destructive"> *</span>}
      </label>
      <QuestionControl
        question={question}
        value={answers[question.id]}
        onChange={(value) => setAnswers((current) => ({ ...current, [question.id]: value }))}
      />
    </div>
  );

  return (
    <section>
      {/* {loading && <p className="mt-3 text-sm text-muted-foreground">Loading questions...</p>}
      {error && <p className="mt-3 text-sm text-destructive">{error}</p>} */}
      {!loading && !error && (
        <div className="mt-4 flex flex-col gap-8">
          {/* Top Stack: Full-Width / Multi-Option Questions */}
          {fullWidthQuestions.length > 0 && (
            <div className="grid grid-cols-1 gap-8">
              {fullWidthQuestions.map(renderQuestionCard)}
            </div>
          )}

          {/* Bottom Stack: 2-Column Standard Questions */}
          {standardQuestions.length > 0 && (
            <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
              {standardQuestions.map(renderQuestionCard)}
            </div>
          )}
        </div>
      )}
    </section>
  );
}