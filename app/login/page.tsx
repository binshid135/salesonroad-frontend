"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthDivider, AuthError, AuthSecondaryLink, AuthShell, AuthTextField } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const user = await login(email, password);
      router.push(user.role === "super_admin" ? "/super-admin" : "/dashboard");
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ||
        "Login failed. Check your credentials.";
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Welcome Back!" subtitle="Login to continue to Sales on Road" version="Version 1.0.0">
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <AuthError message={error} />}

          <AuthTextField
            id="email"
            icon="email"
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            placeholder="you@company.com"
          />

          <AuthTextField
            id="password"
            icon="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            placeholder="Enter your password"
            action={
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="rounded-md px-1 text-xs font-semibold text-gray-500 hover:text-purple-700"
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            }
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-700 to-violet-600 text-base font-bold text-white shadow-lg shadow-purple-700/25 transition hover:from-purple-800 hover:to-violet-700 disabled:opacity-60"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>

        <AuthDivider />
        <AuthSecondaryLink href="/register">Create company account</AuthSecondaryLink>
      </AuthCard>
    </AuthShell>
  );
}
