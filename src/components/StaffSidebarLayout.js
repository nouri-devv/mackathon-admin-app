"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { label: "Home", href: "/home", icon: "🏠" },
  { label: "Events", href: "/home/events", icon: "📋" },
];

export default function StaffSidebarLayout({ children }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-lg p-6 space-y-6">
        <h1 className="text-2xl font-bold text-blue-600">CampusConnect</h1>
        <nav className="space-y-2">
          {navItems.map(({ label, href, icon }) => (
            <Link key={href} href={href}>
              <div
                className={`flex items-center px-4 py-2 rounded-lg cursor-pointer
                  ${pathname === href ? "bg-blue-100 text-blue-700 font-semibold" : "text-gray-700 hover:bg-gray-100"}
                `}
              >
                <span className="mr-3 text-lg">{icon}</span>
                {label}
              </div>
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
