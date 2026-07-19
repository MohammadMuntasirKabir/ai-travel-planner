"use client";

import Link from "next/link";
import type { Session } from "next-auth";
import ThemeToggle from "@/components/theme-toggle";
import { logout } from "@/lib/auth-actions";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/20 glass dark:border-white/10">
      <div className="container mx-auto flex justify-between items-center px-6 lg:px-8 py-3">
        <Link href={"/"} className="flex items-center gap-2 group">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/30 transition-transform group-hover:scale-105">
            <svg
              viewBox="0 0 24 24"
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M12 2 2 7l10 5 10-5-10-5Z" />
              <path d="m2 17 10 5 10-5" />
              <path d="m2 12 10 5 10-5" />
            </svg>
          </span>
          <span className="text-xl font-extrabold tracking-tight">
            <span className="text-brand-gradient">Travel</span>
            <span className="text-gray-800 dark:text-gray-100">Planner</span>
          </span>
        </Link>

        <div className="flex items-center space-x-2 sm:space-x-5">
          <ThemeToggle />
          {session ? (
            <>
              <Link
                href={"/trips"}
                className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors dark:text-gray-200 dark:hover:text-sky-400"
              >
                My Trips
              </Link>
              <Link
                href={"/globe"}
                className="hidden sm:inline text-sm font-medium text-gray-700 hover:text-sky-600 transition-colors dark:text-gray-200 dark:hover:text-sky-400"
              >
                Globe
              </Link>

              <button
                type="button"
                className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 active:scale-95"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href={"/login"}
              className="rounded-lg bg-brand-gradient px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/30 transition hover:brightness-110 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
