// POST /api/ai/generate-itinerary
// Generates a full day-by-day itinerary for a trip using OpenRouter AI

import { auth } from "@/auth";
import { chatCompletion } from "@/lib/ai";
import { PROMPTS } from "@/lib/ai-prompts";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit-middleware";
import { NextRequest, NextResponse } from "next/server";

async function handler(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const { tripId } = await req.json();

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: session.user.id },
      include: { locations: { orderBy: { order: "asc" } } },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    const locationNames = trip.locations.map((l) => l.locationTitle).join(", ");
    const prompt = PROMPTS.generateItinerary(
      trip.title,
      trip.description,
      trip.startDate.toISOString().split("T")[0],
      trip.endDate.toISOString().split("T")[0],
      locationNames
    );

    const result = await chatCompletion([
      { role: "system", content: "You are an expert travel planner. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ], { maxTokens: 4096 });

    // Extract JSON from response
    const jsonMatch = result.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    // Save to database
    await prisma.trip.update({
      where: { id: tripId },
      data: { aiItinerary: jsonMatch[0] },
    });

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("AI itinerary error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const POST = withRateLimit(handler);
