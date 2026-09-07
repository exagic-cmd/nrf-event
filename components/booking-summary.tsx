"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import {
  MapPin,
  Calendar,
  Clock,
  Car,
  Users,
  Luggage,
  User,
  Phone,
  Mail,
  Plane,
  CheckCircle,
  Edit3,
} from "lucide-react"

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
}

interface BookingData {
  pickup: string
  dropoff: string
  isRoundtrip: boolean | null
  vehicle: string | null
  vehicleDetails: Vehicle | null
  pickupDate: string | null
  pickupTime: string | null
  departureFlightNumber: string | null
  returnDate: string | null
  returnTime: string | null
  returnFlightNumber: string | null
  baggage: number | null
  passengerName: string | null
  contactNumber: string | null
  email: string | null
}

interface BookingSummaryProps {
  bookingData: BookingData
  onConfirm: () => void
  onEdit: (section: string) => void
  isProcessing?: boolean
}

export function BookingSummary({ bookingData, onConfirm, onEdit, isProcessing = false }: BookingSummaryProps) {
  const totalPrice = bookingData.vehicleDetails?.price
    ? bookingData.isRoundtrip
      ? bookingData.vehicleDetails.price * 2
      : bookingData.vehicleDetails.price
    : 0

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "Not set"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "short",
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  const formatTime = (timeString: string | null) => {
    if (!timeString) return "Not set"
    return timeString
  }

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-foreground mb-2">Booooking Summary</h2>
        <p className="text-muted-foreground">Please review your transfer details before confirming</p>
      </div>

      {/* Route Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <MapPin className="h-5 w-5 text-primary" />
              Route Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit("route")}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-primary rounded-full"></div>
              <div>
                <div className="font-medium text-sm">{bookingData.pickup}</div>
                <div className="text-xs text-muted-foreground">Pickup Location</div>
              </div>
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-px h-8 bg-border"></div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 bg-secondary rounded-full"></div>
              <div>
                <div className="font-medium text-sm">{bookingData.dropoff}</div>
                <div className="text-xs text-muted-foreground">Dropoff Location</div>
              </div>
            </div>
          </div>

          {bookingData.isRoundtrip && (
            <Badge variant="secondary" className="w-fit">
              Roundtrip Transfer
            </Badge>
          )}
        </CardContent>
      </Card>

      {/* Vehicle Information */}
      {bookingData.vehicleDetails && (
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <Car className="h-5 w-5 text-primary" />
                Vehicle Details
              </CardTitle>
              <Button variant="ghost" size="sm" onClick={() => onEdit("vehicle")}>
                <Edit3 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
              <div className="w-16 h-12 bg-background rounded overflow-hidden">
                <img
                  src={bookingData.vehicleDetails.image || "/placeholder.svg"}
                  alt={bookingData.vehicleDetails.name}
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1">
                <div className="font-semibold">{bookingData.vehicleDetails.name}</div>
                <div className="text-sm text-muted-foreground">{bookingData.vehicleDetails.type}</div>
                <div className="flex items-center gap-4 mt-2 text-xs">
                  <div className="flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {bookingData.vehicleDetails.passengers}
                  </div>
                  <div className="flex items-center gap-1">
                    <Luggage className="h-3 w-3" />
                    {bookingData.vehicleDetails.baggage}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-lg">${bookingData.vehicleDetails.price}</div>
                <div className="text-xs text-muted-foreground">per trip</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Schedule Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <Calendar className="h-5 w-5 text-primary" />
              Schedule
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit("schedule")}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Outbound Trip */}
          <div className="p-3 bg-muted rounded-lg">
            <div className="font-medium text-sm mb-2">Outbound Trip</div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(bookingData.pickupDate)}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-muted-foreground" />
                <span>{formatTime(bookingData.pickupTime)}</span>
              </div>
            </div>
            {bookingData.departureFlightNumber && (
              <div className="flex items-center gap-2 mt-2 text-sm">
                <Plane className="h-4 w-4 text-muted-foreground" />
                <span>Flight: {bookingData.departureFlightNumber}</span>
              </div>
            )}
          </div>

          {/* Return Trip */}
          {bookingData.isRoundtrip && (
            <div className="p-3 bg-muted rounded-lg">
              <div className="font-medium text-sm mb-2">Return Trip</div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>{formatDate(bookingData.returnDate)}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span>{formatTime(bookingData.returnTime)}</span>
                </div>
              </div>
              {bookingData.returnFlightNumber && (
                <div className="flex items-center gap-2 mt-2 text-sm">
                  <Plane className="h-4 w-4 text-muted-foreground" />
                  <span>Flight: {bookingData.returnFlightNumber}</span>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Passenger Information */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              Passenger Details
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={() => onEdit("passenger")}>
              <Edit3 className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-3">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{bookingData.passengerName || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{bookingData.contactNumber || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{bookingData.email || "Not provided"}</span>
          </div>
          <div className="flex items-center gap-3">
            <Luggage className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">{bookingData.baggage || 0} bags</span>
          </div>
        </CardContent>
      </Card>

      {/* Price Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Price Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex justify-between text-sm">
            <span>Base fare ({bookingData.vehicle})</span>
            <span>${bookingData.vehicleDetails?.price || 0}</span>
          </div>

          {bookingData.isRoundtrip && (
            <div className="flex justify-between text-sm">
              <span>Return trip</span>
              <span>${bookingData.vehicleDetails?.price || 0}</span>
            </div>
          )}

          <Separator />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span>${totalPrice}</span>
          </div>

          <div className="text-xs text-muted-foreground">* Includes all taxes and fees</div>
        </CardContent>
      </Card>

      {/* Confirmation Button */}
      <div className="space-y-4">
        <Button onClick={onConfirm} className="w-full h-12 text-base font-semibold" disabled={isProcessing}>
          {isProcessing ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Processing Booking...
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              Confirm Booking
            </div>
          )}
        </Button>

        <div className="text-center text-xs text-muted-foreground">
          By confirming, you agree to our terms of service and cancellation policy
        </div>
      </div>
    </div>
  )
}
