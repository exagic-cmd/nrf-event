import { Star } from "lucide-react"

export function RatingCard() {
  return (
    <div className="w-full max-w-xs mx-auto md:mx-0 mt-8 p-3 bg-surface/80 backdrop-blur-sm rounded-xl shadow-lg border border-border flex flex-col sm:flex-row items-center justify-center gap-2 text-center text-sm">
      <div className="flex items-center gap-1 text-orange-500">
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current" />
        <Star className="w-4 h-4 fill-current text-orange-300" /> {/* Half star or slightly less filled */}
      </div>
      <span className="text-muted-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">4.9/5 by</span>
      <div className="flex -space-x-2 overflow-hidden">
        <img
          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
          src="/placeholder.svg?height=24&width=24&text=P1"
          alt="Traveler 1"
        />
        <img
          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
          src="/placeholder.svg?height=24&width=24&text=P2"
          alt="Traveler 2"
        />
        <img
          className="inline-block h-6 w-6 rounded-full ring-2 ring-white"
          src="/placeholder.svg?height=24&width=24&text=P3"
          alt="Traveler 3"
        />
      </div>
      <span className="text-muted-foreground font-semibold text-xs sm:text-sm whitespace-nowrap">1000+ travelers</span>
    </div>
  )
}
