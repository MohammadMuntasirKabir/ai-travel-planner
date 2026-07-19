import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { auth } from "@/auth";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Travel Planner — Plan Smarter with AI",
  description:
    "Plan your perfect trip with AI-powered itineraries, location suggestions, and smart budgeting.",
  openGraph: {
    title: "AI Travel Planner — Plan Smarter with AI",
    description:
      "Plan your perfect trip with AI-powered itineraries, location suggestions, and smart budgeting.",
    type: "website",
    siteName: "AI Travel Planner",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Travel Planner — Plan Smarter with AI",
    description:
      "Plan your perfect trip with AI-powered itineraries, location suggestions, and smart budgeting.",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const session = await auth();

  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <Navbar session={session} />
        {children}
      </body>
    </html>
  );
}
