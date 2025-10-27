import { Bot, User } from "lucide-react"

export function AIChatPreview() {
  return (
    <div className="w-full max-w-md mx-auto md:mx-0 mt-8 p-4 bg-white/80 backdrop-blur-sm rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="flex flex-col gap-3">
        {/* User Message */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <User className="w-4 h-4" />
          </div>
          <div className="bg-orange-500 text-white p-3 rounded-lg max-w-[75%] self-start text-sm shadow-sm">
            {"Hi AI, I'm planning a trip to Singapore. Any suggestions?"}
          </div>
        </div>

        {/* AI Response */}
        <div className="flex items-start gap-2 justify-end">
          <div className="bg-gray-100 text-gray-800 p-3 rounded-lg max-w-[75%] self-end text-sm shadow-sm">
            {"Hello! Singapore is fantastic! What are your interests? Food, nature, culture?"}
          </div>
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
            <Bot className="w-4 h-4" />
          </div>
        </div>

        {/* User Message 2 (Optional, for more interaction) */}
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
            <User className="w-4 h-4" />
          </div>
          <div className="bg-orange-500 text-white p-3 rounded-lg max-w-[75%] self-start text-sm shadow-sm">
            {"Mostly food and unique cultural spots!"}
          </div>
        </div>
      </div>
    </div>
  )
}
