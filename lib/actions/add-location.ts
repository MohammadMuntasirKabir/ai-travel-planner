"use server";

import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

function getGoogleMapsKey(): string {
  return (
    process.env.GOOGLE_MAPS_API_KEY ??
    process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ??
    ""
  );
}

interface GeocodeGeometry {
  location: { lat: number; lng: number };
}

async function geocodeAddress(address: string) {
  const apiKey = getGoogleMapsKey();
  const response = await fetch(
    `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address,
    )}&key=${apiKey}`,
  );

  const data = await response.json();
  const geometry = data?.results?.[0]?.geometry as GeocodeGeometry | undefined;
  if (!geometry?.location) {
    throw new Error(
      "Could not geocode that address. Please try a more specific location.",
    );
  }
  const { lat, lng } = geometry.location;
  return { lat, lng };
}

export async function addLocation(formData: FormData, tripId: string) {
  const session = await auth();
  if (!session) {
    throw new Error("Not authenticated");
  }

  const address = formData.get("address")?.toString();
  if (!address) {
    throw new Error("Missing address");
  }

  const { lat, lng } = await geocodeAddress(address);

  const count = await prisma.location.count({
    where: { tripId },
  });

  await prisma.location.create({
    data: {
      locationTitle: address,
      lat,
      lng,
      tripId,
      order: count,
    },
  });

  redirect(`/trips/${tripId}`);
}
