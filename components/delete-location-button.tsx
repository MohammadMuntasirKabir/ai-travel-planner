"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";

interface DeleteLocationButtonProps {
  locationId: string;
  tripId: string;
}

export default function DeleteLocationButton({
  locationId,
  tripId,
}: DeleteLocationButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    if (!confirm("Remove this location from the trip?")) return;
    startTransition(async () => {
      const res = await fetch(`/api/trips?locationId=${locationId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        router.refresh();
      } else {
        alert("Failed to delete location.");
      }
    });
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      disabled={isPending}
      aria-label="Delete location"
      className="text-gray-400 hover:text-red-500 transition-colors disabled:opacity-50"
    >
      <Trash2 className="h-4 w-4" />
    </button>
  );
}
