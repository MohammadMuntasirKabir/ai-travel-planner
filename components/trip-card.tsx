import Link from "next/link";
import type { Location, Trip } from "@/app/generated/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TripWithLocations extends Trip {
  locations: Location[];
}

export function TripCard({ trip }: { trip: TripWithLocations }) {
  return (
    <Link href={`/trips/${trip.id}`}>
      <Card className="h-full hover:shadow-md transition-shadow">
        <CardHeader>
          <CardTitle className="line-clamp-1">{trip.title}</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-sm line-clamp-2 mb-2">{trip.description}</p>
          <div className="text-sm">
            {" "}
            {new Date(trip.startDate).toLocaleDateString()} -
            {new Date(trip.endDate).toLocaleDateString()}
          </div>
          {trip.locations.length > 0 && (
            <div className="text-xs text-gray-500 mt-1">
              {trip.locations.length}{" "}
              {trip.locations.length === 1 ? "location" : "locations"}
            </div>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}
