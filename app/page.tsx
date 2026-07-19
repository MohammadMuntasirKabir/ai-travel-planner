import { Map as MapIcon } from "lucide-react";
import Link from "next/link";

export default function LandingPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative bg-gradient-to-b from-white to-blue-50 py-20 md:py-32 dark:from-gray-950 dark:to-gray-900">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-gray-900 dark:text-gray-100">
                Plan your perfect trip, every time
              </h1>
              <p className="text-xl md:text-2xl text-gray-600 mb-8 dark:text-gray-300">
                Create itineraries, organize destinations, and share your travel
                plans all in one place.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center dark:bg-white dark:text-black dark:hover:bg-gray-200"
                >
                  Get Started
                </Link>
                <Link
                  href="/login"
                  className="w-full sm:w-auto border border-gray-300 text-gray-800 hover:bg-gray-100 px-6 py-3 rounded-lg transition-colors duration-200 flex items-center justify-center dark:border-gray-700 dark:text-gray-100 dark:hover:bg-gray-800"
                >
                  Sign In
                </Link>
              </div>
            </div>
          </div>
          <div
            className="absolute bottom-0 left-0 right-0 h-24 bg-white dark:bg-gray-950"
            style={{ clipPath: "polygon(0 100%, 100% 100%, 100% 0, 0 100%)" }}
          />
        </section>

        {/* Features Section */}
        <section className="py-16 md:py-24 bg-white dark:bg-gray-950">
          <div className="container mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-12 text-gray-900 dark:text-gray-100">
              Plan with confidence
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-6 rounded-lg border border-gray-100 shadow-sm bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <MapIcon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Interactive Maps
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Visualize your trip with interactive maps. See your entire
                  itinerary at a glance.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-gray-100 shadow-sm bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="w-12 h-12 rounded-full bg-amber-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-travel-amber"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Day-by-Day Itineraries
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Organize your trip day by day. Never miss a beat with
                  structured planning.
                </p>
              </div>
              <div className="p-6 rounded-lg border border-gray-100 shadow-sm bg-white dark:border-gray-800 dark:bg-gray-900">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mb-4">
                  <svg
                    className="h-6 w-6 text-green-500"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M3 15a4 4 0 004 4h9a5 5 0 10-4.5-6.5L12 7" />
                    <path d="M15 5v4h4" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-gray-100">
                  Drag & Drop Planning
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Easily rearrange your itinerary with simple drag and drop
                  functionality.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Call to Action Section */}
        <section className="py-16 md:py-24 bg-gray-800">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Ready to plan your next adventure?
            </h2>
            <p className="text-xl text-blue-50 mb-8 max-w-2xl mx-auto">
              Join thousands of travelers who plan better trips with AI Travel
              Planner.
            </p>
            <Link
              href="/register"
              className="inline-block bg-white text-gray-800 hover:bg-blue-50 px-6 py-3 rounded-lg transition-colors duration-200"
            >
              Sign Up Now
            </Link>
          </div>
        </section>
      </main>
    </div>
  );
}
