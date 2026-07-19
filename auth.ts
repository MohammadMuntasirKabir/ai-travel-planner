import { PrismaAdapter } from "@auth/prisma-adapter";
import bcrypt from "bcryptjs";
import NextAuth, { type NextAuthConfig } from "next-auth";
import Apple from "next-auth/providers/apple";
import Credentials from "next-auth/providers/credentials";
import Facebook from "next-auth/providers/facebook";
import Google from "next-auth/providers/google";
import { prisma } from "@/lib/prisma";

// Only register an OAuth provider when its credentials are present, so the
// app degrades gracefully (e.g. on local dev) without throwing at boot.
const providers: NextAuthConfig["providers"] = [
  Credentials({
    name: "Email & Password",
    credentials: {
      identifier: { label: "Email or username", type: "text" },
      password: { label: "Password", type: "password" },
    },
    async authorize(credentials) {
      const identifier = (
        credentials?.identifier as string | undefined
      )?.trim();
      const password = credentials?.password as string | undefined;
      if (!identifier || !password) return null;

      const user = await prisma.user.findFirst({
        where: { OR: [{ email: identifier }, { username: identifier }] },
      });
      if (!user?.password) return null;

      const valid = await bcrypt.compare(password, user.password);
      if (!valid) return null;

      return {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
      };
    },
  }),
];

if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
  providers.push(
    Google({
      clientId: process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
    }),
  );
}

if (process.env.AUTH_FACEBOOK_ID && process.env.AUTH_FACEBOOK_SECRET) {
  providers.push(
    Facebook({
      clientId: process.env.AUTH_FACEBOOK_ID,
      clientSecret: process.env.AUTH_FACEBOOK_SECRET,
    }),
  );
}

if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET) {
  providers.push(
    Apple({
      clientId: process.env.AUTH_APPLE_ID,
      clientSecret: process.env.AUTH_APPLE_SECRET,
    }),
  );
}

export const { auth, handlers, signIn, signOut } = NextAuth({
  adapter: PrismaAdapter(prisma),
  providers,
  session: { strategy: "database" },
  pages: {
    signIn: "/login",
  },
});
