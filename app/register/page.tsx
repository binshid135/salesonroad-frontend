"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({
    email: "",
    password: "",
    full_name: "",
    organization_name: "",
    subdomain: "",
  });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const autoSubdomain = (name: string) =>
    name.toLowerCase().replace(/[^a-z0-9]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

  const handleOrgChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setForm((prev) => ({
      ...prev,
      organization_name: val,
      subdomain: autoSubdomain(val),
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
      const axiosErr = err as { response?: { status?: number; data?: unknown }; request?: unknown; message?: string };
      console.error("Register error:", axiosErr);

      if (axiosErr.response) {
        const data = axiosErr.response.data;
        if (data && typeof data === "object" && !Array.isArray(data)) {
          const messages = Object.entries(data as Record<string, unknown>)
            .flatMap(([field, val]) => {
              const msgs = Array.isArray(val) ? val : [val];
              const label = field === "non_field_errors" ? "" : `${field}: `;
              return msgs.map((m) => `${label}${String(m)}`);
            });
          setError(messages[0] || "Registration failed.");
        } else {
          setError(`Server error (${axiosErr.response.status}). Try again.`);
        }
      } else if (axiosErr.request) {
        setError("Cannot reach server. Make sure the backend is running on port 8001.");
      } else {
        setError(axiosErr.message || "Registration failed.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-600">SalesOnRoad</h1>
          <p className="text-gray-500 mt-1 text-sm">Create your free account</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 space-y-4"
        >
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          {[
            { label: "Full Name", field: "full_name", type: "text", placeholder: "Ahmed Al-Rashid" },
            { label: "Email", field: "email", type: "email", placeholder: "you@company.com" },
            { label: "Password", field: "password", type: "password", placeholder: "Min 8 characters" },
          ].map(({ label, field, type, placeholder }) => (
            <div key={field}>
              <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
              <input
                type={type}
                value={form[field as keyof typeof form]}
                onChange={set(field)}
                required
                className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder={placeholder}
              />
            </div>
          ))}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              value={form.organization_name}
              onChange={handleOrgChange}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Al-Rashid Trading"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Subdomain</label>
            <div className="flex items-center border border-gray-300 rounded-lg overflow-hidden focus-within:ring-2 focus-within:ring-blue-500">
              <input
                type="text"
                value={form.subdomain}
                onChange={set("subdomain")}
                required
                className="flex-1 px-3 py-2 text-sm focus:outline-none"
                placeholder="al-rashid"
              />
              <span className="px-3 py-2 bg-gray-50 text-gray-400 text-sm border-l border-gray-300">
                .salesonroad.com
              </span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 rounded-lg text-sm transition disabled:opacity-60"
          >
            {loading ? "Creating account…" : "Create Free Account"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-500 mt-4">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
