"use client";

import Image from "next/image";
import Link from "next/link";
import type { Session } from "next-auth";
import ThemeToggle from "@/components/theme-toggle";
import { logout } from "@/lib/auth-actions";

export default function Navbar({ session }: { session: Session | null }) {
  return (
    <nav className="bg-white shadow-md py-4 border-b border-gray-200">
      {" "}
      <div className="container mx-auto flex justify-between items-center px-6 lg:px-8">
        <Link href={"/"} className="flex items-center">
          <Image src={"/logo.png"} alt="logo" width={50} height={50} />
          <span className="text-2xl font-bold text-gray-800">
            Travel Planner
          </span>
        </Link>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          {session ? (
            <>
              <Link
                href={"/trips"}
                className="text-slate-900 hover:text-sky-500"
              >
                My Trips
              </Link>
              <Link
                href={"/globe"}
                className="text-slate-900 hover:text-sky-500"
              >
                Globe
              </Link>

              <button
                type="button"
                className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-sm cursor-pointer"
                onClick={logout}
              >
                Sign Out
              </button>
            </>
          ) : (
            <Link
              href={"/login"}
              className="flex items-center justify-center bg-gray-800 hover:bg-gray-900 text-white p-2 rounded-sm cursor-pointer"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
