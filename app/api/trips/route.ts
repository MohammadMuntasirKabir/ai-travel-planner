import { auth } from "@/auth";
import { getCountryFromCoordinates } from "@/lib/actions/geocode";
import { prisma } from "@/lib/prisma";
import {
  assertDateString,
  assertOptionalString,
  assertString,
  ValidationError,
} from "@/lib/validation";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth();
    if (!session) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const locations = await prisma.location.findMany({
      where: {
        trip: {
          userId: session.user?.id,
        },
      },
      select: {
        locationTitle: true,
        lat: true,
        lng: true,
        trip: {
          select: {
            title: true,
          },
        },
      },
    });

    const transformedLocations = await Promise.all(
      locations.map(async (loc) => {
        try {
          const geocodeResult = await getCountryFromCoordinates(loc.lat, loc.lng);
          return {
            name: `${loc.trip.title} - ${geocodeResult.formattedAddress}`,
            lat: loc.lat,
            lng: loc.lng,
            country: geocodeResult.country,
          };
        } catch {
          return {
            name: `${loc.trip.title} - ${loc.locationTitle}`,
            lat: loc.lat,
            lng: loc.lng,
            country: "Unknown",
          };
        }
      })
    );

    return NextResponse.json(transformedLocations);
  } catch (err) {
    console.error("Trips API error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const locationId = new URL(req.url).searchParams.get("locationId");

    if (locationId) {
      // Delete a single location owned by the user.
      const location = await prisma.location.findFirst({
        where: { id: locationId, trip: { userId: session.user.id } },
        select: { id: true },
      });
      if (!location) {
        return new NextResponse("Location not found", { status: 404 });
      }
      await prisma.location.delete({ where: { id: locationId } });
      return new NextResponse(null, { status: 204 });
    }

    // Otherwise expect a JSON body with { id } for trip deletion.
    const body = await req.json().catch(() => null);
    const tripId = body?.id;
    if (!tripId || typeof tripId !== "string") {
      return NextResponse.json(
        { error: "Validation failed", details: ["id is required"] },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: session.user.id },
      select: { id: true },
    });
    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    await prisma.trip.delete({ where: { id: tripId } });
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    console.error("Trips DELETE error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const body = await req.json();

    // Validate inputs
    const title = assertString(body.title, "title", { min: 1, max: 200 });
    const description = assertString(body.description, "description", {
      min: 1,
      max: 5000,
    });
    const startDate = assertDateString(body.startDate, "startDate");
    const endDate = assertDateString(body.endDate, "endDate");
    const imageUrl = assertOptionalString(body.imageUrl, "imageUrl", {
      max: 2048,
    });

    // Business rule: endDate must be >= startDate
    if (new Date(endDate) < new Date(startDate)) {
      return NextResponse.json(
        { error: "Validation failed", details: ["endDate must be on or after startDate"] },
        { status: 400 }
      );
    }

    const trip = await prisma.trip.create({
      data: {
        title,
        description,
        startDate: new Date(startDate),
        endDate: new Date(endDate),
        imageUrl,
        userId: session.user.id,
      },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (err) {
    if (err instanceof ValidationError) {
      return NextResponse.json(
        { error: err.message, details: err.details },
        { status: err.status }
      );
    }
    console.error("Trips POST error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
