// components/manager/layout/sidebar.js
"use client";

import { useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase-browser";
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
  { href: "/manager/dashboard", label: "Dashboard", icon: HomeIcon },
  { href: "/manager/events", label: "Events", icon: CalendarDaysIcon },
  { href: "/manager/bookings", label: "Bookings", icon: ClipboardDocumentListIcon },
  { href: "/manager/analytics", label: "Analytics", icon: ChartBarIcon },
  { href: "/manager/payments", label: "Payments", icon: CreditCardIcon },
];

export default function Sidebar() {
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createBrowserSupabase();

  async function handleLogout() {
    // ✅ Pulizia localStorage
    localStorage.removeItem("clubName");
  
    // ⛔️ Logout da Supabase
    await supabase.auth.signOut();
  
    // 🔁 Redirect alla pagina di login
    router.push("/auth/manager/landing");
  }
  

  return (
    <aside className="w-64 h-screen bg-white border-r border-gray-200 flex flex-col px-4 py-6">
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

      {/* Nav */}
      <nav className="flex flex-col gap-1">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all
                ${isActive ? "bg-purple-100 text-purple-800" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"}`}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-auto pt-6 border-t border-gray-100 flex flex-col gap-2">
        <Link
          href="/manager/settings"
          className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all ${
            pathname.startsWith("/manager/settings")
              ? "bg-purple-100 text-purple-800"
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
