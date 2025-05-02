// apps/web-manager/components/layout/sidebar.js
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabase } from "@lib/supabase-browser";
import Image from "next/image";
import Link from "next/link";
import {
  HomeIcon,
  CalendarDaysIcon,
  ClipboardDocumentListIcon,
  ChartBarIcon,
  CreditCardIcon,
  Cog6ToothIcon,
  ArrowLeftOnRectangleIcon,
} from "@heroicons/react/24/outline";

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/events", label: "Events", icon: CalendarDaysIcon },
  { href: "/bookings", label: "Bookings", icon: ClipboardDocumentListIcon },
  { href: "/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/payments", label: "Payments", icon: CreditCardIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabase();

  async function handleLogout() {
    localStorage.removeItem("clubName");
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col px-4 py-6 shadow-md">
      {/* Logo */}
      <div className="mb-10 flex items-center justify-center">
        <Image
          src="/images/clubster-manager-logo.png"
          alt="Clubster Manager Logo"
          width={160}
          height={40}
          className="object-contain"
          priority
        />
      </div>

      {/* Navigation */}
      <div className="text-xs uppercase text-gray-400 font-semibold mb-3 px-3">Navigation</div>
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive
                ? "bg-purple-100 text-purple-800 border-l-4 border-purple-500"
                : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <item.icon className={`h-5 w-5 transition-transform ${isActive ? "scale-110" : "group-hover:scale-105"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Settings & Logout */}
      <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-2">
        <div className="text-xs uppercase text-gray-400 font-semibold mb-2 px-3">Account</div>

        <Link
          href="/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            pathname.startsWith("/settings")
              ? "bg-purple-100 text-purple-800 border-l-4 border-purple-500"
              : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
          }`}
        >
          <Cog6ToothIcon className="h-5 w-5" />
          Settings
        </Link>

        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-all"
        >
          <ArrowLeftOnRectangleIcon className="h-5 w-5" />
          Logout
        </button>
      </div>
    </aside>
  );
}