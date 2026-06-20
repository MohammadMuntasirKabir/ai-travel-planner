# AI Travel Planner

An AI-powered travel planning application built with Next.js 15, React 19, Prisma, and OpenRouter. Generate intelligent itineraries, get location suggestions, receive insider tips, and chat with an AI travel assistant.

## Features

- **AI Itinerary Generator** - Generate full day-by-day itineraries from your trip details
- **AI Location Suggester** - Get smart location recommendations for your trip
- **AI Trip Summary** - Auto-generate trip summaries, packing lists, and budget estimates
- **AI Location Tips** - Get insider tips for each destination
- **AI Travel Chat** - Streaming chat assistant for travel advice
- **Interactive Maps** - Visualize destinations with Google Maps
- **3D Globe** - View your travel journey on an interactive globe
- **Drag & Drop Itinerary** - Reorder destinations with drag and drop
- **Image Upload** - Upload trip cover images via UploadThing
- **GitHub OAuth** - Sign in with GitHub via NextAuth

## Tech Stack

- **Framework:** Next.js 15 (App Router, Turbopack)
- **UI:** React 19, Tailwind CSS 4, shadcn/ui components
- **Database:** PostgreSQL with Prisma ORM
- **Auth:** NextAuth 5 (GitHub OAuth)
- **AI:** OpenRouter API (OpenAI-compatible, supports Gemini, Claude, GPT, and more)
- **Maps:** @react-google-maps/api
- **Globe:** react-globe.gl + Three.js
- **File Upload:** UploadThing
- **DnD:** @dnd-kit
- **Testing:** Vitest

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenRouter API key ([openrouter.ai/keys](https://openrouter.ai/keys))
- GitHub OAuth App credentials
- Google Maps API key (for maps)
- UploadThing credentials (for image uploads)

### Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/MohammadMuntasirKabir/ai-travel-planner.git
   cd ai-travel-planner
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```

   Required environment variables:
   ```
   # Database
   DATABASE_URL="postgresql://user:password@localhost:5432/travel_planner"

   # NextAuth
   AUTH_SECRET="your-random-secret"
   AUTH_GITHUB_ID="your-github-oauth-app-id"
   AUTH_GITHUB_SECRET="your-github-oauth-app-secret"

   # OpenRouter AI
   OPENROUTER_API_KEY="sk-or-..."
   OPENROUTER_MODEL="google/gemini-2.5-flash-preview"

   # Google Maps (optional, for map features)
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY="..."

   # UploadThing (optional, for image uploads)
   UPLOADTHING_TOKEN="..."
   ```

4. **Set up the database**
   ```bash
   npx prisma migrate dev
   npx prisma generate
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000)

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

58 tests covering AI client, prompt templates, all 5 API routes, server actions, and schema validation.

## Project Structure

```
ai-travel-planner/
├── app/
│   ├── api/
│   │   ├── ai/                    # AI API routes
│   │   │   ├── chat/              # Streaming chat
│   │   │   ├── generate-itinerary/ # Itinerary generation
│   │   │   ├── location-tips/     # Location tips
│   │   │   ├── suggest-locations/ # Location suggestions
│   │   │   └── summarize/         # Trip summary
│   │   ├── auth/[...nextauth]/    # NextAuth handlers
│   │   ├── trips/                 # Trip data API
│   │   └── uploadthing/           # File upload
│   ├── trips/                     # Trip pages
│   ├── globe/                     # 3D globe page
│   ├── page.tsx                   # Landing page
│   └── layout.tsx                 # Root layout
├── components/                    # React components
├── lib/
│   ├── ai.ts                      # OpenRouter AI client
│   ├── ai-prompts.ts              # AI prompt templates
│   ├── actions/                   # Server actions
│   ├── prisma.ts                  # Prisma client
│   └── utils.ts                   # Utilities
├── prisma/
│   ├── schema.prisma              # Database schema
│   └── migrations/                # DB migrations
├── tests/                         # Test files (58 tests)
├── vitest.config.ts               # Vitest configuration
└── package.json
```

## AI Features

### Itinerary Generation
Send a trip to the AI and get a structured day-by-day itinerary with activities, times, locations, and tips. Budget estimates included.

### Location Suggestions
Tell the AI about your trip and get 5-8 specific location recommendations with addresses, reasons, and estimated days.

### Trip Summary
Generates a vivid trip summary, practical travel tips, packing suggestions, and budget breakdown.

### Location Tips
Per-location insider tips including must-try experiences, things to avoid, best times to visit, and cost estimates.

### Travel Chat
Streaming chat interface with optional trip context. Ask about destinations, food, transport, or anything travel-related.

## License

MIT
