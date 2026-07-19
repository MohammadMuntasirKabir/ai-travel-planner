"use client";

import { MapPin } from "lucide-react";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { addLocation } from "@/lib/actions/add-location";

export default function NewLocationClient({ tripId }: { tripId: string }) {
  const [isPending, startTransation] = useTransition();

  return (
    <div className="flex min-h-[calc(100vh-8rem)] items-center justify-center bg-brand-gradient-soft px-4">
      <div className="w-full max-w-md">
        <div className="glass rounded-3xl border border-white/40 p-8 shadow-2xl dark:border-white/10">
          <div className="mb-6 flex flex-col items-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/30">
              <MapPin className="h-6 w-6" />
            </div>
            <h1 className="text-2xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
              Add New Location
            </h1>
          </div>

          <form
            className="space-y-6"
            action={(formData: FormData) => {
              startTransation(() => {
                addLocation(formData, tripId);
              });
            }}
          >
            <div>
              <label
                htmlFor="address"
                className="mb-2 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Address
              </label>
              <input
                id="address"
                name="address"
                type="text"
                required
                placeholder="Eiffel Tower, Paris"
                className="w-full rounded-xl border border-gray-300 bg-white px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-sky-500/40 focus:border-sky-500 dark:border-white/10 dark:bg-white/5 dark:text-gray-100"
              />
            </div>
            <Button
              type="submit"
              className="btn-gradient w-full rounded-xl py-2.5 text-base font-semibold shadow-lg shadow-indigo-500/30 hover:brightness-110"
            >
              {isPending ? "Adding..." : "Add Location"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
