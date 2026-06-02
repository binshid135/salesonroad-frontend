"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";
import { billingAPI, BillingInfo } from "@/lib/api";

const PLANS = [
  {
    tier: "free",
    name: "Free",
    price: 0,
    features: ["1 salesman", "50 items", "100 orders/month"],
  },
  {
    tier: "starter",
    name: "Starter",
    price: 19,
    features: ["2 salesmen", "500 items", "1,000 orders/month", "Offline mode", "PDF invoices"],
  },
  {
    tier: "pro",
    name: "Pro",
    price: 49,
    features: ["5 salesmen", "5,000 items", "5,000 orders/month", "Route optimization"],
    highlight: true,
  },
  {
    tier: "enterprise",
    name: "Enterprise",
    price: 99,
    features: ["Unlimited everything", "Custom branding", "API access", "Phone support"],
  },
];

const TIER_ORDER = ["free", "starter", "pro", "enterprise"];

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const warn = !unlimited && pct >= 80;

  return (
    <div>
      <div className="flex justify-between text-xs text-gray-600 mb-1">
        <span>{label}</span>
        <span>{unlimited ? `${used} / ∞` : `${used} / ${limit}`}</span>
      </div>
      {!unlimited && (
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all ${warn ? "bg-orange-500" : "bg-blue-500"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

export default function BillingPage() {
  const searchParams = useSearchParams();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    billingAPI.current().then((r) => {
      setInfo(r.data);
      setLoading(false);
    });
  }, []);

  const handleUpgrade = async (tier: string) => {
    setError("");
    setCheckoutLoading(tier);
    try {
      const res = await billingAPI.checkout(tier);
      window.location.href = res.data.checkout_url;
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(msg || "Stripe is not configured yet. Add your API keys to proceed.");
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setError("");
    setPortalLoading(true);
    try {
      const res = await billingAPI.portal();
      window.location.href = res.data.portal_url;
    } catch {
      setError("Stripe is not configured yet.");
      setPortalLoading(false);
    }
  };

  const currentTierIndex = TIER_ORDER.indexOf(info?.tier ?? "free");

  return (
    <AuthGuard>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-6">Billing & Plan</h1>

            {success && (
              <div className="mb-5 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-5 py-4">
                Payment successful! Your plan has been upgraded.
              </div>
            )}
            {cancelled && (
              <div className="mb-5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm rounded-xl px-5 py-4">
                Checkout cancelled. Your plan was not changed.
              </div>
            )}
            {error && (
              <div className="mb-5 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-5 py-4">
                {error}
              </div>
            )}

            {loading ? (
              <div className="space-y-4">
                {[...Array(2)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <>
                {/* Current plan */}
                <div className="bg-white rounded-xl border border-gray-200 p-5 mb-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-sm font-semibold text-gray-700">Current Plan</h2>
                      <div className="flex items-baseline gap-2 mt-1">
                        <span className="text-2xl font-bold text-gray-900 capitalize">
                          {info?.tier}
                        </span>
                        <span className="text-gray-400 text-sm">
                          ${info?.price_per_month}/mo
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium ${
                        info?.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-600"
                      }`}>
                        {info?.status}
                      </span>
                      {info?.current_period_end && (
                        <p className="text-xs text-gray-400 mt-1">
                          Renews {new Date(info.current_period_end).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Usage */}
                  <div className="space-y-3">
                    <UsageBar
                      label="Salesmen"
                      used={info?.usage.salesmen ?? 0}
                      limit={info?.limits.salesmen ?? 1}
                    />
                    <UsageBar
                      label="Items"
                      used={info?.usage.items ?? 0}
                      limit={info?.limits.items ?? 50}
                    />
                    <UsageBar
                      label="Orders this month"
                      used={info?.usage.orders_month ?? 0}
                      limit={info?.limits.orders_month ?? 100}
                    />
                  </div>

                  {info?.stripe_subscription_id && (
                    <button
                      onClick={handlePortal}
                      disabled={portalLoading}
                      className="mt-4 text-sm text-blue-600 hover:underline disabled:opacity-60"
                    >
                      {portalLoading ? "Opening portal…" : "Manage subscription in Stripe →"}
                    </button>
                  )}
                </div>

                {/* Upgrade options */}
                <h2 className="text-sm font-semibold text-gray-700 mb-3">Change Plan</h2>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {PLANS.map((plan, idx) => {
                    const isCurrent = plan.tier === info?.tier;
                    const isDowngrade = idx < currentTierIndex;

                    return (
                      <div
                        key={plan.tier}
                        className={`rounded-xl border p-4 flex flex-col ${
                          isCurrent
                            ? "border-blue-500 bg-blue-50"
                            : plan.highlight
                            ? "border-violet-200 bg-violet-50"
                            : "border-gray-200 bg-white"
                        }`}
                      >
                        <p className="text-sm font-bold text-gray-900">{plan.name}</p>
                        <p className="text-xl font-bold text-gray-900 mt-1 mb-3">
                          ${plan.price}
                          <span className="text-xs font-normal text-gray-400">/mo</span>
                        </p>
                        <ul className="space-y-1 flex-1 mb-4">
                          {plan.features.map((f) => (
                            <li key={f} className="text-xs text-gray-600 flex gap-1">
                              <span className="text-green-500">✓</span> {f}
                            </li>
                          ))}
                        </ul>

                        {isCurrent ? (
                          <span className="block text-center text-xs font-medium text-blue-600 py-2">
                            Current plan
                          </span>
                        ) : plan.tier === "free" ? (
                          <span className="block text-center text-xs text-gray-400 py-2">
                            Downgrade via portal
                          </span>
                        ) : (
                          <button
                            onClick={() => handleUpgrade(plan.tier)}
                            disabled={checkoutLoading === plan.tier}
                            className="w-full py-2 bg-gray-900 hover:bg-gray-800 text-white text-xs font-semibold rounded-lg transition disabled:opacity-60"
                          >
                            {checkoutLoading === plan.tier
                              ? "Redirecting…"
                              : isDowngrade
                              ? `Downgrade to ${plan.name}`
                              : `Upgrade to ${plan.name}`}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>

                <p className="text-xs text-gray-400 text-center mt-4">
                  Payments powered by Stripe. Cancel any time.
                </p>
              </>
            )}
          </div>
        </main>
      </div>
    </AuthGuard>
  );
}
