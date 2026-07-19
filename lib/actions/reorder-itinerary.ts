"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function reorderItinerary(_tripId: string, newOrder: string[]) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }

  await prisma.$transaction(
    newOrder.map((locationId: string, key: number) =>
      prisma.location.update({
        where: { id: locationId },
        data: { order: key },
      }),
    ),
  );
}
