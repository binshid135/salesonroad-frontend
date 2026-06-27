import type { ReactNode } from "react";
import AuthGuard from "@/components/AuthGuard";
import Sidebar from "@/components/Sidebar";

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <AuthGuard>
      <div className="flex min-h-screen bg-[#f7f3fb] md:h-screen md:overflow-hidden">
        <Sidebar />
        <main className="min-w-0 flex-1 overflow-y-auto pb-24 md:pb-0">
          <div className="mx-auto w-full max-w-7xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">{children}</div>
        </main>
      </div>
    </AuthGuard>
  );
}

export function PageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="mb-5 flex flex-col gap-4 sm:mb-6 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <h1 className="text-2xl font-black text-[#130824] sm:text-4xl">{title}</h1>
        {subtitle && <p className="mt-2 max-w-2xl text-sm leading-6 text-[#6d6478]">{subtitle}</p>}
      </div>
      {actions && <div className="flex flex-wrap gap-2 sm:justify-end">{actions}</div>}
    </div>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/80 bg-white shadow-[0_16px_40px_rgba(54,22,92,0.08)] ${className}`}>
      {children}
    </div>
  );
}

export function EmptyState({
  title,
  body,
  action,
}: {
  title: string;
  body?: string;
  action?: ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-dashed border-purple-200 bg-white px-6 py-10 text-center text-sm text-[#6d6478]">
      <div className="mx-auto mb-3 grid h-12 w-12 place-items-center rounded-full bg-purple-100 text-purple-700">
        <span className="h-3 w-3 rounded-full bg-purple-700" />
      </div>
      <p className="font-bold text-[#130824]">{title}</p>
      {body && <p className="mt-1">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function StatusBadge({ tone, children }: { tone: "success" | "warning" | "danger" | "neutral"; children: ReactNode }) {
  const tones = {
    success: "bg-emerald-100 text-emerald-700",
    warning: "bg-amber-100 text-amber-700",
    danger: "bg-red-100 text-red-700",
    neutral: "bg-purple-100 text-purple-700",
  };

  return <span className={`inline-flex rounded-full px-2.5 py-1 text-xs font-bold ${tones[tone]}`}>{children}</span>;
}

export function PlusIcon() {
  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}
