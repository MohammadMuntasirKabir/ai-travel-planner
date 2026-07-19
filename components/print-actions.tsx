"use client";

import Link from "next/link";

export default function PrintActions({ tripId }: { tripId: string }) {
  return (
    <div className="no-print mb-6 flex gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="bg-black text-white px-4 py-2 rounded-md"
      >
        Print / Save as PDF
      </button>
      <Link
        href={`/trips/${tripId}`}
        className="px-4 py-2 rounded-md border border-gray-300"
      >
        Back
      </Link>
    </div>
  );
}
