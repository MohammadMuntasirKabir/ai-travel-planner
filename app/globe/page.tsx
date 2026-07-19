"use client";
import { MapPin } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import Globe, { type GlobeMethods } from "react-globe.gl";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export interface TransformedLocation {
  lat: number;
  lng: number;
  name: string;
  country: string;
}

export default function GlobePage() {
  const globeRef = useRef<GlobeMethods | undefined>(undefined);

  const [visitedCountries, setVisitedCountries] = useState<Set<string>>(
    new Set(),
  );
  const [locations, setLocations] = useState<TransformedLocation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLocations = async () => {
      try {
        const response = await fetch("/api/trips");
        const data = await response.json();
        setLocations(data);
        const countries = new Set<string>(
          data.map((loc: TransformedLocation) => loc.country),
        );

        setVisitedCountries(countries);
      } catch (err) {
        console.error("error", err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLocations();
  }, []);

  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
    }
  }, []);
  return (
    <div className="min-h-screen app-bg">
      {" "}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-center text-4xl font-extrabold tracking-tight mb-12 text-gray-900 dark:text-gray-100">
            {" "}
            Your Travel Journey
          </h1>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 overflow-hidden rounded-3xl bg-white shadow-xl dark:bg-white/5">
              <div className="p-6">
                <h2 className="text-2xl font-semibold mb-4 text-gray-900 dark:text-gray-100">
                  {" "}
                  See where you've been...
                </h2>

                <div className="h-[600px] w-full relative">
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900">
                        {" "}
                      </div>
                    </div>
                  ) : (
                    <Globe
                      ref={globeRef}
                      globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                      bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                      backgroundColor="rgba(0,0,0,0)"
                      pointColor={() => "#FF5733"}
                      pointLabel="name"
                      pointsData={locations}
                      pointRadius={0.5}
                      pointAltitude={0.1}
                      pointsMerge={true}
                      width={800}
                      height={600}
                    />
                  )}
                </div>
              </div>
            </div>

            <div className="lg:col-span-1">
              <Card className="sticky top-8">
                <CardHeader>
                  {" "}
                  <CardTitle> Countries Visited</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center h-full">
                      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900">
                        {" "}
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <div className="rounded-xl bg-brand-tint p-4">
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-200">
                          {" "}
                          You've visited{" "}
                          <span className="font-bold">
                            {" "}
                            {visitedCountries.size}
                          </span>{" "}
                          countries.
                        </p>
                      </div>

                      <div className="space-y-2 max-h-[500px] overflow-y-auto pr-2">
                        {Array.from(visitedCountries)
                          .sort()
                          .map((country, key) => (
                            <div
                              key={key}
                              className="flex items-center gap-2 rounded-xl border border-gray-100 p-3 transition-colors hover:bg-sky-50 dark:border-white/10 dark:hover:bg-white/10"
                            >
                              <MapPin className="h-4 w-4 text-red-500" />
                              <span className="font-medium"> {country}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>{" "}
    </div>
  );
}
