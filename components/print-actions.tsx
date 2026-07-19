"use client";

import Link from "next/link";

export default function PrintActions({ tripId }: { tripId: string }) {
  return (
    <div className="no-print mb-6 flex gap-3 print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="btn-gradient rounded-xl px-4 py-2 font-semibold text-white shadow-md shadow-indigo-500/30"
      >
        Print / Save as PDF
      </button>
      <Link
        href={`/trips/${tripId}`}
        className="rounded-xl border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-100 dark:border-white/10 dark:text-gray-200 dark:hover:bg-white/10"
      >
        Back
      </Link>
    </div>
  );
}
