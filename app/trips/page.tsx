import Link from "next/link";
import { auth } from "@/auth";
import type { TripWithLocations } from "@/components/trip-card";
import TripSearch from "@/components/trip-search";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { prisma } from "@/lib/prisma";

export default async function TripsPage() {
  const session = await auth();

  if (!session?.user) {
    return (
      <div className="flex h-[70vh] flex-col items-center justify-center gap-3 text-center">
        <p className="text-xl font-medium text-gray-700 dark:text-gray-200">
          Please Sign In.
        </p>
        <Link href="/login">
          <Button>Sign In</Button>
        </Link>
      </div>
    );
  }

  const trips = await prisma.trip.findMany({
    where: { userId: session.user.id },
    include: { locations: true },
  });

  const sortedTrips = [...trips].sort(
    (a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime(),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const upcomingTrips = sortedTrips.filter(
    (trip) => new Date(trip.startDate) >= today,
  );

  return (
    <div className="container mx-auto min-h-screen space-y-8 px-4 py-8 app-bg">
      {/* Gradient welcome banner */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-10 text-white shadow-xl shadow-indigo-500/20">
        <div className="hero-tint" />
        <div className="relative flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <p className="text-sm font-medium text-white/80">Welcome back,</p>
            <h1 className="text-3xl font-extrabold tracking-tight">
              {session.user?.name ?? "Traveler"} 👋
            </h1>
            <p className="mt-2 text-white/90">
              {trips.length === 0
                ? "Start planning your first trip."
                : `You have ${trips.length} ${
                    trips.length === 1 ? "trip" : "trips"
                  } planned${
                    upcomingTrips.length > 0
                      ? ` · ${upcomingTrips.length} upcoming`
                      : ""
                  }.`}
            </p>
          </div>
          <Link href="/trips/new">
            <Button className="btn-gradient rounded-xl px-5 py-2.5 text-base font-semibold shadow-lg shadow-indigo-900/30 hover:brightness-110">
              + New Trip
            </Button>
          </Link>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
          Your Recent Trips
        </h2>
        {trips.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-10">
              <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-tint text-sky-600 dark:text-sky-300">
                <svg
                  viewBox="0 0 24 24"
                  className="h-7 w-7"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden
                >
                  <path d="M12 2 2 7l10 5 10-5-10-5Z" />
                  <path d="m2 17 10 5 10-5" />
                  <path d="m2 12 10 5 10-5" />
                </svg>
              </div>
              <h3 className="mb-1 text-lg font-semibold text-gray-800 dark:text-gray-100">
                No trips yet.
              </h3>
              <p className="mb-5 max-w-sm text-center text-sm text-gray-500 dark:text-gray-400">
                Start planning your adventure by creating your first trip.
              </p>
              <Link href="/trips/new">
                <Button className="btn-gradient rounded-xl px-5 py-2.5 font-semibold shadow-lg shadow-indigo-500/30 hover:brightness-110">
                  Create Trip
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <TripSearch trips={sortedTrips as TripWithLocations[]} />
        )}
      </div>
    </div>
  );
}
