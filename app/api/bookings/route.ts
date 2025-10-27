import { type NextRequest, NextResponse } from "next/server"

interface BookingRequest {
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

// Mock driver data
const mockDrivers = [
  {
    name: "John Smith",
    phone: "+65 9123 4567",
    vehicle: "Toyota Camry",
    plateNumber: "SBA 1234A",
  },
  {
    name: "Sarah Lee",
    phone: "+65 9876 5432",
    vehicle: "Honda Odyssey",
    plateNumber: "SBB 5678B",
  },
  {
    name: "Michael Chen",
    phone: "+65 9555 1234",
    vehicle: "Mercedes E-Class",
    plateNumber: "SBC 9012C",
  },
]

function generateBookingReference(): string {
  const prefix = "TRF"
  const number = Math.floor(Math.random() * 90000) + 10000
  return `${prefix}-${number}`
}

function calculateEstimatedArrival(pickupTime: string): string {
  const [hours, minutes] = pickupTime.split(":").map(Number)
  const pickupDate = new Date()
  pickupDate.setHours(hours, minutes, 0, 0)

  // Add 45 minutes for estimated travel time
  const arrivalDate = new Date(pickupDate.getTime() + 45 * 60000)

  return arrivalDate.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  })
}

function validateBookingData(data: BookingRequest): string | null {
  if (!data.pickup || !data.dropoff) {
    return "Pickup and dropoff locations are required"
  }

  if (!data.pickupDate || !data.pickupTime) {
    return "Pickup date and time are required"
  }

  if (data.isRoundtrip && (!data.returnDate || !data.returnTime)) {
    return "Return date and time are required for roundtrip bookings"
  }

  if (!data.passenger.name || !data.passenger.phone || !data.passenger.email) {
    return "Complete passenger information is required"
  }

  if (data.baggage < 0 || data.baggage > 10) {
    return "Invalid baggage count"
  }

  // Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(data.passenger.email)) {
    return "Invalid email format"
  }

  return null
}

export async function POST(request: NextRequest) {
  try {
    const bookingData: BookingRequest = await request.json()

    // Validate booking data
    const validationError = validateBookingData(bookingData)
    if (validationError) {
      return NextResponse.json(
        {
          success: false,
          error: validationError,
        },
        { status: 400 },
      )
    }

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Calculate total price
    const basePrice = bookingData.vehicle.price
    const totalPrice = bookingData.isRoundtrip ? basePrice * 2 : basePrice

    // Generate booking reference
    const bookingReference = generateBookingReference()

    // Calculate estimated arrival
    const estimatedArrival = calculateEstimatedArrival(bookingData.pickupTime)

    // Assign random driver
    const driverInfo = mockDrivers[Math.floor(Math.random() * mockDrivers.length)]

    // Simulate 95% success rate
    if (Math.random() < 0.95) {
      const response: BookingResponse = {
        success: true,
        bookingReference,
        totalPrice,
        estimatedArrival,
        driverInfo,
      }

      return NextResponse.json(response)
    } else {
      return NextResponse.json(
        {
          success: false,
          error: "Booking failed due to high demand. Please try again.",
        },
        { status: 503 },
      )
    }
  } catch (error) {
    console.error("Booking API error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error. Please try again.",
      },
      { status: 500 },
    )
  }
}
