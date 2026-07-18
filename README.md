# AI Travel Planner

An AI-powered travel planning application built with **Next.js 16**, **React 19**, **Prisma**, **NextAuth 5**, and **OpenRouter**. Generate intelligent itineraries, get location suggestions, receive insider tips, and chat with an AI travel assistant.

## Features

- **AI Itinerary Generator** — Generate full day-by-day itineraries from trip details
- **AI Location Suggester** — Get smart location recommendations for your trip
- **AI Trip Summary** — Auto-generate trip summaries, packing lists, and budget estimates
- **AI Location Tips** — Get insider tips for each destination
- **AI Travel Chat** — Streaming chat assistant for travel advice
- **Interactive Maps** — Visualize destinations with Google Maps
- **3D Globe** — View your travel journey on an interactive globe
- **Drag & Drop Itinerary** — Reorder destinations with @dnd-kit
- **Image Upload** — Upload trip cover images via UploadThing
- **GitHub OAuth** — Sign in with GitHub via NextAuth 5
- **Rate Limiting** — In-memory sliding window rate limiter on all AI endpoints (correct X-RateLimit-Remaining header)
- **Input Validation** — Structured validation on trip creation API
- **Error Handling** — Error boundaries, loading states, not-found pages
- **Retry Logic** — Exponential backoff for OpenRouter API calls (3 retries)
- **Robust AI JSON Parsing** — Strips code fences / prose and extracts balanced JSON from model output
- **Delete Trip & Location** — Remove trips and individual destinations (owner-scoped)
- **Clone Trip** — Duplicate a trip (with all locations and AI content) in one click
- **Public Share Link** — Generate a read-only `/shared/[tripId]` page to share plans
- **Print / PDF Export** — Printer-optimized `/trips/[tripId]/print` view for save-as-PDF
- **Dashboard Search** — Filter your trips instantly by title or description

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Database | PostgreSQL with Prisma 6 |
| Auth | NextAuth 5 (GitHub OAuth) |
| AI | OpenRouter API (Gemini, Claude, GPT, etc.) |
| Maps | @react-google-maps/api |
| Globe | react-globe.gl + Three.js |
| File Upload | UploadThing |
| DnD | @dnd-kit |
| Testing | Vitest + React Testing Library |
| Language | TypeScript 6 |

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL database
- OpenRouter API key
- GitHub OAuth App credentials

### Setup

```bash
git clone git@github.com:MohammadMuntasirKabir/ai-travel-planner.git
cd ai-travel-planner
npm install
cp .env.example .env.local
# Fill in DATABASE_URL, AUTH_SECRET, AUTH_GITHUB_ID, AUTH_GITHUB_SECRET, OPENROUTER_API_KEY
npx prisma migrate dev
npm run dev
```

Open [http://localhost:3003](http://localhost:3003)

### Running Tests

```bash
npm test          # Run all tests
npm run test:watch
npm run test:coverage
```

**91 tests** covering AI client, prompt templates, all API routes, server actions, JSON parsing, rate limiting, and schema validation.

## Project Structure

```
ai-travel-planner/
├── app/
│   ├── api/
│   │   ├── ai/                    # AI API routes (rate limited)
│   │   │   ├── chat/              # Streaming chat
│   │   │   ├── generate-itinerary/
│   │   │   ├── location-tips/
│   │   │   ├── suggest-locations/
│   │   │   └── summarize/
│   │   ├── auth/[...nextauth]/
│   │   ├── trips/                 # Trip CRUD + location delete (DELETE)
│   │   └── uploadthing/
│   ├── trips/                     # Trip pages
│   ├── shared/                    # Public read-only shared trip page
│   ├── globe/                     # 3D globe page
│   ├── error.tsx                  # Error boundary
│   ├── loading.tsx                # Loading state
│   ├── not-found.tsx              # 404 page
│   ├── page.tsx                   # Landing page
│   └── layout.tsx                 # Root layout with metadata
├── components/                    # React components + shadcn/ui
├── lib/
│   ├── ai.ts                      # OpenRouter client with retry logic
│   ├── ai-prompts.ts              # AI prompt templates
│   ├── actions/                   # Server actions (typed geocode)
│   ├── prisma.ts                  # Prisma client
│   ├── rate-limit.ts              # In-memory rate limiter
│   ├── rate-limit-middleware.ts   # Rate limit HOF for API routes
│   ├── upload-thing.ts            # UploadThing helpers
│   └── validation.ts              # Input validation helpers
├── prisma/
│   ├── schema.prisma
│   └── migrations/
├── tests/                         # 68 tests across 10 files
└── vitest.config.ts
```

## License

MIT
