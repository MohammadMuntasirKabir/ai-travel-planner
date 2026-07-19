import { Clock, Map as MapIcon, MousePointerClick } from "lucide-react";
import Link from "next/link";

const features = [
  {
    icon: MapIcon,
    title: "Interactive Maps",
    desc: "Visualize your whole trip on interactive maps. See every destination and route at a glance.",
  },
  {
    icon: Clock,
    title: "Day-by-Day Itineraries",
    desc: "Structure your adventure with AI-generated, day-by-day plans you can tweak anytime.",
  },
  {
    icon: MousePointerClick,
    title: "Drag & Drop Planning",
    desc: "Rearrange stops with simple drag-and-drop. Your perfect order, in seconds.",
  },
];

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col app-bg dark:dark-app-bg">
      <main className="flex-1">
        {/* ───────────── Hero ───────────── */}
        <section className="relative overflow-hidden bg-brand-gradient text-white">
          <div className="hero-tint dark:dark-hero-tint" />
          <div className="container relative mx-auto px-4 py-24 md:py-36">
            <div className="mx-auto max-w-3xl text-center">
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/10 px-4 py-1.5 text-sm font-medium backdrop-blur">
                ✨ Plan smarter with AI
              </span>
              <h1 className="text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl md:text-6xl">
                Plan your perfect trip,{" "}
                <span className="underline decoration-white/40 decoration-4 underline-offset-8">
                  every time
                </span>
              </h1>
              <p className="mx-auto mt-6 max-w-2xl text-lg text-white/90 md:text-xl">
                Create AI-powered itineraries, organize destinations, and share
                your travel plans — all in one beautiful place.
              </p>
              <div className="mt-9 flex flex-col gap-4 sm:flex-row sm:justify-center">
                <Link
                  href="/register"
                  className="btn-gradient inline-flex items-center justify-center rounded-xl px-7 py-3.5 text-base font-semibold text-white shadow-xl transition hover:brightness-110 active:scale-95"
                >
                  Get Started Free
                </Link>
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center rounded-xl border border-white/40 bg-white/10 px-7 py-3.5 text-base font-semibold text-white backdrop-blur transition hover:bg-white/20 active:scale-95"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          <svg
            className="block w-full text-white dark:text-gray-950"
            viewBox="0 0 1440 80"
            preserveAspectRatio="none"
            aria-hidden
          >
            <path
              fill="currentColor"
              d="M0,40 C240,80 480,0 720,40 C960,80 1200,0 1440,40 L1440,80 L0,80 Z"
            />
          </svg>
        </section>

        {/* ───────────── Features ───────────── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="mx-auto mb-14 max-w-2xl text-center">
              <h2 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
                Plan with{" "}
                <span className="text-brand-gradient">confidence</span>
              </h2>
              <p className="mt-3 text-gray-600 dark:text-gray-400">
                Everything you need to turn travel ideas into a real, shareable
                plan.
              </p>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {features.map((f) => (
                <div
                  key={f.title}
                  className="card-surface dark:dark-card-surface group rounded-2xl p-7 transition-all duration-300 hover:-translate-y-1"
                >
                  <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-md shadow-indigo-500/25">
                    <f.icon className="h-6 w-6" />
                  </div>
                  <h3 className="mb-2 text-xl font-semibold text-gray-900 dark:text-gray-100">
                    {f.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-gray-700 dark:text-gray-300">
                    {f.desc}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ───────────── CTA ───────────── */}
        <section className="py-16 md:py-24">
          <div className="container mx-auto px-4">
            <div className="relative overflow-hidden rounded-3xl bg-brand-gradient px-8 py-14 text-center shadow-xl shadow-indigo-500/20">
              <div className="hero-tint dark:dark-hero-tint" />
              <div className="relative">
                <h2 className="text-3xl font-extrabold text-white md:text-4xl">
                  Ready to plan your next adventure?
                </h2>
                <p className="mx-auto mt-4 max-w-2xl text-lg text-white/90">
                  Join travelers who plan better trips with AI Travel Planner.
                </p>
                <Link
                  href="/register"
                  className="mt-8 inline-flex items-center justify-center rounded-xl bg-white px-7 py-3.5 text-base font-semibold text-indigo-600 shadow-xl transition hover:bg-white/90 active:scale-95"
                >
                  Sign Up Now
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
