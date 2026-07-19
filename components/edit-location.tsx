"use client";

import { Pencil } from "lucide-react";
import { useState, useTransition } from "react";
import { updateLocationTitle } from "@/lib/actions/update-location";

export default function EditLocation({
  locationId,
  title,
}: {
  locationId: string;
  title: string;
}) {
  const [editing, setEditing] = useState(false);
  const [value, setValue] = useState(title);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!editing) {
    return (
      <button
        type="button"
        aria-label="Edit location name"
        className="text-gray-400 transition-colors hover:text-sky-600 disabled:opacity-50"
        disabled={isPending}
        onClick={() => setEditing(true)}
      >
        <Pencil className="h-4 w-4" />
      </button>
    );
  }

  return (
    <span className="flex items-center gap-2">
      <input
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-48 rounded border border-gray-300 px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500"
      />
      {error && <span className="text-xs text-red-600">{error}</span>}
      <button
        type="button"
        className="text-sm text-sky-600 hover:underline disabled:opacity-50"
        disabled={isPending}
        onClick={() =>
          startTransition(async () => {
            try {
              await updateLocationTitle(locationId, value);
              setEditing(false);
              setError(null);
            } catch (e) {
              setError(e instanceof Error ? e.message : "Failed");
            }
          })
        }
      >
        Save
      </button>
      <button
        type="button"
        className="text-sm text-gray-500 hover:underline disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          setValue(title);
          setEditing(false);
        }}
      >
        Cancel
      </button>
    </span>
  );
}
