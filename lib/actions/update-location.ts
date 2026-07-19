"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function updateLocationTitle(locationId: string, title: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated.");
  }

  const trimmed = title.trim();
  if (!trimmed) {
    throw new Error("Location title cannot be empty.");
  }

  const location = await prisma.location.findFirst({
    where: { id: locationId, trip: { userId: session.user.id } },
    select: { id: true, tripId: true },
  });
  if (!location) {
    throw new Error("Location not found.");
  }

  await prisma.location.update({
    where: { id: locationId },
    data: { locationTitle: trimmed },
  });

  revalidatePath(`/trips/${location.tripId}`);
  return { ok: true as const };
}
