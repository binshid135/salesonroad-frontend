"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/super-admin", label: "Dashboard", icon: "▦", exact: true },
  { href: "/super-admin/organizations", label: "Organizations", icon: "◈" },
];

export default function SuperAdminSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push("/login");
  };

  return (
    <aside className="fixed inset-x-0 bottom-0 z-40 flex h-16 flex-row bg-gray-900 text-white shadow-[0_-12px_34px_rgba(0,0,0,0.25)] md:sticky md:top-0 md:h-screen md:w-56 md:shrink-0 md:flex-col">
      <div className="hidden border-b border-gray-700 px-5 py-5 md:block">
        <span className="text-violet-400 font-bold text-lg">SalesOnRoad</span>
        <p className="text-xs text-gray-400 mt-0.5">Super Admin</p>
      </div>

      <nav className="flex flex-1 items-center gap-2 overflow-x-auto px-2 py-2 md:block md:space-y-1 md:overflow-visible md:px-3 md:py-4">
        {navItems.map((item) => {
          const active = item.exact
            ? pathname === item.href
            : pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex min-w-[8rem] flex-1 items-center justify-center gap-2 rounded-lg px-3 py-2.5 text-xs font-medium transition md:min-w-0 md:justify-start md:text-sm ${
                active
                  ? "bg-violet-600 text-white"
                  : "text-gray-400 hover:bg-gray-800 hover:text-white"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="hidden border-t border-gray-700 px-3 py-4 md:block">
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-gray-400 hover:text-red-400 hover:bg-gray-800 rounded-lg transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
