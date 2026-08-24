"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Users, Luggage, Star, Clock } from "lucide-react"

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

interface VehicleSelectionProps {
  onVehicleSelect: (vehicle: Vehicle) => void
  selectedVehicle?: string
}

const vehicles: Vehicle[] = [
  {
    id: "sedan",
    name: "Sedan",
    type: "Economy",
    passengers: 3,
    baggage: 3,
    features: ["Air Conditioning", "WiFi", "Phone Charger"],
    price: 45,
    estimatedTime: "45 mins",
    rating: 4.5,
    image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Screenshot_2025-09-02_173322.png`,
    description: "Comfortable and affordable option for small groups",
  },
  {
    id: "suv",
    name: "SUV",
    type: "Standard",
    passengers: 6,
    baggage: 6,
    features: ["Air Conditioning", "WiFi", "Phone Charger", "Extra Space"],
    price: 65,
    estimatedTime: "45 mins",
    rating: 4.7,
    image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Screenshot_2025-09-02_173305.png`,
    description: "Spacious and comfortable for medium groups",
  },
  {
    id: "minivan",
    name: "Minivan",
    type: "Premium",
    passengers: 8,
    baggage: 8,
    features: ["Air Conditioning", "WiFi", "Phone Charger", "Extra Space", "Premium Interior"],
    price: 85,
    estimatedTime: "50 mins",
    rating: 4.6,
    image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Screenshot_2025-09-02_173346.png`,
    description: "Perfect for large groups and families",
  },
  {
    id: "luxury",
    name: "Luxury Car",
    type: "Luxury",
    passengers: 3,
    baggage: 3,
    features: ["Premium Interior", "WiFi", "Phone Charger", "Complimentary Water", "Professional Driver"],
    price: 120,
    estimatedTime: "40 mins",
    rating: 4.9,
    image: `${process.env.NEXT_PUBLIC_IMAGE_BASE_URL}External+Links/Screenshot_2025-09-02_173332.png`,
    description: "Premium experience with luxury amenities",
  },
]

export function VehicleSelection({ onVehicleSelect, selectedVehicle }: VehicleSelectionProps) {
  return (
    <div className="space-y-4">
      <div className="text-center mb-6">
        <h3 className="text-lg font-semibold text-foreground mb-2">Choose Your Vehicle</h3>
        <p className="text-sm text-muted-foreground">Select the perfect vehicle for your transfer</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {vehicles.map((vehicle) => (
          <Card
            key={vehicle.id}
            className={`cursor-pointer transition-all hover:shadow-md ${selectedVehicle === vehicle.name ? "ring-2 ring-primary bg-accent/50" : ""
              }`}
            onClick={() => onVehicleSelect(vehicle)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-base font-semibold">{vehicle.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs mt-1">
                    {vehicle.type}
                  </Badge>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-primary">${vehicle.price}</div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                    {vehicle.rating}
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {/* Vehicle Image */}
              <div className="w-full h-24 bg-muted rounded-lg overflow-hidden">
                <img
                  src={vehicle.image || "/placeholder.svg"}
                  alt={vehicle.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {/* Vehicle Stats */}
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="flex flex-col items-center gap-1">
                  <Users className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{vehicle.passengers}</span>
                  <span className="text-xs text-muted-foreground">Passengers</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Luggage className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{vehicle.baggage}</span>
                  <span className="text-xs text-muted-foreground">Bags</span>
                </div>
                <div className="flex flex-col items-center gap-1">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-xs font-medium">{vehicle.estimatedTime}</span>
                  <span className="text-xs text-muted-foreground">Duration</span>
                </div>
              </div>

              {/* Description */}
              <p className="text-xs text-muted-foreground text-center">{vehicle.description}</p>

              {/* Features */}
              <div className="space-y-2">
                <div className="text-xs font-medium text-foreground">Included Features:</div>
                <div className="flex flex-wrap gap-1">
                  {vehicle.features.map((feature, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Select Button */}
              <Button className="w-full" variant={selectedVehicle === vehicle.name ? "default" : "outline"} size="sm">
                {selectedVehicle === vehicle.name ? "Selected" : "Select Vehicle"}
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
