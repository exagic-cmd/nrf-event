"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, ArrowRight } from "lucide-react"

// Mock location data - in real app this would come from your 10k location database
const mockLocations = [
  "Hilton Singapore Orchard",
  "Changi Airport Terminal 1",
  "Changi Airport Terminal 2",
  "Changi Airport Terminal 3",
  "Marina Bay Sands",
  "Raffles Hotel Singapore",
  "Sentosa Island",
  "Clarke Quay",
  "Orchard Road",
  "Singapore Flyer",
]

interface LocationSelectionFormProps {
  onSubmit: (pickup: string, dropoff: string) => void
}

export function LocationSelectionForm({ onSubmit }: LocationSelectionFormProps) {
  const [pickup, setPickup] = useState("")
  const [dropoff, setDropoff] = useState("")
  const [pickupSuggestions, setPickupSuggestions] = useState<string[]>([])
  const [dropoffSuggestions, setDropoffSuggestions] = useState<string[]>([])
  const [showPickupSuggestions, setShowPickupSuggestions] = useState(false)
  const [showDropoffSuggestions, setShowDropoffSuggestions] = useState(false)

  const handlePickupChange = (value: string) => {
    setPickup(value)
    if (value.length > 0) {
      const filtered = mockLocations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
      setPickupSuggestions(filtered)
      setShowPickupSuggestions(true)
    } else {
      setShowPickupSuggestions(false)
    }
  }

  const handleDropoffChange = (value: string) => {
    setDropoff(value)
    if (value.length > 0) {
      const filtered = mockLocations.filter((location) => location.toLowerCase().includes(value.toLowerCase()))
      setDropoffSuggestions(filtered)
      setShowDropoffSuggestions(true)
    } else {
      setShowDropoffSuggestions(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (pickup && dropoff) {
      onSubmit(pickup, dropoff)
    }
  }

  const selectPickupLocation = (location: string) => {
    setPickup(location)
    setShowPickupSuggestions(false)
  }

  const selectDropoffLocation = (location: string) => {
    setDropoff(location)
    setShowDropoffSuggestions(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-background to-muted">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold text-foreground">Book Your Transfer</CardTitle>
          <CardDescription className="text-muted-foreground">
            Enter your pickup and dropoff locations to get started
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2 relative">
              <Label htmlFor="pickup" className="text-sm font-medium text-foreground">
                Pickup Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="pickup"
                  type="text"
                  placeholder="Enter pickup location"
                  value={pickup}
                  onChange={(e) => handlePickupChange(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {showPickupSuggestions && pickupSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {pickupSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                      onClick={() => selectPickupLocation(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="space-y-2 relative">
              <Label htmlFor="dropoff" className="text-sm font-medium text-foreground">
                Dropoff Location
              </Label>
              <div className="relative">
                <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="dropoff"
                  type="text"
                  placeholder="Enter dropoff location"
                  value={dropoff}
                  onChange={(e) => handleDropoffChange(e.target.value)}
                  className="pl-10"
                  required
                />
              </div>
              {showDropoffSuggestions && dropoffSuggestions.length > 0 && (
                <div className="absolute z-10 w-full bg-popover border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                  {dropoffSuggestions.map((location, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full text-left px-3 py-2 hover:bg-accent hover:text-accent-foreground text-sm"
                      onClick={() => selectDropoffLocation(location)}
                    >
                      {location}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground"
              disabled={!pickup || !dropoff}
            >
              Continue to Booking
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
