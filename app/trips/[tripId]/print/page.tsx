import { Calendar, MapPin } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export const metadata = {
  title: "Print Trip — AI Travel Planner",
};

export default async function PrintTripPage({
  params,
}: {
  params: Promise<{ tripId: string }>;
}) {
  const { tripId } = await params;

  const session = await auth();
  if (!session?.user?.id) {
    notFound();
  }

  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { locations: { orderBy: { order: "asc" } } },
  });

  if (!trip) {
    notFound();
  }

  let itinerary: { itinerary?: unknown[]; highlights?: string[] } | null = null;
  let budget: unknown = null;
  let packing: unknown = null;
  const summary: string | null = trip.aiSummary;
  try {
    itinerary = trip.aiItinerary ? JSON.parse(trip.aiItinerary) : null;
    budget = trip.aiBudgetEstimate ? JSON.parse(trip.aiBudgetEstimate) : null;
    packing = trip.aiPackingList ? JSON.parse(trip.aiPackingList) : null;
  } catch {
    // Ignore malformed stored AI JSON.
  }

  return (
    <div className="print-container max-w-3xl mx-auto px-6 py-10 text-gray-900">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body { background: #fff; }
          .print-container { max-width: 100%; padding: 0; }
        }
      `}</style>

      <div className="no-print mb-6 flex gap-3 print:hidden">
        <button
          type="button"
          onClick={() => window.print()}
          className="bg-black text-white px-4 py-2 rounded-md"
        >
          Print / Save as PDF
        </button>
        <Link
          href={`/trips/${trip.id}`}
          className="px-4 py-2 rounded-md border border-gray-300"
        >
          Back
        </Link>
      </div>

      <h1 className="text-3xl font-extrabold">{trip.title}</h1>
      <p className="text-gray-500 mt-1">
        <Calendar className="inline h-4 w-4 mr-1" />
        {new Date(trip.startDate).toLocaleDateString()} -{" "}
        {new Date(trip.endDate).toLocaleDateString()}
      </p>

      {trip.imageUrl && (
        <div className="my-4 w-full h-56 overflow-hidden rounded-lg relative">
          <Image
            src={trip.imageUrl}
            alt={trip.title}
            fill
            className="object-cover"
          />
        </div>
      )}

      <p className="mt-3 text-gray-700 leading-relaxed">{trip.description}</p>

      {summary && (
        <section className="mt-6">
          <h2 className="text-xl font-bold border-b pb-1">Trip Summary</h2>
          <p className="mt-2 text-gray-700 whitespace-pre-line">{summary}</p>
        </section>
      )}

      {itinerary?.itinerary && Array.isArray(itinerary.itinerary) && (
        <section className="mt-6">
          <h2 className="text-xl font-bold border-b pb-1">Itinerary</h2>
          <div className="mt-2 space-y-3">
            {(
              itinerary.itinerary as Array<{
                day?: number;
                title?: string;
                activities?: Array<{
                  time?: string;
                  description?: string;
                  location?: string;
                  tips?: string;
                }>;
              }>
            ).map((d, i) => (
              <div key={i}>
                <h3 className="font-semibold">
                  Day {d.day ?? i + 1}
                  {d.title ? ` — ${d.title}` : ""}
                </h3>
                <ul className="ml-4 list-disc text-sm text-gray-700">
                  {(d.activities ?? []).map((a, j) => (
                    <li key={j}>
                      {a.time ? `${a.time} — ` : ""}
                      {a.description ?? ""}
                      {a.location ? ` (${a.location})` : ""}
                      {a.tips ? ` — ${a.tips}` : ""}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>
      )}

      {Array.isArray(packing) && packing.length > 0 && (
        <section className="mt-6">
          <h2 className="text-xl font-bold border-b pb-1">Packing List</h2>
          <ul className="mt-2 list-disc ml-4 text-gray-700">
            {(packing as string[]).map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </section>
      )}

      {budget != null && (
        <section className="mt-6">
          <h2 className="text-xl font-bold border-b pb-1">Budget Estimate</h2>
          <p className="mt-2 text-gray-700">
            {typeof budget === "string" ? budget : JSON.stringify(budget)}
          </p>
        </section>
      )}

      <section className="mt-6">
        <h2 className="text-xl font-bold border-b pb-1">Destinations</h2>
        <ol className="mt-2 space-y-1 text-gray-700">
          {trip.locations.map((loc) => (
            <li key={loc.id} className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-gray-400" />
              {loc.locationTitle}
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
