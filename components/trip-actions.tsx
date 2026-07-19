"use client";

import { Copy, Printer, Share2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { cloneTrip } from "@/lib/actions/clone-trip";

interface TripActionsProps {
  tripId: string;
}

export default function TripActions({ tripId }: TripActionsProps) {
  const router = useRouter();
  const [isCloning, startClone] = useTransition();
  const [isDeleting, startDelete] = useTransition();

  const shareUrl = `${window.location.origin}/shared/${tripId}`;

  const handleCopyShare = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      alert("Share link copied to clipboard!");
    } catch {
      prompt("Copy this share link:", shareUrl);
    }
  };

  const handleDelete = () => {
    if (
      !confirm("Delete this trip and all its locations? This cannot be undone.")
    ) {
      return;
    }
    startDelete(async () => {
      const res = await fetch("/api/trips", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: tripId }),
      });
      if (res.ok) {
        router.push("/trips");
        router.refresh();
      } else {
        alert("Failed to delete trip.");
      }
    });
  };

  return (
    <div className="flex flex-wrap gap-2">
      <Button
        variant="outline"
        className="rounded-xl border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
        onClick={handleCopyShare}
      >
        <Share2 className="mr-2 h-4 w-4" /> Share
      </Button>
      <Button
        variant="outline"
        className="rounded-xl border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
        onClick={() => router.push(`/trips/${tripId}/print`)}
      >
        <Printer className="mr-2 h-4 w-4" /> Print / PDF
      </Button>
      <Button
        variant="outline"
        className="rounded-xl border-gray-300 hover:bg-gray-100 dark:border-white/10 dark:hover:bg-white/10"
        disabled={isCloning}
        onClick={() => startClone(() => cloneTrip(tripId))}
      >
        <Copy className="mr-2 h-4 w-4" /> {isCloning ? "Cloning…" : "Clone"}
      </Button>
      <Button
        variant="destructive"
        className="rounded-xl"
        disabled={isDeleting}
        onClick={handleDelete}
      >
        <Trash2 className="mr-2 h-4 w-4" />{" "}
        {isDeleting ? "Deleting…" : "Delete"}
      </Button>
    </div>
  );
}
