"use client";

export default function TourLocationDetails({ translation, details }) {
  if (!translation && !details) return null;

  return (
    <div className="space-y-6">
      {/* Description */}
      <p>{translation?.title}</p>
      {translation?.description && (
        <p className="text-gray-100 text-base md:text-lg whitespace-pre-line">
          {translation.description}
        </p>
      )}

      {/* Dynamic Details */}
      {details && Object.keys(details).length > 0 && (
        <div className="bg-[#CC9A55]/15 border border-[#CC9A55]/30 rounded-2xl p-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {Object.entries(details).map(([key, value]) => (
            <div
              key={key}
              className="flex-col justify-between items-center bg-black/20 rounded-xl p-3 min-h-[56px]"
            >
              <div className="text-[#f8dcb0] text-sm font-semibold mr-3">{key}</div>
              <div className="text-white text-base font-bold ml-auto min-w-0 truncate">
                {value}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
