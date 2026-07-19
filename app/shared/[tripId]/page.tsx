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
    <div className="min-h-screen bg-gradient-to-br from-indigo-50/70 via-white to-teal-50/60 text-gray-900 dark:from-gray-950 dark:via-gray-900 dark:to-gray-950 dark:text-gray-100">
      <header className="sticky top-0 z-10 border-b border-white/40 glass dark:border-white/10">
        <div className="container mx-auto flex items-center justify-between px-4 py-4">
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-brand-gradient">Travel</span>
            <span className="text-gray-800 dark:text-gray-100">Planner</span>
          </span>
          <Link
            href="/"
            className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110"
          >
            Plan your own trip →
          </Link>
        </div>
      </header>

      <main className="container mx-auto space-y-8 px-4 py-8">
        {trip.imageUrl && (
          <div className="relative h-72 w-full overflow-hidden rounded-3xl shadow-lg md:h-96">
            <Image
              src={trip.imageUrl}
              alt={trip.title}
              className="object-cover"
              fill
              priority
            />
          </div>
        )}

        <div className="rounded-3xl bg-white p-8 shadow-lg dark:bg-white/5">
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {trip.title}
          </h1>
          <div className="mt-2 flex items-center text-gray-500">
            <Calendar className="mr-2 h-5 w-5 text-sky-500" />
            <span>
              {new Date(trip.startDate).toLocaleDateString()} -{" "}
              {new Date(trip.endDate).toLocaleDateString()}
            </span>
          </div>
          <p className="mt-4 leading-relaxed text-gray-600 dark:text-gray-300">
            {trip.description}
          </p>
        </div>

        {Array.isArray(packing) && packing.length > 0 && (
          <section className="rounded-3xl bg-white p-6 shadow-lg dark:bg-white/5">
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
            <section className="rounded-3xl bg-white p-6 shadow-lg dark:bg-white/5">
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

        <div className="rounded-3xl bg-white p-6 shadow-lg dark:bg-white/5">
          <h2 className="mb-4 text-2xl font-semibold tracking-tight text-gray-900 dark:text-gray-100">
            Destinations
          </h2>
          {trip.locations.length === 0 ? (
            <p className="text-gray-500">No destinations added yet.</p>
          ) : (
            <div className="space-y-3">
              {trip.locations.map((loc, i) => (
                <div
                  key={loc.id}
                  className="flex items-start gap-3 rounded-xl border border-gray-200 p-3 dark:border-white/10"
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

        <footer className="py-8 text-center text-sm text-gray-400">
          Created with AI Travel Planner
        </footer>
      </main>
    </div>
  );
}
