"use client";

import { useState } from "react";
import type { TripWithLocations } from "./trip-card";
import { TripCard } from "./trip-card";

export default function TripSearch({ trips }: { trips: TripWithLocations[] }) {
  const [query, setQuery] = useState("");

  const filtered = trips.filter((trip) => {
    const q = query.trim().toLowerCase();
    if (!q) return true;
    return (
      trip.title.toLowerCase().includes(q) ||
      trip.description.toLowerCase().includes(q)
    );
  });

  return (
    <div>
      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search your trips…"
        className="w-full border border-gray-300 px-4 py-3 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 mb-6 text-sm dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
      />
      {filtered.length === 0 ? (
        <p className="text-center text-gray-500 py-8">
          No trips match “{query}”.
        </p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((trip) => (
            <TripCard key={trip.id} trip={trip} />
          ))}
        </div>
      )}
    </div>
  );
}
