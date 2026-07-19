"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  assertDateString,
  assertString,
  ValidationError,
} from "@/lib/validation";

export async function updateTrip(formData: FormData, tripId: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Not authenticated.");
  }

  const title = formData.get("title")?.toString();
  const description = formData.get("description")?.toString();
  const startDateStr = formData.get("startDate")?.toString();
  const endDateStr = formData.get("endDate")?.toString();
  const imageUrl = formData.get("imageUrl")?.toString() || null;

  if (!title || !description || !startDateStr || !endDateStr) {
    throw new Error("All fields are required.");
  }

  try {
    assertString(title, "title", { min: 1, max: 200 });
    assertString(description, "description", { min: 1, max: 5000 });
    const startDate = assertDateString(startDateStr, "startDate");
    const endDate = assertDateString(endDateStr, "endDate");
    if (new Date(endDate) < new Date(startDate)) {
      throw new ValidationError(["endDate must be on or after startDate"]);
    }
  } catch (err) {
    if (err instanceof ValidationError) {
      throw new Error(err.details.join("; "));
    }
    throw err;
  }

  const existing = await prisma.trip.findFirst({
    where: { id: tripId, userId: session.user.id },
    select: { id: true },
  });
  if (!existing) {
    throw new Error("Trip not found.");
  }

  await prisma.trip.update({
    where: { id: tripId },
    data: {
      title,
      description,
      startDate: new Date(startDateStr),
      endDate: new Date(endDateStr),
      imageUrl,
    },
  });

  redirect(`/trips/${tripId}`);
}
