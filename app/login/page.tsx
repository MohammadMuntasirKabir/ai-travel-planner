import type { Metadata } from "next";
import AuthForm from "@/components/auth-form";

export const metadata: Metadata = {
  title: "Sign In — AI Travel Planner",
};

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
