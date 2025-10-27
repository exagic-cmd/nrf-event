"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { CheckCircle, MapPin, Calendar, Clock, Car, User, Phone, Download, Share, MessageSquare } from "lucide-react"

interface BookingConfirmationProps {
  bookingReference: string
  totalPrice: number
  estimatedArrival: string
  driverInfo: {
    name: string
    phone: string
    vehicle: string
    plateNumber: string
  }
  pickup: string
  dropoff: string
  pickupDate: string
  pickupTime: string
  passengerName: string
  onNewBooking: () => void
}

export function BookingConfirmation({
  bookingReference,
  totalPrice,
  estimatedArrival,
  driverInfo,
  pickup,
  dropoff,
  pickupDate,
  pickupTime,
  passengerName,
  onNewBooking,
}: BookingConfirmationProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Success Header */}
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">Booking Confirmed!</h1>
          <p className="text-muted-foreground">Your transfer has been successfully booked</p>
        </div>
      </div>

      {/* Booking Reference */}
      <Card className="border-green-200 bg-green-50">
        <CardContent className="p-6 text-center">
          <div className="text-sm text-muted-foreground mb-1">Booking Reference</div>
          <div className="text-2xl font-bold text-foreground tracking-wider">{bookingReference}</div>
          <div className="text-sm text-muted-foreground mt-2">Save this reference number for your records</div>
        </CardContent>
      </Card>

      {/* Trip Details */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-primary" />
            Trip Details
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">From</div>
              <div className="text-sm">{pickup}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground">To</div>
              <div className="text-sm">{dropoff}</div>
            </div>
          </div>

          <Separator />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Calendar className="h-4 w-4" />
                Date
              </div>
              <div className="text-sm">{formatDate(pickupDate)}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Pickup Time
              </div>
              <div className="text-sm">{pickupTime}</div>
            </div>
            <div className="space-y-2">
              <div className="text-sm font-medium text-muted-foreground flex items-center gap-1">
                <Clock className="h-4 w-4" />
                Est. Arrival
              </div>
              <div className="text-sm">{estimatedArrival}</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Driver Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Car className="h-5 w-5 text-primary" />
            Your Driver
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4 p-4 bg-muted rounded-lg">
            <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
              <User className="h-6 w-6 text-primary-foreground" />
            </div>
            <div className="flex-1">
              <div className="font-semibold">{driverInfo.name}</div>
              <div className="text-sm text-muted-foreground">{driverInfo.vehicle}</div>
              <div className="text-sm text-muted-foreground">Plate: {driverInfo.plateNumber}</div>
            </div>
            <div className="text-right">
              <Button variant="outline" size="sm" className="flex items-center gap-1 bg-transparent">
                <Phone className="h-4 w-4" />
                {driverInfo.phone}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-between items-center">
            <span className="text-lg">Total Paid</span>
            <span className="text-2xl font-bold text-primary">${totalPrice}</span>
          </div>
          <div className="text-sm text-muted-foreground mt-1">Payment processed successfully</div>
        </CardContent>
      </Card>

      {/* Important Information */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="p-4">
          <div className="text-sm space-y-2">
            <div className="font-medium text-blue-900">Important Information:</div>
            <ul className="space-y-1 text-blue-800 text-xs">
              <li>• Your driver will arrive 5 minutes before the scheduled time</li>
              <li>• You'll receive SMS updates about your driver's location</li>
              <li>• Free cancellation up to 2 hours before pickup</li>
              <li>• Contact support if you need to make changes</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Download className="h-4 w-4" />
          Download Receipt
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <Share className="h-4 w-4" />
          Share Details
        </Button>
        <Button variant="outline" className="flex items-center gap-2 bg-transparent">
          <MessageSquare className="h-4 w-4" />
          Contact Support
        </Button>
      </div>

      {/* New Booking Button */}
      <div className="text-center pt-4">
        <Button onClick={onNewBooking} size="lg" className="w-full md:w-auto">
          Book Another Transfer
        </Button>
      </div>
    </div>
  )
}
