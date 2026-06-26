"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthCard, AuthDivider, AuthError, AuthSecondaryLink, AuthShell, AuthTextField } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

type RegisterForm = {
  email: string;
  password: string;
  full_name: string;
  organization_name: string;
  subdomain: string;
};

const initialForm: RegisterForm = {
  email: "",
  password: "",
  full_name: "",
  organization_name: "",
  subdomain: "",
};

function getRegistrationError(err: unknown) {
  const axiosErr = err as { response?: { status?: number; data?: unknown }; request?: unknown; message?: string };

  if (axiosErr.response) {
    const { data, status } = axiosErr.response;

    if (data && typeof data === "object" && !Array.isArray(data)) {
      const messages = Object.entries(data as Record<string, unknown>).flatMap(([field, val]) => {
        const msgs = Array.isArray(val) ? val : [val];
        const label = field === "non_field_errors" ? "" : `${field}: `;
        return msgs.map((message) => `${label}${String(message)}`);
      });

      return messages[0] || "Registration failed.";
    }

    return `Server error (${status}). Try again.`;
  }

  if (axiosErr.request) {
    return "Cannot reach server. Make sure the backend is running on port 8001.";
  }

  return axiosErr.message || "Registration failed.";
}

function autoSubdomain(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState<RegisterForm>(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const setField = (field: keyof RegisterForm) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const organizationName = e.target.value;
    setForm((prev) => ({
      ...prev,
      organization_name: organizationName,
      subdomain: autoSubdomain(organizationName),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await register(form);
      router.push("/dashboard");
    } catch (err: unknown) {
      setError(getRegistrationError(err));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell>
      <AuthCard title="Create Account" subtitle="Start managing your field sales team">
        <form onSubmit={handleSubmit} className="mt-8 space-y-5">
          {error && <AuthError message={error} />}

          <AuthTextField
            id="full_name"
            icon="user"
            label="Full Name"
            type="text"
            value={form.full_name}
            onChange={setField("full_name")}
            required
            placeholder="Ahmed Al-Rashid"
          />

          <AuthTextField
            id="email"
            icon="email"
            label="Email"
            type="email"
            value={form.email}
            onChange={setField("email")}
            required
            placeholder="you@company.com"
          />

          <AuthTextField
            id="password"
            icon="password"
            label="Password"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={setField("password")}
            required
            minLength={8}
            placeholder="Min 8 characters"
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

          <AuthTextField
            id="organization_name"
            icon="company"
            label="Company Name"
            type="text"
            value={form.organization_name}
            onChange={handleOrgChange}
            required
            placeholder="Al-Rashid Trading"
          />

          <AuthTextField
            id="subdomain"
            icon="domain"
            label="Subdomain"
            type="text"
            value={form.subdomain}
            onChange={setField("subdomain")}
            required
            placeholder="al-rashid"
            rightAddon=".salesonroad.com"
          />

          <button
            type="submit"
            disabled={loading}
            className="h-14 w-full rounded-xl bg-gradient-to-r from-purple-700 to-violet-600 text-base font-bold text-white shadow-lg shadow-purple-700/25 transition hover:from-purple-800 hover:to-violet-700 disabled:opacity-60"
          >
            {loading ? "Creating account..." : "Create Free Account"}
          </button>
        </form>

        <AuthDivider />
        <AuthSecondaryLink href="/login">Sign in to existing account</AuthSecondaryLink>
      </AuthCard>
    </AuthShell>
  );
}
