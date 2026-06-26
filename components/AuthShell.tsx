import Link from "next/link";
import type { InputHTMLAttributes, ReactNode } from "react";

type FieldIconType = "email" | "password" | "user" | "company" | "domain";

const featureHighlights = [
  ["Route Planning", "Plan and optimize daily visits"],
  ["Customer Management", "Track leads and interactions"],
  ["Order Management", "Create orders in real time"],
  ["Performance Insights", "Monitor every route and sale"],
];

export function VanLogo({ className = "h-10 w-10" }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" fill="none" className={className} aria-hidden="true">
      <path
        d="M7 25h25c4 0 7 2 9 5l5 8h6c3 0 5 2 5 5v5H7"
        stroke="currentColor"
        strokeWidth="4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="M9 17h18M4 25h14M10 33h11" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
      <path d="M35 30h7l5 8H35V30Z" fill="currentColor" />
      <circle cx="20" cy="50" r="5" stroke="currentColor" strokeWidth="4" />
      <circle cx="47" cy="50" r="5" stroke="currentColor" strokeWidth="4" />
    </svg>
  );
}

function FieldIcon({ type }: { type: FieldIconType }) {
  if (type === "password") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <rect x="5" y="10" width="14" height="10" rx="2" stroke="currentColor" strokeWidth="2" />
        <path d="M8 10V7a4 4 0 0 1 8 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "user") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="2" />
        <path d="M4 20c1.5-4 4.2-6 8-6s6.5 2 8 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "company") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" stroke="currentColor" strokeWidth="2" />
        <path d="M9 21v-5h6v5M9 7h.01M15 7h.01M9 11h.01M15 11h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (type === "domain") {
    return (
      <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
        <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" />
        <path d="M3 12h18M12 3c2.2 2.5 3.3 5.5 3.3 9S14.2 18.5 12 21M12 3C9.8 5.5 8.7 8.5 8.7 12S9.8 18.5 12 21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5" aria-hidden="true">
      <path
        d="M4 6h16v12H4V6Z"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-[#15003f] text-white lg:grid lg:grid-cols-[1.08fr_0.92fr]">
      <section className="relative min-h-[42vh] overflow-hidden px-6 py-8 sm:px-10 lg:min-h-screen lg:px-14 lg:py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_68%_34%,rgba(168,85,247,0.55),transparent_32%),linear-gradient(135deg,#180063_0%,#4b08ca_46%,#8a16ff_100%)]" />
        <div className="absolute inset-0 opacity-25">
          <div className="absolute left-[6%] top-[18%] h-48 w-[86%] rotate-[-13deg] rounded-[50%] border-t border-white/25" />
          <div className="absolute left-[14%] top-[34%] h-64 w-[70%] rotate-[10deg] rounded-[50%] border-t border-white/20" />
          <div className="absolute left-[30%] top-[4%] h-[90%] w-px rotate-[58deg] bg-white/15" />
          <div className="absolute left-[52%] top-[1%] h-[88%] w-px rotate-[58deg] bg-white/10" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-[38%] bg-gradient-to-t from-[#070019] via-[#13003f]/80 to-transparent" />

        <div className="relative z-10 flex min-h-[42vh] max-w-2xl flex-col lg:min-h-[calc(100vh-6rem)]">
          <div className="flex items-center gap-4">
            <VanLogo className="h-14 w-14 text-white" />
            <div className="leading-none">
              <p className="text-2xl font-black uppercase">Sales</p>
              <p className="text-lg font-semibold uppercase">On Road</p>
            </div>
          </div>

          <div className="mt-10 max-w-xl lg:mt-14">
            <h1 className="text-4xl font-black leading-tight sm:text-5xl">
              Drive Sales.
              <span className="block text-purple-200">Every Road. Every Customer.</span>
            </h1>
            <p className="mt-6 max-w-md text-base leading-7 text-purple-50/90 sm:text-lg">
              Empowering your field sales team to manage routes, customers, items, and orders in one place.
            </p>
          </div>

          <div className="mt-8 grid gap-4 text-sm sm:grid-cols-2 lg:mt-10 lg:grid-cols-1">
            {featureHighlights.map(([title, body]) => (
              <div key={title} className="flex items-center gap-3">
                <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 ring-1 ring-white/20">
                  <span className="h-2.5 w-2.5 rounded-full bg-white" />
                </span>
                <span>
                  <span className="block font-semibold">{title}</span>
                  <span className="text-purple-100/85">{body}</span>
                </span>
              </div>
            ))}
          </div>

          <div className="relative mt-auto hidden h-52 lg:block">
            <div className="absolute bottom-0 left-0 h-24 w-[92%] rounded-t-full border-t-4 border-purple-300/70 bg-gradient-to-r from-white/5 to-purple-400/10 shadow-[0_0_36px_rgba(168,85,247,0.8)]" />
            <div className="absolute bottom-14 left-[18%] h-20 w-56 rounded-2xl bg-white shadow-2xl">
              <div className="absolute left-4 top-5 h-9 w-16 rounded bg-[#24105f]" />
              <div className="absolute right-9 top-6 h-8 w-14 rounded bg-[#24105f]" />
              <div className="absolute right-6 top-12 h-8 w-16 rounded-tl-2xl bg-purple-600" />
              <div className="absolute left-10 -bottom-3 h-7 w-7 rounded-full bg-[#080712] ring-4 ring-white" />
              <div className="absolute right-12 -bottom-3 h-7 w-7 rounded-full bg-[#080712] ring-4 ring-white" />
              <VanLogo className="absolute right-16 top-9 h-9 w-9 text-purple-700" />
            </div>
          </div>
        </div>
      </section>

      <section className="flex items-center justify-center bg-[#f7f5ff] px-5 py-8 text-gray-950 lg:min-h-screen lg:px-10">
        {children}
      </section>
    </main>
  );
}

export function AuthCard({
  title,
  subtitle,
  children,
  footer,
  version,
}: {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  version?: string;
}) {
  return (
    <div className="w-full max-w-md rounded-[28px] border border-white bg-white/95 p-7 shadow-[0_24px_80px_rgba(30,0,80,0.22)] sm:p-9">
      <div className="mx-auto grid h-24 w-24 place-items-center rounded-full bg-purple-50 text-purple-700 shadow-[0_12px_34px_rgba(126,34,206,0.2)]">
        <VanLogo className="h-14 w-14" />
      </div>

      <div className="mt-7 text-center">
        <h2 className="text-3xl font-black text-gray-950">{title}</h2>
        <p className="mt-2 text-sm text-gray-500">{subtitle}</p>
      </div>

      {children}

      {footer}

      {version && <p className="mt-8 text-center text-xs text-gray-500">{version}</p>}
    </div>
  );
}

export function AuthTextField({
  icon,
  label,
  rightAddon,
  action,
  ...inputProps
}: InputHTMLAttributes<HTMLInputElement> & {
  icon: FieldIconType;
  label: string;
  rightAddon?: ReactNode;
  action?: ReactNode;
}) {
  return (
    <div>
      <label htmlFor={inputProps.id} className="block text-sm font-semibold text-gray-900">
        {label}
      </label>
      <div className="mt-2 flex h-14 items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 text-purple-700 shadow-sm focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-100">
        <FieldIcon type={icon} />
        <input
          {...inputProps}
          className={`h-full min-w-0 flex-1 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400 ${inputProps.className ?? ""}`}
        />
        {action}
        {rightAddon && <span className="shrink-0 text-sm text-gray-400">{rightAddon}</span>}
      </div>
    </div>
  );
}

export function AuthError({ message }: { message: string }) {
  return <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>;
}

export function AuthDivider() {
  return (
    <div className="mt-7 flex items-center gap-4 text-sm text-gray-400">
      <span className="h-px flex-1 bg-gray-200" />
      <span>or</span>
      <span className="h-px flex-1 bg-gray-200" />
    </div>
  );
}

export function AuthSecondaryLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link
      href={href}
      className="mt-7 flex h-14 items-center justify-center rounded-xl border border-purple-600 text-sm font-bold text-purple-700 transition hover:bg-purple-50"
    >
      {children}
    </Link>
  );
}
