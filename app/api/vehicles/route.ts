import { NextResponse } from "next/server"

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
  detailedFeatures: string[]
  cancellationPolicy: string
  driverInfo: string
}

const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Economy Sedan",
    type: "Sedan",
    passengers: 4,
    baggage: 2,
    features: ["Air Conditioning", "GPS Navigation"],
    price: 45,
    estimatedTime: "25 mins",
    rating: 4.5,
    image: "/modern-sedan.png",
    description: "Comfortable and affordable",
    detailedFeatures: [
      "Professional driver with 5+ years experience",
      "Real-time GPS tracking",
      "Complimentary bottled water",
      "Phone charging cable available",
      "Meet & greet service at pickup",
    ],
    cancellationPolicy: "Free cancellation up to 2 hours before pickup",
    driverInfo: "Licensed professional drivers with excellent ratings",
  },
  {
    id: "suv",
    name: "Premium SUV",
    type: "SUV",
    passengers: 6,
    baggage: 4,
    features: ["Leather Seats", "WiFi", "Phone Charger"],
    price: 65,
    estimatedTime: "25 mins",
    rating: 4.8,
    image: "/luxury-suv-vehicle.jpg",
    description: "Spacious and luxurious",
    detailedFeatures: [
      "Premium leather interior",
      "Complimentary WiFi throughout journey",
      "Climate control with individual zones",
      "Refreshment package included",
      "Extra luggage space",
      "Child seat available upon request",
    ],
    cancellationPolicy: "Free cancellation up to 4 hours before pickup",
    driverInfo: "Premium service drivers with luxury vehicle training",
  },
  {
    id: "minivan",
    name: "Family Minivan",
    type: "Minivan",
    passengers: 8,
    baggage: 6,
    features: ["Extra Space", "Child Seats Available"],
    price: 85,
    estimatedTime: "30 mins",
    rating: 4.6,
    image: "/premium-minivan-transport.jpg",
    description: "Perfect for large groups",
    detailedFeatures: [
      "Spacious interior for up to 8 passengers",
      "Multiple child seats available",
      "Extra-large luggage compartment",
      "Individual air conditioning vents",
      "Entertainment system with screens",
      "Group travel coordination service",
    ],
    cancellationPolicy: "Free cancellation up to 6 hours before pickup",
    driverInfo: "Family-friendly drivers experienced with group travel",
  },
  {
    id: "luxury",
    name: "Executive Luxury",
    type: "Luxury",
    passengers: 4,
    baggage: 3,
    features: ["Premium Service", "Champagne", "Concierge"],
    price: 120,
    estimatedTime: "20 mins",
    rating: 4.9,
    image: "/luxury-executive-car.jpg",
    description: "Ultimate luxury experience",
    detailedFeatures: [
      "Chauffeur service with white glove treatment",
      "Complimentary champagne or premium beverages",
      "Personal concierge assistance",
      "Premium sound system",
      "Tinted windows for privacy",
      "Red carpet service available",
      "Business amenities (WiFi, charging stations)",
    ],
    cancellationPolicy: "Free cancellation up to 24 hours before pickup",
    driverInfo: "Executive chauffeurs with VIP service training",
  },
]

export async function GET() {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  return NextResponse.json({
    success: true,
    vehicles: vehicles,
    message: "Vehicles loaded successfully",
  })
}
