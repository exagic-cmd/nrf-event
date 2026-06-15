'use client'

import { useState } from "react"
import { MapPin, Calendar, Clock } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

import GooglePlacesInput from "@/components/custom/GooglePlacesInput"
import { useTransferStore } from "@/store/useTransferStore"
export default function BookingForm({ onSearchVehicles }) {
  const [pickup, setPickup] = useState(null)
  const [dropoff, setDropoff] = useState(null)
  const [pickupTime, setPickupTime] = useState("")
  const [pickupDate, setPickupDate] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showCustomTime, setShowCustomTime] = useState(false)
  const [showCustomDate, setShowCustomDate] = useState(false)
  const fetchTravelInfo = useTransferStore((state) => state.fetchTravelInfo)
  const vehicles = useTransferStore((state) => state.vehicles)

  const formatTime = (time) => {
    if (!time) return ""
    const [h, m] = time.split(":")
    const hour = Number.parseInt(h, 10)
    const ampm = hour >= 12 ? "PM" : "AM"
    const hour12 = hour % 12 || 12
    return `${hour12}:${m} ${ampm}`
  }

  const formatDate = (date) => {
    if (!date) return ""
    return new Date(date).toLocaleDateString("en-US", {
      day: "numeric",
      month: "short",
      year: "numeric",
    })
  }

  const handleTimeChange = (value) => {
    if (value === "custom") {
      setShowCustomTime(true)
      setPickupTime("")
    } else {
      setShowCustomTime(false)
      setPickupTime(value)
    }
  }

  const handleDateChange = (value) => {
    if (value === "today") {
      const today = new Date()
      setPickupDate(today.toISOString().split("T")[0]) // YYYY-MM-DD
      setShowCustomDate(false)
    } else if (value === "tomorrow") {
      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      setPickupDate(tomorrow.toISOString().split("T")[0])
      setShowCustomDate(false)
    } else if (value === "custom") {
      setShowCustomDate(true)
      setPickupDate("")
    }
  }

  const handleCustomTime = (e) => {
    setPickupTime(e.target.value)
    setShowCustomTime(false)
  }

  const handleCustomDate = (e) => {
    setPickupDate(e.target.value)
    setShowCustomDate(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!pickup || !dropoff || !pickupDate || !pickupTime) {
      alert("Please fill all fields")
      return
    }

    setIsLoading(true)
    const payload = {
      origin_lat: pickup.lat,
      origin_lng: pickup.lng,
      dest_lat: dropoff.lat,
      dest_lng: dropoff.lng,
      date: pickupDate,
      start_time: `${pickupTime}:00`,
    }
    const response = await fetchTravelInfo(payload)

    if (response?.success) {
      onSearchVehicles({
        pickupLocation: pickup?.description || pickup?.name,
        dropoffLocation: dropoff?.description || dropoff?.name,
        date: pickupDate,
        time: formatTime(pickupTime),
        fares: response,
      })
    }
    setIsLoading(false)
  }

  return (
    <div className="min-h-screen flex md:mt-2 -mt-24 items-center justify-center">
      <div className="w-full md:mx-8 mx-2 lg:mx-12 grid lg:grid-cols-2 gap-12 items-center">
        {/* Left side - Booking Form */}
        <Card className="w-full max-w-xl mx-auto border-0 shadow-lg rounded-2xl">
          <CardContent className="p-8">
            <div className="space-y-4">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
                Go Anywhere With <span className="text-[#FE6F4F]">Us</span>
              </h1>
            </div>
            <hr className="mb-8" />
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Pickup Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-[#FE6F4F]" /> Pickup Location
                </Label>
                <GooglePlacesInput
                  placeholder="Enter pickup location"
                  onSelect={setPickup}
                  value={pickup?.description || ""}
                  onChange={(value) => setPickup({ description: value })}
                  onClear={() => setPickup(null)}
                />
              </div>

              {/* Dropoff Location */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-500">
                  <MapPin className="w-4 h-4 text-[#FE6F4F]" /> Dropoff Location
                </Label>
                <GooglePlacesInput
                  placeholder="Enter dropoff location"
                  onSelect={setDropoff}
                  value={dropoff?.description || ""}
                  onChange={(value) => setDropoff({ description: value })}
                  onClear={() => setDropoff(null)}
                />
              </div>

              {/* Pickup Time */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-500">
                  <Clock className="w-4 h-4 text-[#FE6F4F]" /> Pickup Time
                </Label>
                {!showCustomTime ? (
                  <Select onValueChange={handleTimeChange} value={pickupTime}>
                    <SelectTrigger className="h-12 rounded-md">
                      <SelectValue placeholder="Select pickup time">
                        {pickupTime && pickupTime.includes(":")
                          ? formatTime(pickupTime)
                          : pickupTime}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-md shadow-md">
                      <SelectItem value="08:00">08:00</SelectItem>
                      <SelectItem value="12:00">12:00</SelectItem>
                      <SelectItem value="14:00">14:00</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="time"
                    className="h-12 rounded-md focus:ring-2 focus:ring-orange-200"
                    onChange={handleCustomTime}
                    autoFocus
                  />
                )}
              </div>

              {/* Pickup Date */}
              <div className="space-y-2">
                <Label className="flex items-center gap-2 text-gray-500">
                  <Calendar className="w-4 h-4 text-[#FE6F4F]" /> Pickup Date
                </Label>
                {!showCustomDate ? (
                  <Select onValueChange={handleDateChange} value={pickupDate}>
                    <SelectTrigger className="h-12 rounded-md">
                      <SelectValue placeholder="Select pickup date">
                        {pickupDate && pickupDate.includes("-")
                          ? formatDate(pickupDate)
                          : pickupDate}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent className="rounded-md shadow-md">
                      <SelectItem value="today">Today</SelectItem>
                      <SelectItem value="tomorrow">Tomorrow</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                ) : (
                  <Input
                    type="date"
                    className="h-12 rounded-md focus:ring-2 focus:ring-orange-200"
                    onChange={handleCustomDate}
                    autoFocus
                  />
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 rounded-md text-lg bg-[#FE6F4F] hover:bg-orange-600"
              >
                Search Transfer
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Right side - Urban Illustration */}
        <div className="hidden lg:block">
          <div className="relative">
            <img
              src= {`${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}v1757328212/External%20Links/modern-urban-cityscape-with-person-getting-into-bl_2.jpg`}
              alt="Airport transfer illustration showing a person getting into a modern car in an urban setting"
              className="w-full h-full rounded-2xl shadow-2xl"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl"></div>
          </div>
        </div>
      </div>
    </div>
  )
}