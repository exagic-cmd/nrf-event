"use client"

import type React from "react"

import { useState } from "react"
import { Send } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import ConversationList from "./conversation-list"
import { useMediaQuery } from "@/hooks/use-media-query"

// Sample data for conversations
const conversations = [
  {
    id: "1",
    name: "Alice Johnson",
    lastMessage: "Hey, how's it going?",
    time: "10:30 AM",
    unread: 2,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Bob Smith",
    lastMessage: "Can we meet tomorrow?",
    time: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Carol Williams",
    lastMessage: "I sent you the files",
    time: "Yesterday",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Dave Brown",
    lastMessage: "Thanks for your help!",
    time: "Monday",
    unread: 0,
    avatar: "/placeholder.svg?height=40&width=40",
  },
]

// Sample messages for the current conversation
const initialMessages = [
  {
    id: "1",
    content: "Hey there! How are you doing today?",
    sender: "them",
    timestamp: "10:30 AM",
  },
  {
    id: "2",
    content: "I'm good, thanks for asking! Just working on some new projects.",
    sender: "me",
    timestamp: "10:32 AM",
  },
  {
    id: "3",
    content: "That sounds interesting. What kind of projects are you working on?",
    sender: "them",
    timestamp: "10:33 AM",
  },
  {
    id: "4",
    content: "I'm building a chat interface with React and shadcn/ui. It's coming along nicely!",
    sender: "me",
    timestamp: "10:35 AM",
  },
  {
    id: "5",
    content: "That's awesome! I'd love to see it when you're done.",
    sender: "them",
    timestamp: "10:36 AM",
  },
]

export default function ChatLayout() {
  const [messages, setMessages] = useState(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [activeConversation, setActiveConversation] = useState(conversations[0])
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const isDesktop = useMediaQuery("(min-width: 768px)")

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage = {
        id: String(messages.length + 1),
        content: inputValue,
        sender: "me",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }
      setMessages([...messages, newMessage])
      setInputValue("")
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div
        className={cn(
          "border-r bg-muted/40 transition-all duration-300 ease-in-out",
          isDesktop ? "w-80" : sidebarOpen ? "w-full absolute inset-0 z-10" : "w-0 hidden",
        )}
      >
        <div className="p-4 border-b">
          <h2 className="text-xl font-bold">Messages</h2>
        </div>
        <ScrollArea className="h-[calc(100vh-65px)]">
          <ConversationList
            conversations={conversations}
            activeId={activeConversation.id}
            onSelect={(conv) => {
              setActiveConversation(conv)
              if (!isDesktop) setSidebarOpen(false)
            }}
          />
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className="flex flex-col flex-1 overflow-hidden">
        {/* Chat Header */}
        <div className="flex items-center p-4 border-b h-16">
          {!isDesktop && (
            <Button variant="ghost" size="sm" className="mr-2" onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </Button>
          )}
          <Avatar className="h-10 w-10">
            <AvatarImage src={activeConversation.avatar} alt={activeConversation.name} />
            <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <h3 className="font-semibold">{activeConversation.name}</h3>
            <p className="text-xs text-muted-foreground">Online</p>
          </div>
        </div>

        {/* Messages */}
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={cn("flex", message.sender === "me" ? "justify-end" : "justify-start")}>
                <div className="flex items-end gap-2">
                  {message.sender !== "me" && (
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={activeConversation.avatar} alt={activeConversation.name} />
                      <AvatarFallback>{activeConversation.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  )}
                  <Card
                    className={cn(
                      "max-w-md px-4 py-3",
                      message.sender === "me" ? "bg-primary text-primary-foreground" : "bg-muted",
                    )}
                  >
                    <p>{message.content}</p>
                    <p
                      className={cn(
                        "text-xs mt-1",
                        message.sender === "me" ? "text-primary-foreground/70" : "text-muted-foreground",
                      )}
                    >
                      {message.timestamp}
                    </p>
                  </Card>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Input Area */}
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <Input
              placeholder="Type a message..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              className="flex-1"
            />
            <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

