"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "▦" },
  { href: "/items", label: "Items", icon: "◈" },
  { href: "/orders", label: "Orders", icon: "◎" },
  { href: "/orders/new", label: "New Order", icon: "＋" },
  { href: "/team", label: "Team", icon: "⊙", adminOnly: true },
  { href: "/billing", label: "Billing", icon: "◷", adminOnly: true },
];

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

  return (
    <aside className="w-56 shrink-0 bg-white border-r border-gray-200 flex flex-col h-screen sticky top-0">
      <div className="px-5 py-5 border-b border-gray-100">
        <span className="text-blue-600 font-bold text-lg">SalesOnRoad</span>
        {user?.organization_name && (
          <p className="text-xs text-gray-400 truncate mt-0.5">{user.organization_name}</p>
        )}
      </div>

      <nav className="flex-1 px-3 py-4 space-y-1">
        {visible.map((item) => {
          const active = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                active
                  ? "bg-blue-50 text-blue-700"
                  : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
              }`}
            >
              <span className="text-base">{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-3 py-4 border-t border-gray-100">
        <div className="px-3 mb-3">
          <p className="text-sm font-medium text-gray-800 truncate">{user?.full_name || user?.email}</p>
          <p className="text-xs text-gray-400 capitalize">{user?.role?.replace("_", " ")}</p>
        </div>
        <button
          onClick={handleLogout}
          className="w-full text-left px-3 py-2 text-sm text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
        >
          Sign out
        </button>
      </div>
    </aside>
  );
}
