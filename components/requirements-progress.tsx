import type React from "react"
import { Progress } from "@/components/ui/progress"
import {
  CheckCircle2,
  Circle,
  MapPin,
  Calendar,
  Users,
  Building,
  Star,
  Bed,
  Car,
  Utensils,
  Dumbbell,
} from "lucide-react"
import { cn } from "@/lib/utils"

// Requirement types
type BasicRequirements = {
  required: boolean
  origin: string | null
  destination: string | null
  duration: string | null
  paxComposition: string | null
}

type AccommodationRequirements = {
  required: boolean
  preferred_location: string | null
  brand: string | null
  star: number | null
  bed_type: string | null
  breakfast_included: boolean | null
}

type TransferRequirements = {
  required: boolean
  type: string | null
  private_transfer: boolean | string | null
}

type MealRequirements = {
  required: boolean
  included_meals: string | null
  dietary_restrictions: string | null
  cuisine_preference: string | null
}

type ActivityRequirements = {
  required: boolean
  activity_level: string | null
  preferred_activities: string[] | null
  guided_tours: boolean | null
}

interface RequirementsProgressProps {
  basicReq: BasicRequirements
  accommodationReq: AccommodationRequirements
  transferReq: TransferRequirements
  mealReq: MealRequirements
  activityReq: ActivityRequirements
  basicProgress: number
  accommodationProgress: number
  transferProgress: number
  mealsProgress: number
  activitiesProgress: number
}

export default function RequirementsProgress({
  basicReq,
  accommodationReq,
  transferReq,
  mealReq,
  activityReq,
  basicProgress,
  accommodationProgress,
  transferProgress,
  mealsProgress,
  activitiesProgress,
}: RequirementsProgressProps) {
  return (
    <div className="space-y-6">
      {basicReq.required && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                1
              </span>
              Basic Information
            </h3>
            <span
              className={cn(
                "text-xs font-medium",
                basicProgress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400",
              )}
            >
              {Math.round(basicProgress)}% complete
            </span>
          </div>
          <Progress
            value={basicProgress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
            indicatorClassName={cn(
              basicProgress === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400",
            )}
          />

          <div className="grid grid-cols-1 gap-2 mt-3">
            <RequirementItem label="Origin" value={basicReq.origin} icon={<MapPin className="h-3 w-3" />} />
            <RequirementItem label="Destination" value={basicReq.destination} icon={<MapPin className="h-3 w-3" />} />
            <RequirementItem label="Duration" value={basicReq.duration} icon={<Calendar className="h-3 w-3" />} />
            <RequirementItem label="Travelers" value={basicReq.paxComposition} icon={<Users className="h-3 w-3" />} />
          </div>
        </div>
      )}

      {accommodationReq.required && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                2
              </span>
              Accommodation
            </h3>
            <span
              className={cn(
                "text-xs font-medium",
                accommodationProgress === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {Math.round(accommodationProgress)}% complete
            </span>
          </div>
          <Progress
            value={accommodationProgress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
            indicatorClassName={cn(
              accommodationProgress === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400",
            )}
          />

          <div className="grid grid-cols-1 gap-2 mt-3">
            <RequirementItem label="Brand" value={accommodationReq.brand} icon={<Building className="h-3 w-3" />} />
            <RequirementItem
              label="Star Rating"
              value={accommodationReq.star ? `${accommodationReq.star} stars` : null}
              icon={<Star className="h-3 w-3" />}
            />
            <RequirementItem label="Bed Type" value={accommodationReq.bed_type} icon={<Bed className="h-3 w-3" />} />
            <RequirementItem
              label="Location"
              value={accommodationReq.preferred_location}
              icon={<MapPin className="h-3 w-3" />}
            />
            <RequirementItem
              label="Breakfast"
              value={
                accommodationReq.breakfast_included !== null
                  ? accommodationReq.breakfast_included
                    ? "Included"
                    : "Not included"
                  : null
              }
              icon={<Building className="h-3 w-3" />}
            />
          </div>
        </div>
      )}

      {transferReq.required && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                3
              </span>
              Transportation
            </h3>
            <span
              className={cn(
                "text-xs font-medium",
                transferProgress === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {Math.round(transferProgress)}% complete
            </span>
          </div>
          <Progress
            value={transferProgress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
            indicatorClassName={cn(
              transferProgress === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400",
            )}
          />

          <div className="grid grid-cols-1 gap-2 mt-3">
            <RequirementItem label="Vehicle Type" value={transferReq.type} icon={<Car className="h-3 w-3" />} />
            <RequirementItem
              label="Private Transfer"
              value={transferReq.private_transfer !== null ? (transferReq.private_transfer && transferReq.private_transfer != '0' ? "Yes" : "No") : null}
              icon={<Car className="h-3 w-3" />}
            />
          </div>
        </div>
      )}

      {mealReq.required && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                4
              </span>
              Meals
            </h3>
            <span
              className={cn(
                "text-xs font-medium",
                mealsProgress === 100 ? "text-emerald-600 dark:text-emerald-400" : "text-slate-500 dark:text-slate-400",
              )}
            >
              {Math.round(mealsProgress)}% complete
            </span>
          </div>
          <Progress
            value={mealsProgress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
            indicatorClassName={cn(
              mealsProgress === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400",
            )}
          />

          <div className="grid grid-cols-1 gap-2 mt-3">
            <RequirementItem
              label="Included Meals"
              value={mealReq.included_meals}
              icon={<Utensils className="h-3 w-3" />}
            />
            <RequirementItem
              label="Dietary Restrictions"
              value={mealReq.dietary_restrictions}
              icon={<Utensils className="h-3 w-3" />}
            />
            <RequirementItem
              label="Cuisine Preference"
              value={mealReq.cuisine_preference}
              icon={<Utensils className="h-3 w-3" />}
            />
          </div>
        </div>
      )}

      {activityReq.required && (
        <div>
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium flex items-center gap-1.5">
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400">
                5
              </span>
              Activities
            </h3>
            <span
              className={cn(
                "text-xs font-medium",
                activitiesProgress === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-slate-500 dark:text-slate-400",
              )}
            >
              {Math.round(activitiesProgress)}% complete
            </span>
          </div>
          <Progress
            value={activitiesProgress}
            className="h-1.5 bg-slate-100 dark:bg-slate-800"
            indicatorClassName={cn(
              activitiesProgress === 100 ? "bg-emerald-500 dark:bg-emerald-400" : "bg-indigo-500 dark:bg-indigo-400",
            )}
          />

          <div className="grid grid-cols-1 gap-2 mt-3">
            <RequirementItem
              label="Activity Level"
              value={activityReq.activity_level}
              icon={<Dumbbell className="h-3 w-3" />}
            />
            <RequirementItem
              label="Preferred Activities"
              value={activityReq.preferred_activities ? activityReq.preferred_activities.join(", ") : null}
              icon={<Dumbbell className="h-3 w-3" />}
            />
            <RequirementItem
              label="Guided Tours"
              value={activityReq.guided_tours !== null ? (activityReq.guided_tours ? "Yes" : "No") : null}
              icon={<Users className="h-3 w-3" />}
            />
          </div>
        </div>
      )}
    </div>
  )
}

interface RequirementItemProps {
  label: string
  value: string | null | boolean | string[]
  icon: React.ReactNode
}

function RequirementItem({ label, value, icon }: RequirementItemProps) {
  const isCompleted = value !== null

  return (
    <div className="flex items-center gap-2 text-sm group animate-in fade-in-50 duration-300">
      {isCompleted ? (
        <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
      ) : (
        <Circle className="h-4 w-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
      )}
      <span className="mr-1 flex-shrink-0 text-indigo-500 dark:text-indigo-400">{icon}</span>
      <span className={isCompleted ? "font-medium" : "text-slate-400 dark:text-slate-500"}>{label}</span>
      {isCompleted && value !== true && value !== false && (
        <span className="ml-auto text-xs truncate max-w-[100px] text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-full group-hover:bg-slate-200 dark:group-hover:bg-slate-700 transition-colors">
          {value}
        </span>
      )}
    </div>
  )
}

