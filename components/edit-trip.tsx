"use client";

import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import type { Trip } from "@/app/generated/prisma";
import { Button } from "@/components/ui/button";
import { updateTrip } from "@/lib/actions/update-trip";
import { cn } from "@/lib/utils";

function fmt(d: Date) {
  return new Date(d).toISOString().split("T")[0];
}

export default function EditTrip({ trip }: { trip: Trip }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!open) {
    return (
      <Button variant="outline" onClick={() => setOpen(true)}>
        <Pencil className="mr-2 h-4 w-4" /> Edit Trip
      </Button>
    );
  }

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      <h2 className="mb-4 text-xl font-semibold">Edit Trip</h2>
      <form
        className="space-y-4"
        action={(formData: FormData) => {
          setError(null);
          if (trip.imageUrl) formData.append("imageUrl", trip.imageUrl);
          startTransition(async () => {
            try {
              await updateTrip(formData, trip.id);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Update failed.");
            }
          });
        }}
      >
        <div>
          <label htmlFor="title" className="mb-1 block text-sm font-medium">
            Title
          </label>
          <input
            id="title"
            name="title"
            defaultValue={trip.title}
            required
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
            )}
          />
        </div>
        <div>
          <label
            htmlFor="description"
            className="mb-1 block text-sm font-medium"
          >
            Description
          </label>
          <textarea
            id="description"
            name="description"
            defaultValue={trip.description}
            required
            className={cn(
              "w-full rounded-md border border-gray-300 px-3 py-2",
              "focus:outline-none focus:ring-2 focus:ring-blue-500",
            )}
          />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label
              htmlFor="startDate"
              className="mb-1 block text-sm font-medium"
            >
              Start Date
            </label>
            <input
              id="startDate"
              name="startDate"
              type="date"
              defaultValue={fmt(trip.startDate)}
              className={cn(
                "w-full rounded-md border border-gray-300 px-3 py-2",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            />
          </div>
          <div>
            <label htmlFor="endDate" className="mb-1 block text-sm font-medium">
              End Date
            </label>
            <input
              id="endDate"
              name="endDate"
              type="date"
              defaultValue={fmt(trip.endDate)}
              className={cn(
                "w-full rounded-md border border-gray-300 px-3 py-2",
                "focus:outline-none focus:ring-2 focus:ring-blue-500",
              )}
            />
          </div>
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <div className="flex gap-2">
          <Button type="submit" disabled={isPending}>
            {isPending ? "Saving…" : "Save Changes"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            disabled={isPending}
            onClick={() => setOpen(false)}
          >
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
