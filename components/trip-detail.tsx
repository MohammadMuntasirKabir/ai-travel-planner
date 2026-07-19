"use client";

import { Calendar, MapPin, Plus } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import type { Location, Trip } from "@/app/generated/prisma";
import AiPanels from "@/components/ai-panels";
import EditTrip from "@/components/edit-trip";
import TripMap from "@/components/map";
import SortableItinerary from "@/components/sortable-itinerary";
import TripActions from "@/components/trip-actions";
import TripChat from "@/components/trip-chat";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export type TripWithLocation = Trip & {
  locations: Location[];
};

interface TripDetailClientProps {
  trip: TripWithLocation;
}

export default function TripDetailClient({ trip }: TripDetailClientProps) {
  const [activeTab, setActiveTab] = useState("overview");

  const tripContext = {
    title: trip.title,
    description: trip.description,
    startDate: trip.startDate.toISOString().split("T")[0],
    endDate: trip.endDate.toISOString().split("T")[0],
    locations: trip.locations.map((l) => ({ locationTitle: l.locationTitle })),
  };

  const days = Math.round(
    (trip.endDate.getTime() - trip.startDate.getTime()) / (1000 * 60 * 60 * 24),
  );

  return (
    <div className="container mx-auto min-h-screen space-y-8 px-4 py-8 app-bg">
      {/* Hero */}
      <div className="relative overflow-hidden rounded-3xl bg-brand-gradient shadow-xl shadow-indigo-500/20">
        {trip.imageUrl && (
          <Image
            src={trip.imageUrl}
            alt={trip.title}
            className="absolute inset-0 h-full w-full object-cover opacity-30"
            fill
            priority
          />
        )}
        <div className="relative p-8 md:p-10">
          <h1 className="text-4xl font-extrabold tracking-tight text-white drop-shadow-sm">
            {trip.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-white/90">
            <Calendar className="h-5 w-5" />
            <span className="text-lg">
              {trip.startDate.toLocaleDateString()} -{" "}
              {trip.endDate.toLocaleDateString()}
              <span className="ml-2 rounded-full bg-white/20 px-2 py-0.5 text-sm">
                {days} days
              </span>
            </span>
          </div>
        </div>
      </div>

      {/* Action bar */}
      <div className="flex flex-wrap items-center gap-3">
        <EditTrip trip={trip} />
        <Link href={`/trips/${trip.id}/itinerary/new`}>
          <Button className="btn-gradient rounded-xl px-4 py-2.5 font-semibold shadow-md shadow-indigo-500/30 hover:brightness-110">
            <Plus className="mr-2 h-5 w-5" /> Add Location
          </Button>
        </Link>
        <TripActions tripId={trip.id} />
      </div>

      {/* Tabbed panel */}
      <div className="card-surface rounded-3xl p-2">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-2 grid w-full grid-cols-2 gap-1 rounded-2xl bg-black/5 p-1 sm:grid-cols-4 dark:bg-white/5">
            {[
              { v: "overview", label: "Overview" },
              { v: "itinerary", label: "Itinerary" },
              { v: "ai", label: "AI Assistant" },
              { v: "map", label: "Map" },
            ].map((t) => (
              <TabsTrigger
                key={t.v}
                value={t.v}
                className="rounded-xl text-sm font-semibold data-[state=active]:bg-brand-gradient data-[state=active]:text-white data-[state=active]:shadow-md"
              >
                {t.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="p-4 md:p-6">
            <TabsContent value="overview" className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div>
                  <h2 className="mb-4 text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                    Trip Summary
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-start">
                      <Calendar className="mr-3 mt-0.5 h-6 w-6 text-sky-500" />
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Dates
                        </p>
                        <p className="text-sm text-gray-700">
                          {trip.startDate.toLocaleDateString()} -{" "}
                          {trip.endDate.toLocaleDateString()}
                          <br />
                          {`${days} days`}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-start">
                      <MapPin className="mr-3 mt-0.5 h-6 w-6 text-teal-500" />
                      <div>
                        <p className="font-medium text-gray-700 dark:text-gray-300">
                          Destinations
                        </p>
                        <p className="text-sm text-gray-700">
                          {trip.locations.length}{" "}
                          {trip.locations.length === 1
                            ? "location"
                            : "locations"}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="mt-6">
                    <p className="leading-relaxed text-gray-700 dark:text-gray-300">
                      {trip.description}
                    </p>
                  </div>
                </div>
                <div className="h-72 overflow-hidden rounded-2xl shadow-md">
                  <TripMap itineraries={trip.locations} />
                </div>
              </div>
              {trip.locations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-white/10">
                  <p className="mb-3 text-gray-500 dark:text-gray-400">
                    Add locations to see them on the map.
                  </p>
                  <Link href={`/trips/${trip.id}/itinerary/new`}>
                    <Button className="btn-gradient rounded-xl px-4 py-2.5 font-semibold shadow-md shadow-indigo-500/30 hover:brightness-110">
                      <Plus className="mr-2 h-5 w-5" /> Add Location
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>

            <TabsContent value="itinerary" className="space-y-6">
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
                Full Itinerary
              </h2>
              {trip.locations.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-white/10">
                  <p className="mb-3 text-gray-500 dark:text-gray-400">
                    Add locations to see them on the itinerary.
                  </p>
                  <Link href={`/trips/${trip.id}/itinerary/new`}>
                    <Button className="btn-gradient rounded-xl px-4 py-2.5 font-semibold shadow-md shadow-indigo-500/30 hover:brightness-110">
                      <Plus className="mr-2 h-5 w-5" /> Add Location
                    </Button>
                  </Link>
                </div>
              ) : (
                <SortableItinerary
                  locations={trip.locations}
                  tripId={trip.id}
                />
              )}
            </TabsContent>

            <TabsContent value="ai" className="space-y-6">
              <AiPanels trip={trip} />
            </TabsContent>

            <TabsContent value="map" className="space-y-6">
              <div className="h-80 overflow-hidden rounded-2xl shadow-md">
                <TripMap itineraries={trip.locations} />
              </div>
              {trip.locations.length === 0 && (
                <div className="rounded-2xl border border-dashed border-gray-300 p-6 text-center dark:border-white/10">
                  <p className="mb-3 text-gray-500 dark:text-gray-400">
                    Add locations to see them on the map.
                  </p>
                  <Link href={`/trips/${trip.id}/itinerary/new`}>
                    <Button className="btn-gradient rounded-xl px-4 py-2.5 font-semibold shadow-md shadow-indigo-500/30 hover:brightness-110">
                      <Plus className="mr-2 h-5 w-5" /> Add Location
                    </Button>
                  </Link>
                </div>
              )}
            </TabsContent>
          </div>
        </Tabs>
      </div>

      <div className="text-center">
        <Link href="/trips">
          <Button
            variant="outline"
            className="rounded-xl border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
          >
            ← Back to Trips
          </Button>
        </Link>
      </div>

      <TripChat tripTitle={trip.title} tripContext={tripContext} />
    </div>
  );
}
