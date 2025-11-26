import React from "react";

// Renders a structured terms/notes list suitable for Accommodation Detail pages.
// Expected `sections` prop format (flexible):
// [
//   { title: 'Section Title', description: 'Optional intro text', items: ['bullet1', 'bullet2'] },
//   { title: 'Another', items: [ { subtitle: 'Sub', points: ['a','b'] } ] }
// ]
// The component mirrors spacing and hierarchy used by Terms & Conditions display.

export default function AccommodationTermsList({ sections = [] }) {
  if (!sections || sections.length === 0) return null;

  return (
    <div className="bg-white rounded p-4">
      {sections.map((sec, idx) => (
        <div key={idx} className="mb-4 last:mb-0">
          {sec.title && (
            <h3 className="text-sm md:text-base font-semibold text-gray-800 mb-2">
              {sec.title}
            </h3>
          )}

          {sec.description && (
            <div className="text-sm text-gray-700 mb-2 whitespace-pre-line">
              {sec.description}
            </div>
          )}

          {/* items can be strings, arrays, or objects with nested points */}
          {Array.isArray(sec.items) && (
            <ul className="list-inside text-sm text-gray-700 space-y-2">
              {sec.items.map((it, i) => {
                if (typeof it === "string") {
                  return (
                    <li key={i} className="flex gap-2">
                      <span className="text-[#D3202D] mt-0.5">•</span>
                      <span className="flex-1">{it}</span>
                    </li>
                  );
                }

                // object form: { subtitle, points: [] }
                if (typeof it === "object") {
                  return (
                    <li key={i} className="">
                      {it.subtitle && (
                        <div className="text-sm font-medium text-gray-800 mb-1">
                          {it.subtitle}
                        </div>
                      )}
                      {Array.isArray(it.points) && (
                        <ul className="ml-4 list-disc text-sm text-gray-700 space-y-1">
                          {it.points.map((p, pi) => (
                            <li key={pi}>{p}</li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                }

                return null;
              })}
            </ul>
          )}
        </div>
      ))}
    </div>
  );
}

// Usage example (Accommodation Detail):
// <AccommodationTermsList sections={termsResponse.sections} />
