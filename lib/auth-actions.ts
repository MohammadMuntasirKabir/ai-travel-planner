"use server";

import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { signIn, signOut } from "@/auth";
import { prisma } from "@/lib/prisma";

export interface AuthResult {
  ok: boolean;
  error?: string;
}

export async function register(formData: FormData): Promise<AuthResult> {
  const name = (formData.get("name")?.toString() ?? "").trim();
  const username = (formData.get("username")?.toString() ?? "").trim();
  const email = (formData.get("email")?.toString() ?? "").trim().toLowerCase();
  const password = formData.get("password")?.toString() ?? "";

  if (!email || !password) {
    return { ok: false, error: "Email and password are required." };
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { ok: false, error: "Please enter a valid email address." };
  }
  if (password.length < 8) {
    return { ok: false, error: "Password must be at least 8 characters." };
  }
  if (username && !/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    return {
      ok: false,
      error: "Username must be 3-20 letters, numbers, or underscores.",
    };
  }

  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, ...(username ? [{ username }] : [])] },
    select: { id: true, email: true, username: true },
  });
  if (existing) {
    if (existing.email === email) {
      return { ok: false, error: "An account with this email already exists." };
    }
    return { ok: false, error: "That username is already taken." };
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: {
      name: name || null,
      username: username || null,
      email,
      password: hashed,
    },
  });

  try {
    await signIn("credentials", {
      identifier: email,
      password,
      redirectTo: "/trips",
    });
  } catch (err) {
    // signIn throws on redirect; a real AuthError means bad credentials
    if (err instanceof AuthError) {
      return { ok: false, error: "Account created but sign-in failed." };
    }
    // NextAuth redirects by throwing a special error — treat as success.
    return { ok: true };
  }
  return { ok: true };
}

export async function loginWithCredentials(
  identifier: string,
  password: string,
): Promise<AuthResult> {
  try {
    await signIn("credentials", {
      identifier,
      password,
      redirectTo: "/trips",
    });
    return { ok: true };
  } catch (err) {
    if (err instanceof AuthError) {
      return { ok: false, error: "Invalid email/username or password." };
    }
    return { ok: true };
  }
}

export async function loginWithProvider(provider: string) {
  await signIn(provider, { redirectTo: "/trips" });
}

export const logout = async () => {
  await signOut({ redirectTo: "/login" });
};
