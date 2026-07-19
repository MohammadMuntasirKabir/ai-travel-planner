import { CalendarDays, MapPin } from "lucide-react";
import Link from "next/link";
import type { Location, Trip } from "@/app/generated/prisma";
import { Card } from "@/components/ui/card";

export interface TripWithLocations extends Trip {
  locations: Location[];
}

export function TripCard({ trip }: { trip: TripWithLocations }) {
  return (
    <Link href={`/trips/${trip.id}`} className="group block">
      <Card className="h-full overflow-hidden border-gray-200/70 bg-white transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-white/10 dark:bg-white/5">
        {/* Gradient accent strip */}
        <div className="h-2 w-full bg-brand-gradient" />
        <div className="p-5">
          <div className="mb-3 flex items-start justify-between gap-3">
            <h3 className="line-clamp-1 text-lg font-bold tracking-tight text-gray-900 dark:text-gray-100">
              {trip.title}
            </h3>
            {trip.locations?.length > 0 && (
              <span className="inline-flex shrink-0 items-center gap-1 rounded-full bg-sky-50 px-2.5 py-1 text-xs font-medium text-sky-600 dark:bg-sky-500/15 dark:text-sky-300">
                <MapPin className="h-3 w-3" />
                {trip.locations.length}
              </span>
            )}
          </div>

          <p className="mb-4 line-clamp-2 text-sm leading-relaxed text-gray-600 dark:text-gray-400">
            {trip.description || "No description yet."}
          </p>

          <div className="flex items-center gap-2 text-sm font-medium text-gray-500 dark:text-gray-400">
            <CalendarDays className="h-4 w-4 text-sky-500" />
            {new Date(trip.startDate).toLocaleDateString()}
            <span className="text-gray-300 dark:text-gray-600">→</span>
            {new Date(trip.endDate).toLocaleDateString()}
          </div>
        </div>
      </Card>
    </Link>
  );
}
