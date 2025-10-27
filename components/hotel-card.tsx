"use client"

import { Card } from "@/components/ui/card"
import { Star, DollarSign, Building, Bed, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

interface HotelCardProps {
  hotel: {
    id: string
    name: string
    image: string
    starRating: number
    price: number
    description: string
    brand: string
    bedType: string
    location: string
    amenities: string[]
  }
  onSelect: () => void
}

export default function HotelCard({ hotel, onSelect }: HotelCardProps) {
  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 h-full border-0 shadow-md group bg-white dark:bg-slate-800">
      <div className="flex flex-col h-full">
        {/* Hotel Image */}
        <div className="h-40 w-full relative overflow-hidden">
          <img
            src={hotel.image || "/placeholder.svg"}
            alt={hotel.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          />
          <div className="absolute top-2 right-2">
            <Badge className="bg-white/90 dark:bg-slate-900/90 text-slate-900 dark:text-white border-0 shadow-md backdrop-blur-sm">
              <DollarSign className="h-3.5 w-3.5 mr-0.5 text-emerald-600 dark:text-emerald-400" />
              {hotel.price}
            </Badge>
          </div>
        </div>

        {/* Hotel Details */}
        <div className="flex flex-col flex-1 p-4">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-base font-semibold line-clamp-1">{hotel.name}</h3>
              <div className="flex items-center gap-0.5 mt-1">
                {Array.from({ length: hotel.starRating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-amber-400 text-amber-400" />
                ))}
              </div>
            </div>
          </div>

          <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 line-clamp-2">{hotel.description}</p>

          <div className="flex flex-wrap gap-x-3 gap-y-1 mt-3 text-xs">
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Building className="h-3 w-3 mr-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>{hotel.brand}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <Bed className="h-3 w-3 mr-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>{hotel.bedType}</span>
            </div>
            <div className="flex items-center text-slate-600 dark:text-slate-300">
              <MapPin className="h-3 w-3 mr-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400" />
              <span>{hotel.location}</span>
            </div>
          </div>

          <div className="flex flex-wrap gap-1 mt-3">
          {(hotel?.amenities ?? []).slice(0, 1).map((amenity, index) => (
            <Badge
              key={index}
              variant="outline"
              className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            >
              {amenity}
            </Badge>
          ))}
          {hotel?.amenities?.length > 3 && (
            <Badge
              variant="outline"
              className="text-xs px-1.5 py-0 bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700"
            >
              +{hotel.amenities.length - 3} more
            </Badge>
          )}
        </div>


          {/* <div className="mt-auto pt-3">
            <Button
              onClick={onSelect}
              size="sm"
              className="w-full bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white shadow-md transition-all"
            >
              Select
            </Button>
          </div> */}
        </div>
      </div>
    </Card>
  )
}

