"use client"

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

type Conversation = {
  id: string
  name: string
  lastMessage: string
  time: string
  unread: number
  avatar: string
}

interface ConversationListProps {
  conversations: Conversation[]
  activeId: string
  onSelect: (conversation: Conversation) => void
}

export default function ConversationList({ conversations, activeId, onSelect }: ConversationListProps) {
  return (
    <div className="space-y-1 p-2">
      {conversations.map((conversation) => (
        <button
          key={conversation.id}
          className={cn(
            "flex w-full items-center gap-3 rounded-lg p-3 text-left transition-colors",
            activeId === conversation.id ? "bg-accent" : "hover:bg-muted",
          )}
          onClick={() => onSelect(conversation)}
        >
          <Avatar>
            <AvatarImage src={conversation.avatar} alt={conversation.name} />
            <AvatarFallback>{conversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 overflow-hidden">
            <div className="flex items-center justify-between">
              <h4 className="font-medium">{conversation.name}</h4>
              <span className="text-xs text-muted-foreground">{conversation.time}</span>
            </div>
            <p className="truncate text-sm text-muted-foreground">{conversation.lastMessage}</p>
          </div>
          {conversation.unread > 0 && (
            <div className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
              {conversation.unread}
            </div>
          )}
        </button>
      ))}
    </div>
  )
}

