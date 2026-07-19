// POST /api/ai/location-tips
// Generates AI tips for a specific location

import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { chatCompletion } from "@/lib/ai";
import { PROMPTS } from "@/lib/ai-prompts";
import { extractJson } from "@/lib/json";
import { prisma } from "@/lib/prisma";
import { withRateLimit } from "@/lib/rate-limit-middleware";

async function handler(req: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return new NextResponse("Not authenticated", { status: 401 });
    }

    const { locationId, tripTitle } = await req.json();

    const location = await prisma.location.findFirst({
      where: {
        id: locationId,
        trip: { is: { userId: session.user.id } },
      },
    });

    if (!location) {
      return new NextResponse("Location not found", { status: 404 });
    }

    const prompt = PROMPTS.locationTips(location.locationTitle, tripTitle);

    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a local travel guide. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 1536 },
    );

    let parsed: unknown;
    try {
      parsed = extractJson(result);
    } catch {
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    // Save tips to database
    await prisma.location.update({
      where: { id: locationId },
      data: { aiTips: JSON.stringify(parsed) },
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI location-tips error:", err);
    const message = err instanceof Error ? err.message : "Unknown error";
    const status = message.includes("429") ? 429 : 500;
    return new NextResponse(message, { status });
  }
}

export const POST = withRateLimit(handler);
