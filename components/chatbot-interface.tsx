"use client"

import type React from "react"
import { useCartStore } from "@/store/useCartStore"
import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Send, Bot, Loader2, X } from "lucide-react"
import { BookingLogic } from "@/components/booking-logic"
import LocationSearchForm from "@/components/LocationSearchForm"
import { useTransferStore } from "@/store/useTransferStore"
import { useRouter } from 'next/router';
interface Location {
  id: string
  name: string
}

interface ChatbotInterfaceProps {
  pickup: Location | string
  dropoff: Location | string
  onEditLocations: () => void
}

interface Message {
  id: string
  type: "bot" | "user" | "component"
  content: string
  timestamp: Date
  options?: string[]
  component?: "vehicle-selection"
  selectedOption?: string
}

interface Vehicle {
  id: string
  name: string
  type: string
  passengers: number
  baggage: number
  features: string[]
  price: number
  estimatedTime: string
  rating: number
  image: string
  description: string
  detailedFeatures?: string[]
  cancellationPolicy?: string
  driverInfo?: string
  // Additional fields from API
  api_id?: number
  pickup_point_id?: number
  dropoff_point_id?: number
  pickup_point_group_id?: number
  dropoff_point_group_id?: number
  final_price?: string
  final_promo_price?: string
  is_two_way?: boolean
  pax_capacity?: number
  product_id?: number
  promo_price?: string
  requested_direction?: string
  transfer_cluster_id?: number
  two_way_price?: string
  two_way_promo_price?: string
  vehicle_id?: number
}

interface BookingData {
  isRoundtrip: boolean | null
  vehicle: Vehicle | null
  pickupDate: string | null
  pickupTime: string | null
  departureFlightNumber: string | null
  returnDate: string | null
  returnTime: string | null
  returnFlightNumber: string | null
  adults: number | null
  children: number | null
  baggage: number | null
  passengerName: string | null
  contactNumber: string | null
  email: string | null
}

export function ChatbotInterface({ pickup: pickupProp, dropoff: dropoffProp, onEditLocations }: ChatbotInterfaceProps) {
  const normalizeLocation = (loc: Location | string | undefined | null): Location => {
    if (typeof loc === "string") {
      return { id: "", name: loc }
    }
    if (loc && typeof loc === "object" && loc.name) {
      return loc as Location
    }
    return { id: "", name: "" }
  }

  const [currentPickup, setCurrentPickup] = useState<Location>(normalizeLocation(pickupProp))
  const [currentDropoff, setCurrentDropoff] = useState<Location>(normalizeLocation(dropoffProp))
  const router = useRouter();
  // const {
  //   setSelectedPickup,
  //   setSelectedDropoff,
  //   selectedPickup: storePickup,
  //   selectedDropoff: storeDropoff,
  // } = useTransferStore()

  const [messages, setMessages] = useState<Message[]>([])
  const [currentStep, setCurrentStep] = useState(1)
  const [bookingData, setBookingData] = useState<BookingData>({
    isRoundtrip: null,
    vehicle: null,
    pickupDate: null,
    pickupTime: null,
    departureFlightNumber: null,
    returnDate: null,
    returnTime: null,
    returnFlightNumber: null,
    adults: null,
    children: null,
    baggage: null,
    passengerName: null,
    contactNumber: null,
    email: null,
  })
  const [inputValue, setInputValue] = useState("")
  const [waitingForInput, setWaitingForInput] = useState(false)
  const [inputType, setInputType] = useState<"text" | "date" | "time" | "number" | "email">("text")
  const [showVehicleSelection, setShowVehicleSelection] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [showLocationModal, setShowLocationModal] = useState(false)
  const [showVehicleDetails, setShowVehicleDetails] = useState(false)
  const [selectedVehicleDetails, setSelectedVehicleDetails] = useState<Vehicle | null>(null)
  const [forceLocationEdit, setForceLocationEdit] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [transferType, setTransferType] = useState<"one-way" | "roundtrip">("one-way")

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const addUniqueBotMessage = (content: string, options?: string[]) => {
    setMessages((prev) => {
      const alreadyExists = prev.some((msg) => msg.type === "bot" && msg.content === content)
      if (alreadyExists) return prev
      return [
        ...prev,
        {
          id: Date.now().toString(),
          type: "bot",
          content,
          timestamp: new Date(),
          options,
        },
      ]
    })
  }

  useEffect(() => {
    addUniqueBotMessage(
      `Hi! 👋 I'll help you book your transfer from ${currentPickup.name} to ${currentDropoff.name}. Is this route correct?`,
      ["Yes, let's continue", "No, change locations"],
    )
  }, [currentPickup, currentDropoff])

  useEffect(() => {
    if (showVehicleSelection) {
      setTimeout(() => {
        scrollToBottom()
      }, 100)
    }
  }, [showVehicleSelection])

  const addBotMessage = (content: string, options?: string[]) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "bot",
      content,
      timestamp: new Date(),
      options,
    }
    setMessages((prev) => [...prev, message])
  }

  const addComponentMessage = (component: "vehicle-selection") => {
    const message: Message = {
      id: Date.now().toString(),
      type: "component",
      content: "",
      timestamp: new Date(),
      component,
    }
    setMessages((prev) => [...prev, message])
  }

  const addUserMessage = (content: string) => {
    const message: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, message])
  }

  const handleOptionClick = (option: string, messageId: string) => {
    const message = messages.find((m) => m.id === messageId);
    if (message?.selectedOption) return;

    setMessages((prev) =>
      prev.map((m) => (m.id === messageId ? { ...m, selectedOption: option } : m))
    );
    addUserMessage(option);
    processUserResponse(option.includes("|") ? option.split("|")[0] : option);
  }

  const handleVehicleSelect = (vehicle: Vehicle) => {
    setBookingData((prev) => ({ ...prev, vehicle: vehicle }))
    setShowVehicleSelection(false)
    addUserMessage(`Selected: ${vehicle.name}`)
    setCurrentStep(4)

    addBotMessage("How many adults will be traveling?", ["1", "2", "3", "4", "5", "6+"])
  }

  const handleInputSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputValue.trim() && !isProcessing) {
      const validation = BookingLogic.validateBookingStep(
        inputType === "date"
          ? "date"
          : inputType === "time"
            ? "time"
            : inputType === "number"
              ? "baggage"
              : inputType === "email"
                ? "email"
                : "text",
        inputValue,
      )

      if (!validation.valid) {
        addBotMessage(validation.message || "Invalid input. Please try again.")
        return
      }

      addUserMessage(inputValue)

      if (inputType === "time" && bookingData.pickupDate) {
        setIsProcessing(true)
        const availability = await BookingLogic.checkAvailability(
          currentPickup.name,
          currentDropoff.name,
          bookingData.pickupDate,
          inputValue,
        )

        if (!availability.available && availability.alternativeTimes) {
          addBotMessage(availability.message || "Your requested time is not available. Please enter a different time.")
          setIsProcessing(false)
          return
        }
        setIsProcessing(false)
      }

      processUserResponse(inputValue)
      setInputValue("")
      setWaitingForInput(false)
    }
  }

  const processUserResponse = (response: string) => {
    switch (currentStep) {
      case 1: // Greeting & Confirmation
        if (response === "Yes, let's continue") {
          setCurrentStep(2)
          addBotMessage("Do you need a return trip as well?", ["Yes, roundtrip", "No, one-way only"])
        } else {
          setShowLocationModal(true)
        }
        break

      case 2: // Roundtrip
        const isRoundtrip = response === "Yes, roundtrip"
        setBookingData((prev) => ({ ...prev, isRoundtrip }))
        setTransferType(isRoundtrip ? "roundtrip" : "one-way")
        setCurrentStep(3)
        addBotMessage("Great! Let me show you available vehicles for your route:")
        addBotMessage("🔄 Loading available vehicles...")
        setShowVehicleSelection(true)
        addComponentMessage("vehicle-selection")
        break

      case 3: // Vehicle Selection is handled by component

        break

      case 4: // Adults Count
        const adults = response === "6+" ? 6 : Number.parseInt(response)
        setBookingData((prev) => ({ ...prev, adults }))
        setCurrentStep(5)
        addBotMessage("How many children will be traveling?", ["0", "1", "2", "3", "4", "5+"])
        break

      case 5: // Children Count
        const children = response === "5+" ? 5 : Number.parseInt(response)
        setBookingData((prev) => ({ ...prev, children }))
        setCurrentStep(6)
        addBotMessage("Perfect! What date do you need pickup? (Format: YYYY-MM-DD)")
        setWaitingForInput(true)
        setInputType("date")
        break

      case 6: // Pickup Date
        setBookingData((prev) => ({ ...prev, pickupDate: response }))
        setCurrentStep(7)
        addBotMessage("What time should we pick you up?", generateTimeOptions())
        break

      case 7: // Pickup Time
        setBookingData((prev) => ({ ...prev, pickupTime: response }))
        if (bookingData.isRoundtrip) {
          setCurrentStep(8)
          addBotMessage("What's your departure flight number? (Optional - helps us track delays)")
          setTimeout(() => {
            setWaitingForInput(true)
            setInputType("text")
          }, 100)
        } else {
          setCurrentStep(10)
          addBotMessage("What's your flight number? (Optional - helps us track delays)")
          setTimeout(() => {
            setWaitingForInput(true)
            setInputType("text")
          }, 100)
        }
        break

      case 8: // Departure Flight Number (roundtrip only)
        setBookingData((prev) => ({ ...prev, departureFlightNumber: response }))
        setCurrentStep(9)
        addBotMessage("What's your arrival flight number? (Optional - helps us track delays)")
        setTimeout(() => {
          setWaitingForInput(true)
          setInputType("text")
        }, 100)
        break

      case 9: // Arrival Flight Number (roundtrip only)
        setBookingData((prev) => ({ ...prev, returnFlightNumber: response }))
        setCurrentStep(11)
        addBotMessage("What date do you need the return trip? (Format: YYYY-MM-DD)")
        setTimeout(() => {
          setWaitingForInput(true)
          setInputType("date")
        }, 100)
        break

      case 10: // Flight Number (one-way only)
        setBookingData((prev) => ({ ...prev, departureFlightNumber: response }))
        setCurrentStep(13)
        addBotMessage("How many bags will you have?", ["0", "1", "2", "3", "4", "5+"])
        break

      case 11: // Return Date (roundtrip only)
        setBookingData((prev) => ({ ...prev, returnDate: response }))
        setCurrentStep(12)
        addBotMessage("What time for the return pickup?", generateTimeOptions())
        break

      case 12: // Return Time (roundtrip only)
        setBookingData((prev) => ({ ...prev, returnTime: response }))
        setCurrentStep(13)
        addBotMessage("How many bags will you have?", ["0", "1", "2", "3", "4", "5+"])
        break

      case 13: // Baggage
        const baggage = response === "5+" ? 5 : Number.parseInt(response)
        setBookingData((prev) => ({ ...prev, baggage }))
        showBookingSummary()
        break

      case 15: // Booking Confirmation
        if (response === "Confirm Booking") {
          setCurrentStep(16)
          addBotMessage("Perfect! Processing your booking...")
 const bookingInfo = {
            pickup: currentPickup.name,
            dropoff: currentDropoff.name,
            ...bookingData,
          }
          console.log("[v0] Redirecting to payment page with booking data:", bookingInfo)

          // Add booking to cart
          useCartStore.getState().addItem({
            pickup: bookingInfo.pickup,
            dropoff: bookingInfo.dropoff,
            isRoundtrip: bookingInfo.isRoundtrip,
            vehicle: bookingInfo.vehicle,
            pickupDate: bookingInfo.pickupDate,
            pickupTime: bookingInfo.pickupTime,
            departureFlightNumber: bookingInfo.departureFlightNumber,
            returnDate: bookingInfo.returnDate,
            returnTime: bookingInfo.returnTime,
            returnFlightNumber: bookingInfo.returnFlightNumber,
            adults: bookingInfo.adults,
            children: bookingInfo.children,
            baggage: bookingInfo.baggage,
            passengerName: bookingInfo.passengerName,
            pricing: bookingInfo.vehicle?.price || 0,
            tourId: bookingInfo.vehicle?.product_id || 0,
          })

          addBotMessage("🔄 Redirecting to secure booking page...")
          sessionStorage.setItem("fromBooking", "true")
          setTimeout(() => {
            router.push("/checkout")
          }, 200)
          
          //  addBotMessage("Redirecting you to complete payment and provide contact details...", ["Continue to Payment"])
         
        } else if (response === "Cancel or Start Again") {
          setForceLocationEdit(true);
          handleLocationEdit();
        }
        break

      case 16:
        if (response === "Continue to Payment") {
          const bookingInfo = {
            pickup: currentPickup.name,
            dropoff: currentDropoff.name,
            ...bookingData,
          }
          console.log("[v0] Redirecting to payment page with booking data:", bookingInfo)

          // Add booking to cart
          useCartStore.getState().addItem({
            pickup: bookingInfo.pickup,
            dropoff: bookingInfo.dropoff,
            isRoundtrip: bookingInfo.isRoundtrip,
            vehicle: bookingInfo.vehicle,
            pickupDate: bookingInfo.pickupDate,
            pickupTime: bookingInfo.pickupTime,
            departureFlightNumber: bookingInfo.departureFlightNumber,
            returnDate: bookingInfo.returnDate,
            returnTime: bookingInfo.returnTime,
            returnFlightNumber: bookingInfo.returnFlightNumber,
            adults: bookingInfo.adults,
            children: bookingInfo.children,
            baggage: bookingInfo.baggage,
            passengerName: bookingInfo.passengerName,
            pricing: bookingInfo.vehicle?.price || 0,
            tourId: bookingInfo.vehicle?.product_id || 0,
          })

          addBotMessage("🔄 Redirecting to secure booking page...")
          sessionStorage.setItem("fromBooking", "true")
          setTimeout(() => {
            router.push("/checkout")
          }, 1000)
        }
        break
    }
  }

  const showBookingSummary = () => {
    setCurrentStep(15)

    const totalPrice = bookingData.vehicle?.price || 0
    const finalPrice = bookingData.isRoundtrip ? totalPrice * 2 : totalPrice

    const summaryMessage = `
📋 **Booking Summary**

🚗 Vehicle: ${bookingData.vehicle?.name}
👥 Passengers: ${bookingData.adults} adults, ${bookingData.children} children
📅 Pickup: ${bookingData.pickupDate} at ${bookingData.pickupTime}
${bookingData.departureFlightNumber ? `✈️ Departure Flight: ${bookingData.departureFlightNumber}` : ""}
${bookingData.isRoundtrip ? `🔄 Return: ${bookingData.returnDate} at ${bookingData.returnTime}` : ""}
${bookingData.returnFlightNumber ? `✈️ Arrival Flight: ${bookingData.returnFlightNumber}` : ""}
🎒 Baggage: ${bookingData.baggage} bags
💰 Total: $${finalPrice}

Ready to confirm your booking?`

    addBotMessage(summaryMessage, ["Confirm Booking", "Cancel or Start Again"])
  }

  const handleLocationEdit = () => {
    setShowLocationModal(true)
  }

  const handleLocationConfirm = (newPickup: any, newDropoff: any) => {
    if (!newPickup || !newDropoff) {
      alert("Please select both pickup and dropoff locations")
      return
    }

    setShowLocationModal(false)
    setForceLocationEdit(false)

    if (newPickup.id === currentPickup.id && newDropoff.id === currentDropoff.id) {
      setCurrentStep(2)
      addBotMessage(
        `Ok, we'll stick with the current route: ${currentPickup.name} to ${currentDropoff.name}. Do you need a return trip as well?`,
        ["Yes, roundtrip", "No, one-way only"],
      )
      return
    }

    setCurrentPickup(newPickup)
    setCurrentDropoff(newDropoff)

    setMessages([])
    setCurrentStep(1)
    setBookingData({
      isRoundtrip: null,
      vehicle: null,
      pickupDate: null,
      pickupTime: null,
      departureFlightNumber: null,
      returnDate: null,
      returnTime: null,
      returnFlightNumber: null,
      adults: null,
      children: null,
      baggage: null,
      passengerName: null,
      contactNumber: null,
      email: null,
    })
    setWaitingForInput(false)
  }

  const handleLocationModalClose = () => {
    setShowLocationModal(false)
    setCurrentStep(2)
    addBotMessage(
      `Ok, we'll stick with the current route: ${currentPickup.name} to ${currentDropoff.name}. Do you need a return trip as well?`,
      ["Yes, roundtrip", "No, one-way only"],
    )
  }

  const restartConversation = () => {
    setCurrentStep(1)
    setBookingData({
      isRoundtrip: null,
      vehicle: null,
      pickupDate: null,
      pickupTime: null,
      departureFlightNumber: null,
      returnDate: null,
      returnTime: null,
      returnFlightNumber: null,
      adults: null,
      children: null,
      baggage: null,
      passengerName: null,
      contactNumber: null,
      email: null,
    })
    setWaitingForInput(false)
    const initialMessage: Message = {
      id: Date.now().toString(),
      type: "bot",
      content: `Hi! 👋 I'll help you book your transfer from ${currentPickup.name} to ${currentDropoff.name}. Is this route correct?`,
      timestamp: new Date(),
      options: ["Yes, let's continue", "No, change locations"],
    };
    setMessages([initialMessage]);
  }

  const generateTimeOptions = () => {
    const times = []
    for (let hour = 0; hour < 24; hour++) {
      const timeString = `${hour.toString().padStart(2, "0")}:00`
      times.push(timeString)
    }
    return times
  }

  const handleVehicleDetails = (vehicle: Vehicle) => {
    setSelectedVehicleDetails(vehicle)
    setShowVehicleDetails(true)
  }

  return (
    <div className="h-screen pt-12 md:pt-20 bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 flex flex-col relative overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-orange-200/30 to-red-200/30 rounded-full blur-3xl animate-pulse"></div>
        <div
          className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-pink-200/30 to-orange-200/30 rounded-full blur-3xl animate-pulse"
          style={{ animationDelay: "2s" }}
        ></div>
      </div>

      <div className="flex-1 flex flex-col relative z-10 min-h-0">
        {/* Chat Bubble */}
        <div className="flex-1 bg-gradient-to-b from-white to-gray-50/80 backdrop-blur-sm shadow-2xl border border-white/20 flex flex-col transition-all duration-500 hover:shadow-3xl min-h-0 rounded-b-3xl">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-b from-gray-50/50 to-white/80 min-h-0 scroll-smooth">
            {messages.map((message) => (
              <div key={message.id}>
                {message.type === "component" && message.component === "vehicle-selection" ? (
                  <div className="w-full">
                    {currentPickup?.id && currentDropoff?.id && (
                      <VehicleSlider
                        pickupId={currentPickup.id}
                        dropoffId={currentDropoff.id}
                        transferType={transferType === "roundtrip"} // true for roundtrip, false for one-way
                        onVehicleSelect={handleVehicleSelect}
                        onVehicleDetails={handleVehicleDetails}
                      />
                    )}
                  </div>
                ) : (
                  <div className={`flex gap-2 ${message.type === "user" ? "justify-end" : "justify-start"}`}>
                    {message.type === "bot" && (
                      <Avatar className="h-8 w-8 bg-gradient-to-br from-[#ec5c0d] to-orange-600 flex-shrink-0 shadow-lg border-2 border-white/50 transition-transform duration-200 hover:scale-110">
                        <AvatarFallback>
                          <Bot className="h-4 w-4 text-white" />
                        </AvatarFallback>
                      </Avatar>
                    )}
                    <div className={`max-w-[85%] ${message.type === "user" ? "order-first" : ""}`}>
                      <div
                        className={`rounded-2xl px-4 py-2 text-sm transition-all duration-200 hover:scale-[1.02] ${
                          message.type === "bot"
                            ? "bg-gradient-to-br from-white to-gray-50 text-gray-800 shadow-md border border-gray-100/50 hover:shadow-lg"
                            : "bg-gradient-to-br from-orange-100 to-orange-50 text-black ml-auto shadow-sm border border-orange-200/50 hover:shadow-md"
                        }`}
                      >
                        {message.content}
                      </div>
                      {message.options && (
                        <div className="flex flex-wrap gap-2 mt-2">
                          {message.options.map((option, index) => {
                            const displayOption = option.includes("|") ? option.split("|")[0] : option
                            const isSelected = message.selectedOption === displayOption
                            const isDisabled = !!message.selectedOption

                            return (
                              <Button
                                key={index}
                                variant="outline"
                                size="sm"
                                onClick={() => handleOptionClick(displayOption, message.id)}
                                className={`text-xs rounded-full transition-all duration-200 hover:scale-105 hover:shadow-md ${
                                  isSelected
                                    ? "bg-gradient-to-r from-[#ec5c0d] to-orange-600 text-white border-[#ec5c0d] cursor-default"
                                    : "bg-gradient-to-r from-white to-gray-50 hover:from-[#ec5c0d] hover:to-orange-600 hover:text-white border-orange-200 text-gray-700 hover:border-[#ec5c0d]"
                                } ${isDisabled ? "opacity-70" : ""}`}
                                disabled={isDisabled || isProcessing}
                              >
                                {displayOption}
                              </Button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          {waitingForInput && (
            <div className="p-4 bg-gradient-to-r from-white to-gray-50/80 border-t border-gray-200/50 flex-shrink-0 backdrop-blur-sm">
              <form onSubmit={handleInputSubmit} className="flex gap-2">
                <Input
                  type={inputType}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder={
                    inputType === "date"
                      ? "YYYY-MM-DD (e.g., 2025-01-15)"
                      : inputType === "time"
                        ? "HH:MM (e.g., 14:30)"
                        : inputType === "number"
                          ? "Enter number of bags"
                          : "Enter flight number (optional)..."
                  }
                  className="flex-1 rounded-full border-gray-200 bg-white/80 backdrop-blur-sm transition-all duration-200 focus:bg-white focus:shadow-md"
                  disabled={isProcessing}
                  required={inputType !== "text"}
                />
                <Button
                  type="submit"
                  size="sm"
                  disabled={isProcessing || !inputValue.trim()}
                  className="rounded-full w-10 h-10 p-0 bg-gradient-to-r from-[#ec5c0d] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-200 hover:scale-110 shadow-lg hover:shadow-xl"
                >
                  {isProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                </Button>
              </form>
            </div>
          )}
        </div>

        {/* Route Info */}
        <div className="p-4 text-center flex-shrink-0 bg-white">
          <div className="inline-flex items-center gap-2 bg-gradient-to-r from-gray-50 to-white backdrop-blur-md rounded-full px-4 py-2 text-sm text-gray-600 shadow-lg border border-gray-200 transition-all duration-200 hover:shadow-xl hover:scale-105">
            <span className="font-medium">{currentPickup.name}</span>
            <span className="text-[#ec5c0d]">→</span>
            <span className="font-medium">{currentDropoff.name}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleLocationEdit}
              className="text-xs text-[#ec5c0d] hover:text-white hover:bg-[#ec5c0d] p-1 h-auto rounded-full transition-all duration-200"
            >
              Edit
            </Button>
          </div>
        </div>
      </div>

      {/* Location Selection Modal */}
      {showLocationModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-md p-6 space-y-4 shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-800">Edit Locations</h2>
              {!forceLocationEdit && (
              <Button variant="ghost" size="sm" onClick={handleLocationModalClose} className="p-1 h-auto">
                <X className="h-4 w-4" />
              </Button>
              )}
            </div>

            <div className="space-y-4">
              <div className="bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-3 text-sm text-orange-800 shadow-sm">
                ⚠️ Updating your route will restart the booking process from the beginning.
              </div>

              <LocationSearchForm
                onConfirm={handleLocationConfirm}
                initialPickup={currentPickup}
                initialDropoff={currentDropoff}
              />
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Details Modal */}
      {showVehicleDetails && selectedVehicleDetails && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
          <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl border border-white/20 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold text-gray-800">{selectedVehicleDetails.name}</h2>
              <Button variant="ghost" size="sm" onClick={() => setShowVehicleDetails(false)} className="p-1 h-auto">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <img
              src={selectedVehicleDetails.image || "/placeholder.svg"}
              alt={selectedVehicleDetails.name}
              className="w-full h-48 object-cover rounded-lg"
            />

            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-2xl font-bold text-[#ec5c0d]">SGD {selectedVehicleDetails.price}</span>
                <div className="flex items-center gap-1">
                  <span className="text-yellow-500">★</span>
                  <span className="text-sm font-medium">{selectedVehicleDetails.rating}</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <span className="font-medium">Passengers:</span>
                  <span>{selectedVehicleDetails.passengers}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Baggage:</span>
                  <span>{selectedVehicleDetails.baggage} bags</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Est. Time:</span>
                  <span>{selectedVehicleDetails.estimatedTime}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-medium">Type:</span>
                  <span>{selectedVehicleDetails.type}</span>
                </div>
              </div>

              {/* {selectedVehicleDetails.detailedFeatures && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Features & Services</h3>
                  <ul className="space-y-1 text-sm text-gray-600">
                    {selectedVehicleDetails.features.map((feature, index) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-[#ec5c0d] mt-1">•</span>
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )} */}

              {selectedVehicleDetails.driverInfo && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Driver Information</h3>
                  <p className="text-sm text-gray-600">{selectedVehicleDetails.driverInfo}</p>
                </div>
              )}

              {selectedVehicleDetails.cancellationPolicy && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-2">Cancellation Policy</h3>
                  <p className="text-sm text-gray-600">{selectedVehicleDetails.cancellationPolicy}</p>
                </div>
              )}
            </div>

            <div className="flex gap-3 pt-4">
              <Button
                variant="outline"
                onClick={() => setShowVehicleDetails(false)}
                className="flex-1 hover:bg-gray-50 transition-all duration-200"
              >
                Close
              </Button>
              <Button
                onClick={() => {
                  handleVehicleSelect(selectedVehicleDetails)
                  setShowVehicleDetails(false)
                }}
                className="flex-1 bg-gradient-to-r from-[#ec5c0d] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
              >
                Select Vehicle
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

interface VehicleSliderProps {
  pickupId: string;
  dropoffId: string;
  transferType: boolean;
  onVehicleSelect: (vehicle: Vehicle) => void;
  onVehicleDetails: (vehicle: Vehicle) => void;
}

function VehicleSlider({
  pickupId,
  dropoffId,
  transferType,
  onVehicleSelect,
  onVehicleDetails,
}: VehicleSliderProps) {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setLoading(true);
        console.log("VehicleSlider pickupId:", pickupId, "dropoffId:", dropoffId, "transferType:", transferType);
        if (!pickupId || !dropoffId) {
          setLoading(false);
          return;
        }

        const response = await fetch("https://app.exploresingapore.ai/api/transfer/search", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            pickup_point_id: pickupId,
            dropoff_point_id: dropoffId,
            is_two_way: transferType,
          }),
        });
        const data = await response.json();

        if (data.success && data.results) {
          const mappedVehicles = data.results.map((v: any) => ({
            id: v.id.toString(),
            name: v.vehicle_name,
            type: v.vehicle_type,
            passengers: v.max_capacity,
            baggage: v.capacity_with_luggage,
            features: [],
            price: Number(v.final_price),
            estimatedTime: "N/A",
            rating: 5.0,
            image: v.vehicle_image ? `https://app.exploresingapore.ai/vehicle_images//${v.vehicle_image}` : "/placeholder.svg",
            description: v.description,
            detailedFeatures: [],
            cancellationPolicy: "",
            driverInfo: "",
            // Additional fields from API
            api_id: v.id,
            pickup_point_id: v.pickup_point_id,
            dropoff_point_id: v.dropoff_point_id,
            pickup_point_group_id: v.pickup_point_group_id,
            dropoff_point_group_id: v.dropoff_point_group_id,
            final_price: v.final_price,
            final_promo_price: v.final_promo_price,
            is_two_way: v.is_two_way,
            pax_capacity: v.pax_capacity,
            product_id: v.product_id,
            promo_price: v.promo_price,
            requested_direction: v.requested_direction,
            transfer_cluster_id: v.transfer_cluster_id,
            two_way_price: v.two_way_price,
            two_way_promo_price: v.two_way_promo_price,
            vehicle_id: v.vehicle_id,
          }));
          setVehicles(mappedVehicles);
          setError(null);
        } else {
          setError("No vehicles available for this route");
          setVehicles([]);
        }
      } catch (err) {
        setError("Network error while loading vehicles");
        setVehicles([]);
      } finally {
        setLoading(false);
      }
    };

    fetchVehicles();
  }, [pickupId, dropoffId, transferType]);


  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin text-[#ec5c0d]" />
        <span className="ml-2 text-sm text-gray-600">Loading vehicles...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600 text-sm">{error}</p>
        <Button variant="outline" size="sm" onClick={() => window.location.reload()} className="mt-2">
          Retry
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600 text-center">Swipe to see all options</p>
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory">
        {vehicles.map((vehicle) => (
          <div
            key={vehicle.id}
            className="flex-shrink-0 w-48 bg-gradient-to-br from-white to-gray-50 rounded-xl border border-gray-200/50 p-3 snap-start shadow-md hover:shadow-lg transition-all duration-300 hover:scale-105"
          >
            <img
              src={vehicle.image || "/placeholder.svg"}
              alt={vehicle.name}
              className="w-full h-24 object-cover rounded-lg mb-2 transition-transform duration-200 hover:scale-105"
            />
            <h3 className="font-semibold text-sm line-clamp-1">{vehicle.name}</h3>
            <p className="text-xs text-gray-500 mb-2 line-clamp-2">{vehicle.description}</p>
            <div className="flex justify-between items-center text-xs mb-2">
              <span className="text-gray-600">{vehicle.passengers} seats</span>
              <span className="font-bold text-[#ec5c0d]">SGD {vehicle.price}</span>
            </div>
            <div className="flex gap-1">
              <Button
                size="sm"
                onClick={() => onVehicleDetails(vehicle)}
                variant="outline"
                className="flex-1 text-xs h-7 border-[#ec5c0d] text-[#ec5c0d] hover:bg-[#ec5c0d] hover:text-white transition-all duration-200 hover:scale-105"
              >
                Details
              </Button>
              <Button
                size="sm"
                onClick={() => onVehicleSelect(vehicle)}
                className="flex-1 text-xs h-7 bg-gradient-to-r from-[#ec5c0d] to-orange-600 hover:from-orange-600 hover:to-red-600 text-white transition-all duration-200 hover:scale-105 shadow-sm hover:shadow-md"
              >
                Select
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
