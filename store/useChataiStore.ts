// store/useChatStore.js
import { create } from 'zustand'

export const useChatStore = create((set) => ({
  messages: [],
  recommendedTours: [],
  loading: false,
  error: null,
userId: null,

initializeUserId: () => {
  let storedId = localStorage.getItem("esgpt_user_id")
  if (!storedId) {
    storedId = "user-" + Math.random().toString(36).substr(2, 10)
    localStorage.setItem("esgpt_user_id", storedId)
  }
  set({ userId: storedId })
},
  fetchHistory: async (userId) => {
    set({ loading: true, error: null })
    try {
      const res = await fetch('https://ai.airporttransfers.ai/get-user-messages-history', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          type: 'activity',
        }),
      })

      if (!res.ok) throw new Error('Failed to fetch')

      const history = await res.json()

      const parsed = history.flatMap((item) => [
        {
          id: `user-${item.id}`,
          type: 'user',
          content: item.user_message,
        },
        {
          id: `bot-${item.id}`,
          type: 'bot',
          content: item.system_response,
        },
      ])

      set({ messages: parsed, loading: false })
    } catch (err) {
      console.error(err)
      set({ error: 'Failed to fetch chat history', loading: false })
    }
  },

sendMessage: async (userId, userMessage) => {
  const timestamp = Date.now()

  const userPayload = {
    id: `user-${timestamp}`,
    type: 'user',
    content: userMessage,
    timestamp: new Date().toISOString(),
  }

  try {
    const res = await fetch('https://ai.airporttransfers.ai/esgpt-search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, userMessage }),
    })

    if (!res.ok) throw new Error('Failed to get response')

    const response = await res.json()

    const botPayload = {
      id: `bot-${timestamp + 1}`,
      type: 'bot',
      content: response.system_response ?? "Sorry, no response.",
      timestamp: new Date().toISOString(),
    }

    const tours = response?.matched_products || []


    set((state) => ({
      messages: [...state.messages, userPayload, botPayload],
      recommendedTours: tours,
      loading: false,
    }))

    return response
  } catch (err) {
    console.error(err)
    set({ error: 'Failed to send message', loading: false })
  }
}


}))
