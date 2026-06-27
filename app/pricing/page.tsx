import Link from "next/link";

const PLANS = [
  {
    name: "Free",
    price: 0,
    tier: "free",
    description: "Try it out for your own shop.",
    features: ["1 salesman", "50 items", "100 orders/month", "Basic quotes"],
    cta: "Get started free",
    href: "/register",
    highlight: false,
  },
  {
    name: "Starter",
    price: 19,
    tier: "starter",
    description: "For small teams hitting the road daily.",
    features: ["2 salesmen", "500 items", "1,000 orders/month", "Offline mode", "PDF invoices"],
    cta: "Start Starter",
    href: "/register",
    highlight: false,
  },
  {
    name: "Pro",
    price: 49,
    tier: "pro",
    description: "Growing businesses with multiple vans.",
    features: ["5 salesmen", "5,000 items", "5,000 orders/month", "Route optimization", "WhatsApp invoices", "Priority support"],
    cta: "Start Pro",
    href: "/register",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: 99,
    tier: "enterprise",
    description: "Unlimited scale, custom branding.",
    features: ["Unlimited salesmen", "Unlimited items", "Unlimited orders", "Custom branding", "API access", "Phone support"],
    cta: "Contact us",
    href: "/register",
    highlight: false,
  },
];

export default function PricingPage() {
  return (
    <div className="min-h-screen bg-gray-50 px-3 py-10 sm:px-4 sm:py-16">
      <div className="max-w-5xl mx-auto">
        <div className="mb-10 text-center sm:mb-12">
          <Link href="/" className="text-2xl font-bold text-blue-600">SalesOnRoad</Link>
          <h1 className="mb-3 mt-6 text-3xl font-bold text-gray-900 sm:text-4xl">Simple, transparent pricing</h1>
          <p className="text-gray-500">No setup fees. Cancel any time. Start free.</p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4 md:gap-5">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`flex flex-col rounded-2xl border p-5 sm:p-6 ${
                plan.highlight
                  ? "border-blue-600 bg-blue-600 text-white shadow-xl md:scale-105"
                  : "bg-white border-gray-200"
              }`}
            >
              {plan.highlight && (
                <span className="text-xs font-semibold bg-white text-blue-600 px-3 py-1 rounded-full self-start mb-3">
                  Most popular
                </span>
              )}
              <h2 className={`text-lg font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                {plan.name}
              </h2>
              <div className="mt-2 mb-4">
                <span className={`text-3xl font-bold ${plan.highlight ? "text-white" : "text-gray-900"}`}>
                  ${plan.price}
                </span>
                <span className={`text-sm ${plan.highlight ? "text-blue-100" : "text-gray-400"}`}>/mo</span>
              </div>
              <p className={`text-sm mb-5 ${plan.highlight ? "text-blue-100" : "text-gray-500"}`}>
                {plan.description}
              </p>
              <ul className="space-y-2 flex-1 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className={plan.highlight ? "text-blue-200" : "text-green-500"}>✓</span>
                    <span className={plan.highlight ? "text-blue-50" : "text-gray-700"}>{f}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={plan.href}
                className={`block text-center py-2.5 rounded-xl font-semibold text-sm transition ${
                  plan.highlight
                    ? "bg-white text-blue-600 hover:bg-blue-50"
                    : "bg-gray-900 text-white hover:bg-gray-800"
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-gray-400 mt-10">
          Already have an account?{" "}
          <Link href="/login" className="text-blue-600 hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
