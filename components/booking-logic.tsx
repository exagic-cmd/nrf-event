"use client"

interface BookingData {
  pickup: string
  dropoff: string
  isRoundtrip: boolean
  vehicle: {
    id: string
    name: string
    price: number
  }
  pickupDate: string
  pickupTime: string
  departureFlightNumber?: string
  returnDate?: string
  returnTime?: string
  returnFlightNumber?: string
  baggage: number
  passenger: {
    name: string
    phone: string
    email: string
  }
}

interface BookingResponse {
  success: boolean
  bookingReference?: string
  totalPrice?: number
  estimatedArrival?: string
  driverInfo?: {
    name: string
    phone: string
    vehicle: string
    plateNumber: string
  }
  error?: string
}

export class BookingLogic {
  static async checkAvailability(pickup: string, dropoff: string, date: string, time: string) {
    try {
      const response = await fetch("/api/availability", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ pickup, dropoff, date, time }),
      })

      return await response.json()
    } catch (error) {
      console.error("Availability check failed:", error)
      return {
        available: false,
        message: "Unable to check availability. Please try again.",
      }
    }
  }

  static async createBooking(bookingData: BookingData): Promise<BookingResponse> {
    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bookingData),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Booking failed")
      }

      return result
    } catch (error) {
      console.error("Booking creation failed:", error)
      return {
        success: false,
        error: error instanceof Error ? error.message : "Booking failed. Please try again.",
      }
    }
  }

  static validateBookingStep(step: string, value: any): { valid: boolean; message?: string } {
    switch (step) {
      case "date":
        const selectedDate = new Date(value)
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        if (selectedDate < today) {
          return { valid: false, message: "Please select a future date" }
        }

        // Don't allow bookings more than 6 months in advance
        const maxDate = new Date()
        maxDate.setMonth(maxDate.getMonth() + 6)

        if (selectedDate > maxDate) {
          return { valid: false, message: "Bookings can only be made up to 6 months in advance" }
        }

        return { valid: true }

      case "time":
        const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
        if (!timeRegex.test(value)) {
          return { valid: false, message: "Please enter time in HH:MM format" }
        }

        const [hours, minutes] = value.split(":").map(Number)
        if (hours < 5 || hours > 23) {
          return { valid: false, message: "Service is available from 05:00 to 23:00" }
        }

        return { valid: true }

      case "baggage":
        const bagCount = Number.parseInt(value)
        if (isNaN(bagCount) || bagCount < 0 || bagCount > 10) {
          return { valid: false, message: "Please enter a valid number of bags (0-10)" }
        }

        return { valid: true }

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(value)) {
          return { valid: false, message: "Please enter a valid email address" }
        }

        return { valid: true }

      case "phone":
        const phoneRegex = /^[+]?[0-9\s\-$$$$]{8,15}$/
        if (!phoneRegex.test(value)) {
          return { valid: false, message: "Please enter a valid phone number" }
        }

        return { valid: true }

      default:
        return { valid: true }
    }
  }

  static formatBookingConfirmation(booking: BookingResponse): string {
    if (!booking.success || !booking.bookingReference) {
      return "Booking confirmation unavailable"
    }

    return `✅ Booking Confirmed!

Reference: ${booking.bookingReference}
Total: $${booking.totalPrice}
Estimated Arrival: ${booking.estimatedArrival}

Driver Details:
${booking.driverInfo?.name}
${booking.driverInfo?.phone}
Vehicle: ${booking.driverInfo?.vehicle} (${booking.driverInfo?.plateNumber})

Safe travels! You'll receive SMS updates about your driver's location.`
  }
}
