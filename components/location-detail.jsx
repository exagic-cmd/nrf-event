// "use client"

// import { useState, useRef, useEffect } from "react"

// export default function LocationDetail({ location, locationIndex, selectedLang, onNext, onPrev, canNext, canPrev }) {
//   const audioRef = useRef(null)
//   const [isPlaying, setIsPlaying] = useState(false)
//   const [elapsed, setElapsed] = useState(0)
//   const [duration, setDuration] = useState(0)
//   const timerRef = useRef(null)

//   const translations = location.translations || {}
//   const currentTranslation = translations["EN"]

//   const mainImage = location.images && location.images.length > 0 ? location.images[0] : "/abstract-location.png"

//   const audioUrl = location.audio_urls?.location?.[selectedLang] || location.audio_urls?.location?.EN || ""

//   const formatMMSS = (seconds) => {
//     const mins = String(Math.floor(seconds / 60)).padStart(2, "0")
//     const secs = String(Math.floor(seconds % 60)).padStart(2, "0")
//     return `${mins}:${secs}`
//   }

//   const handlePlayAudio = () => {
//     if (!audioRef.current) return
//     if (isPlaying) {
//       audioRef.current.pause()
//       setIsPlaying(false)
//       if (timerRef.current) clearInterval(timerRef.current)
//     } else {
//       audioRef.current.play()
//       setIsPlaying(true)
//       startTimer()
//     }
//   }

//   const startTimer = () => {
//     if (timerRef.current) clearInterval(timerRef.current)
//     timerRef.current = setInterval(() => {
//       if (audioRef.current) {
//         setElapsed(Math.floor(audioRef.current.currentTime))
//       }
//     }, 300)
//   }

//   const handleAudioEnded = () => {
//     setIsPlaying(false)
//     if (timerRef.current) clearInterval(timerRef.current)
//   }

//   useEffect(() => {
//     return () => {
//       if (timerRef.current) clearInterval(timerRef.current)
//     }
//   }, [])

//   const formatKey = (key) => {
//     return key.replace(/_/g, " ").replace(/\b\w/g, (char) => char.toUpperCase())
//   }

//   const formatValue = (value) => {
//     if (typeof value === "string" && value === value.toUpperCase() && value.length > 1) {
//       return value.charAt(0).toUpperCase() + value.slice(1).toLowerCase()
//     }
//     return value
//   }

//   const details = Object.fromEntries(
//     Object.entries(location.details || {}).filter(
//       ([k, v]) => !["lat", "lng", "travel_mode"].includes(k) && String(v).trim() !== "",
//     ),
//   )

//   return (
//     <div className="flex-1 flex flex-col">
//       {/* Image */}
//       <div className="w-full h-64 md:h-96 bg-secondary overflow-hidden">
//         <img
//           src={mainImage || "/placeholder.svg"}
//           alt={currentTranslation.title || "Location"}
//           className="w-full h-full object-cover"
//         />
//       </div>

//       {/* Content */}
//       <main className="flex-1 max-w-5xl mx-auto w-full px-4 md:px-6 py-6 md:py-8 space-y-6">
//         <h1 className="text-2xl md:text-4xl font-bold text-white">{currentTranslation.title || "Untitled"}</h1>

//         {/* Audio Player */}
//         {/* {audioUrl && (
//           <div className="bg-brand-secondary rounded-2xl p-4 flex items-center gap-4">
//             <button
//               onClick={handlePlayAudio}
//               className="flex-shrink-0 w-12 h-12 bg-surface/20 hover:bg-surface/10 rounded-full flex items-center justify-center text-white transition-colors"
//             >
//               {isPlaying ? "⏸" : "▶"}
//             </button>
//             <div className="flex-1">
//               <audio
//                 ref={audioRef}
//                 src={audioUrl}
//                 onEnded={handleAudioEnded}
//                 onLoadedMetadata={(e) => setDuration(e.target.duration)}
//                 className="w-full"
//               />
//               <div className="text-white text-sm font-medium">
//                 {formatMMSS(elapsed)} / {formatMMSS(duration)}
//               </div>
//             </div>
//           </div>
//         )} */}

//         {/* Description */}
//         <p className="text-gray-100 text-base md:text-lg whitespace-pre-line">{currentTranslation.description || ""}</p>

//         {/* Details Grid */}
//         {Object.keys(details).length > 0 && (
//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
//             {Object.entries(details).map(([key, value]) => (
//               <div key={key} className="bg-secondary border border-border rounded-lg p-4">
//                 <div className="text-gray-100 text-sm font-medium mb-1">{formatKey(key)}</div>
//                 <div className="text-white font-semibold">{formatValue(value)}</div>
//               </div>
//             ))}
//           </div>
//         )}

//         {/* Navigation Buttons */}
//         <div className="flex justify-between gap-4 pt-6">
//           <button
//             onClick={onPrev}
//             disabled={!canPrev}
//             className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
//               canPrev ? "bg-muted hover:bg-secondary text-white" : "bg-secondary text-muted-foreground cursor-not-allowed"
//             }`}
//           >
//             ← Previous
//           </button>
//           <button
//             onClick={onNext}
//             disabled={!canNext}
//             className={`px-6 py-3 rounded-lg font-semibold transition-colors ${
//               canNext ? "bg-brand-secondary text-white" : "bg-secondary text-muted-foreground cursor-not-allowed"
//             }`}
//           >
//             Next →
//           </button>
//         </div>
//       </main>
//     </div>
//   )
// }
