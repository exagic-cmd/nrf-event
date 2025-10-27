"use client"

import type React from "react"

import { useState } from "react"
import { Send, Home, Hotel, Building, MapPin, DollarSign, Calendar } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"

type MessageType = {
  id: string
  content: string
  sender: "ai" | "user"
  timestamp: string
  options?: Option[]
  selectedOption?: string
}

type Option = {
  id: string
  text: string
  icon?: React.ReactNode
}

// Initial welcome message from the AI
const initialMessages: MessageType[] = [
  {
    id: "1",
    content:
      "Hello! I'm your accommodation assistant. I can help you find the perfect place to stay. What type of accommodation are you looking for?",
    sender: "ai",
    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    options: [
      { id: "hotel", text: "Hotel", icon: <Hotel className="h-4 w-4" /> },
      { id: "apartment", text: "Apartment", icon: <Building className="h-4 w-4" /> },
      { id: "house", text: "House", icon: <Home className="h-4 w-4" /> },
    ],
  },
]

export default function AccommodationChatSystem() {
  const [messages, setMessages] = useState<MessageType[]>(initialMessages)
  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  // Function to handle option selection
  const handleOptionSelect = (messageId: string, optionId: string, optionText: string) => {
    // Update the message to show which option was selected
    setMessages((prevMessages) =>
      prevMessages.map((msg) => (msg.id === messageId ? { ...msg, selectedOption: optionId } : msg)),
    )

    // Add user message showing their selection
    const userMessage: MessageType = {
      id: Date.now().toString(),
      content: optionText,
      sender: "user",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setMessages((prev) => [...prev, userMessage])

    // Simulate AI thinking
    setIsTyping(true)

    // Simulate AI response based on selection
    setTimeout(() => {
      let aiResponse: MessageType

      switch (optionId) {
        case "hotel":
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: "Great choice! Hotels offer convenience and services. What's your preferred location?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            options: [
              { id: "downtown", text: "Downtown", icon: <MapPin className="h-4 w-4" /> },
              { id: "beach", text: "Near the beach", icon: <MapPin className="h-4 w-4" /> },
              { id: "airport", text: "Near airport", icon: <MapPin className="h-4 w-4" /> },
            ],
          }
          break
        case "apartment":
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: "Apartments are great for longer stays! What's your budget range per night?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            options: [
              { id: "budget", text: "Under $100", icon: <DollarSign className="h-4 w-4" /> },
              { id: "mid", text: "$100-$200", icon: <DollarSign className="h-4 w-4" /> },
              { id: "luxury", text: "Over $200", icon: <DollarSign className="h-4 w-4" /> },
            ],
          }
          break
        case "house":
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: "Houses are perfect for families or groups! How many bedrooms do you need?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            options: [
              { id: "1br", text: "1 Bedroom" },
              { id: "2br", text: "2 Bedrooms" },
              { id: "3br", text: "3+ Bedrooms" },
            ],
          }
          break
        case "downtown":
        case "beach":
        case "airport":
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: "Perfect! When are you planning to stay?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            options: [
              { id: "weekend", text: "This weekend", icon: <Calendar className="h-4 w-4" /> },
              { id: "week", text: "Next week", icon: <Calendar className="h-4 w-4" /> },
              { id: "month", text: "Next month", icon: <Calendar className="h-4 w-4" /> },
            ],
          }
          break
        case "budget":
        case "mid":
        case "luxury":
        case "1br":
        case "2br":
        case "3br":
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content: "Based on your preferences, here are some recommendations for you:",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          }

          // Add some sample recommendations
          setTimeout(() => {
            const recommendations: MessageType = {
              id: (Date.now() + 2).toString(),
              content: "Here are 3 options that match your criteria:",
              sender: "ai",
              timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
              options: [
                {
                  id: "option1",
                  text: "Seaside Resort - $180/night, 4.8★, Beachfront location with stunning views",
                },
                {
                  id: "option2",
                  text: "Urban Loft - $150/night, 4.6★, Downtown location, walking distance to attractions",
                },
                {
                  id: "option3",
                  text: "Cozy Retreat - $120/night, 4.5★, Quiet neighborhood with great amenities",
                },
              ],
            }
            setMessages((prev) => [...prev, recommendations])
          }, 1000)
          break
        default:
          aiResponse = {
            id: (Date.now() + 1).toString(),
            content:
              "Thank you for your selection. Is there anything specific you're looking for in your accommodation?",
            sender: "ai",
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            options: [
              { id: "pool", text: "Swimming Pool" },
              { id: "wifi", text: "Free WiFi" },
              { id: "breakfast", text: "Breakfast Included" },
            ],
          }
      }

      setMessages((prev) => [...prev, aiResponse])
      setIsTyping(false)
    }, 1500)
  }

  // Function to handle text input submission
  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const userMessage: MessageType = {
        id: Date.now().toString(),
        content: inputValue,
        sender: "user",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      }

      setMessages((prev) => [...prev, userMessage])
      setInputValue("")

      // Simulate AI thinking
      setIsTyping(true)

      // Simulate AI response to free text input
      setTimeout(() => {
        const aiResponse: MessageType = {
          id: (Date.now() + 1).toString(),
          content:
            "Thanks for sharing that. To help you better, could you tell me what's most important for your stay?",
          sender: "ai",
          timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          options: [
            { id: "location", text: "Location", icon: <MapPin className="h-4 w-4" /> },
            { id: "price", text: "Price", icon: <DollarSign className="h-4 w-4" /> },
            { id: "amenities", text: "Amenities" },
          ],
        }

        setMessages((prev) => [...prev, aiResponse])
        setIsTyping(false)
      }, 1500)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <div className="flex items-center p-4 border-b h-16 bg-primary text-primary-foreground">
        <Avatar className="h-10 w-10">
          <AvatarImage src="/placeholder.svg?height=40&width=40" alt="AI Assistant" />
          <AvatarFallback>AI</AvatarFallback>
        </Avatar>
        <div className="ml-3">
          <h3 className="font-semibold">Accommodation Assistant</h3>
          <p className="text-xs opacity-80">Find your perfect stay</p>
        </div>
      </div>

      {/* Chat Area */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-4 max-w-3xl mx-auto">
          {messages.map((message) => (
            <div key={message.id} className={cn("flex", message.sender === "user" ? "justify-end" : "justify-start")}>
              <div className="flex items-end gap-2 max-w-[80%]">
                {message.sender === "ai" && (
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/ai.png" alt="AI Assistant" />
                    <AvatarFallback>AI</AvatarFallback>
                  </Avatar>
                )}
                <Card
                  className={cn(
                    "px-4 py-3",
                    message.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted",
                  )}
                >
                  <p>{message.content}</p>
                  {message.options && !message.selectedOption && (
                    <div className="mt-3 space-y-2">
                      {message.options.map((option) => (
                        <Button
                          key={option.id}
                          variant="outline"
                          className="w-full justify-start text-left"
                          onClick={() => handleOptionSelect(message.id, option.id, option.text)}
                        >
                          {option.icon && <span className="mr-2">{option.icon}</span>}
                          {option.text}
                        </Button>
                      ))}
                    </div>
                  )}
                  <p
                    className={cn(
                      "text-xs mt-1",
                      message.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground",
                    )}
                  >
                    {message.timestamp}
                  </p>
                </Card>
              </div>
            </div>
          ))}

          {isTyping && (
            <div className="flex justify-start">
              <div className="flex items-end gap-2">
                <Avatar className="h-8 w-8">
                  <AvatarImage src="/ai.png" alt="AI Assistant" />
                  <AvatarFallback>AI</AvatarFallback>
                </Avatar>
                <Card className="px-4 py-3 bg-muted">
                  <div className="flex space-x-1">
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 rounded-full bg-muted-foreground/40 animate-bounce"></div>
                  </div>
                </Card>
              </div>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t">
        <div className="flex items-center gap-2 max-w-3xl mx-auto">
          <Input
            placeholder="Ask something or type your preferences..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            className="flex-1"
            disabled={isTyping}
          />
          <Button size="icon" onClick={handleSendMessage} disabled={!inputValue.trim() || isTyping}>
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

