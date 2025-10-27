import { type NextRequest, NextResponse } from "next/server"

interface AvailabilityRequest {
  pickup: string
  dropoff: string
  date: string
  time: string
}

interface AvailabilityResponse {
  available: boolean
  alternativeTimes?: string[]
  message?: string
}

export async function POST(request: NextRequest) {
  try {
    const { pickup, dropoff, date, time }: AvailabilityRequest = await request.json()

    // Simulate processing delay
    await new Promise((resolve) => setTimeout(resolve, 800))

    // Mock availability logic - simulate 90% availability
    const isAvailable = Math.random() < 0.9

    if (isAvailable) {
      return NextResponse.json({
        available: true,
        message: "Your requested time slot is available!",
      })
    } else {
      // Generate alternative times
      const [hours, minutes] = time.split(":").map(Number)
      const alternatives = []

      // Suggest times 30 minutes before and after
      const earlierTime = new Date()
      earlierTime.setHours(hours, minutes - 30, 0, 0)

      const laterTime = new Date()
      laterTime.setHours(hours, minutes + 30, 0, 0)

      alternatives.push(
        earlierTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
        laterTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false }),
      )

      return NextResponse.json({
        available: false,
        alternativeTimes: alternatives,
        message: "Your requested time is not available. Here are some alternatives:",
      })
    }
  } catch (error) {
    console.error("Availability API error:", error)
    return NextResponse.json(
      {
        available: false,
        message: "Unable to check availability. Please try again.",
      },
      { status: 500 },
    )
  }
}
