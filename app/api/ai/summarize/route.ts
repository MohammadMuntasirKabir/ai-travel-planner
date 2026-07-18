// POST /api/ai/summarize
// Generates trip summary, packing list, and budget estimate

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

    const { tripId } = await req.json();

    const trip = await prisma.trip.findFirst({
      where: { id: tripId, userId: session.user.id },
      include: { locations: { orderBy: { order: "asc" } } },
    });

    if (!trip) {
      return new NextResponse("Trip not found", { status: 404 });
    }

    const locationNames = trip.locations.map((l) => l.locationTitle).join(", ");
    const prompt = PROMPTS.generateSummary(
      trip.title,
      trip.description,
      trip.startDate.toISOString().split("T")[0],
      trip.endDate.toISOString().split("T")[0],
      locationNames,
    );

    const result = await chatCompletion(
      [
        {
          role: "system",
          content:
            "You are a travel writer. Always respond with valid JSON only.",
        },
        { role: "user", content: prompt },
      ],
      { maxTokens: 3072 },
    );

    let parsed: {
      summary?: string;
      tips?: string[];
      packingSuggestions?: string[];
      budgetEstimate?: unknown;
    };
    try {
      parsed = extractJson(result) as typeof parsed;
    } catch {
      return new NextResponse("Failed to parse AI response", { status: 500 });
    }

    // Save to database
    await prisma.trip.update({
      where: { id: tripId },
      data: {
        aiSummary: parsed.summary || result,
        aiPackingList: JSON.stringify(parsed.packingSuggestions ?? []),
        aiBudgetEstimate: JSON.stringify(parsed.budgetEstimate ?? {}),
      },
    });

    return NextResponse.json(parsed);
  } catch (err) {
    console.error("AI summarize error:", err);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export const POST = withRateLimit(handler);
