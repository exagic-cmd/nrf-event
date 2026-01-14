"use client";

export default function TourLocationDetails({ translation, details, travel = false }) {
  if (!translation && !details) return null;

  // Filter details based on "travel" prop
  const filteredDetails =
    details &&
    Object.fromEntries(
      Object.entries(details).filter(([key]) => {
        const lowerKey = key.toLowerCase();
        const isTravelKey = lowerKey.startsWith("travel") || lowerKey === "pass_by";
        return travel ? isTravelKey : !isTravelKey;
      })
    );

  return (
    <div className="space-y-6">
      {!travel && translation?.description && (
        <p className="text-gray-800 text-base md:text-lg whitespace-pre-line">
          {translation.description}
        </p>
      )}
      {/* Dynamic Details */}
      {filteredDetails && Object.keys(filteredDetails).length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2">
          {Object.entries(filteredDetails).map(([key, value]) => {
            if (!value) return null;

            if (key.toLowerCase() === "pass_by") {
              const locations = (Array.isArray(value) ? value : String(value).split(",").map(s => s.trim())).filter(Boolean);
              if (locations.length === 0) return null;
              return (
                <div
                  key={key}
                  className="flex-col justify-between items-start bg-white rounded-xl p-3 min-h-[56px] sm:col-span-2 md:col-span-3"
                >
                  <div className="text-[#D3202D] text-sm font-semibold capitalize">
                    Pass By
                  </div>
                  <div className="text-black text-base font-bold min-w-0 flex flex-wrap gap-2 mt-2">
                    {locations.map((loc, index) => (
                      <span
                        key={index}
                        className="bg-gray-700 px-2 py-1 rounded-md text-sm font-normal"
                      >
                        {loc}
                      </span>
                    ))}
                  </div>
                </div>
              );
            }

            return (
              <div
                key={key}
                className="flex-col justify-between items-center bg-[#f4f4f4]/20 rounded-xl p-3 min-h-[56px]"
              >
                <div className="text-[#D3202D] text-sm font-semibold mr-3 capitalize">
                  {key.replace(/_/g, " ")}
                </div>
                <div className="text-black text-base font-bold ml-auto min-w-0 truncate">
                  {value}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
