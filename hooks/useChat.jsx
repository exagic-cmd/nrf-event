"use client"
import { useState, useEffect } from "react"
import { useChatStore } from "@/store/useChataiStore"

export const useChat = () => {
  const {
    userId,
    initializeUserId,
    messages,
    recommendedTours,
    fetchHistory,
    sendMessage,
    loading,
  } = useChatStore()

  const [inputValue, setInputValue] = useState("")
  const [isTyping, setIsTyping] = useState(false)

  const getInitialGreeting = () => {
    const hour = new Date().getHours()
    return {
      id: `greeting-${hour}`,
      type: "bot",
      content:
        "Hi, I’ll help you find experiences, transfers, and package tours from our website.",
      timestamp: new Date().toISOString(),
    }
  }

  useEffect(() => {
    initializeUserId()
  }, [])

  useEffect(() => {
    if (userId) {
      fetchHistory(userId)
    }
  }, [userId])

const handleSendMessage = async (onShowTours, customMessage) => {
  const messageToSend = customMessage ?? inputValue
  if (!messageToSend.trim()) return

  if (!customMessage) setInputValue("")
  setIsTyping(true)

  try {
    const result = await sendMessage(userId, messageToSend)
    if (result?.matched_products?.length > 0) {
      onShowTours?.(true)
    }
  } finally {
    setIsTyping(false)
  }
}


  const handleKeyPress = (e, onShowTours) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage(onShowTours)
    }
  }

 const mergedMessages = messages?.length > 0 ? messages : [getInitialGreeting()];


  return {
    messages: mergedMessages,
    inputValue,
    setInputValue,
    isTyping,
    handleSendMessage,
    handleKeyPress,
    recommendedTours,
  }
}
