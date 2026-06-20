// POST /api/ai/suggest-locations
// Suggests new locations for a trip using OpenRouter AI

import { auth } from "@/auth";
import { chatCompletion } from "@/lib/ai";
import { PROMPTS } from "@/lib/ai-prompts";
import { prisma } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
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

    const existingLocations = trip.locations.map((l) => l.locationTitle).join(", ");
    const prompt = PROMPTS.suggestLocations(
      trip.title,
      trip.description,
      trip.startDate.toISOString().split("T")[0],
      trip.endDate.toISOString().split("T")[0],
      existingLocations
    );

    const result = await chatCompletion([
      { role: "system", content: "You are a travel expert. Always respond with valid JSON only." },
      { role: "user", content: prompt },
    ], { maxTokens: 2048 });

    const jsonMatch = result.match(/\[[\s\S]*\]/);
    if (!jsonMatch) {
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    return NextResponse.json(JSON.parse(jsonMatch[0]));
  } catch (err) {
    console.error("AI suggest locations error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
