"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AppShell, Card, PageHeader, StatusBadge } from "@/components/AppShell";
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
const buttonPrimary =
  "inline-flex items-center justify-center gap-2 rounded-xl bg-[#6d28d9] px-4 py-2.5 text-sm font-black text-white shadow-lg shadow-purple-900/15 transition hover:bg-[#581c87] disabled:cursor-not-allowed disabled:opacity-60";
const sectionTitleClass = "text-lg font-black text-[#130824]";
const alertSuccessClass = "rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-700";
const alertWarningClass = "rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-bold text-amber-700";
const alertErrorClass = "rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-bold text-red-700";

function UsageBar({ used, limit, label }: { used: number; limit: number; label: string }) {
  const unlimited = limit === -1;
  const pct = unlimited ? 0 : Math.min((used / limit) * 100, 100);
  const warn = !unlimited && pct >= 80;

  return (
    <div>
      <div className="mb-1 flex justify-between text-xs font-semibold text-[#6d6478]">
        <span>{label}</span>
        <span>{unlimited ? `${used} / unlimited` : `${used} / ${limit}`}</span>
      </div>
      {!unlimited && (
        <div className="h-2 overflow-hidden rounded-full bg-purple-100">
          <div
            className={`h-full rounded-full transition-all ${warn ? "bg-amber-500" : "bg-purple-600"}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      )}
    </div>
  );
}

function BillingContent() {
  const searchParams = useSearchParams();
  const [info, setInfo] = useState<BillingInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);
  const [portalLoading, setPortalLoading] = useState(false);
  const [error, setError] = useState("");

  const success = searchParams.get("success");
  const cancelled = searchParams.get("cancelled");

  useEffect(() => {
    billingAPI.current().then((response) => {
      setInfo(response.data);
      setLoading(false);
    });
  }, []);

  const handleUpgrade = async (tier: string) => {
    setError("");
    setCheckoutLoading(tier);
    try {
      const response = await billingAPI.checkout(tier);
      window.location.assign(response.data.checkout_url);
    } catch (err: unknown) {
      const message = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      setError(message || "Stripe is not configured yet. Add your API keys to proceed.");
      setCheckoutLoading(null);
    }
  };

  const handlePortal = async () => {
    setError("");
    setPortalLoading(true);
    try {
      const response = await billingAPI.portal();
      window.location.assign(response.data.portal_url);
    } catch {
      setError("Stripe is not configured yet.");
      setPortalLoading(false);
    }
  };

  const currentTierIndex = TIER_ORDER.indexOf(info?.tier ?? "free");

  return (
    <AppShell>
      <PageHeader title="Billing & Plan" subtitle="Review usage, manage subscriptions, and choose the right plan." />

      {success && <div className={`${alertSuccessClass} mb-5`}>Payment successful! Your plan has been upgraded.</div>}
      {cancelled && <div className={`${alertWarningClass} mb-5`}>Checkout cancelled. Your plan was not changed.</div>}
      {error && <div className={`${alertErrorClass} mb-5`}>{error}</div>}

      {loading ? (
        <div className="space-y-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="h-32 animate-pulse rounded-2xl bg-purple-100/70" />
          ))}
        </div>
      ) : (
        <>
          <Card className="mb-6 p-4 sm:p-5">
            <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className={sectionTitleClass}>Current Plan</h2>
                <div className="mt-1 flex items-baseline gap-2">
                  <span className="text-3xl font-black capitalize text-[#130824]">{info?.tier}</span>
                  <span className="text-sm text-[#6d6478]">${info?.price_per_month}/mo</span>
                </div>
              </div>
              <div className="sm:text-right">
                <StatusBadge tone={info?.status === "active" ? "success" : "danger"}>{info?.status}</StatusBadge>
                {info?.current_period_end && (
                  <p className="mt-1 text-xs text-[#6d6478]">
                    Renews {new Date(info.current_period_end).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <UsageBar label="Salesmen" used={info?.usage.salesmen ?? 0} limit={info?.limits.salesmen ?? 1} />
              <UsageBar label="Items" used={info?.usage.items ?? 0} limit={info?.limits.items ?? 50} />
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
                className="mt-4 text-sm font-bold text-purple-700 hover:text-purple-900 disabled:opacity-60"
              >
                {portalLoading ? "Opening portal..." : "Manage subscription in Stripe"}
              </button>
            )}
          </Card>

          <h2 className={`${sectionTitleClass} mb-3`}>Change Plan</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
            {PLANS.map((plan, idx) => {
              const isCurrent = plan.tier === info?.tier;
              const isDowngrade = idx < currentTierIndex;

              return (
                <div
                  key={plan.tier}
                  className={`flex flex-col rounded-2xl border p-4 shadow-[0_18px_50px_rgba(30,0,80,0.08)] ${
                    isCurrent
                      ? "border-purple-500 bg-purple-50"
                      : plan.highlight
                      ? "border-violet-300 bg-violet-50"
                      : "border-[#e9e1f5] bg-white"
                  }`}
                >
                  <p className="text-sm font-black text-[#130824]">{plan.name}</p>
                  <p className="mb-3 mt-1 text-2xl font-black text-[#130824]">
                    ${plan.price}
                    <span className="text-xs font-semibold text-[#6d6478]">/mo</span>
                  </p>
                  <ul className="mb-4 flex-1 space-y-1">
                    {plan.features.map((feature) => (
                      <li key={feature} className="flex gap-2 text-xs text-[#6d6478]">
                        <span className="text-emerald-600">✓</span> {feature}
                      </li>
                    ))}
                  </ul>

                  {isCurrent ? (
                    <span className="block py-2 text-center text-xs font-bold text-purple-700">Current plan</span>
                  ) : plan.tier === "free" ? (
                    <span className="block py-2 text-center text-xs text-[#6d6478]">Downgrade via portal</span>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(plan.tier)}
                      disabled={checkoutLoading === plan.tier}
                      className={`${buttonPrimary} h-10 w-full text-xs`}
                    >
                      {checkoutLoading === plan.tier
                        ? "Redirecting..."
                        : isDowngrade
                        ? `Downgrade to ${plan.name}`
                        : `Upgrade to ${plan.name}`}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-4 text-center text-xs text-[#6d6478]">Payments powered by Stripe. Cancel any time.</p>
        </>
      )}
    </AppShell>
  );
}

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <AppShell>
          <PageHeader title="Billing & Plan" subtitle="Review usage, manage subscriptions, and choose the right plan." />
          <div className="space-y-4">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-2xl bg-purple-100/70" />
            ))}
          </div>
        </AppShell>
      }
    >
      <BillingContent />
    </Suspense>
  );
}
