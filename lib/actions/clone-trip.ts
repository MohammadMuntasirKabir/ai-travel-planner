"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

export async function cloneTrip(tripId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated");
  }

  const source = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    include: { locations: { orderBy: { order: "asc" } } },
  });

  if (!source) {
    throw new Error("Trip not found");
  }

  const copyTitle = source.title.endsWith("(Copy)")
    ? source.title
    : `${source.title} (Copy)`;

  const created = await prisma.trip.create({
    data: {
      title: copyTitle,
      description: source.description,
      imageUrl: source.imageUrl,
      startDate: source.startDate,
      endDate: source.endDate,
      userId: session.user.id,
      aiItinerary: source.aiItinerary,
      aiSummary: source.aiSummary,
      aiPackingList: source.aiPackingList,
      aiBudgetEstimate: source.aiBudgetEstimate,
      locations: {
        create: source.locations.map((loc) => ({
          locationTitle: loc.locationTitle,
          lat: loc.lat,
          lng: loc.lng,
          order: loc.order,
          aiTips: loc.aiTips,
        })),
      },
    },
  });

  redirect(`/trips/${created.id}`);
}
