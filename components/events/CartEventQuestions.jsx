import { useEffect, useMemo, useState } from "react";
import { CircleHelp } from "lucide-react";
import { useCartStore } from "@/store/useCartStore";

const commonClassName =
  "mt-1 w-full rounded border border-border bg-surface px-4 py-3 text-base text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

function normalizeOptions(options) {
  if (!Array.isArray(options)) return [];
  return options.map((option) => ({
    label: String(option?.text ?? option?.label ?? option?.value ?? ""),
    value: String(option?.value ?? option?.text ?? option?.label ?? ""),
  }));
}

function QuestionControl({ question, value, onChange }) {
  const options = normalizeOptions(question.options);
  const type = question.type;

  if (type === "radio") {
    return (
      <div className="mt-2 flex flex-wrap gap-4">
        {options.map((option) => (
          <label key={option.value} className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
            <input
              type="radio"
              name={`cart-q-${question.id}`}
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

  if (type === "checkbox") {
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

  if (type === "dropdown" || type === "select") {
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

  if (type === "textarea") {
    return (
      <textarea
        rows={3}
        value={value || ""}
        onChange={(event) => onChange(event.target.value)}
        className={commonClassName}
        placeholder={`Enter ${question.question?.toLowerCase?.() ?? ""}`}
      />
    );
  }

  const inputType = ["email", "tel", "number", "date", "url"].includes(type) ? type : "text";
  return (
    <input
      type={inputType}
      value={value || ""}
      onChange={(event) => onChange(event.target.value)}
      className={commonClassName}
      placeholder={`Enter ${question.question?.toLowerCase?.() ?? ""}`}
    />
  );
}

function isAnswerFilled(answer, type) {
  if (["checkbox"].includes(type)) {
    return Array.isArray(answer) && answer.length > 0;
  }
  return String(answer ?? "").trim().length > 0;
}

export default function CartEventQuestions({ onChange, onValidityChange, className = "" }) {
  const items = useCartStore((state) => state.items);
  const questionItems = useMemo(
    () => items.filter((item) => Array.isArray(item?.questions) && item.questions.length > 0),
    [items]
  );

  const [answers, setAnswers] = useState({});

  useEffect(() => {
    setAnswers((current) => {
      const next = {};
      questionItems.forEach((item) => {
        const key = String(item.tourId ?? item.key);
        const existingForItem = current[key] || {};
        const kept = {};
        item.questions.forEach((question) => {
          const qid = String(question.id);
          if (existingForItem[qid] !== undefined) kept[qid] = existingForItem[qid];
        });
        next[key] = kept;
      });
      return next;
    });
  }, [questionItems]);

  useEffect(() => {
    const structured = {};
    let allValid = true;

    questionItems.forEach((item) => {
      const productKey = String(item.tourId ?? item.key);
      structured[productKey] = {};
      item.questions.forEach((question) => {
        const qid = String(question.id);
        const value = answers[productKey]?.[qid];
        const defaultValue = ["checkbox"].includes(question.type) ? [] : "";
        structured[productKey][qid] = value ?? defaultValue;

        if (question.is_required && !isAnswerFilled(value, question.type)) {
          allValid = false;
        }
      });
    });

    onChange?.(structured);
    onValidityChange?.(allValid);
  }, [answers, questionItems, onChange, onValidityChange]);

  if (questionItems.length === 0) return null;

  return (
    <section className={className}>
      {questionItems.map((item) => {
        const productKey = String(item.tourId ?? item.key);
        return (
          <div key={item.key} className="mt-4">
            <h3 className="text-base font-semibold text-foreground">{item.title}</h3>
            <div className="mt-4 grid grid-cols-1 gap-8 md:grid-cols-2">
              {item.questions.map((question) => (
                <div key={question.id}>
                  <label className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CircleHelp className="h-4 w-4 shrink-0" />
                    <span>{question.question}</span>
                    {question.is_required && <span className="text-destructive"> *</span>}
                  </label>
                  <QuestionControl
                    question={question}
                    value={answers[productKey]?.[String(question.id)]}
                    onChange={(value) =>
                      setAnswers((current) => ({
                        ...current,
                        [productKey]: {
                          ...(current[productKey] || {}),
                          [String(question.id)]: value,
                        },
                      }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </section>
  );
}
