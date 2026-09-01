export default function LocationCard({ location, index, isLast }) {
  const translations = location?.translations || {}
  const currentTranslation = translations.EN || {}

  const stopDuration = location?.details?.["Stop duration"] || "—"
  const landmarkType = location?.details?.["Landmark type"] || "N/A"
  const tags = location?.details?.["Tag(s)"] || "N/A"

  return (
    <div className="flex gap-2 md:gap-4 pb-0 relative">
      {/* Timeline Line and Dot */}
      <div className="flex flex-col items-center">
        {/* Dot */}
        <div className="md:w-6 md:h-6 w-2 h-2 bg-primary rounded-full flex-shrink-0 mt-0" />
        {/* Connecting Line */}
        {!isLast && <div className="w-0.5 md:w-1 bg-surface flex-1 min-h-16 mt-0" />}
      </div>

      {/* Content */}
      <div className="flex-1 pt-1">
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1">
          <div className="flex-col">
              {/* Location Title */}
            <h4 className="text-white font-semibold text-xs md:text-sm mb-1">
              {currentTranslation.title || ""}
            </h4>

            {/* Optional Description */}
            {currentTranslation.short_desc && (
              <p className="text-muted-foreground text-xs md:text-sm mb-1">
                {currentTranslation.short_desc}
              </p>
            )}
          </div>

            {/* Location Details */}
            <div className="flex-col md:flex gap-3 text-xs md:text-sm text-foreground">
              {landmarkType !== "N/A" && <span>{tags}</span>}
            
             <div>
                {landmarkType !== "N/A" && <span className="px-1">•</span>}
               {landmarkType !== "N/A" && <span>{landmarkType}</span>}
             </div>
            </div>
          </div>

          {/* Stop Duration Badge */}
          <div className="bg-primary text-white rounded-full text-sm font-semibold flex items-center justify-between flex-shrink-0 whitespace-nowrap">
            <span className="text-[10px] md:text-sm px-2">Stop duration:</span>
            <span className="rounded-xl text-[10px] md:text-sm text-surface-foreground bg-surface py-1 px-2">
              {stopDuration !== "—" ? stopDuration : "-"}
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
