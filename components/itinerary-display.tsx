import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, MapPin, Utensils, Plane, Car, Building, Camera, Waves, Dumbbell } from "lucide-react"
import { cn } from "@/lib/utils"
import { useLocalizedRouter } from "./localizedRouter";

type ItineraryType = {
  id: number;
  category_id: number;
  destination: string
  duration: string
  days: ItineraryDayType[]
}

type ItineraryDayType = {
  day: number
  date: string
  activities: ItineraryActivityType[]
  meals: ItineraryMealType[]
  accommodation: string
}

type ItineraryActivityType = {
  time: string
  description: string
  location: string
  type: "sightseeing" | "adventure" | "cultural" | "relaxation" | "transfer"
}

type ItineraryMealType = {
  time: string
  type: "breakfast" | "lunch" | "dinner"
  location: string
  description: string
}

interface ItineraryDisplayProps {
  itinerary: ItineraryType
}

export default function ItineraryDisplay({ itinerary }: ItineraryDisplayProps) {
  const { localizedReplace } = useLocalizedRouter();

  const handleVirtualTourClick = () => {
    if (itinerary.id) {
      localizedReplace(`/day-tours/detail/${itinerary.id}`);
    }
  };

  return (
    <>
      {itinerary.category_id === 3 && (
        <button
          onClick={handleVirtualTourClick}
          className="fixed bottom-5 right-5 bg-[#CC9A55] text-black font-semibold px-5 py-3 rounded-full shadow-lg z-50 flex items-center gap-2 hover:bg-[#e1b97b] transition-all"
        >
          <Waves size={20} />
          <span>Virtual Tour</span>
        </button>
      )}
      <Card className="w-full border-0 shadow-md bg-white dark:bg-slate-800 overflow-hidden">
        <CardHeader className="pb-2 bg-gradient-to-r from-indigo-500 to-violet-500 text-white">
          <CardTitle className="text-lg font-bold flex items-center gap-2">
            <Plane className="h-5 w-5" />
            {itinerary.destination} - {itinerary.duration} Itinerary
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Tabs defaultValue={`day-1`} className="w-full">
            <TabsList className="w-full flex overflow-x-auto bg-slate-50 dark:bg-slate-900 p-1 rounded-none border-b border-slate-200 dark:border-slate-700">
              {itinerary.days.map((day) => (
                <TabsTrigger
                  key={day.day}
                  value={`day-${day.day}`}
                  className="flex-shrink-0 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-800 data-[state=active]:text-indigo-600 dark:data-[state=active]:text-indigo-400 data-[state=active]:shadow-sm"
                >
                  Day {day.day}
                </TabsTrigger>
              ))}
            </TabsList>

            {itinerary.days.map((day) => (
              <TabsContent key={day.day} value={`day-${day.day}`} className="p-4 space-y-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 bg-slate-50 dark:bg-slate-900 px-3 py-1.5 rounded-full">
                    <Calendar className="h-4 w-4 text-indigo-500 dark:text-indigo-400" />
                    <span className="text-sm font-medium">{day.date}</span>
                  </div>
                  <Badge
                    variant="outline"
                    className={cn(
                      "font-normal border-slate-200 dark:border-slate-700",
                      day.accommodation === "Departure"
                        ? "bg-rose-50 text-rose-600 dark:bg-rose-900/20 dark:text-rose-400 border-rose-200 dark:border-rose-800/30"
                        : "bg-emerald-50 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30",
                    )}
                  >
                    {day.accommodation === "Departure" ? (
                      <Plane className="mr-1 h-3 w-3" />
                    ) : (
                      <Building className="mr-1 h-3 w-3" />
                    )}
                    {day.accommodation}
                  </Badge>
                </div>

                <div className="space-y-4">
                  {[...day.activities, ...day.meals]
                    .sort((a, b) => {
                      const timeA = new Date(`1970/01/01 ${a.time}`).getTime()
                      const timeB = new Date(`1970/01/01 ${b.time}`).getTime()
                      return timeA - timeB
                    })
                    .map((item, index) => {
                      const isMeal =
                        "type" in item && (item.type === "breakfast" || item.type === "lunch" || item.type === "dinner")

                      let borderColor = "border-indigo-200 dark:border-indigo-800/30"
                      let dotColor = "bg-indigo-500 dark:bg-indigo-400"

                      if (isMeal) {
                        borderColor = "border-amber-200 dark:border-amber-800/30"
                        dotColor = "bg-amber-500 dark:bg-amber-400"
                      } else {
                        const activityType = (item as ItineraryActivityType).type
                        if (activityType === "transfer") {
                          borderColor = "border-blue-200 dark:border-blue-800/30"
                          dotColor = "bg-blue-500 dark:bg-blue-400"
                        } else if (activityType === "adventure") {
                          borderColor = "border-emerald-200 dark:border-emerald-800/30"
                          dotColor = "bg-emerald-500 dark:bg-emerald-400"
                        } else if (activityType === "cultural") {
                          borderColor = "border-purple-200 dark:border-purple-800/30"
                          dotColor = "bg-purple-500 dark:bg-purple-400"
                        } else if (activityType === "relaxation") {
                          borderColor = "border-cyan-200 dark:border-cyan-800/30"
                          dotColor = "bg-cyan-500 dark:bg-cyan-400"
                        }
                      }

                      return (
                        <div
                          key={index}
                          className={`flex gap-3 border-l-2 pl-4 relative ${borderColor} animate-in fade-in-50 slide-in-from-left-3 duration-500`}
                        >
                          <div
                            className={`absolute -left-1.5 top-1.5 h-3 w-3 rounded-full ${dotColor} ring-2 ring-white dark:ring-slate-800`}
                          />

                          <div className="flex-1">
                            <div className="flex items-center gap-2">
                              <Clock className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
                              <span className="text-xs text-slate-500 dark:text-slate-400">{item.time}</span>

                              {isMeal ? (
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 hover:bg-amber-200"
                                >
                                  <Utensils className="mr-1 h-3 w-3" />
                                  {(item as ItineraryMealType).type.charAt(0).toUpperCase() +
                                    (item as ItineraryMealType).type.slice(1)}
                                </Badge>
                              ) : (
                                <Badge
                                  variant="secondary"
                                  className={cn(
                                    "ml-2 text-xs",
                                    (item as ItineraryActivityType).type === "transfer"
                                      ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 hover:bg-blue-200"
                                      : (item as ItineraryActivityType).type === "sightseeing"
                                        ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400 hover:bg-indigo-200"
                                        : (item as ItineraryActivityType).type === "cultural"
                                          ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 hover:bg-purple-200"
                                          : (item as ItineraryActivityType).type === "adventure"
                                            ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 hover:bg-emerald-200"
                                            : "bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400 hover:bg-cyan-200",
                                  )}
                                >
                                  {(item as ItineraryActivityType).type === "transfer" ? (
                                    <Car className="mr-1 h-3 w-3" />
                                  ) : (item as ItineraryActivityType).type === "sightseeing" ? (
                                    <Camera className="mr-1 h-3 w-3" />
                                  ) : (item as ItineraryActivityType).type === "cultural" ? (
                                    <Building className="mr-1 h-3 w-3" />
                                  ) : (item as ItineraryActivityType).type === "adventure" ? (
                                    <Dumbbell className="mr-1 h-3 w-3" />
                                  ) : (
                                    <Waves className="mr-1 h-3 w-3" />
                                  )}
                                  {(item as ItineraryActivityType).type.charAt(0).toUpperCase() +
                                    (item as ItineraryActivityType).type.slice(1)}
                                </Badge>
                              )}
                            </div>

                            <h4 className="mt-1 text-sm font-medium">{item.description}</h4>

                            <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                              <MapPin className="h-3 w-3" />
                              <span>{item.location}</span>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </>
  )
}