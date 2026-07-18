import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Shared Trip — AI Travel Planner",
};

export default async function SharedTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const trip = await prisma.trip.findUnique({
    where: { id: tripId },
    include: { locations: { orderBy: { order: "asc" } } },
  });

  if (!trip) {
    notFound();
  }

  let itinerary: unknown = null;
  let _budget: unknown = null;
  let packing: unknown = null;
  try {
    itinerary = trip.aiItinerary ? JSON.parse(trip.aiItinerary) : null;
    _budget = trip.aiBudgetEstimate ? JSON.parse(trip.aiBudgetEstimate) : null;
    packing = trip.aiPackingList ? JSON.parse(trip.aiPackingList) : null;
  } catch {
    // Ignore malformed stored AI JSON for the public view.
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold">AI Travel Planner</span>
          <Link
            href="/"
            className="text-sm text-sky-600 hover:underline font-medium"
          >
            Plan your own trip →
          </Link>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        {trip.imageUrl && (
          <div className="w-full h-72 md:h-96 overflow-hidden rounded-xl shadow-lg relative">
            <Image
              src={trip.imageUrl}
              alt={trip.title}
              className="object-cover"
              fill
              priority
            />
          </div>
        )}

        <div className="bg-white p-6 shadow rounded-lg">
          <h1 className="text-4xl font-extrabold">{trip.title}</h1>
          <div className="flex items-center text-gray-500 mt-2">
            <Calendar className="h-5 w-5 mr-2" />
            <span>
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-4 text-gray-600 leading-relaxed">
            {trip.description}
          </p>
        </div>

        {Array.isArray(packing) && packing.length > 0 && (
          <section className="bg-white p-6 shadow rounded-lg">
            <h2 className="text-2xl font-semibold mb-3">Packing List</h2>
            <ul className="list-disc pl-6 space-y-1 text-gray-700">
              {(packing as string[]).map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </section>
        )}

        {Array.isArray((itinerary as { highlights?: unknown })?.highlights) &&
          ((itinerary as { highlights?: unknown[] }).highlights?.length ?? 0) >
            0 && (
            <section className="bg-white p-6 shadow rounded-lg">
              <h2 className="text-2xl font-semibold mb-3">Highlights</h2>
              <ul className="list-disc pl-6 space-y-1 text-gray-700">
                {(
                  (itinerary as { highlights?: string[] }).highlights ?? []
                ).map((h, i) => (
                  <li key={i}>{h}</li>
                ))}
              </ul>
            </section>
          )}

        <div className="bg-white p-6 shadow rounded-lg">
          <h2 className="text-2xl font-semibold mb-4">Destinations</h2>
          {trip.locations.length === 0 ? (
            <p className="text-gray-500">No destinations added yet.</p>
          ) : (
            <div className="space-y-3">
              {trip.locations.map((loc, i) => (
                <div
                  key={loc.id}
                  className="flex items-start gap-3 p-3 border rounded-md"
                >
                  <span className="text-sm font-bold text-gray-400 w-6">
                    {i + 1}
                  </span>
                  <div>
                    <p className="font-medium">{loc.locationTitle}</p>
                    <p className="text-xs text-gray-500">
                      <MapPin className="inline h-3 w-3" /> {loc.lat.toFixed(4)}
                      , {loc.lng.toFixed(4)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <footer className="text-center text-gray-400 text-sm py-8">
          Created with AI Travel Planner
        </footer>
      </main>
    </div>
  );
}
