"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { VanLogo } from "@/components/AuthShell";
import { useAuth } from "@/context/AuthContext";

type IconName = "dashboard" | "items" | "orders" | "plus" | "team" | "billing";

const navItems: { href: string; label: string; icon: IconName; adminOnly?: boolean }[] = [
  { href: "/dashboard", label: "Dashboard", icon: "dashboard" },
  { href: "/items", label: "Items", icon: "items" },
  { href: "/orders", label: "Orders", icon: "orders" },
  { href: "/orders/new", label: "New Order", icon: "plus" },
  { href: "/team", label: "Team", icon: "team", adminOnly: true },
  { href: "/billing", label: "Billing", icon: "billing", adminOnly: true },
];

function NavIcon({ name }: { name: IconName }) {
  if (name === "items") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M4 5h12M4 10h12M4 15h8" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "orders") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M6 3h8l2 3v11H4V6l2-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
        <path d="M7 9h6M7 13h4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "plus") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M10 4v12M4 10h12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "team") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M7 9a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM13.5 8a2.5 2.5 0 1 0 0-5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M2.5 17c.8-3.2 2.4-4.8 4.5-4.8s3.7 1.6 4.5 4.8M12.5 12.5c1.9.3 3.3 1.8 4 4.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  if (name === "billing") {
    return (
      <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
        <path d="M3 6.5A2.5 2.5 0 0 1 5.5 4h9A2.5 2.5 0 0 1 17 6.5v7A2.5 2.5 0 0 1 14.5 16h-9A2.5 2.5 0 0 1 3 13.5v-7Z" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 8h14M6 12h3" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
      <path d="M4 10.5 10 4l6 6.5V17H4v-6.5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M8 17v-5h4v5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
    </svg>
  );
}

export default function Sidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  const visible = navItems.filter(
    (item) => !item.adminOnly || user?.role === "org_admin" || user?.role === "super_admin"
  );

  const initials = (user?.full_name || user?.email || "U").slice(0, 1).toUpperCase();

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex h-20 flex-row border-t border-white/20 bg-[#170342] text-white shadow-[0_-18px_50px_rgba(30,0,80,0.18)] md:sticky md:top-0 md:h-screen md:w-64 md:shrink-0 md:flex-col md:border-r md:border-t-0 md:border-white/30 md:shadow-[18px_0_50px_rgba(30,0,80,0.18)]">
      <div className="relative hidden overflow-hidden border-b border-white/10 px-3 py-6 md:block md:px-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_85%_0%,rgba(168,85,247,0.45),transparent_55%)]" />
        <div className="relative flex items-center justify-center gap-3 md:justify-start">
          <VanLogo className="h-11 w-11 text-white" />
          <div className="hidden min-w-0 md:block">
            <p className="text-lg font-black leading-tight">SalesOnRoad</p>
            {user?.organization_name && (
              <p className="mt-0.5 truncate text-xs text-purple-100/80">{user.organization_name}</p>
            )}
          </div>
        </div>
      </div>

      <nav className="flex flex-1 items-center gap-1 overflow-x-auto px-2 py-2 md:block md:space-y-1 md:overflow-visible md:px-3 md:py-5">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[4.5rem] flex-1 flex-col items-center justify-center gap-1 rounded-xl px-2 py-2 text-[11px] font-bold transition md:min-w-0 md:flex-row md:gap-3 md:px-3 md:py-3 md:text-sm md:justify-start ${
                active
                  ? "bg-white text-purple-800 shadow-lg shadow-purple-950/15"
                  : "text-purple-100/85 hover:bg-white/10 hover:text-white"
              }`}
            >
              <span className="grid h-7 w-7 place-items-center rounded-lg bg-current/10 md:h-8 md:w-8">
                <NavIcon name={item.icon} />
              </span>
              <span className="max-w-full truncate md:inline">{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-white/10 p-2 md:block md:p-4">
        <div className="mb-3 flex items-center justify-center gap-3 rounded-2xl bg-white/10 p-3 md:justify-start">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-white text-sm font-black text-purple-800">
            {initials}
          </div>
          <div className="hidden min-w-0 md:block">
            <p className="truncate text-sm font-bold">{user?.full_name || user?.email}</p>
            <p className="text-xs capitalize text-purple-100/75">{user?.role?.replace("_", " ")}</p>
          </div>
        </div>
        <button
          onClick={handleLogout}
          className="w-full rounded-xl px-2 py-2.5 text-center text-xs font-bold text-purple-100/80 transition hover:bg-red-500/15 hover:text-white md:px-3 md:text-left md:text-sm"
        >
          <span className="md:hidden">Out</span>
          <span className="hidden md:inline">Sign out</span>
        </button>
      </div>
    </aside>
  );
}
