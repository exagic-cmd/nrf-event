"use client"
import AudioNote from "@/components/AudioNotePlayer"

export default function TourAudioSection({ image, title, audioUrl }) {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="w-full h-64 md:h-96 bg-secondary overflow-hidden rounded-xl">
        <img
          src={image}
          alt={title || "Location"}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Title */}
      {title && (
        <h1 className="text-lg md:text-2xl font-bold text-white">{title}</h1>
      )}

      {/* Audio Player */}
      {audioUrl && (
        <div className="mt-4 px-2 rounded-xl border border-[#CC9A55] py-6">
          <AudioNote audioUrl={audioUrl} />
        </div>
      )}
    </div>
  )
}
