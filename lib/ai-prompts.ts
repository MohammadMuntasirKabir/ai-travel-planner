// AI prompt templates for travel planning

export const PROMPTS = {
  generateItinerary: (
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    locations: string,
  ) => `You are an expert travel planner. Create a detailed day-by-day itinerary for the following trip.

Trip: ${title}
Description: ${description}
Dates: ${startDate} to ${endDate}
Locations: ${locations}

Return a JSON object with this structure:
{
  "itinerary": [
    {
      "day": 1,
      "date": "YYYY-MM-DD",
      "title": "Day title",
      "activities": [
        {
          "time": "09:00",
          "description": "Activity description",
          "location": "Location name",
          "tips": "Helpful tip"
        }
      ]
    }
  ],
  "highlights": ["Key highlight 1", "Key highlight 2"],
  "estimatedBudget": {
    "budget": "$-$$$",
    "currency": "USD",
    "breakdown": {
      "accommodation": "estimated cost",
      "food": "estimated cost",
      "transport": "estimated cost",
      "activities": "estimated cost"
    }
  }
}`,

  suggestLocations: (
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    existingLocations: string,
  ) => `You are a travel expert. Suggest interesting locations to visit for this trip.

Trip: ${title}
Description: ${description}
Dates: ${startDate} to ${endDate}
Already planned: ${existingLocations || "None yet"}

Return a JSON array of suggested locations:
[
  {
    "name": "Location name",
    "address": "Full address or city, country",
    "reason": "Why this location fits the trip",
    "bestFor": "e.g. food, culture, nature, nightlife",
    "estimatedDays": 1-3
  }
]

Suggest 5-8 locations. Be specific with addresses.`,

  generateSummary: (
    title: string,
    description: string,
    startDate: string,
    endDate: string,
    locations: string,
  ) => `You are a travel writer. Create an engaging trip summary and travel tips.

Trip: ${title}
Description: ${description}
Dates: ${startDate} to ${endDate}
Locations: ${locations}

Return a JSON object:
{
  "summary": "A vivid 2-3 paragraph trip summary",
  "tips": [
    "Practical travel tip 1",
    "Practical travel tip 2",
    "Practical travel tip 3"
  ],
  "packingSuggestions": [
    "Item 1",
    "Item 2"
  ],
  "budgetEstimate": "A rough budget estimate with breakdown"
}`,

  locationTips: (
    locationName: string,
    tripTitle: string,
  ) => `You are a local travel guide. Provide insider tips for visiting this location.

Location: ${locationName}
Trip context: ${tripTitle}

Return a JSON object:
{
  "tips": [
    "Insider tip 1",
    "Insider tip 2",
    "Insider tip 3"
  ],
  "mustTry": ["Food/activity 1", "Food/activity 2"],
  "avoid": ["Tourist trap 1", "Common mistake 1"],
  "bestTimeToVisit": "Best time of day or season",
  "estimatedCost": "Budget estimate for this location"
}`,

  chatSystem: `You are a knowledgeable and friendly travel assistant. Help users plan trips, suggest destinations, give travel advice, and answer questions about their travel plans. Be concise, practical, and enthusiastic about travel.`,
};
