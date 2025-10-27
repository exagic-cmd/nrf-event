import { MessageSquare } from "lucide-react"

export function FloatingChatQuery({ text, delayClass }) {
  return (
    <div
      className={`p-2 rounded-lg bg-white/70 backdrop-blur-sm shadow-md text-sm text-gray-700 flex items-center gap-1 ${delayClass}`}
    >
      <MessageSquare className="w-3 h-3 text-orange-500" />
      <span className="whitespace-nowrap">{text}</span>
    </div>
  )
}
