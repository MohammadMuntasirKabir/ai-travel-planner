"use client";

import {
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  User,
} from "lucide-react";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import {
  loginWithCredentials,
  loginWithProvider,
  register,
} from "@/lib/auth-actions";
import { cn } from "@/lib/utils";

type Mode = "login" | "register";

function GoogleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1Z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.65l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23Z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.11a6.6 6.6 0 0 1 0-4.22V7.05H2.18a11 11 0 0 0 0 9.9l3.66-2.84Z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 1.36 14.97.5 12 .5A11 11 0 0 0 2.18 7.05l3.66 2.84C6.71 6.68 9.14 4.75 12 4.75Z"
      />
    </svg>
  );
}

function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden>
      <path
        fill="#1877F2"
        d="M24 12a12 12 0 1 0-13.875 11.854v-8.385H7.078V12h3.047V9.356c0-3.007 1.792-4.668 4.533-4.668 1.313 0 2.686.234 2.686.234v2.953h-1.513c-1.49 0-1.955.925-1.955 1.874V12h3.328l-.532 3.469h-2.796v8.385A12 12 0 0 0 24 12Z"
      />
    </svg>
  );
}

function AppleIcon() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="h-5 w-5"
      fill="currentColor"
      aria-hidden
    >
      <path d="M16.365 1.43c0 1.14-.493 2.27-1.177 3.08-.744.9-1.99 1.57-2.987 1.47-.12-1.1.46-2.28 1.17-3.03.8-.93 2.19-1.6 3.0-1.52ZM21.18 17.4c-.5 1.16-.74 1.68-1.38 2.71-.92 1.46-2.22 3.28-3.83 3.29-1.46.01-1.87-.95-3.88-.95-2.01 0-2.57.93-3.95.99-1.59.06-2.81-1.59-3.74-3.04-2.03-3.23-2.26-7.04-1-9.01.99-1.76 2.75-2.92 4.54-2.92 1.66 0 2.71.95 4.09.95 1.34 0 2.16-.95 4.1-.95 1.53 0 3.15.83 4.31 2.26-3.79 2.07-3.18 7.48-.33 8.66Z" />
    </svg>
  );
}

export default function AuthForm({ mode }: { mode: Mode }) {
  const [isPending, startTransition] = useTransition();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const isRegister = mode === "register";

  const onSubmit = (formData: FormData) => {
    setError(null);
    startTransition(async () => {
      const result = isRegister
        ? await register(formData)
        : await loginWithCredentials(
            formData.get("identifier")?.toString() ?? "",
            formData.get("password")?.toString() ?? "",
          );
      if (!result.ok && result.error) setError(result.error);
    });
  };

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-brand-gradient-soft px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-gradient text-white shadow-lg shadow-indigo-500/30">
            <svg
              viewBox="0 0 24 24"
              className="h-7 w-7"
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
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-gray-900 dark:text-gray-100">
            {isRegister ? "Create your account" : "Welcome back"}
          </h1>
          <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
            {isRegister
              ? "Start planning smarter trips with AI."
              : "Sign in to access your trips and AI assistant."}
          </p>
        </div>

        <div className="glass rounded-2xl border border-white/40 p-8 shadow-2xl dark:border-white/10">
          <div className="grid grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => loginWithProvider("google")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <GoogleIcon /> Google
            </button>
            <button
              type="button"
              onClick={() => loginWithProvider("facebook")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <FacebookIcon /> Facebook
            </button>
            <button
              type="button"
              onClick={() => loginWithProvider("apple")}
              className="flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800"
            >
              <AppleIcon /> Apple
            </button>
          </div>

          <div className="my-6 flex items-center gap-3">
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs uppercase tracking-wide text-gray-400">
              or
            </span>
            <div className="h-px flex-1 bg-gray-200 dark:bg-gray-700" />
          </div>

          {error && (
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700 dark:bg-red-950/40 dark:text-red-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              {error}
            </div>
          )}

          <form action={onSubmit} className="space-y-4">
            {isRegister && (
              <div>
                <label
                  htmlFor="name"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Full name
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    autoComplete="name"
                    placeholder="Jane Doe"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            {isRegister && (
              <div>
                <label
                  htmlFor="username"
                  className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Username <span className="text-gray-400">(optional)</span>
                </label>
                <div className="relative">
                  <User className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    id="username"
                    name="username"
                    type="text"
                    autoComplete="username"
                    placeholder="wanderer"
                    className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                  />
                </div>
              </div>
            )}

            <div>
              <label
                htmlFor="identifier"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                {isRegister ? "Email" : "Email or username"}
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id={isRegister ? "email" : "identifier"}
                  name={isRegister ? "email" : "identifier"}
                  type="text"
                  autoComplete="email"
                  required
                  placeholder="you@example.com"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="password"
                className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete={
                    isRegister ? "new-password" : "current-password"
                  }
                  required
                  placeholder="••••••••"
                  className="w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-10 text-sm outline-none focus:border-sky-500 focus:ring-2 focus:ring-sky-500/30 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {isRegister && (
                <p className="mt-1 text-xs text-gray-400">
                  At least 8 characters.
                </p>
              )}
            </div>

            <Button
              type="submit"
              disabled={isPending}
              className={cn(
                "btn-gradient w-full rounded-lg shadow-lg shadow-indigo-500/30 hover:brightness-110",
                isPending && "opacity-70",
              )}
            >
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isRegister ? "Create account" : "Sign in"}
            </Button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500 dark:text-gray-400">
          {isRegister ? (
            <>
              Already have an account?{" "}
              <a
                href="/login"
                className="font-semibold text-blue-600 hover:underline"
              >
                Sign in
              </a>
            </>
          ) : (
            <>
              New to AI Travel Planner?{" "}
              <a
                href="/register"
                className="font-semibold text-blue-600 hover:underline"
              >
                Create an account
              </a>
            </>
          )}
        </p>
      </div>
    </div>
  );
}
