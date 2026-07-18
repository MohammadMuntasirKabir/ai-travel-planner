"use client";

import { GoogleMap, Marker, useLoadScript } from "@react-google-maps/api";
import type { Location } from "@/app/generated/prisma";

interface MapViewProps {
  itineraries: Location[];
}

export default function TripMap({ itineraries }: MapViewProps) {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  if (loadError) {
    return (
      <div className="h-full w-full grid place-items-center text-sm text-red-500">
        Error loading maps
      </div>
    );
  }
  if (!isLoaded) {
    return (
      <div className="h-full w-full grid place-items-center text-sm text-gray-400">
        Loading maps…
      </div>
    );
  }

  const center =
    itineraries.length > 0
      ? { lat: itineraries[0].lat, lng: itineraries[0].lng }
      : { lat: 20, lng: 0 };

  return (
    <GoogleMap
      mapContainerStyle={{ width: "100%", height: "100%" }}
      zoom={itineraries.length > 1 ? 4 : 8}
      center={center}
    >
      {itineraries.map((location, key) => (
        <Marker
          key={key}
          position={{ lat: location.lat, lng: location.lng }}
          title={location.locationTitle}
        />
      ))}
    </GoogleMap>
  );
}
