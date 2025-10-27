"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { ChatbotInterface } from "@/components/chatbot-interface"
import { useTransferStore } from "@/store/useTransferStore"

export default function TransferBookingPage() {
  const router = useRouter()
  const { searchParams } = useTransferStore()

  const pickup = searchParams?.pickup
  const dropoff = searchParams?.dropoff

  useEffect(() => {
    if (!pickup || !dropoff) {
      router.replace("/") 
    }
  }, [pickup, dropoff, router])

  const handleEditLocations = () => {
    router.push("/transfer-booking")
  }

  if (!pickup || !dropoff) {
    return null 
  }

  return (
    <div className="h-[100vh] bg-background">
      <ChatbotInterface
        pickup={pickup}
        dropoff={dropoff}
        onEditLocations={handleEditLocations}
      />
    </div>
  )
}
